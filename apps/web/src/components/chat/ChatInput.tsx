import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { PixelIcon } from '../ui/PixelIcon';
import './ChatInput.css';

interface Props {
  onEnviar: (texto: string) => void;
  deshabilitado?: boolean;
  /** Las sugerencias solo ayudan al empezar; después quitan espacio en la pantalla chica. */
  mostrarSugerencias?: boolean;
}

const SUGERENCIAS = ['Comí 200g de pollo con arroz', '¿Cómo voy hoy de proteína?', 'Registrar mi peso de hoy'];
const ALTO_MAXIMO_PX = 120;

export function ChatInput({ onEnviar, deshabilitado, mostrarSugerencias = true }: Props) {
  const [texto, setTexto] = useState('');
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // El cuadro crece con el texto, hasta un máximo.
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    area.style.height = 'auto';
    area.style.height = `${Math.min(area.scrollHeight, ALTO_MAXIMO_PX)}px`;
  }, [texto]);

  function enviar() {
    const limpio = texto.trim();
    if (!limpio || deshabilitado) return;
    onEnviar(limpio);
    setTexto('');
  }

  function manejarSubmit(evento: FormEvent) {
    evento.preventDefault();
    enviar();
  }

  function manejarTecla(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      enviar();
    }
  }

  return (
    <div className="chat-input-contenedor">
      {mostrarSugerencias && (
        <div className="chat-input-sugerencias">
          {SUGERENCIAS.map((s) => (
            <button key={s} type="button" className="chat-input-chip" onClick={() => setTexto(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form className="chat-input" onSubmit={manejarSubmit}>
        <textarea
          ref={areaRef}
          rows={1}
          placeholder="Escríbele a A.D.A.M."
          aria-label="Mensaje para A.D.A.M."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={manejarTecla}
        />
        <button type="submit" className="chat-input-enviar" disabled={!texto.trim() || deshabilitado} aria-label="Enviar">
          <PixelIcon nombre="flecha-arriba" tamano={22} />
        </button>
      </form>
    </div>
  );
}
