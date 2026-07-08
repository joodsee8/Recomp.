import { Schema, model, Document } from 'mongoose';

/**
 * Comida
 * ------
 * Catálogo de "comidas estructuradas del plan alimenticio" (array "comidas"
 * de dieta.json), ej. "Almuerzo - Pollo, Arroz y Brócoli". Cada comida es
 * una composición de alimentos del catálogo Alimento con su cantidad en
 * gramos.
 *
 * No se agrega aquí este modelo por pedido explícito, pero es necesario
 * para que seedDieta.ts pueda sembrar TODO dieta.json de forma coherente
 * (si solo sembramos "alimentos" e ignoramos "comidas", perdemos la mitad
 * del archivo y el frontend no podría ofrecer "seleccionar comida
 * estructurada" en vez de cargar alimento por alimento).
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
    tipo: { type: String, index: true, trim: true }, // ej. "Desayuno" | "Comida" | "Cena" | "Snack" — libre a propósito, no enum, por si el usuario agrega categorías nuevas
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
