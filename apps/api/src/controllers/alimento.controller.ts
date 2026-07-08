import { Request, Response } from 'express';
import { Alimento } from '../models/Alimento.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

/**
 * GET /api/alimentos?q=pollo&categoria=proteina
 * `q` usa el índice de texto sobre `nombre` (ver Alimento.model.ts) para el
 * buscador/autocompletar del Tracker de macros.
 */
export const listarAlimentos = asyncHandler(async (req: Request, res: Response) => {
  const { q, categoria } = req.query as { q?: string; categoria?: string };

  const filtro: Record<string, unknown> = {};
  if (categoria) filtro.categoria = categoria.toLowerCase();
  if (q) filtro.$text = { $search: q };

  const alimentos = await Alimento.find(filtro).sort({ nombre: 1 }).limit(100);

  res.json({ alimentos });
});

/** GET /api/alimentos/:alimentoId */
export const obtenerAlimento = asyncHandler(async (req: Request, res: Response) => {
  const alimento = await Alimento.findOne({ alimentoId: req.params.alimentoId });

  if (!alimento) {
    throw new AppError(404, `No existe un alimento con alimentoId "${req.params.alimentoId}"`);
  }

  res.json({ alimento });
});
