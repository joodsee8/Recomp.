import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

interface ErrorConNombreYCodigo {
  name?: string;
  code?: number;
  message?: string;
}

/**
 * errorHandler
 * ------------
 * Único lugar donde se decide qué status HTTP devolver por tipo de error.
 * Se monta AL FINAL de app.ts (después de todas las rutas). Gracias a
 * asyncHandler, cualquier throw dentro de un controller termina acá.
 */
export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  const errorTipado = error as ErrorConNombreYCodigo;

  // Errores de validación de Mongoose (campo requerido faltante, enum inválido, etc.)
  if (errorTipado?.name === 'ValidationError') {
    res.status(400).json({ error: errorTipado.message });
    return;
  }

  // CastError de Mongoose: por ejemplo un ObjectId con formato inválido en la URL
  if (errorTipado?.name === 'CastError') {
    res.status(400).json({ error: 'Identificador con formato inválido' });
    return;
  }

  // Violación de índice único (E11000)
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

/** Se monta justo antes de errorHandler, para rutas que no matchearon nada. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}
