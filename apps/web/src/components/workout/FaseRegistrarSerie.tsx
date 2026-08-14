import { useState, type FormEvent } from 'react';
import './FaseRegistrarSerie.css';

interface Props {
  nombreEjercicio: string;
  numeroSerie: number;
  totalSeries: number;
  repsSugeridas: number;
  onRegistrar: (pesoKg: number, reps: number) => void;
}

export function FaseRegistrarSerie({ nombreEjercicio, numeroSerie, totalSeries, repsSugeridas, onRegistrar }: Props) {
  const [pesoKg, setPesoKg] = useState('');
  const [reps, setReps] = useState(String(repsSugeridas));
  const [error, setError] = useState<string | null>(null);

  function manejarSubmit(evento: FormEvent) {
    evento.preventDefault();
    const peso = Number(pesoKg);
    const repsNum = Number(reps);

    if (!peso || peso <= 0) {
      setError('Ponle el peso que usaste en esta serie');
      return;
    }
    if (!repsNum || repsNum <= 0) {
      setError('Ponle las repeticiones logradas');
      return;
    }

    onRegistrar(peso, repsNum);
  }

  return (
    <form className="fase-registrar" onSubmit={manejarSubmit}>
      <span className="fase-registrar-progreso dato-numerico">
        Serie {numeroSerie} / {totalSeries}
      </span>
      <h1>{nombreEjercicio}</h1>

      <div className="fase-registrar-inputs">
        <div className="campo">
          <label htmlFor="peso-serie">Peso (kg)</label>
          <input
            id="peso-serie"
            type="number"
            inputMode="decimal"
            autoFocus
            value={pesoKg}
            onChange={(e) => setPesoKg(e.target.value)}
          />
        </div>
        <div className="campo">
          <label htmlFor="reps-serie">Repeticiones</label>
          <input
            id="reps-serie"
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="error-mensaje">{error}</p>}

      <button type="submit" className="boton boton-primario fase-registrar-boton">
        Registrar serie
      </button>
    </form>
  );
}
