import { Alimento, IAlimento } from '../models/Alimento.model';
import { generarJSON, generarTexto } from './gemini.service';
import {
  obtenerResumenParaFecha,
  registrarAlimentoConsumido,
  eliminarAlimentoPorDescripcion,
  parsearFecha,
  fechaDeHoyISO
} from './macroLog.service';
import { eliminarSesion, obtenerSesionMasReciente } from './workoutLog.service';
import { AppError } from '../utils/AppError';

/**
 * chat.service.ts
 * ----------------
 * Patrón de DOS llamadas a Gemini, en vez de usar "function calling" nativo
 * del SDK (que cambia de forma entre versiones y no lo puedo probar sin
 * red): primero clasifica qué quiere el usuario en JSON estructurado,
 * después el backend ejecuta la acción real contra Mongo (reutilizando
 * macroLog.service.ts / workoutLog.service.ts, el mismo código que usa el
 * Dashboard y el Tracker), y recién ahí una segunda llamada a Gemini redacta
 * la respuesta final en base a los datos REALES del resultado — nunca
 * inventa números.
 */

interface MensajeHistorial {
  autor: 'usuario' | 'ia';
  texto: string;
}

type AccionChat =
  | 'buscar_alimento'
  | 'registrar_alimento'
  | 'consultar_resumen_dia'
  | 'eliminar_alimento_consumido'
  | 'eliminar_sesion_entrenamiento'
  | 'ninguna';

interface IntencionClasificada {
  tipo: 'accion' | 'respuesta';
  accion: AccionChat;
  alimentoBuscado?: string;
  cantidadG?: number;
  descripcionAEliminar?: string;
  diasAtras?: number;
  diaEntrenamientoMencionado?: string;
  mensajeDirecto?: string;
}

function construirSchemaIntencion(): Record<string, unknown> {
  return {
    type: 'OBJECT',
    properties: {
      tipo: { type: 'STRING', enum: ['accion', 'respuesta'] },
      accion: {
        type: 'STRING',
        enum: [
          'buscar_alimento',
          'registrar_alimento',
          'consultar_resumen_dia',
          'eliminar_alimento_consumido',
          'eliminar_sesion_entrenamiento',
          'ninguna'
        ]
      },
      alimentoBuscado: { type: 'STRING' },
      cantidadG: { type: 'NUMBER' },
      descripcionAEliminar: { type: 'STRING' },
      diasAtras: { type: 'NUMBER' },
      diaEntrenamientoMencionado: { type: 'STRING' },
      mensajeDirecto: { type: 'STRING' }
    },
    required: ['tipo', 'accion']
  };
}

function construirPromptIntencion(mensaje: string, historial: MensajeHistorial[]): string {
  const historialTexto = historial
    .slice(-6)
    .map((m) => `${m.autor === 'usuario' ? 'Usuario' : 'Coach'}: ${m.texto}`)
    .join('\n');

  return `Eres el clasificador de intención del asistente conversacional de una app de fitness/nutrición. Tu trabajo AHORA es solo clasificar, NO responderle al usuario todavía.

Acciones disponibles:
- "registrar_alimento": el usuario dice que comió/tomó algo (extrae "alimentoBuscado" = qué comió en lenguaje natural tal cual lo dijo, y "cantidadG" = cantidad en gramos si la mencionó; si no dio cantidad, pon 100 como default).
- "buscar_alimento": pregunta si algo existe en el catálogo o cuántas calorías/macros tiene, sin querer registrarlo todavía.
- "consultar_resumen_dia": pregunta cómo va de calorías/macros/proteína hoy.
- "eliminar_alimento_consumido": pide borrar/quitar/corregir una comida que ya registró por error (extrae "descripcionAEliminar" = qué comida, en sus palabras; "diasAtras" = 0 si dice "hoy"/no especifica, 1 si dice "ayer").
- "eliminar_sesion_entrenamiento": pide borrar/quitar/corregir un entrenamiento que ya registró por error (extrae "diaEntrenamientoMencionado" si menciona cuál día de rutina, ej. "pierna", "torso" — si no lo dice, deja el campo vacío y se borra el más reciente).
- "ninguna": no aplica ninguna acción (saludo, agradecimiento, pregunta general de fitness). En este caso escribe la respuesta directa en "mensajeDirecto" (tono coach motivador, breve, en español, sin inventar datos numéricos del usuario que no tengas).

Conversación reciente:
${historialTexto || '(sin mensajes previos)'}

Último mensaje del usuario: "${mensaje}"

Responde solo con el JSON pedido.`;
}

