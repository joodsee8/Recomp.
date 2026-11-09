import { useMemo } from 'react';

interface Props {
  /** Una cadena por fila; cada carácter es un píxel ('.' = vacío). */
  filas: string[];
  /** Color de cada carácter. Si falta, el píxel no se dibuja. */
  paleta: Record<string, string>;
  /** Alto en px; el ancho se calcula con la proporción de la cuadrícula. */
  tamano?: number;
  className?: string;
  title?: string;
}

interface Rect {
  x: number;
  y: number;
  ancho: number;
  color: string;
}

/**
 * Dibuja pixel art como SVG nítido (sin suavizado). Agrupa píxeles contiguos
 * del mismo color en un solo rectángulo para mantener el SVG liviano.
 */
export function PixelSprite({ filas, paleta, tamano = 24, className, title }: Props) {
  const columnas = filas[0]?.length ?? 0;

  const rects = useMemo(() => {
    const resultado: Rect[] = [];
    filas.forEach((fila, y) => {
      let x = 0;
      while (x < fila.length) {
        const caracter = fila[x];
        const color = paleta[caracter];
        if (!color) {
          x += 1;
          continue;
        }
        let ancho = 1;
        while (x + ancho < fila.length && fila[x + ancho] === caracter) ancho += 1;
        resultado.push({ x, y, ancho, color });
        x += ancho;
      }
    });
    return resultado;
  }, [filas, paleta]);

  return (
    <svg
      className={className}
      width={(tamano * columnas) / filas.length}
      height={tamano}
      viewBox={`0 0 ${columnas} ${filas.length}`}
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={r.ancho} height={1} fill={r.color} />
      ))}
    </svg>
  );
}
