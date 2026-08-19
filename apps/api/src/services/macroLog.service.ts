import { MacroLog } from '../models/MacroLog.model';
import { Alimento } from '../models/Alimento.model';
import { AppError } from '../utils/AppError';
import { escalarMacrosPorGramos, sumarMacros, restarMacros, MACROS_EN_CERO, IMacrosBase } from '../utils/macros';
import { obtenerMetaCaloricaVigente } from './macroCalculator.service';

/**
 * macroLog.service.ts
 * --------------------
 * Lógica de negocio de MacroLog, extraída de macroLog.controller.ts para
 * que el Chat (chat.service.ts) pueda reutilizarla exactamente igual que el
 * Dashboard — un solo lugar que sabe "cómo se registra un alimento" o "cómo
 * se arma el resumen del día", sin duplicar la aritmética de macros en dos
 * sitios que podrían desincronizarse.
 */

export function parsearFecha(fechaStr: string): Date {
  const fecha = new Date(`${fechaStr}T00:00:00.000Z`);
  if (Number.isNaN(fecha.getTime())) {
    throw new AppError(400, `Fecha inválida: "${fechaStr}". Usa formato YYYY-MM-DD.`);
  }
  return fecha;
}

export function fechaDeHoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function restarConSigno(meta: IMacrosBase, totales: IMacrosBase): IMacrosBase {
  return {
    calorias: meta.calorias - totales.calorias,
    proteinaG: Math.round((meta.proteinaG - totales.proteinaG) * 10) / 10,
    carbohidratosG: Math.round((meta.carbohidratosG - totales.carbohidratosG) * 10) / 10,
    grasasG: Math.round((meta.grasasG - totales.grasasG) * 10) / 10,
    fibraG: Math.round((meta.fibraG - totales.fibraG) * 10) / 10
  };
}

export function calcularResumen(meta: IMacrosBase, totales: IMacrosBase) {
  const restante = restarConSigno(meta, totales);
  const porcentajeCumplido = {
    calorias: meta.calorias > 0 ? Math.round((totales.calorias / meta.calorias) * 100) : 0,
    proteinaG: meta.proteinaG > 0 ? Math.round((totales.proteinaG / meta.proteinaG) * 100) : 0,
    carbohidratosG: meta.carbohidratosG > 0 ? Math.round((totales.carbohidratosG / meta.carbohidratosG) * 100) : 0,
    grasasG: meta.grasasG > 0 ? Math.round((totales.grasasG / meta.grasasG) * 100) : 0
  };
  return { totales, meta, restante, porcentajeCumplido };
}

export async function obtenerResumenParaFecha(userId: string, fecha: Date) {
  const registroDelDia = await MacroLog.findOne({ userId, fecha });

  if (!registroDelDia) {
    const metaVigente = await obtenerMetaCaloricaVigente();
    return { alimentosConsumidos: [], ...calcularResumen(metaVigente, MACROS_EN_CERO) };
  }

  return {
    alimentosConsumidos: registroDelDia.alimentosConsumidos,
    ...calcularResumen(registroDelDia.metaDelDia, registroDelDia.totalesConsumidos)
  };
}

export async function registrarAlimentoConsumido(
  userId: string,
  fecha: Date,
  alimentoId: string,
  cantidadG: number,
  comidaId?: string
) {
  if (!cantidadG || cantidadG <= 0) {
    throw new AppError(400, 'cantidadG debe ser mayor a 0');
  }

  const alimento = await Alimento.findOne({ alimentoId });
  if (!alimento) {
    throw new AppError(404, `No existe un alimento con alimentoId "${alimentoId}"`);
  }

  const macrosDelItem = escalarMacrosPorGramos(alimento.macrosPor100g, cantidadG);

  let registroDelDia = await MacroLog.findOne({ userId, fecha });

  if (!registroDelDia) {
    const metaVigente = await obtenerMetaCaloricaVigente();
    registroDelDia = await MacroLog.create({
      userId,
      fecha,
      metaDelDia: metaVigente,
      alimentosConsumidos: [],
      totalesConsumidos: MACROS_EN_CERO
    });
  }

  registroDelDia.alimentosConsumidos.push({
    alimentoId: alimento.alimentoId,
    nombreAlimento: alimento.nombre,
    cantidadG,
    comidaId,
    horaRegistro: new Date(),
    macros: macrosDelItem
  });

  registroDelDia.totalesConsumidos = sumarMacros(registroDelDia.totalesConsumidos, macrosDelItem);

  await registroDelDia.save();

  return {
    alimentoRegistrado: { nombre: alimento.nombre, cantidadG, macros: macrosDelItem },
    alimentosConsumidos: registroDelDia.alimentosConsumidos,
    ...calcularResumen(registroDelDia.metaDelDia, registroDelDia.totalesConsumidos)
  };
}

