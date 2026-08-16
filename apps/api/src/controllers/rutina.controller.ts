import { Request, Response } from 'express';
import { Rutina } from '../models/Rutina.model';
import { Ejercicio } from '../models/Ejercicio.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const listarRutinas = asyncHandler(async (req: Request, res: Response) => {
  const incluirInactivas = req.query.activa === 'false';
  const filtro = incluirInactivas ? {} : { activa: true };

  const rutinas = await Rutina.find(filtro).select('-dias');

  res.json({ rutinas });
});

export const obtenerRutina = asyncHandler(async (req: Request, res: Response) => {
  const rutina = await Rutina.findOne({ rutinaId: req.params.rutinaId });

  if (!rutina) {
    throw new AppError(404, `No existe una rutina con rutinaId "${req.params.rutinaId}"`);
  }

  res.json({ rutina });
});

/**
 * GET /api/rutinas/:rutinaId/dias/:diaId
 * Devuelve UN día del programa con cada ejercicio ya resuelto contra el
 * catálogo Ejercicio (nombre, grupoMuscularPrincipal, equipo, videoUrl).
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
