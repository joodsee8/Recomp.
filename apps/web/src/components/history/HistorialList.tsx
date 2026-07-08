import type { WorkoutLog } from '../../types/api';
import './HistorialList.css';

interface Props {
  sesiones: WorkoutLog[];
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'long' });
}

function contarPRs(sesion: WorkoutLog): number {
  return sesion.ejerciciosRegistrados.reduce(
    (total, ej) => total + ej.series.filter((s) => s.esRecordPersonal).length,
    0
  );
}

function calcularVolumen(sesion: WorkoutLog): number {
  return sesion.ejerciciosRegistrados.reduce(
    (total, ej) => total + ej.series.reduce((sub, s) => sub + s.pesoKg * s.repsLogradas, 0),
    0
  );
}

export function HistorialList({ sesiones }: Props) {
  if (sesiones.length === 0) {
    return <div className="estado-vacio">Todavía no hay sesiones registradas.</div>;
  }

  return (
    <ul className="historial-lista">
      {sesiones.map((sesion) => {
        const prs = contarPRs(sesion);
        return (
          <li key={sesion._id} className="historial-item">
            <div className="historial-item-info">
              <span className="historial-item-dia">{sesion.nombreDia}</span>
              <span className="historial-item-fecha">{formatearFecha(sesion.fecha)}</span>
            </div>
            <div className="historial-item-metricas dato-numerico">
              <span>{sesion.ejerciciosRegistrados.length} ejercicios</span>
              <span>{Math.round(calcularVolumen(sesion))} kg de volumen</span>
              {prs > 0 && <span className="historial-item-pr">{prs} PR</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
