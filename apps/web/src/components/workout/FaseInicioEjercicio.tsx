import './FaseInicioEjercicio.css';

interface Props {
  nombreEjercicio: string;
  numeroEjercicio: number;
  totalEjercicios: number;
  series: number;
  repsMin: number;
  repsMax: number;
  descansoSegundos: number;
  notas?: string;
  onComenzar: () => void;
}

export function FaseInicioEjercicio({
  nombreEjercicio,
  numeroEjercicio,
  totalEjercicios,
  series,
  repsMin,
  repsMax,
  descansoSegundos,
  notas,
  onComenzar
}: Props) {
  return (
    <div className="fase-inicio">
      <span className="fase-inicio-progreso dato-numerico">
        Ejercicio {numeroEjercicio} / {totalEjercicios}
      </span>
      <h1>{nombreEjercicio}</h1>
      {notas && <p className="fase-inicio-notas">{notas}</p>}

      <div className="fase-inicio-metricas">
        <div className="fase-inicio-metrica">
          <span className="dato-numerico fase-inicio-metrica-valor">{series}</span>
          <span className="fase-inicio-metrica-etiqueta">series</span>
        </div>
        <div className="fase-inicio-metrica">
          <span className="dato-numerico fase-inicio-metrica-valor">
            {repsMin}–{repsMax}
          </span>
          <span className="fase-inicio-metrica-etiqueta">reps</span>
        </div>
        <div className="fase-inicio-metrica">
          <span className="dato-numerico fase-inicio-metrica-valor">{descansoSegundos}s</span>
          <span className="fase-inicio-metrica-etiqueta">descanso</span>
        </div>
      </div>

      <button className="boton boton-primario fase-inicio-boton" onClick={onComenzar}>
        Comenzar serie 1
      </button>
    </div>
  );
}
