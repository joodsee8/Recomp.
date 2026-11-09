import './BarraEtapas.css';

interface Props {
  /** Etapa en curso, empezando en 1. */
  actual: number;
  total: number;
  etiqueta: string;
}

/** Progreso de la sesión como bloques de nivel: una pieza por ejercicio o serie. */
export function BarraEtapas({ actual, total, etiqueta }: Props) {
  return (
    <div className="barra-etapas">
      <span className="barra-etapas-texto dato-numerico">
        {etiqueta} {actual} / {total}
      </span>
      <div
        className="barra-etapas-pista"
        role="progressbar"
        aria-label={etiqueta}
        aria-valuenow={actual}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`barra-etapas-bloque${i < actual - 1 ? ' barra-etapas-bloque--hecho' : ''}${
              i === actual - 1 ? ' barra-etapas-bloque--actual' : ''
            }`}
          />
        ))}
      </div>
    </div>
  );
}
