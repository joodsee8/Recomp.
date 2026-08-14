export interface EstadoSerie {
  numeroSerie: number;
  pesoKg: string;
  repsLogradas: string;
  completada: boolean;
  esRecordPersonal?: boolean;
}

export interface EstadoEjercicio {
  ejercicioId: string;
  nombreEjercicio: string;
  repsMin: number;
  repsMax: number;
  descansoSegundos: number;
  notas?: string;
  series: EstadoSerie[];
}

export type FaseSesion =
  | { tipo: 'calentamiento' }
  | { tipo: 'inicio_ejercicio'; indiceEjercicio: number }
  | { tipo: 'registrar_serie'; indiceEjercicio: number; indiceSerie: number }
  | { tipo: 'descanso_serie'; indiceEjercicio: number; indiceSerieSiguiente: number }
  | { tipo: 'descanso_ejercicio'; indiceEjercicioSiguiente: number }
  | { tipo: 'guardando' }
  | { tipo: 'resumen' };
