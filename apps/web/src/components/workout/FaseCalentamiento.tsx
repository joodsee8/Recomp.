import './FaseCalentamiento.css';

interface Props {
  onContinuar: () => void;
  onCambiarDia?: () => void;
  /** Dato real de tu rutina (viene de rutina.calentamiento en el backend). Si no existe, se usa un texto genérico. */
  calentamiento?: { duracionMinutos: string; descripcion: string } | null;
}

const PASOS_CALENTAMIENTO_GENERICO = [
  '5 minutos de cardio ligero (bici, caminadora o remo) para subir la temperatura corporal.',
  'Movilidad articular: rotaciones de hombro, cadera, tobillo y muñeca.',
  '1-2 series ligeras del primer ejercicio, bien lejos del fallo, para practicar el patrón de movimiento.'
];

export function FaseCalentamiento({ onContinuar, onCambiarDia, calentamiento }: Props) {
  return (
    <div className="fase-calentamiento">
      {onCambiarDia && (
        <button className="fase-calentamiento-cambiar-dia" onClick={onCambiarDia}>
          ← Elegir otro día
        </button>
      )}
      <span className="fase-calentamiento-etiqueta">Antes de empezar</span>
      <h1>Calentamiento</h1>

      {calentamiento ? (
        <div className="fase-calentamiento-real">
          <span className="fase-calentamiento-duracion dato-numerico">{calentamiento.duracionMinutos} min</span>
          <p>{calentamiento.descripcion}</p>
        </div>
      ) : (
        <ul className="fase-calentamiento-lista">
          {PASOS_CALENTAMIENTO_GENERICO.map((paso, i) => (
            <li key={i}>{paso}</li>
          ))}
        </ul>
      )}

      <div className="fase-calentamiento-acciones">
        <button className="boton boton-primario" onClick={onContinuar}>
          Ya calenté, empezar sesión
        </button>
        <button className="boton" onClick={onContinuar}>
          Saltar calentamiento
        </button>
      </div>
    </div>
  );
}
