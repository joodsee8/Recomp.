import type { EstadoEjercicio } from './tiposSesion';
import { SerieInputRow } from './SerieInputRow';
import './FaseResumen.css';

interface Props {
  nombreDia: string;
  ejercicios: EstadoEjercicio[];
  onNuevaSesion: () => void;
}

export function FaseResumen({ nombreDia, ejercicios, onNuevaSesion }: Props) {
  const totalPRs = ejercicios.reduce(
    (total, ej) => total + ej.series.filter((s) => s.esRecordPersonal).length,
    0
  );

  return (
    <div className="fase-resumen">
      <div className="fase-resumen-encabezado">
        <span className="fase-resumen-check">Sesión guardada ✓</span>
        <h1>{nombreDia}</h1>
        {totalPRs > 0 && (
          <p className="fase-resumen-prs">
            {totalPRs} récord{totalPRs > 1 ? 's' : ''} personal{totalPRs > 1 ? 'es' : ''} hoy 🔥
          </p>
        )}
      </div>

      <div className="fase-resumen-lista">
        {ejercicios.map((ej) => (
          <div key={ej.ejercicioId} className="tarjeta">
            <h3 style={{ marginBottom: 'var(--space-2)' }}>{ej.nombreEjercicio}</h3>
            <div className="fase-resumen-series">
              {ej.series.map((serie) => (
                <SerieInputRow
                  key={serie.numeroSerie}
                  numeroSerie={serie.numeroSerie}
                  pesoKg={serie.pesoKg}
                  repsLogradas={serie.repsLogradas}
                  completada={serie.completada}
                  soloLectura
                  esRecordPersonal={serie.esRecordPersonal}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="boton boton-primario" onClick={onNuevaSesion}>
        Registrar otra sesión
      </button>
    </div>
  );
}
