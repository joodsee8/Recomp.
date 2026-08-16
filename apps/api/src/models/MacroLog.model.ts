import { Schema, model, Document, Types } from 'mongoose';

/**
 * MacroLog
 * --------
 * Registra lo que el usuario comió en UN día específico. Existe un único
 * documento por (userId, fecha).
 *
 * `macros` dentro de cada alimento consumido es un SNAPSHOT calculado en el
 * momento del registro (no un simple `cantidadG` que obligue a recalcular
 * contra el catálogo cada vez), para que corregir un dato del catálogo no
 * altere el historial de días pasados.
 */

export interface IMacros {
  calorias: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
  fibraG: number;
}

export interface IAlimentoConsumido {
  alimentoId: string;
  nombreAlimento: string;
  cantidadG: number;
  comidaId?: string;
  horaRegistro: Date;
  macros: IMacros;
}

export interface IMacroLog extends Document {
  userId: Types.ObjectId;
  fecha: Date;
  metaDelDia: IMacros;
  alimentosConsumidos: IAlimentoConsumido[];
  totalesConsumidos: IMacros;
  createdAt: Date;
  updatedAt: Date;
}

const MacrosSchema = new Schema<IMacros>(
  {
    calorias: { type: Number, required: true, min: 0 },
    proteinaG: { type: Number, required: true, min: 0 },
    carbohidratosG: { type: Number, required: true, min: 0 },
    grasasG: { type: Number, required: true, min: 0 },
    fibraG: { type: Number, required: true, min: 0, default: 0 }
  },
  { _id: false }
);

const AlimentoConsumidoSchema = new Schema<IAlimentoConsumido>(
  {
    alimentoId: { type: String, required: true },
    nombreAlimento: { type: String, required: true },
    cantidadG: { type: Number, required: true, min: 0 },
    comidaId: { type: String },
    horaRegistro: { type: Date, required: true, default: Date.now },
    macros: { type: MacrosSchema, required: true }
  },
  { _id: true } // el usuario debe poder borrar un alimento puntual del día sin tocar el resto
);

const MacroLogSchema = new Schema<IMacroLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fecha: { type: Date, required: true },
    metaDelDia: { type: MacrosSchema, required: true },
    alimentosConsumidos: { type: [AlimentoConsumidoSchema], default: [] },
    totalesConsumidos: {
      type: MacrosSchema,
      required: true,
      default: () => ({ calorias: 0, proteinaG: 0, carbohidratosG: 0, grasasG: 0, fibraG: 0 })
    }
  },
  { timestamps: true }
);

MacroLogSchema.index({ userId: 1, fecha: 1 }, { unique: true });

export const MacroLog = model<IMacroLog>('MacroLog', MacroLogSchema);
