import { useEffect, useRef, useState } from 'react';
import { MensajeBurbuja, type Mensaje } from './MensajeBurbuja';
import { IndicadorEscribiendo } from './IndicadorEscribiendo';
import { ChatInput } from './ChatInput';
import './ChatWindow.css';

function horaActual(): string {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

const MENSAJE_BIENVENIDA: Mensaje = {
  id: 'bienvenida',
  autor: 'ia',
  texto:
    'Hola 👋 Todavía estoy en construcción — por ahora solo puedo mostrarte cómo se va a ver esto. Pronto vas a poder registrar comida, pesos y series solo platicando conmigo.',
  hora: horaActual()
};

/**
 * Respuesta simulada, SOLO para que la interfaz se sienta completa mientras
 * se conecta la lógica real de IA. No interpreta el mensaje del usuario.
 */
const RESPUESTA_PLACEHOLDER =
  'Por ahora esto es solo la interfaz — todavía no proceso lo que me escribes. Cuando esté conectada la lógica real, voy a poder registrar esto directo en tu Dashboard.';

export function ChatWindow() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_BIENVENIDA]);
  const [escribiendo, setEscribiendo] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, escribiendo]);

  function enviarMensaje(texto: string) {
    const mensajeUsuario: Mensaje = { id: crypto.randomUUID(), autor: 'usuario', texto, hora: horaActual() };
    setMensajes((prev) => [...prev, mensajeUsuario]);
    setEscribiendo(true);

    // Simulación de respuesta — reemplazar por la llamada real al backend de IA.
    setTimeout(() => {
      setEscribiendo(false);
      setMensajes((prev) => [
        ...prev,
        { id: crypto.randomUUID(), autor: 'ia', texto: RESPUESTA_PLACEHOLDER, hora: horaActual() }
      ]);
    }, 1100);
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
