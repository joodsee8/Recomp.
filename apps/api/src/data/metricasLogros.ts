/**
 * metricasLogros.ts
 * ------------------
 * Catálogo CERRADO de métricas que el evaluador (logrosEvaluator.service.ts)
 * sabe calcular contra datos reales de Mongo. Gemini arma el criterio de
 * cada logro eligiendo una de estas métricas (enum en el schema de
 * respuesta) — nunca describe en texto libre "cómo" evaluar algo, siempre
 * en términos de una de estas métricas ya soportadas por el backend.
 *
 * Esto es lo que hace posible evaluar el progreso SIN volver a llamar a la
 * IA cada vez que el usuario abre la pantalla de logros: es aritmética
 * simple contra Mongo.
 */

export type MetricaLogro =
  | 'dias_con_macros_registrados'
  | 'dias_cumpliendo_meta_proteina'
  | 'sesiones_entrenamiento'
  | 'records_personales'
  | 'series_completadas'
  | 'volumen_total_kg'
  | 'ejercicios_distintos_entrenados'
  | 'racha_dias_consecutivos_macros';

interface DefinicionMetrica {
  id: MetricaLogro;
  descripcionParaIA: string;
  categoriaSugerida: 'dieta' | 'ejercicio';
}

export const METRICAS_LOGROS: DefinicionMetrica[] = [
  {
    id: 'dias_con_macros_registrados',
    descripcionParaIA: 'Cantidad de días distintos en el periodo donde el usuario registró al menos una comida',
    categoriaSugerida: 'dieta'
  },
  {
    id: 'dias_cumpliendo_meta_proteina',
    descripcionParaIA: 'Cantidad de días en el periodo donde la proteína consumida alcanzó su meta diaria',
    categoriaSugerida: 'dieta'
  },
  {
    id: 'sesiones_entrenamiento',
    descripcionParaIA: 'Cantidad de sesiones de entrenamiento (WorkoutLog) completadas en el periodo',
    categoriaSugerida: 'ejercicio'
  },
  {
    id: 'records_personales',
    descripcionParaIA: 'Cantidad de series marcadas como récord personal (PR) logradas en el periodo',
    categoriaSugerida: 'ejercicio'
  },
  {
    id: 'series_completadas',
    descripcionParaIA: 'Cantidad total de series completadas (de cualquier ejercicio) en el periodo',
    categoriaSugerida: 'ejercicio'
  },
  {
    id: 'volumen_total_kg',
    descripcionParaIA: 'Volumen total levantado en el periodo, sumando peso × repeticiones de todas las series',
    categoriaSugerida: 'ejercicio'
  },
  {
    id: 'ejercicios_distintos_entrenados',
    descripcionParaIA: 'Cantidad de ejercicios distintos (por ejercicioId) entrenados en el periodo',
    categoriaSugerida: 'ejercicio'
  },
  {
    id: 'racha_dias_consecutivos_macros',
    descripcionParaIA: 'Racha más larga de días CONSECUTIVOS con registro de macros dentro del periodo',
    categoriaSugerida: 'dieta'
  }
];

export const IDS_METRICAS_LOGROS = METRICAS_LOGROS.map((m) => m.id);

export function esMetricaValida(id: string): id is MetricaLogro {
  return (IDS_METRICAS_LOGROS as string[]).includes(id);
}
