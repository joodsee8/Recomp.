import { Schema, model, Document } from 'mongoose';

/**
 * User
 * ----
 * Modelo mínimo de usuario para poder emitir JWT y scopear WorkoutLog/
 * MacroLog por userId. No guarda perfil de fitness (peso, % grasa, meta
 * calórica personalizada) todavía — eso es la evolución natural cuando se
 * quiera reemplazar el placeholder de metaCalorica en dieta.json por una
 * meta calórica propia por usuario (ver nota en macroLog.controller.ts).
 */

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email inválido']
    },
    passwordHash: { type: String, required: true, select: false },
    nombre: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
