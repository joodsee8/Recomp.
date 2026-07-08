import { apiRequest } from './apiClient';
import type { RespuestaAuth, Usuario } from '../types/api';

export function registrar(email: string, password: string, nombre: string): Promise<RespuestaAuth> {
  return apiRequest<RespuestaAuth>('/auth/registro', { method: 'POST', body: { email, password, nombre } });
}

export function iniciarSesion(email: string, password: string): Promise<RespuestaAuth> {
  return apiRequest<RespuestaAuth>('/auth/login', { method: 'POST', body: { email, password } });
}

export function obtenerPerfil(): Promise<{ usuario: Usuario }> {
  return apiRequest<{ usuario: Usuario }>('/auth/perfil');
}
