import { Request, Response } from 'express';
import { Logro } from '../models/Logro.model';
import { evaluarYActualizarLogros } from '../services/logrosEvaluator.service';
import { generarNuevosLogros } from '../services/logrosGenerator.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * GET /api/logros
 * -----------------
 * Recalcula el progreso de todos los logros activos (query real contra
 * WorkoutLog/MacroLog) y devuelve TODO: activos + desbloqueados, agrupables
 * en el frontend por `periodo`. Si el usuario no tiene ningún logro
 * todavía, devuelve arrays vacíos — el frontend ofrece el botón de
 * "Generar logros" en ese caso (POST /api/logros/generar).
 */
export const listarLogros = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;

  await evaluarYActualizarLogros(userId);

  const [activos, desbloqueados] = await Promise.all([
    Logro.find({ userId, desbloqueado: false, fechaFinPeriodo: { $gte: new Date() } }).sort({ fechaFinPeriodo: 1 }),
    Logro.find({ userId, desbloqueado: true }).sort({ fechaDesbloqueo: -1 }).limit(50)
  ]);

  res.json({ activos, desbloqueados });
});

/**
 * POST /api/logros/generar
 * ---------------------------
 * Llama a Gemini para inventar 5 logros nuevos a partir del historial real
 * del usuario. Devuelve 503 automáticamente (vía gemini.service.ts) si
 * GEMINI_API_KEY no está configurada todavía.
 */
export const generarLogros = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;

  const nuevos = await generarNuevosLogros(userId);

  res.status(201).json({ logros: nuevos });
});
