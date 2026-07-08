import './MacroProgressBar.css';

interface Props {
  etiqueta: string;
  actual: number;
  meta: number;
  unidad: string;
  color: 'proteina' | 'carbos' | 'grasa' | 'neutral';
}

const SEGMENTOS = 20;

export function MacroProgressBar({ etiqueta, actual, meta, unidad, color }: Props) {
  const porcentaje = meta > 0 ? Math.min(100, (actual / meta) * 100) : 0;
  const segmentosLlenos = Math.round((porcentaje / 100) * SEGMENTOS);
  const seExcedio = actual > meta;

  return (
    <div className="macro-bar">
      <div className="macro-bar-encabezado">
        <span className="macro-bar-etiqueta">{etiqueta}</span>
        <span className="dato-numerico macro-bar-valores">
          {Math.round(actual)}
          <span className="macro-bar-meta"> / {Math.round(meta)} {unidad}</span>
        </span>
      </div>

      <div className="macro-bar-pista" role="progressbar" aria-valuenow={Math.round(porcentaje)} aria-valuemin={0} aria-valuemax={100}>
        {Array.from({ length: SEGMENTOS }).map((_, i) => (
          <span
            key={i}
            className={`macro-bar-segmento macro-bar-segmento--${color}${i < segmentosLlenos ? ' macro-bar-segmento--lleno' : ''}`}
          />
        ))}
      </div>

      {seExcedio && (
        <span className="macro-bar-exceso dato-numerico">
          +{Math.round(actual - meta)} {unidad} sobre la meta
        </span>
      )}
    </div>
  );
}
