import { useEffect, useRef } from 'react';
import { MensajeBurbuja, type Mensaje } from './MensajeBurbuja';
import { IndicadorEscribiendo } from './IndicadorEscribiendo';
import { ChatInput } from './ChatInput';
import './ChatWindow.css';

interface Props {
  mensajes: Mensaje[];
  escribiendo: boolean;
  /** El chat sigue montado aunque esté cerrado; esto indica si se ve. */
  visible: boolean;
  onEnviar: (texto: string) => void;
}

export function ChatWindow({ mensajes, escribiendo, visible, onEnviar }: Props) {
  const listaRef = useRef<HTMLDivElement>(null);

  // Mensajes nuevos: baja suave. Al abrir el chat: baja de golpe.
  useEffect(() => {
    const lista = listaRef.current;
    if (!lista || !visible) return;
    lista.scrollTo({ top: lista.scrollHeight, behavior: 'smooth' });
  }, [mensajes, escribiendo, visible]);

  useEffect(() => {
    const lista = listaRef.current;
    if (lista && visible) lista.scrollTop = lista.scrollHeight;
  }, [visible]);

  const usuarioYaEscribio = mensajes.some((m) => m.autor === 'usuario');

  return (
    <div className="chat-window">
      <div className="chat-window-mensajes" ref={listaRef} role="log" aria-live="polite">
        {mensajes.map((m) => (
          <MensajeBurbuja key={m.id} mensaje={m} />
        ))}
        {escribiendo && <IndicadorEscribiendo />}
      </div>
      <ChatInput onEnviar={onEnviar} deshabilitado={escribiendo} mostrarSugerencias={!usuarioYaEscribio} />
    </div>
  );
}
