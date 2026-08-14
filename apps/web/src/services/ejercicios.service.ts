import { apiRequest } from './apiClient';
import type { EjercicioCatalogo } from '../types/api';

export function listarEjercicios(grupoMuscular?: string): Promise<{ ejercicios: EjercicioCatalogo[] }> {
  const params = new URLSearchParams();
  if (grupoMuscular) params.set('grupoMuscular', grupoMuscular);
  const query = params.toString();
  return apiRequest(`/ejercicios${query ? `?${query}` : ''}`);
}
