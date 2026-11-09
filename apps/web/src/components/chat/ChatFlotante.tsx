import { useEffect, useRef, useState } from 'react';
import { AdamAvatar } from '../adam/AdamAvatar';
import { PixelIcon } from '../ui/PixelIcon';
import { ChatWindow } from './ChatWindow';
import { useChatAdam } from './useChatAdam';
import './ChatFlotante.css';

/**
 * Chat flotante de A.D.A.M.
 * -------------------------
 * Botón con el avatar en la esquina inferior derecha; al tocarlo se abre una
 * hoja desde abajo. Vive en el layout de la app, así que está disponible en
 * todas las pantallas y la conversación no se pierde al cambiar de pestaña.
 */
export function ChatFlotante() {
  const { mensajes, escribiendo, enviarMensaje } = useChatAdam();
  const [abierto, setAbierto] = useState(false);
  const [vistos, setVistos] = useState(mensajes.length);
  const capaRef = useRef<HTMLDivElement>(null);
  const hojaRef = useRef<HTMLElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const seAbrioAntes = useRef(false);

  // Mensajes de A.D.A.M. que llegaron mientras el chat estaba cerrado.
  useEffect(() => {
    if (abierto) setVistos(mensajes.length);
  }, [abierto, mensajes.length]);
  const sinLeer = abierto ? 0 : mensajes.slice(vistos).filter((m) => m.autor === 'ia').length;

  // Foco: al abrir va a la hoja; al cerrar vuelve al botón flotante.
  useEffect(() => {
    if (abierto) {
      seAbrioAntes.current = true;
      hojaRef.current?.focus();
    } else if (seAbrioAntes.current) {
      botonRef.current?.focus();
    }
  }, [abierto]);

  // Escape cierra el chat.
  useEffect(() => {
    if (!abierto) return;
    function alPresionarTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAbierto(false);
    }
    window.addEventListener('keydown', alPresionarTecla);
    return () => window.removeEventListener('keydown', alPresionarTecla);
  }, [abierto]);

  // Con el teclado abierto, la hoja se ajusta al área realmente visible para
  // que el cuadro de texto nunca quede tapado.
  useEffect(() => {
    const visual = window.visualViewport;
    const capa = capaRef.current;
    if (!abierto || !visual || !capa) return;

    function ajustar() {
      if (!visual || !capa) return;
      capa.style.setProperty('--vv-alto', `${visual.height}px`);
      capa.style.setProperty('--vv-arriba', `${visual.offsetTop}px`);
    }
    ajustar();
    visual.addEventListener('resize', ajustar);
    visual.addEventListener('scroll', ajustar);
    return () => {
      visual.removeEventListener('resize', ajustar);
      visual.removeEventListener('scroll', ajustar);
      capa.style.removeProperty('--vv-alto');
      capa.style.removeProperty('--vv-arriba');
    };
  }, [abierto]);

  return (
    <>
      {!abierto && (
        <button
          ref={botonRef}
          type="button"
          className={`adam-fab${escribiendo ? ' adam-fab--pensando' : ''}`}
          onClick={() => setAbierto(true)}
          aria-label={sinLeer > 0 ? `Hablar con A.D.A.M. (${sinLeer} mensaje nuevo)` : 'Hablar con A.D.A.M.'}
        >
          <AdamAvatar tamano={44} estado={escribiendo ? 'pensando' : 'reposo'} />
          {sinLeer > 0 && <span className="adam-fab-aviso dato-numerico">{sinLeer}</span>}
        </button>
      )}

      <div className="chat-capa" ref={capaRef} hidden={!abierto}>
        <div className="chat-fondo" onClick={() => setAbierto(false)} />
        <section className="chat-hoja" ref={hojaRef} tabIndex={-1} role="dialog" aria-label="Chat con A.D.A.M.">
          <header className="chat-cabecera">
            <span className="chat-retrato">
              <AdamAvatar tamano={44} estado={escribiendo ? 'pensando' : 'reposo'} />
            </span>
            <div className="chat-cabecera-texto">
              <span className="chat-nombre">A.D.A.M.</span>
              <span className="chat-estado">{escribiendo ? 'Pensando…' : 'Tu coach'}</span>
            </div>
            <button type="button" className="chat-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar chat">
              <PixelIcon nombre="cerrar" tamano={18} />
            </button>
          </header>

          <ChatWindow mensajes={mensajes} escribiendo={escribiendo} visible={abierto} onEnviar={enviarMensaje} />
        </section>
      </div>
    </>
  );
}
