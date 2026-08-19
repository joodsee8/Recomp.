import { Schema, model, Document } from 'mongoose';

/**
 * Rutina
 * ------
 * Guarda el PROGRAMA completo (la clave "rutina" de rutinas.json), con
 * dias -> ejercicios embebidos como subdocumentos.
 *
 * v2: el schema de cada ejercicio-en-día es un passthrough casi directo de
 * los campos reales del usuario (series como NÚMERO de sets prescritos,
 * repsMin/repsMax, descansoSegundos) — se descartó a propósito la idea de
 * expandir "series" en un array de sets individuales con RIR por set,
 * porque la rutina real del usuario prescribe series de forma homogénea
 * (ej. "4 series de 6-8 reps") sin distinguir calentamiento/RIR por set.
 * Meter eso en un array hubiera obligado a inventar datos que no existen.
 *
 * diaSemanaSugerido, enfoque y gruposMusculares son opcionales: el programa
 * real no fija un día de la semana por sesión, y enfoque/gruposMusculares
 * son metadata derivada/inferida, no dato duro.
 */

export interface IEjercicioDeRutina {
  ejercicioId: string; // referencia lógica a Ejercicio.ejercicioId
  orden: number;
  series: number;
  repsMin: number;
  repsMax: number;
  descansoSegundos: number;
  notas?: string; // ej. "10 minutos" para ejercicios por tiempo en vez de por reps (abdominales, planchas, etc.)
}

export interface IDiaRutina {
  diaId: string;
  orden: number;
  nombreDia: string;
  diaSemanaSugerido?: string;
  enfoque?: string;
  gruposMusculares?: string[];
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
  calentamiento?: {
    duracionMinutos: string;
    descripcion: string;
  };
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
    gruposMusculares: { type: [String] },
    ejercicios: {
      type: [EjercicioDeRutinaSchema],
      required: true,
      validate: {
        validator: (ejercicios: IEjercicioDeRutina[]) => ejercicios.length > 0,
        message: 'Un día debe tener al menos un ejercicio'
      }
    }
  },
  { _id: false }
);

const RutinaSchema = new Schema<IRutina>(
  {
    rutinaId: { type: String, required: true, unique: true, trim: true, lowercase: true },
    nombre: { type: String, required: true },
    version: { type: String, default: '1.0.0' },
    objetivo: { type: String, required: true },
    diasPorSemana: { type: Number, required: true, min: 1, max: 7 },
    fechaCreacion: { type: Date, default: Date.now },
    notasGenerales: { type: String },
    calentamiento: {
      type: new Schema(
        {
          duracionMinutos: { type: String, required: true },
          descripcion: { type: String, required: true }
        },
        { _id: false }
      ),
      required: false
    },
    dias: {
      type: [DiaRutinaSchema],
      required: true,
      validate: {
        validator: (dias: IDiaRutina[]) => dias.length > 0,
        message: 'Una rutina debe tener al menos un día'
      }
    },
    // Permite tener varios programas guardados (ej. una rutina de verano y
    // otra de mantenimiento) y marcar cuál es la que el Tracker debe mostrar
    // por defecto, sin necesidad de borrar las anteriores.
    activa: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Rutina = model<IRutina>('Rutina', RutinaSchema);
