/**
 * apiClient.ts
 * ------------
 * Wrapper delgado sobre fetch. Todo lo que necesita cada *.service.ts:
 * agrega el header Authorization automáticamente si hay token guardado,
 * parsea el JSON de respuesta, y si el backend respondió con
 * { error: "mensaje" } (ver errorHandler.middleware.ts del backend) lo
 * convierte en una excepción ApiError con el mensaje real del servidor en
 * vez de un genérico "Failed to fetch".
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://fitness-recomp-api.onrender.com';

const CLAVE_TOKEN = 'recomp_token';

export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function guardarToken(token: string): void {
  localStorage.setItem(CLAVE_TOKEN, token);
}

export function obtenerToken(): string | null {
  return localStorage.getItem(CLAVE_TOKEN);
}

export function borrarToken(): void {
  localStorage.removeItem(CLAVE_TOKEN);
}

interface OpcionesRequest {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

export async function apiRequest<T>(ruta: string, opciones: OpcionesRequest = {}): Promise<T> {
  const token = obtenerToken();

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const respuesta = await fetch(`${BASE_URL}${ruta}`, {
    method: opciones.method ?? 'GET',
    headers,
    body: opciones.body !== undefined ? JSON.stringify(opciones.body) : undefined
  });

  // 204 No Content u otras respuestas sin cuerpo
  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : null;

  if (!respuesta.ok) {
    const mensaje = datos?.error ?? `Error ${respuesta.status}`;
    throw new ApiError(respuesta.status, mensaje);
  }

  return datos as T;
}
