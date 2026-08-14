import { Temporizador } from './Temporizador';
import { TriviaDuranteDescanso } from './TriviaDuranteDescanso';
import './FaseDescanso.css';

interface Props {
  segundos: number;
  etiqueta: string;
  onFinalizar: () => void;
}

export function FaseDescanso({ segundos, etiqueta, onFinalizar }: Props) {
  return (
    <div className="fase-descanso">
      <Temporizador segundos={segundos} etiqueta={etiqueta} onFinalizar={onFinalizar} />
      <TriviaDuranteDescanso />
    </div>
  );
}
