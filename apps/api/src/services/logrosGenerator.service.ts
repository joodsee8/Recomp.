import { WorkoutLog } from '../models/WorkoutLog.model';
import { MacroLog } from '../models/MacroLog.model';
import { Logro, ILogro } from '../models/Logro.model';
import { ICONOS_LOGROS, esIconoValido } from '../data/iconosLogros';
import { METRICAS_LOGROS, esMetricaValida, MetricaLogro } from '../data/metricasLogros';
import { generarJSON } from './gemini.service';
import { calcularLimitesPeriodo } from './logrosEvaluator.service';
import { AppError } from '../utils/AppError';
import { Types } from 'mongoose';

/**
 * logrosGenerator.service.ts
 * ---------------------------
 * Le pide a Gemini que invente nuevos logros a partir del historial real
 * del usuario. Gemini aporta creatividad (título, descripción, qué tan
 * retador poner el objetivo) pero SIEMPRE dentro de los catálogos cerrados
 * de íconos y métricas — nunca texto libre en esos dos campos.
 *
 * Cada logro que devuelve Gemini se revalida acá con los mismos catálogos
 * ANTES de guardar, aunque ya se le haya pedido con responseSchema — la
 * generación controlada reduce el riesgo de que se salga del formato, no
 * lo elimina.
 */

interface LogroGeneradoCrudo {
  titulo?: unknown;
  descripcion?: unknown;
  categoria?: unknown;
  periodo?: unknown;
  icono?: unknown;
  metrica?: unknown;
  comparador?: unknown;
  objetivo?: unknown;
}

interface RespuestaGemini {
  logros?: LogroGeneradoCrudo[];
}

const CATEGORIAS_VALIDAS = ['dieta', 'ejercicio', 'mixto'];
const PERIODOS_VALIDOS = ['diario', 'semanal', 'mensual'] as const;
const COMPARADORES_VALIDOS = ['>=', '='];

function construirSchemaRespuesta(): Record<string, unknown> {
  return {
    type: 'OBJECT',
    properties: {
      logros: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            titulo: { type: 'STRING' },
            descripcion: { type: 'STRING' },
            categoria: { type: 'STRING', enum: CATEGORIAS_VALIDAS },
            periodo: { type: 'STRING', enum: PERIODOS_VALIDOS },
            icono: { type: 'STRING', enum: ICONOS_LOGROS.map((i) => i.id) },
            metrica: { type: 'STRING', enum: METRICAS_LOGROS.map((m) => m.id) },
            comparador: { type: 'STRING', enum: COMPARADORES_VALIDOS },
            objetivo: { type: 'NUMBER' }
          },
          required: ['titulo', 'descripcion', 'categoria', 'periodo', 'icono', 'metrica', 'comparador', 'objetivo']
        }
      }
    },
    required: ['logros']
  };
}

/** Resumen compacto del último mes, para que Gemini calibre objetivos realistas (no imposibles, no triviales). */
async function construirResumenHistorial(userId: string): Promise<string> {
  const hace30Dias = new Date();
  hace30Dias.setUTCDate(hace30Dias.getUTCDate() - 30);

  const [sesiones, registrosMacro] = await Promise.all([
    WorkoutLog.find({ userId, fecha: { $gte: hace30Dias } }).select('ejerciciosRegistrados fecha'),
    MacroLog.find({ userId, fecha: { $gte: hace30Dias } }).select('alimentosConsumidos totalesConsumidos metaDelDia')
  ]);

  const totalSesiones = sesiones.length;
  const totalPRs = sesiones.reduce(
    (total, s) => total + s.ejerciciosRegistrados.reduce((sub, ej) => sub + ej.series.filter((serie) => serie.esRecordPersonal).length, 0),
    0
  );
  const diasConMacros = registrosMacro.filter((r) => r.alimentosConsumidos.length > 0).length;
  const diasCumpliendoProteina = registrosMacro.filter((r) => r.totalesConsumidos.proteinaG >= r.metaDelDia.proteinaG).length;

  return [
    `Últimos 30 días: ${totalSesiones} sesiones de entrenamiento registradas, ${totalPRs} récords personales.`,
    `De los días con datos de comida: ${diasConMacros} días con al menos una comida registrada, ${diasCumpliendoProteina} días cumpliendo la meta de proteína.`
  ].join(' ');
}

function construirPrompt(resumenHistorial: string, titulosActivos: string[]): string {
  const catalogoIconos = ICONOS_LOGROS.map((i) => `- ${i.id}: ${i.descripcionParaIA}`).join('\n');
  const catalogoMetricas = METRICAS_LOGROS.map((m) => `- ${m.id}: ${m.descripcionParaIA}`).join('\n');
  const titulosAEvitar = titulosActivos.length > 0 ? titulosActivos.map((t) => `- "${t}"`).join('\n') : '(ninguno todavía)';

  return `Eres el diseñador de un sistema de logros gamificado dentro de una app de recomposición corporal (déficit calórico agresivo + entrenamiento de fuerza pesado). Tu trabajo es inventar 5 logros NUEVOS, variados y motivadores para mantener la constancia del usuario, mezclando periodos diario/semanal/mensual y categorías dieta/ejercicio/mixto.

CONTEXTO DEL USUARIO (últimos 30 días):
${resumenHistorial}

LOGROS QUE YA TIENE ACTIVOS AHORA MISMO (NO repitas estos títulos ni algo casi idéntico, busca variedad real):
${titulosAEvitar}

REGLAS ESTRICTAS:
1. Cada logro usa EXACTAMENTE una "metrica" de este catálogo (no inventes otras):
${catalogoMetricas}
2. Cada logro usa EXACTAMENTE un "icono" de este catálogo (elige el que mejor combine con el logro):
${catalogoIconos}
3. El "objetivo" debe ser realista pero retador según el contexto del usuario de arriba — ni trivial, ni imposible. Si el usuario ya tiene buen desempeño en algo, sube la exigencia; si le cuesta, pon algo alcanzable que lo empuje sin desanimarlo.
4. "titulo" corto y con gancho (máximo 6 palabras), "descripcion" en una frase clara de qué hay que lograr.
5. Escribe todo en español, tono motivador pero directo, sin ser cursi ni usar exceso de emojis.
6. Mezcla los 3 "periodo" (diario, semanal, mensual) entre los 5 logros — no los pongas todos del mismo tipo.

Responde solo con el JSON pedido.`;
}

