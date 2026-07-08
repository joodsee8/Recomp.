import { apiRequest } from './apiClient';
import type { EjercicioCatalogo } from '../types/api';

export function listarEjercicios(): Promise<{ ejercicios: EjercicioCatalogo[] }> {
  return apiRequest('/ejercicios');
}
