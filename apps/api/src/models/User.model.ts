import { Schema, model, Document } from 'mongoose';

/**
 * User
 * ----
 * Modelo mínimo de usuario para poder emitir JWT y scopear WorkoutLog/
 * MacroLog por userId.
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
