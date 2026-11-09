import { AdamAvatar } from '../adam/AdamAvatar';
import './IndicadorEscribiendo.css';

export function IndicadorEscribiendo() {
  return (
    <div className="burbuja-fila" aria-label="A.D.A.M. está escribiendo">
      <AdamAvatar tamano={32} estado="pensando" className="burbuja-avatar" />
      <div className="burbuja burbuja--ia indicador-escribiendo">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
