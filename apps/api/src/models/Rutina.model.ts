import { Schema, model, Document } from 'mongoose';

/**
 * Rutina
 * ------
 * Guarda cada PROGRAMA completo (un elemento del array "rutinas" de
 * rutinas.json), con dias -> ejercicios embebidos como subdocumentos.
 *
 * v2 — revisado contra el rutinas.json REAL del usuario (2026-07-02):
 * la v1 de este modelo exigía un array `series[]` con RIR y tipo de serie
 * (calentamiento/trabajo) por cada set individual. Esa granularidad era
 * inventada para el JSON de ejemplo, pero el programa real del usuario
 * prescribe series de forma homogénea por ejercicio (ej. "4 series de 6-8
 * reps"), sin RIR ni distinción de calentamiento por set. Se simplifica el
 * modelo para reflejar la prescripción real en vez de forzar datos
 * fabricados. Esto NO afecta a WorkoutLog: el registro de lo que el usuario
 * realmente levanta sigue siendo serie por serie, con peso y reps exactos —
 * la sobrecarga progresiva se mide ahí, no en la prescripción.
 *
 * Misma decisión de diseño que en WorkoutLog: días y ejercicios se leen y
 * escriben siempre juntos como un solo programa, así que embeber evita
 * populates innecesarios y permite pedir "dame el Día 3 - Pierna completo"
 * en una sola query.
 *
 * `ejercicioId` dentro de cada ejercicio de rutina es una referencia LÓGICA
 * (no un ObjectId con `ref`) al catálogo Ejercicio. Se resuelve en el
 * service/controller cuando el frontend necesita nombre/grupo muscular.
 */

export interface IEjercicioDeRutina {
  ejercicioId: string; // referencia lógica a Ejercicio.ejercicioId
  orden: number;
  series: number;
  repsMin: number;
  repsMax: number;
  descansoSegundos: number;
  notas?: string; // ej. "10 minutos" en abdominales, instrucciones libres
}

export interface IDiaRutina {
  diaId: string;
  orden: number;
  nombreDia: string;
  diaSemanaSugerido?: string; // opcional: el programa real no asigna día de la semana fijo
  enfoque?: string; // opcional: ej. "fuerza" / "hipertrofia", no siempre se clasifica
  gruposMusculares?: string[]; // opcional: se puede derivar de los ejercicios si no se provee
  ejercicios: IEjercicioDeRutina[];
}

export interface IRutina extends Document {
  rutinaId: string;
  nombre: string;
  version: string;
  objetivo: string;
  diasPorSemana: number;
  fechaCreacion: Date;
  notasGenerales?: string;
  dias: IDiaRutina[];
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EjercicioDeRutinaSchema = new Schema<IEjercicioDeRutina>(
  {
    ejercicioId: { type: String, required: true },
    orden: { type: Number, required: true },
    series: { type: Number, required: true, min: 1 },
    repsMin: { type: Number, required: true, min: 1 },
    repsMax: { type: Number, required: true, min: 1 },
    descansoSegundos: { type: Number, required: true, min: 0 },
    notas: { type: String, trim: true }
  },
  { _id: false }
);

const DiaRutinaSchema = new Schema<IDiaRutina>(
  {
    diaId: { type: String, required: true },
    orden: { type: Number, required: true },
    nombreDia: { type: String, required: true },
    diaSemanaSugerido: { type: String, lowercase: true },
    enfoque: { type: String },
    gruposMusculares: { type: [String], default: undefined },
    ejercicios: {
      type: [EjercicioDeRutinaSchema],
      required: true,
      validate: {
        validator: (ejercicios: IEjercicioDeRutina[]) => ejercicios.length > 0,
        message: 'Un día de la rutina debe tener al menos un ejercicio'
      }
    }
  },
  { _id: false }
);

const RutinaSchema = new Schema<IRutina>(
  {
    rutinaId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    nombre: { type: String, required: true },
    // version y fechaCreacion tienen default: son metadatos de gestión del
    // programa, no algo que el usuario deba escribir a mano en cada rutina.
    version: { type: String, default: '1.0.0' },
    objetivo: { type: String, required: true },
    diasPorSemana: { type: Number, required: true, min: 1, max: 7 },
    fechaCreacion: { type: Date, default: Date.now },
    notasGenerales: { type: String },
    dias: {
      type: [DiaRutinaSchema],
      required: true,
      validate: {
        validator: (dias: IDiaRutina[]) => dias.length > 0,
        message: 'Una rutina debe tener al menos un día'
      }
    },
    // Permite tener varios programas guardados (ej. rutina de verano y otra
    // de mantenimiento) y marcar cuál debe mostrar el Tracker por defecto.
    activa: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Rutina = model<IRutina>('Rutina', RutinaSchema);
