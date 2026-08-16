import { apiRequest } from './apiClient';
import type { RespuestaLogros, Logro } from '../types/api';

export function listarLogros(): Promise<RespuestaLogros> {
  return apiRequest('/logros');
}

export function generarLogros(): Promise<{ logros: Logro[] }> {
  return apiRequest('/logros/generar', { method: 'POST' });
}
