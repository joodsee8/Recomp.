import { Schema, model, Document, Types } from 'mongoose';
import { IDS_ICONOS_LOGROS } from '../data/iconosLogros';
import { IDS_METRICAS_LOGROS, MetricaLogro } from '../data/metricasLogros';

/**
 * Logro
 * -----
 * Un logro concreto para UN usuario. `titulo`, `descripcion`, `categoria`,
 * `periodo` e `icono` los genera Gemini (creativo, variado). `criterio`
 * también lo elige Gemini, pero SOLO de un catálogo cerrado de métricas que
 * el backend sabe calcular (ver metricasLogros.ts) — así el progreso se
 * recalcula releyendo Mongo, sin volver a llamar a la IA.
 */

export interface ICriterioLogro {
  metrica: MetricaLogro;
  comparador: '>=' | '=';
  objetivo: number;
}

export interface ILogro extends Document {
  userId: Types.ObjectId;
  titulo: string;
  descripcion: string;
  categoria: 'dieta' | 'ejercicio' | 'mixto';
  periodo: 'diario' | 'semanal' | 'mensual';
  icono: string;
  criterio: ICriterioLogro;
  progresoActual: number;
  metaObjetivo: number;
  desbloqueado: boolean;
  fechaDesbloqueo?: Date;
  fechaInicioPeriodo: Date;
  fechaFinPeriodo: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CriterioLogroSchema = new Schema<ICriterioLogro>(
  {
    metrica: { type: String, required: true, enum: IDS_METRICAS_LOGROS },
    comparador: { type: String, required: true, enum: ['>=', '='] },
    objetivo: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const LogroSchema = new Schema<ILogro>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    categoria: { type: String, required: true, enum: ['dieta', 'ejercicio', 'mixto'] },
    periodo: { type: String, required: true, enum: ['diario', 'semanal', 'mensual'], index: true },
    icono: { type: String, required: true, enum: IDS_ICONOS_LOGROS },
    criterio: { type: CriterioLogroSchema, required: true },
    progresoActual: { type: Number, required: true, default: 0, min: 0 },
    metaObjetivo: { type: Number, required: true, min: 1 },
    desbloqueado: { type: Boolean, required: true, default: false, index: true },
    fechaDesbloqueo: { type: Date },
    fechaInicioPeriodo: { type: Date, required: true },
    fechaFinPeriodo: { type: Date, required: true }
  },
  { timestamps: true }
);

// La pantalla de logros siempre pide "los logros activos/recientes de este usuario".
LogroSchema.index({ userId: 1, fechaFinPeriodo: -1 });

export const Logro = model<ILogro>('Logro', LogroSchema);
