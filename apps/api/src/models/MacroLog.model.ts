import { Schema, model, Document, Types } from 'mongoose';

/**
 * MacroLog
 * --------
 * Registra lo que el usuario comió en UN día específico. Existe un único
 * documento por (userId, fecha): cada vez que el usuario agrega un alimento
 * se hace push al array `alimentosConsumidos` y se recalculan los totales.
 *
 * Decisión clave de diseño: `macros` dentro de cada alimento consumido es un
 * SNAPSHOT calculado en el momento del registro (no un simple `cantidadG`
 * que obligue a recalcular contra el catálogo cada vez). Esto es importante
 * porque dieta.json puede cambiar en el futuro (el usuario corrige las
 * calorías de un alimento, sube una nueva versión del catálogo, etc.) y el
 * historial de días pasados NO debe moverse retroactivamente. Es el mismo
 * principio que usan apps como MyFitnessPal: el diario es inmutable respecto
 * al catálogo.
 */

export interface IMacros {
  calorias: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
  fibraG: number;
}

export interface IAlimentoConsumido {
  alimentoId: string; // referencia lógica al catálogo en dieta.json
  nombreAlimento: string; // denormalizado, mismo motivo que en WorkoutLog
  cantidadG: number;
  comidaId?: string; // a qué comida estructurada pertenece (ej. "almuerzo_pollo_arroz"), opcional si fue un registro libre
  horaRegistro: Date;
  macros: IMacros; // snapshot ya calculado, ver razonamiento arriba
}

export interface IMacroLog extends Document {
  userId: Types.ObjectId;
  fecha: Date; // normalizada a 00:00:00 del día (ver helper normalizarFecha en el service layer)
  metaDelDia: IMacros; // snapshot de la meta vigente ese día (la meta también puede cambiar con el tiempo)
  alimentosConsumidos: IAlimentoConsumido[];
  totalesConsumidos: IMacros; // denormalizado y recalculado en cada escritura para que el Dashboard lea en O(1), sin tener que sumar el array en cada request
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
  { _id: true } // a diferencia de las series del WorkoutLog, aquí SÍ se necesita _id propio: el usuario debe poder borrar un alimento puntual del día sin tocar el resto
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

// Un único documento por usuario por día: evita duplicados y habilita upsert atómico
// con findOneAndUpdate({ userId, fecha }, { $push: ... }, { upsert: true }).
MacroLogSchema.index({ userId: 1, fecha: 1 }, { unique: true });

export const MacroLog = model<IMacroLog>('MacroLog', MacroLogSchema);
