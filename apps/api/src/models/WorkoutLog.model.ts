import { Schema, model, Document, Types } from 'mongoose';

/**
 * WorkoutLog
 * ----------
 * Registra UNA sesión de entrenamiento real del usuario (no la prescripción,
 * eso vive en rutinas.json / colección Rutina). Aquí se guarda lo que
 * efectivamente levantó: peso y repeticiones por serie, para poder comparar
 * semana contra semana y validar sobrecarga progresiva.
 *
 * Decisión de diseño: los ejercicios y series se modelan como subdocumentos
 * EMBEBIDOS (no colecciones separadas con ref). Razón: siempre se leen y
 * escriben junto con la sesión completa (nunca se consulta "una serie suelta"
 * de forma aislada), por lo que embeber evita JOINs/populates innecesarios y
 * hace que guardar una sesión completa sea una sola escritura atómica.
 */

export interface ISerieRegistrada {
  numeroSerie: number;
  pesoKg: number;
  repsLogradas: number;
  rirReportado?: number;
  completada: boolean;
  esRecordPersonal?: boolean;
}

export interface IEjercicioRegistrado {
  ejercicioId: string; // referencia "lógica" al ejercicioId del catálogo (rutinas.json)
  nombreEjercicio: string; // denormalizado a propósito: el historial debe verse igual aunque el catálogo cambie de nombre después
  series: ISerieRegistrada[];
  notas?: string;
}

export interface IWorkoutLog extends Document {
  userId: Types.ObjectId;
  fecha: Date;
  diaRutinaId: string; // ej. "torso_pesado", referencia lógica a rutinas.json
  nombreDia: string;
  ejerciciosRegistrados: IEjercicioRegistrado[];
  duracionMinutos?: number;
  notasSesion?: string;
  completado: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SerieRegistradaSchema = new Schema<ISerieRegistrada>(
  {
    numeroSerie: { type: Number, required: true, min: 1 },
    pesoKg: { type: Number, required: true, min: 0 },
    repsLogradas: { type: Number, required: true, min: 0 },
    rirReportado: { type: Number, min: 0, max: 10 },
    completada: { type: Boolean, default: true },
    esRecordPersonal: { type: Boolean, default: false }
  },
  { _id: false } // no necesita id propio: nunca se referencia ni se edita una serie de forma individual fuera del array
);

const EjercicioRegistradoSchema = new Schema<IEjercicioRegistrado>(
  {
    ejercicioId: { type: String, required: true, index: true },
    nombreEjercicio: { type: String, required: true },
    series: {
      type: [SerieRegistradaSchema],
      required: true,
      validate: {
        validator: (series: ISerieRegistrada[]) => series.length > 0,
        message: 'Un ejercicio registrado debe tener al menos una serie'
      }
    },
    notas: { type: String, trim: true }
  },
  { _id: false }
);

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fecha: { type: Date, required: true, index: true },
    diaRutinaId: { type: String, required: true },
    nombreDia: { type: String, required: true },
    ejerciciosRegistrados: { type: [EjercicioRegistradoSchema], required: true },
    duracionMinutos: { type: Number, min: 0 },
    notasSesion: { type: String, trim: true },
    completado: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Índice principal: el Historial siempre pagina "las últimas sesiones de este usuario"
WorkoutLogSchema.index({ userId: 1, fecha: -1 });

// Índice secundario: acelera la vista "progreso de Torso Pesado a través del tiempo",
// que es exactamente lo que se necesita para graficar sobrecarga progresiva por ejercicio/día.
WorkoutLogSchema.index({ userId: 1, diaRutinaId: 1, fecha: -1 });

export const WorkoutLog = model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
