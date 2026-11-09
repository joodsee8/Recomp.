import { useCallback, useState } from 'react';
import type { Mensaje } from './MensajeBurbuja';
import * as chatService from '../../services/chat.service';
import { ApiError } from '../../services/apiClient';

function horaActual(): string {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function crearMensajeBienvenida(): Mensaje {
  return {
    id: 'bienvenida',
    autor: 'ia',
    texto: 'Hola 👋 Soy A.D.A.M., tu coach. Cuéntame qué comiste, cómo te fue en el entreno, o pregúntame cómo vas hoy.',
    hora: horaActual()
  };
}

// Historial que se le manda a la API en cada mensaje: solo autor+texto, sin
// los campos de UI (id, hora) que el backend no necesita.
const MAXIMO_HISTORIAL_ENVIADO = 8;

/**
 * Conversación con A.D.A.M. Vive en el layout de la app (no en una página),
 * así que la charla sigue ahí aunque el usuario cambie de pestaña.
 */
export function useChatAdam() {
  const [mensajes, setMensajes] = useState<Mensaje[]>(() => [crearMensajeBienvenida()]);
  const [escribiendo, setEscribiendo] = useState(false);

  const enviarMensaje = useCallback(
    async (texto: string) => {
      const mensajeUsuario: Mensaje = { id: crypto.randomUUID(), autor: 'usuario', texto, hora: horaActual() };
      const historialParaAPI = [...mensajes, mensajeUsuario]
        .slice(-MAXIMO_HISTORIAL_ENVIADO)
        .map((m) => ({ autor: m.autor, texto: m.texto }));

      setMensajes((prev) => [...prev, mensajeUsuario]);
      setEscribiendo(true);

      try {
        const { mensaje: respuesta } = await chatService.enviarMensaje(texto, historialParaAPI);
        setMensajes((prev) => [...prev, { id: crypto.randomUUID(), autor: 'ia', texto: respuesta, hora: horaActual() }]);
      } catch (e) {
        const esFaltaDeAPIKey = e instanceof ApiError && e.statusCode === 503;
        const textoError = esFaltaDeAPIKey
          ? 'Todavía no tengo configurada mi conexión con Gemini (falta GEMINI_API_KEY en el servidor) — avísale a quien administra la app.'
          : 'Se me cayó la conexión justo ahora. ¿Puedes intentar de nuevo?';
        setMensajes((prev) => [...prev, { id: crypto.randomUUID(), autor: 'ia', texto: textoError, hora: horaActual() }]);
      } finally {
        setEscribiendo(false);
      }
    },
    [mensajes]
  );

  return { mensajes, escribiendo, enviarMensaje };
}
