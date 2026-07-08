import { Request, Response } from 'express';
import { Comida } from '../models/Comida.model';
import { Alimento } from '../models/Alimento.model';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { escalarMacrosPorGramos, sumarMacros, MACROS_EN_CERO } from '../utils/macros';

/** GET /api/comidas?tipo=Desayuno */
export const listarComidas = asyncHandler(async (req: Request, res: Response) => {
  const { tipo } = req.query as { tipo?: string };
  const filtro = tipo ? { tipo } : {};

  const comidas = await Comida.find(filtro).sort({ nombre: 1 });

  res.json({ comidas });
});

/**
 * GET /api/comidas/:comidaId
 * ---------------------------
 * Resuelve cada ingrediente contra el catálogo Alimento y devuelve los
 * macros ya calculados por ingrediente y el total de la comida — así el
 * usuario ve "El Clásico Mexicano: 683 kcal / 91g proteína" ANTES de
 * decidir registrarla en su MacroLog del día.
 */
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
      // No debería pasar si el seed corrió bien, pero no tronamos el
      // endpoint completo por un ingrediente huérfano — se degrada a null.
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
