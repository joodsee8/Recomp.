import type { Logro } from '../../types/api';
import { LogroIcono } from './LogroIcono';
import './LogroCard.css';

const ETIQUETA_PERIODO: Record<Logro['periodo'], string> = {
  diario: 'Hoy',
  semanal: 'Esta semana',
  mensual: 'Este mes'
};

export function LogroCard({ logro }: { logro: Logro }) {
  const porcentaje = logro.metaObjetivo > 0 ? Math.min(100, Math.round((logro.progresoActual / logro.metaObjetivo) * 100)) : 0;

  return (
    <div className={`logro-card${logro.desbloqueado ? ' logro-card--desbloqueado' : ''}`}>
      <LogroIcono icono={logro.icono} desbloqueado={logro.desbloqueado} />

      <div className="logro-card-cuerpo">
        <div className="logro-card-encabezado">
          <span className="logro-card-titulo">{logro.titulo}</span>
          <span className="logro-card-periodo">{ETIQUETA_PERIODO[logro.periodo]}</span>
        </div>
        <p className="logro-card-descripcion">{logro.descripcion}</p>

        {logro.desbloqueado ? (
          <span className="logro-card-check">Desbloqueado ✓</span>
        ) : (
          <div className="logro-card-progreso">
            <div className="logro-card-progreso-pista">
              <div className="logro-card-progreso-relleno" style={{ width: `${porcentaje}%` }} />
            </div>
            <span className="dato-numerico logro-card-progreso-texto">
              {logro.progresoActual} / {logro.metaObjetivo}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
