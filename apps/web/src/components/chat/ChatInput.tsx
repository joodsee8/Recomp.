import { useState, type FormEvent, type KeyboardEvent } from 'react';
import './ChatInput.css';

interface Props {
  onEnviar: (texto: string) => void;
  deshabilitado?: boolean;
}

const SUGERENCIAS = ['Comí 200g de pollo con arroz', '¿Cómo voy hoy de proteína?', 'Registrar mi peso de hoy'];

export function ChatInput({ onEnviar, deshabilitado }: Props) {
  const [texto, setTexto] = useState('');

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
      <div className="chat-input-sugerencias">
        {SUGERENCIAS.map((s) => (
          <button key={s} type="button" className="chat-input-chip" onClick={() => setTexto(s)}>
            {s}
          </button>
        ))}
      </div>

      <form className="chat-input" onSubmit={manejarSubmit}>
        <textarea
          rows={1}
          placeholder="Escríbele a tu coach…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={manejarTecla}
        />
        <button type="submit" className="chat-input-enviar" disabled={!texto.trim() || deshabilitado} aria-label="Enviar">
          ↑
        </button>
      </form>
    </div>
  );
}
