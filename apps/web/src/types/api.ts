/**
 * api.ts (types)
 * --------------
 * Espejo de las formas de respuesta reales de la API — mismos nombres de
 * campo que los controllers del backend (rutina.controller.ts,
 * macroLog.controller.ts, workoutLog.controller.ts, etc.), para que no haya
 * que traducir nada al consumir fetch().
 */

export interface Macros {
  calorias: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
  fibraG: number;
}

export interface PorcentajeCumplido {
  calorias: number;
  proteinaG: number;
  carbohidratosG: number;
  grasasG: number;
}

// ---------- Auth ----------

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
}

export interface RespuestaAuth {
  token: string;
  usuario: Usuario;
}

// ---------- Rutina / Ejercicio ----------

export interface EjercicioCatalogo {
  ejercicioId: string;
  nombre: string;
  grupoMuscularPrincipal: string;
  equipo: string;
  videoUrl: string | null;
}

export interface RutinaResumen {
  rutinaId: string;
  nombre: string;
  objetivo: string;
  diasPorSemana: number;
  activa: boolean;
}

export interface DiaRutinaResumen {
  diaId: string;
  orden: number;
  nombreDia: string;
  enfoque?: string;
  gruposMusculares?: string[];
}

export interface RutinaCompleta extends RutinaResumen {
  version: string;
  notasGenerales?: string;
  dias: DiaRutinaResumen[];
}

export interface EjercicioDeDiaResuelto {
  ejercicioId: string;
  orden: number;
  series: number;
  repsMin: number;
  repsMax: number;
  descansoSegundos: number;
  notas?: string;
  nombre: string;
  grupoMuscularPrincipal: string | null;
  equipo: string | null;
  videoUrl: string | null;
}

export interface DiaDeRutinaResuelto {
  rutinaId: string;
  diaId: string;
  nombreDia: string;
  enfoque: string | null;
  gruposMusculares: string[];
  ejercicios: EjercicioDeDiaResuelto[];
}

// ---------- WorkoutLog ----------

export interface SerieRegistrada {
  numeroSerie: number;
  pesoKg: number;
  repsLogradas: number;
  rirReportado?: number;
  completada: boolean;
  esRecordPersonal?: boolean;
}

export interface EjercicioRegistrado {
  ejercicioId: string;
  nombreEjercicio: string;
  series: SerieRegistrada[];
  notas?: string;
}

export interface WorkoutLog {
  _id: string;
  userId: string;
  fecha: string;
  diaRutinaId: string;
  nombreDia: string;
  ejerciciosRegistrados: EjercicioRegistrado[];
  duracionMinutos?: number;
  notasSesion?: string;
  completado: boolean;
  createdAt: string;
}

export interface Paginacion {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface RespuestaHistorial {
  sesiones: WorkoutLog[];
  paginacion: Paginacion;
}

export interface PuntoDeProgreso {
  fecha: string;
  pesoMaximoKg: number;
  repsEnPesoMaximo: number;
  volumenTotalKg: number;
  huboRecordPersonal: boolean;
}

export interface RespuestaProgreso {
  ejercicioId: string;
  progreso: PuntoDeProgreso[];
}

// ---------- Alimento / Comida ----------

export interface AlimentoCatalogo {
  alimentoId: string;
  nombre: string;
  categoria: string;
  marca?: string;
  macrosPor100g: Macros;
  porcionComunG?: number;
  porcionComunNombre?: string;
}

export interface ComidaResumen {
  comidaId: string;
  nombre: string;
  tipo?: string;
}

// ---------- MacroLog / Dashboard ----------

export interface AlimentoConsumido {
  _id: string;
  alimentoId: string;
  nombreAlimento: string;
  cantidadG: number;
  comidaId?: string;
  horaRegistro: string;
  macros: Macros;
}

export interface ResumenDelDia {
  fecha: string;
  alimentosConsumidos: AlimentoConsumido[];
  totales: Macros;
  meta: Macros;
  restante: Macros;
  porcentajeCumplido: PorcentajeCumplido;
}
