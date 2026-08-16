import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import {
  parsearFecha,
  obtenerResumenParaFecha,
  registrarAlimentoConsumido,
  eliminarAlimentoConsumidoPorId
} from '../services/macroLog.service';

export const obtenerResumenDelDia = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const fecha = parsearFecha(req.params.fecha);

  const resumen = await obtenerResumenParaFecha(userId, fecha);

  res.json({ fecha: req.params.fecha, ...resumen });
});

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

  const resultado = await registrarAlimentoConsumido(userId, fecha, alimentoId, cantidadG, comidaId);

  res.status(201).json({ fecha: req.params.fecha, ...resultado });
});

export const eliminarAlimentoConsumido = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const fecha = parsearFecha(req.params.fecha);
  const { itemId } = req.params;

  const resultado = await eliminarAlimentoConsumidoPorId(userId, fecha, itemId);

  res.json({ fecha: req.params.fecha, ...resultado });
});