interface ResultadoAccion {
  tipo:
    | 'alimento_registrado'
    | 'alimento_no_encontrado'
    | 'alimento_eliminado'
    | 'sesion_eliminada'
    | 'nada_que_eliminar'
    | 'resumen_dia'
    | 'busqueda_alimento'
    | 'sin_accion';
  datos: Record<string, unknown>;
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function buscarCandidatosAlimento(texto: string): Promise<IAlimento[]> {
  // $text + orden por relevancia: para una búsqueda específica como "pechuga
  // de pollo" el resultado más relevante casi siempre es el correcto, aún si
  // varios documentos comparten palabras comunes ("de", "con", etc.).
  const porTexto = await Alimento.find({ $text: { $search: texto } }, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);
  if (porTexto.length > 0) return porTexto;

  // fallback: regex simple por si $text no encontró nada (pasa con textos
  // muy cortos, acentos, o variaciones que el índice de texto no matchea)
  return Alimento.find({ nombre: { $regex: escaparRegex(texto), $options: 'i' } }).limit(5);
}

function fechaHaceNDias(n: number): Date {
  const fecha = parsearFecha(fechaDeHoyISO());
  fecha.setUTCDate(fecha.getUTCDate() - n);
  return fecha;
}

async function ejecutarAccion(userId: string, intencion: IntencionClasificada): Promise<ResultadoAccion> {
  if (intencion.accion === 'consultar_resumen_dia') {
    const fecha = parsearFecha(fechaDeHoyISO());
    const resumen = await obtenerResumenParaFecha(userId, fecha);
    return { tipo: 'resumen_dia', datos: resumen };
  }

  if (intencion.accion === 'buscar_alimento' || intencion.accion === 'registrar_alimento') {
    if (!intencion.alimentoBuscado) {
      return { tipo: 'alimento_no_encontrado', datos: { busqueda: '' } };
    }

    const candidatos = await buscarCandidatosAlimento(intencion.alimentoBuscado);

    if (intencion.accion === 'buscar_alimento') {
      return {
        tipo: 'busqueda_alimento',
        datos: { busqueda: intencion.alimentoBuscado, candidatos: candidatos.map((a) => ({ nombre: a.nombre, macrosPor100g: a.macrosPor100g })) }
      };
    }

    if (candidatos.length === 0) {
      return { tipo: 'alimento_no_encontrado', datos: { busqueda: intencion.alimentoBuscado } };
    }

    // Toma el más relevante (candidatos[0], ya viene ordenado por textScore)
    // en vez de exigir que haya exactamente un resultado — para una consulta
    // específica como "pechuga de pollo" el top-1 casi siempre es correcto,
    // y no tiene sentido interrumpir el flujo pidiendo desambiguación salvo
    // que de plano no se haya encontrado nada.
    const mejorCandidato = candidatos[0];
    const fecha = parsearFecha(fechaDeHoyISO());
    const cantidad = intencion.cantidadG && intencion.cantidadG > 0 ? intencion.cantidadG : 100;
    const resultado = await registrarAlimentoConsumido(userId, fecha, mejorCandidato.alimentoId, cantidad);
    return { tipo: 'alimento_registrado', datos: resultado };
  }

  if (intencion.accion === 'eliminar_alimento_consumido') {
    if (!intencion.descripcionAEliminar) {
      return { tipo: 'nada_que_eliminar', datos: { motivo: 'no especificó qué comida borrar' } };
    }
    const fecha = fechaHaceNDias(intencion.diasAtras && intencion.diasAtras > 0 ? intencion.diasAtras : 0);
    try {
      const resultado = await eliminarAlimentoPorDescripcion(userId, fecha, intencion.descripcionAEliminar);
      return { tipo: 'alimento_eliminado', datos: resultado };
    } catch (error) {
      const mensaje = error instanceof AppError ? error.message : 'No se pudo eliminar';
      return { tipo: 'nada_que_eliminar', datos: { motivo: mensaje } };
    }
  }

  if (intencion.accion === 'eliminar_sesion_entrenamiento') {
    const sesion = await obtenerSesionMasReciente(userId);
    if (!sesion) {
      return { tipo: 'nada_que_eliminar', datos: { motivo: 'no tienes sesiones de entrenamiento registradas' } };
    }

    // Si el usuario mencionó un día específico (ej. "pierna") y NO matchea
    // con la sesión más reciente, se avisa en vez de borrar la equivocada.
    if (
      intencion.diaEntrenamientoMencionado &&
      !sesion.nombreDia.toLowerCase().includes(intencion.diaEntrenamientoMencionado.toLowerCase())
    ) {
      return {
        tipo: 'nada_que_eliminar',
        datos: {
          motivo: `tu sesión más reciente es "${sesion.nombreDia}" (${sesion.fecha.toISOString().slice(0, 10)}), no "${intencion.diaEntrenamientoMencionado}" — confírmame si quieres borrar esa de todos modos`
        }
      };
    }

    const eliminada = await eliminarSesion(userId, String(sesion._id));
    return {
      tipo: 'sesion_eliminada',
      datos: { nombreDia: eliminada.nombreDia, fecha: eliminada.fecha.toISOString().slice(0, 10) }
    };
  }

  return { tipo: 'sin_accion', datos: {} };
}

function construirPromptRespuestaFinal(mensajeUsuario: string, resultado: ResultadoAccion): string {
  const datosJSON = JSON.stringify(resultado.datos);

  return `Eres un coach de fitness/nutrición conversacional: tono directo y motivador, en español, respuestas breves (2-4 líneas), sin exceso de emojis.

El usuario escribió: "${mensajeUsuario}"

Ya se ejecutó la acción "${resultado.tipo}" y estos son los datos REALES del resultado — úsalos para responder con precisión, nunca inventes números que no estén acá:
${datosJSON}

Según el tipo de resultado:
- "alimento_registrado": confirma qué se registró y cuánto le queda disponible hoy (usa "restante").
- "alimento_no_encontrado": di que no lo encontraste en el catálogo, pide que lo describa distinto.
- "alimento_eliminado": confirma qué se borró (nombre y cantidad) y cómo quedan los totales del día ahora ("restante"). Si "huboVariasCoincidencias" es true, aclara que borraste el registro más reciente que coincidía, por si no era el correcto.
- "sesion_eliminada": confirma qué sesión se borró (nombreDia y fecha).
- "nada_que_eliminar": explica por qué no se pudo borrar usando "motivo", tal cual, sin inventar otra razón.
- "resumen_dia": resume cómo va de calorías y proteína hoy.
- "busqueda_alimento": si hay candidatos, da los macros que pidió; si no, dile que no está en el catálogo.

Responde SOLO con el texto final para el usuario, sin JSON, sin comillas envolventes.`;
}

export interface RespuestaChat {
  mensaje: string;
}

export async function responderMensaje(
  userId: string,
  mensaje: string,
  historial: MensajeHistorial[] = []
): Promise<RespuestaChat> {
  const intencion = await generarJSON<IntencionClasificada>({
    prompt: construirPromptIntencion(mensaje, historial),
    schema: construirSchemaIntencion()
  });

  if (intencion.tipo === 'respuesta' || intencion.accion === 'ninguna') {
    return { mensaje: intencion.mensajeDirecto?.trim() || 'Cuéntame qué comiste o cómo te fue en el entrenamiento de hoy.' };
  }

  const resultado = await ejecutarAccion(userId, intencion);
  const textoFinal = await generarTexto(construirPromptRespuestaFinal(mensaje, resultado));

  return { mensaje: textoFinal.trim() };
}
