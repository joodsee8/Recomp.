import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/User.model';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

const SALT_ROUNDS = 10;

function generarToken(userId: string): string {
  const opciones: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ userId }, env.jwtSecret, opciones);
}

export const registrar = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, nombre } = req.body as { email?: string; password?: string; nombre?: string };

  if (!email || !password || !nombre) {
    throw new AppError(400, 'email, password y nombre son requeridos');
  }
  if (password.length < 8) {
    throw new AppError(400, 'La contraseña debe tener al menos 8 caracteres');
  }

  const emailNormalizado = email.toLowerCase().trim();
  const existente = await User.findOne({ email: emailNormalizado });
  if (existente) {
    throw new AppError(409, 'Ya existe una cuenta con ese email');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const usuario = await User.create({ email: emailNormalizado, passwordHash, nombre });

  const token = generarToken(usuario.id);
  res.status(201).json({
    token,
    usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre }
  });
});

export const iniciarSesion = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    throw new AppError(400, 'email y password son requeridos');
  }

  // passwordHash tiene `select: false` en el schema (ver User.model.ts), hay
  // que pedirlo explícitamente para poder compararlo.
  const usuario = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');
  if (!usuario) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const passwordValido = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordValido) {
    throw new AppError(401, 'Credenciales inválidas');
  }

  const token = generarToken(usuario.id);
  res.json({
    token,
    usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre }
  });
});

export const obtenerPerfil = asyncHandler(async (req: Request, res: Response) => {
  const usuario = await User.findById(req.userId);
  if (!usuario) {
    throw new AppError(404, 'Usuario no encontrado');
  }
  res.json({ usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre } });
});
