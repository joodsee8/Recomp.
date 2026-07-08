import { apiRequest } from './apiClient';
import type { ResumenDelDia } from '../types/api';

export function obtenerResumenDelDia(fecha: string): Promise<ResumenDelDia> {
  return apiRequest(`/macro-logs/${fecha}`);
}

export function agregarAlimentoConsumido(
  fecha: string,
  alimentoId: string,
  cantidadG: number,
  comidaId?: string
): Promise<ResumenDelDia> {
  return apiRequest(`/macro-logs/${fecha}/alimentos`, {
    method: 'POST',
    body: { alimentoId, cantidadG, comidaId }
  });
}

export function eliminarAlimentoConsumido(fecha: string, itemId: string): Promise<ResumenDelDia> {
  return apiRequest(`/macro-logs/${fecha}/alimentos/${itemId}`, { method: 'DELETE' });
}
