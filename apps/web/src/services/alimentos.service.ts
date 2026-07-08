import { apiRequest } from './apiClient';
import type { AlimentoCatalogo } from '../types/api';

export function buscarAlimentos(q: string): Promise<{ alimentos: AlimentoCatalogo[] }> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  return apiRequest(`/alimentos?${params.toString()}`);
}
