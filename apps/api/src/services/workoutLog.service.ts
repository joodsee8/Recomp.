import { WorkoutLog, IWorkoutLog } from '../models/WorkoutLog.model';
import { AppError } from '../utils/AppError';

/**
 * workoutLog.service.ts
 * -----------------------
 * Hasta ahora WorkoutLog no tenía NINGUNA forma de borrar una sesión — ni
 * endpoint REST, ni lógica. Se agrega acá (no directo en el controller)
 * para que el Chat pueda reutilizar exactamente la misma función que el
 * futuro botón de "borrar" en el Historial, sin duplicar la query de
 * "borra y confírmame qué borraste".
 */

export async function eliminarSesion(userId: string, sesionId: string): Promise<IWorkoutLog> {
  const sesion = await WorkoutLog.findOneAndDelete({ _id: sesionId, userId });
  if (!sesion) {
    throw new AppError(404, 'No se encontró esa sesión (o no es tuya)');
  }
  return sesion;
}

/**
 * La sesión más reciente del usuario, opcionalmente filtrada por día de
 * rutina. La usa el Chat cuando el usuario dice "borra mi último
 * entrenamiento" sin dar un id — es la corrección más probable ("me
 * equivoqué en lo que acabo de registrar").
 */
export async function obtenerSesionMasReciente(userId: string, diaRutinaId?: string): Promise<IWorkoutLog | null> {
  const filtro: Record<string, unknown> = { userId };
  if (diaRutinaId) filtro.diaRutinaId = diaRutinaId;
  return WorkoutLog.findOne(filtro).sort({ fecha: -1, createdAt: -1 });
}
