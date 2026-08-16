import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { responderMensaje } from '../services/chat.service';

export const enviarMensaje = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId as string;
  const { mensaje, historial } = req.body as {
    mensaje?: string;
    historial?: { autor: 'usuario' | 'ia'; texto: string }[];
  };

  if (!mensaje || !mensaje.trim()) {
    throw new AppError(400, 'mensaje es requerido');
  }

  const respuesta = await responderMensaje(userId, mensaje.trim(), historial ?? []);

  res.json(respuesta);
});
