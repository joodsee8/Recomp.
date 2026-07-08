import { Schema, model, Document } from 'mongoose';

/**
 * Ejercicio
 * ---------
 * Catálogo de ejercicios (la "bibliotecaEjercicios" de rutinas.json). Vive
 * separado del programa de rutina porque un mismo ejercicio (ej. Sentadilla)
 * puede aparecer referenciado desde múltiples días o múltiples programas;
 * este modelo es la única fuente de verdad de "qué es" cada ejercicio
 * (nombre, grupo muscular, equipo), mientras que Rutina.model.ts define
 * "cómo se prescribe" (series, reps, descanso) para un programa específico.
 */

export interface IEjercicio extends Document {
  ejercicioId: string;
  nombre: string;
  grupoMuscularPrincipal: string;
  equipo: string;
  videoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const EjercicioSchema = new Schema<IEjercicio>(
  {
    ejercicioId: {
      type: String,
      required: true,
      unique: true, // garantiza a nivel de índice que no se dupliquen ejercicios en re-seeds parciales o inserciones manuales
      trim: true,
      lowercase: true
    },
    nombre: { type: String, required: true, trim: true },
    grupoMuscularPrincipal: { type: String, required: true, index: true, lowercase: true, trim: true },
    equipo: { type: String, required: true, lowercase: true, trim: true },
    videoUrl: { type: String, default: null }
  },
  { timestamps: true }
);

export const Ejercicio = model<IEjercicio>('Ejercicio', EjercicioSchema);