function normalizarTexto(valor: unknown, maxLargo: number): string | null {
  if (typeof valor !== 'string') return null;
  const limpio = valor.trim();
  if (!limpio) return null;
  return limpio.length > maxLargo ? limpio.slice(0, maxLargo) : limpio;
}

/** Valida un logro crudo de Gemini campo por campo. Devuelve null si algo no pasa (se descarta, no rompe el lote completo). */
function validarLogroGenerado(crudo: LogroGeneradoCrudo): {
  titulo: string;
  descripcion: string;
  categoria: 'dieta' | 'ejercicio' | 'mixto';
  periodo: 'diario' | 'semanal' | 'mensual';
  icono: string;
  metrica: MetricaLogro;
  comparador: '>=' | '=';
  objetivo: number;
} | null {
  const titulo = normalizarTexto(crudo.titulo, 60);
  const descripcion = normalizarTexto(crudo.descripcion, 200);
  if (!titulo || !descripcion) return null;

  if (typeof crudo.categoria !== 'string' || !CATEGORIAS_VALIDAS.includes(crudo.categoria)) return null;
  if (typeof crudo.periodo !== 'string' || !PERIODOS_VALIDOS.includes(crudo.periodo as (typeof PERIODOS_VALIDOS)[number])) return null;
  if (typeof crudo.icono !== 'string' || !esIconoValido(crudo.icono)) return null;
  if (typeof crudo.metrica !== 'string' || !esMetricaValida(crudo.metrica)) return null;
  if (typeof crudo.comparador !== 'string' || !COMPARADORES_VALIDOS.includes(crudo.comparador)) return null;

  const objetivo = typeof crudo.objetivo === 'number' ? crudo.objetivo : Number(crudo.objetivo);
  if (!Number.isFinite(objetivo) || objetivo <= 0) return null;

  return {
    titulo,
    descripcion,
    categoria: crudo.categoria as 'dieta' | 'ejercicio' | 'mixto',
    periodo: crudo.periodo as 'diario' | 'semanal' | 'mensual',
    icono: crudo.icono,
    metrica: crudo.metrica,
    comparador: crudo.comparador as '>=' | '=',
    objetivo: Math.round(objetivo)
  };
}

/**
 * Genera y persiste nuevos logros para un usuario. No borra ni toca los
 * logros activos existentes — solo agrega, evitando duplicar títulos ya
 * activos (defensa extra además de pedírselo a Gemini en el prompt).
 */
export async function generarNuevosLogros(userId: string): Promise<ILogro[]> {
  const userObjectId = new types.ObjectId(userId);
  const [resumenHistorial, logrosActivos] = await Promise.all([
    construirResumenHistorial(userId),
    Logro.find({ userId, desbloqueado: false, fechaFinPeriodo: { $gte: new Date() } }).select('titulo')
  ]);

  const titulosActivos = logrosActivos.map((l) => l.titulo);

  const respuesta = await generarJSON<RespuestaGemini>({
    prompt: construirPrompt(resumenHistorial, titulosActivos),
    schema: construirSchemaRespuesta()
  });

  if (!Array.isArray(respuesta.logros) || respuesta.logros.length === 0) {
    throw new AppError(502, 'Gemini no devolvió ningún logro válido en este intento. Intenta de nuevo.');
  }

  const titulosActivosLower = new Set(titulosActivos.map((t) => t.toLowerCase()));
  const logrosAInsertar = [];

  for (const crudo of respuesta.logros) {
    const validado = validarLogroGenerado(crudo);
    if (!validado) continue; // se descarta silenciosamente un item mal formado, no rompe el lote
    if (titulosActivosLower.has(validado.titulo.toLowerCase())) continue; // duplicado, se descarta

    const { inicio, fin } = calcularLimitesPeriodo(validado.periodo);

    logrosAInsertar.push({
      userId: userObjectId,
      titulo: validado.titulo,
      descripcion: validado.descripcion,
      categoria: validado.categoria,
      periodo: validado.periodo,
      icono: validado.icono,
      criterio: { metrica: validado.metrica, comparador: validado.comparador, objetivo: validado.objetivo },
      progresoActual: 0,
      metaObjetivo: validado.objetivo,
      desbloqueado: false,
      fechaInicioPeriodo: inicio,
      fechaFinPeriodo: fin
    });

    titulosActivosLower.add(validado.titulo.toLowerCase());
  }

  if (logrosAInsertar.length === 0) {
    throw new AppError(502, 'Gemini devolvió logros pero ninguno pasó la validación. Intenta de nuevo.');
  }

  return Logro.insertMany(logrosAInsertar);
}
