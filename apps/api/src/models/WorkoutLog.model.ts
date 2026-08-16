import { Schema, model, Document, Types } from 'mongoose';

/**
 * WorkoutLog
 * ----------
 * Registra UNA sesión de entrenamiento real del usuario (no la prescripción,
 * eso vive en Rutina). Aquí se guarda lo que efectivamente levantó: peso y
 * repeticiones por serie, para poder comparar semana contra semana y
 * validar sobrecarga progresiva.
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
  ejercicioId: string;
  nombreEjercicio: string;
  series: ISerieRegistrada[];
  notas?: string;
}

export interface IWorkoutLog extends Document {
  userId: Types.ObjectId;
  fecha: Date;
  diaRutinaId: string;
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
  { _id: false }
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

WorkoutLogSchema.index({ userId: 1, fecha: -1 });
WorkoutLogSchema.index({ userId: 1, diaRutinaId: 1, fecha: -1 });

export const WorkoutLog = model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema);