export async function eliminarAlimentoConsumidoPorId(userId: string, fecha: Date, itemId: string) {
  const registroDelDia = await MacroLog.findOne({ userId, fecha });
  if (!registroDelDia) {
    throw new AppError(404, 'No hay registro de macros para ese día');
  }

  const item = registroDelDia.alimentosConsumidos.id(itemId);
  if (!item) {
    throw new AppError(404, `No existe un alimento registrado con id "${itemId}" en ese día`);
  }

  const macrosARestar = item.macros;
  item.deleteOne();

  registroDelDia.totalesConsumidos = restarMacros(registroDelDia.totalesConsumidos, macrosARestar);

  await registroDelDia.save();

  return {
    alimentosConsumidos: registroDelDia.alimentosConsumidos,
    ...calcularResumen(registroDelDia.metaDelDia, registroDelDia.totalesConsumidos)
  };
}

/**
 * Borra un alimento consumido por DESCRIPCIÓN en lenguaje natural (no por
 * itemId exacto) — lo usa el Chat, que solo tiene "el pollo que comí" o
 * similar, no un id de Mongo. Si hay varias coincidencias (ej. registraste
 * pollo dos veces hoy), borra la más reciente por default: es la corrección
 * más probable ("me equivoqué en lo último que puse").
 */
/**
 * Palabras "significativas" de una descripción en lenguaje natural: quita
 * artículos y conectores cortos (la/el/de/un...) para no exigir que el
 * usuario diga el nombre exacto del catálogo. "la avena" -> ["avena"].
 */
function palabrasSignificativas(texto: string): string[] {
  return texto
    .toLowerCase()
    .split(/\s+/)
    .filter((palabra) => palabra.length > 2);
}

export async function eliminarAlimentoPorDescripcion(userId: string, fecha: Date, descripcion: string) {
  const registroDelDia = await MacroLog.findOne({ userId, fecha });
  if (!registroDelDia || registroDelDia.alimentosConsumidos.length === 0) {
    throw new AppError(404, 'No hay nada registrado ese día para eliminar');
  }

  const palabras = palabrasSignificativas(descripcion);
  const coincidencias = registroDelDia.alimentosConsumidos.filter((item) => {
    const nombreLower = item.nombreAlimento.toLowerCase();
    return palabras.some((palabra) => nombreLower.includes(palabra));
  });

  if (coincidencias.length === 0) {
    throw new AppError(404, `No encontré "${descripcion}" en lo que registraste ese día`);
  }

  const itemAEliminar =
    coincidencias.length === 1
      ? coincidencias[0]
      : [...coincidencias].sort((a, b) => new Date(b.horaRegistro).getTime() - new Date(a.horaRegistro).getTime())[0];

  const nombreEliminado = itemAEliminar.nombreAlimento;
  const cantidadEliminada = itemAEliminar.cantidadG;
  const macrosARestar = itemAEliminar.macros;

  itemAEliminar.deleteOne();
  registroDelDia.totalesConsumidos = restarMacros(registroDelDia.totalesConsumidos, macrosARestar);
  await registroDelDia.save();

  return {
    alimentoEliminado: { nombre: nombreEliminado, cantidadG: cantidadEliminada },
    huboVariasCoincidencias: coincidencias.length > 1,
    ...calcularResumen(registroDelDia.metaDelDia, registroDelDia.totalesConsumidos)
  };
}
