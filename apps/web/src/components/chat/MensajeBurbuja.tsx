import { AdamAvatar } from '../adam/AdamAvatar';
import './MensajeBurbuja.css';

export interface Mensaje {
  id: string;
  autor: 'usuario' | 'ia';
  texto: string;
  hora: string;
}

export function MensajeBurbuja({ mensaje }: { mensaje: Mensaje }) {
  const esUsuario = mensaje.autor === 'usuario';
  return (
    <div className={`burbuja-fila${esUsuario ? ' burbuja-fila--usuario' : ''}`}>
      {!esUsuario && <AdamAvatar tamano={32} className="burbuja-avatar" />}
      <div className={`burbuja${esUsuario ? ' burbuja--usuario' : ' burbuja--ia'}`}>
        <p>{mensaje.texto}</p>
        <span className="burbuja-hora dato-numerico">{mensaje.hora}</span>
      </div>
    </div>
  );
}
