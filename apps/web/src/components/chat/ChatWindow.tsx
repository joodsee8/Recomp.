import { useEffect, useRef, useState } from 'react';
import { MensajeBurbuja, type Mensaje } from './MensajeBurbuja';
import { IndicadorEscribiendo } from './IndicadorEscribiendo';
import { ChatInput } from './ChatInput';
import * as chatService from '../../services/chat.service';
import { ApiError } from '../../services/apiClient';
import './ChatWindow.css';

function horaActual(): string {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

const MENSAJE_BIENVENIDA: Mensaje = {
  id: 'bienvenida',
  autor: 'ia',
  texto: 'Hola 👋 Cuéntame qué comiste, cómo te fue en el entreno, o pregúntame cómo vas hoy.',
  hora: horaActual()
};

// Historial que se le manda a la API en cada mensaje: solo autor+texto, sin
// los campos de UI (id, hora) que el backend no necesita.
const MAXIMO_HISTORIAL_ENVIADO = 8;

export function ChatWindow() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_BIENVENIDA]);
  const [escribiendo, setEscribiendo] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, escribiendo]);

  async function enviarMensaje(texto: string) {
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
  }

  return (
    <div className="chat-window">
      <div className="chat-window-mensajes">
        {mensajes.map((m) => (
          <MensajeBurbuja key={m.id} mensaje={m} />
        ))}
        {escribiendo && <IndicadorEscribiendo />}
        <div ref={finRef} />
      </div>
      <ChatInput onEnviar={enviarMensaje} deshabilitado={escribiendo} />
    </div>
  );
}
