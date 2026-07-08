import { Request, Response } from 'express';
import { Ejercicio } from '../models/Ejercicio.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

/** GET /api/ejercicios?grupoMuscular=hombros */
export const listarEjercicios = asyncHandler(async (req: Request, res: Response) => {
  const { grupoMuscular } = req.query as { grupoMuscular?: string };

  const filtro = grupoMuscular ? { grupoMuscularPrincipal: grupoMuscular.toLowerCase() } : {};
  const ejercicios = await Ejercicio.find(filtro).sort({ nombre: 1 });

  res.json({ ejercicios });
});

/** GET /api/ejercicios/:ejercicioId */
export const obtenerEjercicio = asyncHandler(async (req: Request, res: Response) => {
  const ejercicio = await Ejercicio.findOne({ ejercicioId: req.params.ejercicioId });

  if (!ejercicio) {
    throw new AppError(404, `No existe un ejercicio con ejercicioId "${req.params.ejercicioId}"`);
  }

  res.json({ ejercicio });
});
