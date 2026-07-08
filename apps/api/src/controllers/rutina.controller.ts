import { Request, Response } from 'express';
import { Rutina } from '../models/Rutina.model';
import { Ejercicio } from '../models/Ejercicio.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

/** GET /api/rutinas?activa=false para incluir también las inactivas */
export const listarRutinas = asyncHandler(async (req: Request, res: Response) => {
  const incluirInactivas = req.query.activa === 'false';
  const filtro = incluirInactivas ? {} : { activa: true };

  // Lista liviana: sin el detalle de "dias" (puede pesar bastante con 5 días
  // y ~30 ejercicios). El detalle completo se pide con GET /rutinas/:rutinaId.
  const rutinas = await Rutina.find(filtro).select('-dias');

  res.json({ rutinas });
});

/** GET /api/rutinas/:rutinaId — programa completo con todos los días */
export const obtenerRutina = asyncHandler(async (req: Request, res: Response) => {
  const rutina = await Rutina.findOne({ rutinaId: req.params.rutinaId });

  if (!rutina) {
    throw new AppError(404, `No existe una rutina con rutinaId "${req.params.rutinaId}"`);
  }

  res.json({ rutina });
});

/**
 * GET /api/rutinas/:rutinaId/dias/:diaId
 * ---------------------------------------
 * Devuelve UN día del programa con cada ejercicio ya resuelto contra el
 * catálogo Ejercicio (nombre, grupoMuscularPrincipal, equipo, videoUrl). Es
 * el endpoint que alimenta la pantalla del Tracker: con una sola llamada el
 * frontend tiene todo lo necesario para pintar "Lunes - Torso Pesado" sin
 * tener que hacer una segunda consulta a /ejercicios por su cuenta.
 */
export const obtenerDiaDeRutina = asyncHandler(async (req: Request, res: Response) => {
  const { rutinaId, diaId } = req.params;

  const rutina = await Rutina.findOne({ rutinaId });
  if (!rutina) {
    throw new AppError(404, `No existe una rutina con rutinaId "${rutinaId}"`);
  }

  const dia = rutina.dias.find((d) => d.diaId === diaId);
  if (!dia) {
    throw new AppError(404, `La rutina "${rutinaId}" no tiene un día con diaId "${diaId}"`);
  }

  const ejercicioIds = dia.ejercicios.map((ej) => ej.ejercicioId);
  const ejerciciosCatalogo = await Ejercicio.find({ ejercicioId: { $in: ejercicioIds } });
  const catalogoPorId = new Map(ejerciciosCatalogo.map((e) => [e.ejercicioId, e]));

  const ejerciciosResueltos = dia.ejercicios.map((ej) => {
    const infoCatalogo = catalogoPorId.get(ej.ejercicioId);
    return {
      ejercicioId: ej.ejercicioId,
      orden: ej.orden,
      series: ej.series,
      repsMin: ej.repsMin,
      repsMax: ej.repsMax,
      descansoSegundos: ej.descansoSegundos,
      notas: ej.notas,
      // Resuelto contra el catálogo — si algún ejercicioId quedó huérfano
      // (no debería pasar si el seed corrió bien) se degrada con nulls en
      // vez de tronar el endpoint completo.
      nombre: infoCatalogo?.nombre ?? ej.ejercicioId,
      grupoMuscularPrincipal: infoCatalogo?.grupoMuscularPrincipal ?? null,
      equipo: infoCatalogo?.equipo ?? null,
      videoUrl: infoCatalogo?.videoUrl ?? null
    };
  });

  res.json({
    rutinaId: rutina.rutinaId,
    diaId: dia.diaId,
    nombreDia: dia.nombreDia,
    enfoque: dia.enfoque ?? null,
    gruposMusculares: dia.gruposMusculares ?? [],
    ejercicios: ejerciciosResueltos
  });
});
