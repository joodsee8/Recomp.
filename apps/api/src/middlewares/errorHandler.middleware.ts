import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

interface ErrorConNombreYCodigo {
  name?: string;
  code?: number;
  message?: string;
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  const errorTipado = error as ErrorConNombreYCodigo;

  if (errorTipado?.name === 'ValidationError') {
    res.status(400).json({ error: errorTipado.message });
    return;
  }

  if (errorTipado?.name === 'CastError') {
    res.status(400).json({ error: 'Identificador con formato inválido' });
    return;
  }

  if (errorTipado?.code === 11000) {
    res.status(409).json({ error: 'Ya existe un registro con ese identificador único' });
    return;
  }

  console.error('[error no controlado]', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    detalle: env.nodeEnv === 'development' ? String(errorTipado?.message ?? error) : undefined
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}
