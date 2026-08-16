import { Schema, model, Document } from 'mongoose';

/**
 * Comida
 * ------
 * Catálogo de "comidas estructuradas del plan alimenticio" (array "comidas"
 * de dieta.json), ej. "Almuerzo - Pollo, Arroz y Brócoli". Cada comida es
 * una composición de alimentos del catálogo Alimento con su cantidad en
 * gramos.
 */

export interface IIngredienteDeComida {
  alimentoId: string; // referencia lógica a Alimento.alimentoId
  cantidadG: number;
}

export interface IComida extends Document {
  comidaId: string;
  nombre: string;
  tipo?: string;
  horarioSugerido?: string;
  ingredientes: IIngredienteDeComida[];
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IngredienteDeComidaSchema = new Schema<IIngredienteDeComida>(
  {
    alimentoId: { type: String, required: true },
    cantidadG: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const ComidaSchema = new Schema<IComida>(
  {
    comidaId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    nombre: { type: String, required: true, trim: true },
    tipo: { type: String, index: true, trim: true }, // ej. "Desayuno" | "Comida" | "Cena" | "Snack" — libre a propósito, no enum
    horarioSugerido: { type: String },
    ingredientes: {
      type: [IngredienteDeComidaSchema],
      required: true,
      validate: {
        validator: (ingredientes: IIngredienteDeComida[]) => ingredientes.length > 0,
        message: 'Una comida debe tener al menos un ingrediente'
      }
    },
    notas: { type: String, trim: true }
  },
  { timestamps: true }
);

export const Comida = model<IComida>('Comida', ComidaSchema);
