import { Request, Response } from 'express';
import { MacroLog } from '../models/MacroLog.model';
import { Alimento } from '../models/Alimento.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { escalarMacrosPorGramos, sumarMacros, restarMacros, MACROS_EN_CERO, IMacrosBase } from '../utils/macros';
import { obtenerMetaCaloricaVigente } from '../utils/macros';
/** "2026-07-06" -> Date UTC a medianoche, para que el índice único {userId, fecha} sea estable sin importar la hora local del request. */
function parsearFecha(fechaStr: string): Date {
  const fecha = new Date(`${fechaStr}T00:00:00.000Z`);
  if (Number.isNaN(fecha.getTime())) {
    throw new AppError(400, `Fecha inválida: "${fechaStr}". Usa formato YYYY-MM-DD.`);
  }
  return fecha;
}

function calcularResumen(meta: IMacrosBase, totales: IMacrosBase) {
  const restante = restarConSigno(meta, totales);
  const porcentajeCumplido = {
    calorias: meta.calorias > 0 ? Math.round((totales.calorias / meta.calorias) * 100) : 0,
    proteinaG: meta.proteinaG > 0 ? Math.round((totales.proteinaG / meta.proteinaG) * 100) : 0,
    carbohidratosG: meta.carbohidratosG > 0 ? Math.round((totales.carbohidratosG / meta.carbohidratosG) * 100) : 0,
    grasasG: meta.grasasG > 0 ? Math.round((totales.grasasG / meta.grasasG) * 100) : 0
  };
  return { totales, meta, restante, porcentajeCumplido };
}

/** A diferencia de restarMacros() de utils/macros.ts, este SÍ puede dar negativo (te pasaste de la meta) — es justo lo que el Dashboard necesita mostrar. */
function restarConSigno(meta: IMacrosBase, totales: IMacrosBase): IMacrosBase {
  return {
    calorias: meta.calorias - totales.calorias,
    proteinaG: Math.round((meta.proteinaG - totales.proteinaG) * 10) / 10,
    carbohidratosG: Math.round((meta.carbohidratosG - totales.carbohidratosG) * 10) / 10,
    grasasG: Math.round((meta.grasasG - totales.grasasG) * 10) / 10,
    fibraG: Math.round((meta.fibraG - totales.fibraG) * 10) / 10
  };
}

/**
 * GET /api/macro-logs/:fecha — Dashboard del día.
 * Un GET no debe tener efectos secundarios: si el usuario todavía no
 * registró nada ese día, NO se crea ningún documento — se responde con
 * totales en cero contra la meta vigente del catálogo.
 */
export const obtenerResumenDelDia = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const fecha = parsearFecha(req.params.fecha);

  const registroDelDia = await MacroLog.findOne({ userId, fecha });

  if (!registroDelDia) {
    const metaVigente = await obtenerMetaCaloricaVigente();
    res.json({
      fecha: req.params.fecha,
      alimentosConsumidos: [],
      ...calcularResumen(metaVigente, MACROS_EN_CERO)
    });
    return;
  }

  res.json({
    fecha: req.params.fecha,
    alimentosConsumidos: registroDelDia.alimentosConsumidos,
    ...calcularResumen(registroDelDia.metaDelDia, registroDelDia.totalesConsumidos)
  });
});

/**
 * POST /api/macro-logs/:fecha/alimentos
 * ---------------------------------------
 * Busca el alimento en el catálogo, calcula el snapshot de macros para la
 * cantidad indicada, crea el MacroLog del día si es la primera vez
 * (snapseando la meta vigente en ese momento) y recalcula totalesConsumidos.
 * body: { alimentoId, cantidadG, comidaId? }
 */
export const agregarAlimentoConsumido = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const fecha = parsearFecha(req.params.fecha);
  const { alimentoId, cantidadG, comidaId } = req.body as {
    alimentoId?: string;
    cantidadG?: number;
    comidaId?: string;
  };

  if (!alimentoId || !cantidadG || cantidadG <= 0) {
    throw new AppError(400, 'alimentoId y cantidadG (mayor a 0) son requeridos');
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

  res.status(201).json({
    fecha: req.params.fecha,
    alimentosConsumidos: registroDelDia.alimentosConsumidos,
    ...calcularResumen(registroDelDia.metaDelDia, registroDelDia.totalesConsumidos)
  });
});

/**
 * DELETE /api/macro-logs/:fecha/alimentos/:itemId
 * Quita un alimento puntual del día y resta su snapshot de macros del total
 * (no se recalcula sumando todo el array de nuevo).
 */
export const eliminarAlimentoConsumido = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const fecha = parsearFecha(req.params.fecha);
  const { itemId } = req.params;

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

  res.json({
    fecha: req.params.fecha,
    alimentosConsumidos: registroDelDia.alimentosConsumidos,
    ...calcularResumen(registroDelDia.metaDelDia, registroDelDia.totalesConsumidos)
  });
});
