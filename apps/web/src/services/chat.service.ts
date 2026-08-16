import { apiRequest } from './apiClient';
import type { MensajeChatBody, RespuestaChat } from '../types/api';

export function enviarMensaje(mensaje: string, historial: MensajeChatBody[]): Promise<RespuestaChat> {
  return apiRequest('/chat', { method: 'POST', body: { mensaje, historial } });
}
