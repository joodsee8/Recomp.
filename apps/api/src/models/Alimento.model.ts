import { Schema, model, Document } from 'mongoose';

/**
 * Alimento
 * --------
 * Catálogo de alimentos (array "alimentos" de dieta.json). Los macros se
 * guardan SIEMPRE normalizados por cada 100g: es la unidad universal que
 * permite escalar a cualquier cantidad consumida sin tener que guardar
 * combinaciones precalculadas (ver macroCalculator.service.ts, que hace
 * `factorEscala = cantidadG / 100`).
 *
 * Importante: este modelo es el CATÁLOGO. El registro de lo que el usuario
 * realmente comió vive en MacroLog, que guarda un snapshot de estos macros
 * al momento de registrar el alimento (para que corregir un dato acá no
 * altere el historial de días pasados).
 */

export interface IMacrosPor100g {
  calorias: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
  fibraG: number;
}

export interface IAlimento extends Document {
  alimentoId: string;
  nombre: string;
  categoria: string;
  marca?: string;
  macrosPor100g: IMacrosPor100g;
  porcionComunG?: number;
  porcionComunNombre?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MacrosPor100gSchema = new Schema<IMacrosPor100g>(
  {
    calorias: { type: Number, required: true, min: 0 },
    proteinaG: { type: Number, required: true, min: 0 },
    carbohidratosG: { type: Number, required: true, min: 0 },
    grasasG: { type: Number, required: true, min: 0 },
    fibraG: { type: Number, required: true, min: 0, default: 0 }
  },
  { _id: false }
);

const AlimentoSchema = new Schema<IAlimento>(
  {
    alimentoId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    nombre: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, index: true, lowercase: true, trim: true },
    marca: { type: String, trim: true },
    macrosPor100g: { type: MacrosPor100gSchema, required: true },
    porcionComunG: { type: Number, min: 0 },
    porcionComunNombre: { type: String, trim: true }
  },
  { timestamps: true }
);

// Búsqueda por nombre para el buscador de alimentos del Tracker de macros
// (ej. autocompletar "poll..." -> "Pechuga de Pollo").
AlimentoSchema.index({ nombre: 'text' });

export const Alimento = model<IAlimento>('Alimento', AlimentoSchema);
