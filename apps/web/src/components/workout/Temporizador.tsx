import { useEffect, useRef, useState } from 'react';
import './Temporizador.css';

interface Props {
  segundos: number;
  etiqueta: string;
  onFinalizar: () => void;
}

function formatearTiempo(segundosRestantes: number): string {
  const min = Math.floor(segundosRestantes / 60);
  const seg = segundosRestantes % 60;
  return `${min}:${String(seg).padStart(2, '0')}`;
}

export function Temporizador({ segundos, etiqueta, onFinalizar }: Props) {
  const [restante, setRestante] = useState(segundos);
  const onFinalizarRef = useRef(onFinalizar);
  onFinalizarRef.current = onFinalizar;

  useEffect(() => {
    setRestante(segundos);
    const intervalo = setInterval(() => {
      setRestante((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          onFinalizarRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [segundos]);

  const porcentaje = segundos > 0 ? ((segundos - restante) / segundos) * 100 : 100;

  return (
    <div className="temporizador">
      <div className="temporizador-anillo" style={{ ['--pct' as string]: porcentaje }}>
        <span className="dato-numerico temporizador-tiempo">{formatearTiempo(restante)}</span>
      </div>
      <span className="temporizador-etiqueta">{etiqueta}</span>
      <button className="boton temporizador-saltar" onClick={onFinalizar}>
        Saltar descanso
      </button>
    </div>
  );
}
