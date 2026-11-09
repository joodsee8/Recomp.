import { useState } from 'react';
import { PixelSprite } from '../ui/PixelSprite';
import './AdamAvatar.css';

export type EstadoAdam = 'reposo' | 'pensando';

/**
 * Avatar de A.D.A.M.
 * ------------------
 * Para poner el avatar definitivo, guarda la imagen en
 * `public/assets/adam/avatar.png` (cuadrada, fondo transparente). Mientras
 * ese archivo no exista, se muestra un robot pixel provisional.
 */
export const RUTA_AVATAR_ADAM = '/assets/adam/avatar.png';

// Si el archivo no existe, se recuerda para no volver a pedirlo en cada instancia.
let imagenAusente = false;

const ROBOT_PROVISIONAL = [
  '......yyyy......',
  '......yyyy......',
  '.......##.......',
  '..############..',
  '.#bbbbbbbbbbbb#.',
  '.#b##########b#.',
  'd#b#cc####cc#b#d',
  'd#b#cc####cc#b#d',
  'd#b##########b#d',
  '.#b###cccc###b#.',
  '.#b##########b#.',
  '.#bbbbbbbbbbbb#.',
  '..############..',
  '....#bbbbbb#....',
  '...##bbbbbb##...',
  '...##########...'
];

const PALETA_ROBOT = {
  '#': '#07041a',
  b: '#b9aeff',
  d: '#7f6fe8',
  c: '#3fd8ff',
  y: '#ffd23f'
};

interface Props {
  /** Lado del avatar en px. */
  tamano?: number;
  estado?: EstadoAdam;
  className?: string;
}

export function AdamAvatar({ tamano = 48, estado = 'reposo', className }: Props) {
  const [imagenFalla, setImagenFalla] = useState(imagenAusente);

  return (
    <span
      className={`adam-avatar adam-avatar--${estado}${className ? ` ${className}` : ''}`}
      style={{ width: tamano, height: tamano }}
    >
      {imagenFalla ? (
        <PixelSprite filas={ROBOT_PROVISIONAL} paleta={PALETA_ROBOT} tamano={tamano} />
      ) : (
        <img
          src={RUTA_AVATAR_ADAM}
          alt=""
          width={tamano}
          height={tamano}
          draggable={false}
          onError={() => {
            imagenAusente = true;
            setImagenFalla(true);
          }}
        />
      )}
    </span>
  );
}
