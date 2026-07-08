import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

interface JwtPayload {
  userId: string;
}

/**
 * requireAuth
 * -----------
 * Exige header `Authorization: Bearer <token>`, valida el JWT contra
 * env.jwtSecret y adjunta `req.userId` para que los controllers de
 * WorkoutLog/MacroLog puedan scopear todo por usuario. Se monta como
 * `router.use(requireAuth)` al inicio de cada archivo de rutas protegido.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(new AppError(401, 'No autenticado: falta el header "Authorization: Bearer <token>"'));
    return;
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.userId = payload.userId;
    next();
  } catch (error) {
    next(new AppError(401, 'Token inválido o expirado'));
  }
}
