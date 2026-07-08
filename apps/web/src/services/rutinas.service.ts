import { apiRequest } from './apiClient';
import type { RutinaResumen, RutinaCompleta, DiaDeRutinaResuelto } from '../types/api';

export function listarRutinas(): Promise<{ rutinas: RutinaResumen[] }> {
  return apiRequest('/rutinas');
}

export function obtenerRutina(rutinaId: string): Promise<{ rutina: RutinaCompleta }> {
  return apiRequest(`/rutinas/${rutinaId}`);
}

export function obtenerDiaDeRutina(rutinaId: string, diaId: string): Promise<DiaDeRutinaResuelto> {
  return apiRequest(`/rutinas/${rutinaId}/dias/${diaId}`);
}
