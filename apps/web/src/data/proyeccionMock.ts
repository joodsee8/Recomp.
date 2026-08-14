/**
 * proyeccionMock.ts
 * ------------------
 * PLACEHOLDER. No existe todavía un modelo de backend que trackee peso
 * corporal / % de grasa del usuario (WeightLog o similar), ni un endpoint
 * de proyección. Esta app hoy solo trackea comida (MacroLog) y
 * entrenamiento (WorkoutLog).
 *
 * Cuando el chat con IA esté conectado de verdad, la idea es que estos 3
 * valores (peso actual, % grasa, semanas para el objetivo) se calculen del
 * lado del backend a partir del historial real de peso + el déficit
 * calórico sostenido (ver metaCalorica en dieta.json). Por ahora se
 * muestran valores de referencia para que la tarjeta del Dashboard tenga
 * forma final, dejando claro en la UI que es un estimado.
 */

export interface PuntoPeso {
  semana: number;
  pesoKg: number;
}

export interface ProyeccionMock {
  pesoActualKg: number;
  grasaActualPct: number;
  pesoObjetivoKg: number;
  grasaObjetivoPct: number;
  semanasEstimadas: number;
  tendencia: PuntoPeso[];
}

export function obtenerProyeccionMock(): ProyeccionMock {
  return {
    pesoActualKg: 84.2,
    grasaActualPct: 22,
    pesoObjetivoKg: 78,
    grasaObjetivoPct: 16,
    semanasEstimadas: 14,
    tendencia: [
      { semana: 1, pesoKg: 86.5 },
      { semana: 2, pesoKg: 86.0 },
      { semana: 3, pesoKg: 85.6 },
      { semana: 4, pesoKg: 85.3 },
      { semana: 5, pesoKg: 84.9 },
      { semana: 6, pesoKg: 84.6 },
      { semana: 7, pesoKg: 84.4 },
      { semana: 8, pesoKg: 84.2 }
    ]
  };
}
