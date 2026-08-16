import { Request, Response } from 'express';
import { Comida } from '../models/Comida.model';
import { Alimento } from '../models/Alimento.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { escalarMacrosPorGramos, sumarMacros, MACROS_EN_CERO } from '../utils/macros';

export const listarComidas = asyncHandler(async (req: Request, res: Response) => {
  const { tipo } = req.query as { tipo?: string };
  const filtro = tipo ? { tipo } : {};

  const comidas = await Comida.find(filtro).sort({ nombre: 1 });

  res.json({ comidas });
});

export const obtenerComida = asyncHandler(async (req: Request, res: Response) => {
  const comida = await Comida.findOne({ comidaId: req.params.comidaId });
  if (!comida) {
    throw new AppError(404, `No existe una comida con comidaId "${req.params.comidaId}"`);
  }

  const alimentoIds = comida.ingredientes.map((ing) => ing.alimentoId);
  const alimentos = await Alimento.find({ alimentoId: { $in: alimentoIds } });
  const alimentoPorId = new Map(alimentos.map((a) => [a.alimentoId, a]));

  let totales = MACROS_EN_CERO;

  const ingredientesResueltos = comida.ingredientes.map((ing) => {
    const alimento = alimentoPorId.get(ing.alimentoId);

    if (!alimento) {
      return { alimentoId: ing.alimentoId, nombre: ing.alimentoId, cantidadG: ing.cantidadG, macros: null };
    }

    const macros = escalarMacrosPorGramos(alimento.macrosPor100g, ing.cantidadG);
    totales = sumarMacros(totales, macros);

    return { alimentoId: ing.alimentoId, nombre: alimento.nombre, cantidadG: ing.cantidadG, macros };
  });

  res.json({
    comidaId: comida.comidaId,
    nombre: comida.nombre,
    tipo: comida.tipo ?? null,
    notas: comida.notas ?? null,
    ingredientes: ingredientesResueltos,
    totales
  });
});
