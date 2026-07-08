import './SerieInputRow.css';

interface Props {
  numeroSerie: number;
  pesoKg: string;
  repsLogradas: string;
  completada: boolean;
  soloLectura?: boolean;
  esRecordPersonal?: boolean;
  onCambiarPeso?: (valor: string) => void;
  onCambiarReps?: (valor: string) => void;
  onCambiarCompletada?: (valor: boolean) => void;
}

export function SerieInputRow({
  numeroSerie,
  pesoKg,
  repsLogradas,
  completada,
  soloLectura,
  esRecordPersonal,
  onCambiarPeso,
  onCambiarReps,
  onCambiarCompletada
}: Props) {
  return (
    <div className={`serie-row${completada ? '' : ' serie-row--incompleta'}`}>
      <span className="serie-row-numero dato-numerico">{numeroSerie}</span>

      <div className="serie-row-campo">
        <input
          type="number"
          className="dato-numerico"
          value={pesoKg}
          placeholder="kg"
          readOnly={soloLectura}
          onChange={(e) => onCambiarPeso?.(e.target.value)}
        />
        <span className="serie-row-unidad">kg</span>
      </div>

      <div className="serie-row-campo">
        <input
          type="number"
          className="dato-numerico"
          value={repsLogradas}
          placeholder="reps"
          readOnly={soloLectura}
          onChange={(e) => onCambiarReps?.(e.target.value)}
        />
        <span className="serie-row-unidad">reps</span>
      </div>

      {!soloLectura && (
        <label className="serie-row-check">
          <input type="checkbox" checked={completada} onChange={(e) => onCambiarCompletada?.(e.target.checked)} />
        </label>
      )}

      {esRecordPersonal && <span className="serie-row-pr">PR</span>}
    </div>
  );
}
