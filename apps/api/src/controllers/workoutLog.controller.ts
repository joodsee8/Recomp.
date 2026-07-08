import { Request, Response } from 'express';
import { WorkoutLog, IEjercicioRegistrado } from '../models/WorkoutLog.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

/**
 * Antes de guardar la sesión, marca esRecordPersonal en cada serie completada
 * que supere el peso máximo que el usuario haya levantado antes en ese
 * ejercicio (comparando contra TODAS las sesiones previas ya guardadas, no
 * contra la sesión que se está creando). El campo ya existía en el schema
 * sin usarse — acá se calcula de verdad.
 */
async function marcarRecordsPersonales(
  userId: string,
  ejerciciosRegistrados: IEjercicioRegistrado[]
): Promise<IEjercicioRegistrado[]> {
  const ejercicioIds = ejerciciosRegistrados.map((ej) => ej.ejercicioId);

  const sesionesPrevias = await WorkoutLog.find({
    userId,
    'ejerciciosRegistrados.ejercicioId': { $in: ejercicioIds }
  }).select('ejerciciosRegistrados');

  const maximoHistoricoPorEjercicio = new Map<string, number>();
  for (const sesion of sesionesPrevias) {
    for (const ej of sesion.ejerciciosRegistrados) {
      if (!ejercicioIds.includes(ej.ejercicioId)) continue;
      const pesosDeEstaSesion = ej.series.filter((s) => s.completada).map((s) => s.pesoKg);
      if (pesosDeEstaSesion.length === 0) continue;
      const maximoDeEstaSesion = Math.max(...pesosDeEstaSesion);
      const maximoActual = maximoHistoricoPorEjercicio.get(ej.ejercicioId) ?? 0;
      if (maximoDeEstaSesion > maximoActual) {
        maximoHistoricoPorEjercicio.set(ej.ejercicioId, maximoDeEstaSesion);
      }
    }
  }

  return ejerciciosRegistrados.map((ej) => {
    const maximoHistorico = maximoHistoricoPorEjercicio.get(ej.ejercicioId) ?? 0;
    return {
      ...ej,
      series: ej.series.map((serie) => ({
        ...serie,
        esRecordPersonal: Boolean(serie.completada && serie.pesoKg > maximoHistorico)
      }))
    };
  });
}

/** POST /api/workout-logs — guarda una sesión completa del Tracker */
export const crearSesion = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { fecha, diaRutinaId, nombreDia, ejerciciosRegistrados, duracionMinutos, notasSesion, completado } =
    req.body as {
      fecha?: string;
      diaRutinaId?: string;
      nombreDia?: string;
      ejerciciosRegistrados?: IEjercicioRegistrado[];
      duracionMinutos?: number;
      notasSesion?: string;
      completado?: boolean;
    };

  if (!fecha || !diaRutinaId || !nombreDia || !Array.isArray(ejerciciosRegistrados) || ejerciciosRegistrados.length === 0) {
    throw new AppError(400, 'fecha, diaRutinaId, nombreDia y ejerciciosRegistrados (no vacío) son requeridos');
  }

  const ejerciciosConRecords = await marcarRecordsPersonales(userId, ejerciciosRegistrados);

  const sesion = await WorkoutLog.create({
    userId,
    fecha: new Date(fecha),
    diaRutinaId,
    nombreDia,
    ejerciciosRegistrados: ejerciciosConRecords,
    duracionMinutos,
    notasSesion,
    completado: completado ?? true
  });

  res.status(201).json({ sesion });
});

/**
 * GET /api/workout-logs?diaRutinaId=torso_pesado&desde=2026-06-01&hasta=2026-07-01&page=1&limit=20
 * Historial paginado, lo más reciente primero.
 */
export const listarHistorial = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { diaRutinaId, desde, hasta, limit, page } = req.query as Record<string, string | undefined>;

  const filtro: Record<string, unknown> = { userId };
  if (diaRutinaId) filtro.diaRutinaId = diaRutinaId;
  if (desde || hasta) {
    const rangoFecha: Record<string, Date> = {};
    if (desde) rangoFecha.$gte = new Date(desde);
    if (hasta) rangoFecha.$lte = new Date(hasta);
    filtro.fecha = rangoFecha;
  }

  const limiteFinal = Math.min(Number(limit) || 20, 100);
  const paginaFinal = Math.max(Number(page) || 1, 1);

  const [sesiones, total] = await Promise.all([
    WorkoutLog.find(filtro)
      .sort({ fecha: -1 })
      .skip((paginaFinal - 1) * limiteFinal)
      .limit(limiteFinal),
    WorkoutLog.countDocuments(filtro)
  ]);

  res.json({
    sesiones,
    paginacion: {
      total,
      pagina: paginaFinal,
      limite: limiteFinal,
      totalPaginas: Math.ceil(total / limiteFinal) || 1
    }
  });
});

/** GET /api/workout-logs/:id — una sesión puntual (siempre scopeada al dueño) */
export const obtenerSesion = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const sesion = await WorkoutLog.findOne({ _id: req.params.id, userId });

  if (!sesion) {
    throw new AppError(404, 'Sesión no encontrada');
  }

  res.json({ sesion });
});

/**
 * GET /api/workout-logs/progreso/:ejercicioId
 * ---------------------------------------------
 * Serie temporal: por cada sesión donde aparece ese ejercicio, el peso
 * máximo levantado, las reps logradas en ese peso, el volumen total
 * (peso × reps sumado de todas las series) y si hubo PR ese día. Es el dato
 * que alimenta el gráfico de sobrecarga progresiva del Historial.
 *
 * IMPORTANTE: esta ruta debe registrarse ANTES de "/:id" en el router, o
 * Express interpretaría "progreso" como el parámetro :id.
 */
export const obtenerProgresoEjercicio = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { ejercicioId } = req.params;

  const sesiones = await WorkoutLog.find({
    userId,
    'ejerciciosRegistrados.ejercicioId': ejercicioId
  })
    .sort({ fecha: 1 })
    .select('fecha ejerciciosRegistrados');

  const progreso = sesiones.map((sesion) => {
    const ejercicio = sesion.ejerciciosRegistrados.find((ej) => ej.ejercicioId === ejercicioId);
    const seriesCompletadas = ejercicio?.series.filter((s) => s.completada) ?? [];

    const pesoMaximoKg = seriesCompletadas.reduce((max, s) => Math.max(max, s.pesoKg), 0);
    const serieDelPesoMaximo = seriesCompletadas.find((s) => s.pesoKg === pesoMaximoKg);
    const volumenTotalKg = seriesCompletadas.reduce((vol, s) => vol + s.pesoKg * s.repsLogradas, 0);

    return {
      fecha: sesion.fecha,
      pesoMaximoKg,
      repsEnPesoMaximo: serieDelPesoMaximo?.repsLogradas ?? 0,
      volumenTotalKg,
      huboRecordPersonal: seriesCompletadas.some((s) => s.esRecordPersonal)
    };
  });

  res.json({ ejercicioId, progreso });
});
