import { apiRequest } from './apiClient';
import type { WorkoutLog, RespuestaHistorial, RespuestaProgreso, EjercicioRegistrado } from '../types/api';

export interface NuevaSesion {
  fecha: string;
  diaRutinaId: string;
  nombreDia: string;
  ejerciciosRegistrados: EjercicioRegistrado[];
  duracionMinutos?: number;
  notasSesion?: string;
  completado?: boolean;
}

export function crearSesion(sesion: NuevaSesion): Promise<{ sesion: WorkoutLog }> {
  return apiRequest('/workout-logs', { method: 'POST', body: sesion });
}

export function listarHistorial(filtros: {
  diaRutinaId?: string;
  page?: number;
  limit?: number;
} = {}): Promise<RespuestaHistorial> {
  const params = new URLSearchParams();
  if (filtros.diaRutinaId) params.set('diaRutinaId', filtros.diaRutinaId);
  if (filtros.page) params.set('page', String(filtros.page));
  if (filtros.limit) params.set('limit', String(filtros.limit));
  const query = params.toString();
  return apiRequest(`/workout-logs${query ? `?${query}` : ''}`);
}

export function obtenerProgresoEjercicio(ejercicioId: string): Promise<RespuestaProgreso> {
  return apiRequest(`/workout-logs/progreso/${ejercicioId}`);
}
