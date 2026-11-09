import { PixelSprite } from './PixelSprite';

export type NombreIcono = 'panel' | 'pesas' | 'reloj' | 'trofeo' | 'salir' | 'cerrar' | 'flecha-arriba';

const ICONOS: Record<NombreIcono, string[]> = {
  panel: [
    '..........',
    '..........',
    '....##....',
    '....##....',
    '....##.##.',
    '....##.##.',
    '.##.##.##.',
    '.##.##.##.',
    '.##.##.##.',
    '##########'
  ],
  pesas: [
    '............',
    '............',
    '..##....##..',
    '..##....##..',
    '####....####',
    '############',
    '############',
    '####....####',
    '..##....##..',
    '..##....##..',
    '............',
    '............'
  ],
  reloj: [
    '....####....',
    '..###..###..',
    '.##..##..##.',
    '.#...##...#.',
    '##...##...##',
    '#....##....#',
    '#....####..#',
    '##........##',
    '.#........#.',
    '.##......##.',
    '..###..###..',
    '....####....'
  ],
  trofeo: [
    '##########',
    '#.######.#',
    '#.######.#',
    '.########.',
    '..######..',
    '...####...',
    '....##....',
    '....##....',
    '..######..',
    '.########.'
  ],
  salir: [
    '....##....',
    '..#.##.#..',
    '.#..##..#.',
    '.#..##..#.',
    '#...##...#',
    '#........#',
    '#........#',
    '.#......#.',
    '..#....#..',
    '...####...'
  ],
  cerrar: [
    '##....##',
    '###..###',
    '.######.',
    '..####..',
    '..####..',
    '.######.',
    '###..###',
    '##....##'
  ],
  'flecha-arriba': [
    '....#....',
    '...###...',
    '..#####..',
    '.#######.',
    '...###...',
    '...###...',
    '...###...',
    '...###...'
  ]
};

const PALETA = { '#': 'currentColor' };

interface Props {
  nombre: NombreIcono;
  /** Alto en px. */
  tamano?: number;
  className?: string;
}

/** Íconos pixel que heredan el color del texto (currentColor). Decorativos: el botón que los contiene lleva su aria-label. */
export function PixelIcon({ nombre, tamano = 22, className }: Props) {
  return <PixelSprite filas={ICONOS[nombre]} paleta={PALETA} tamano={tamano} className={className} />;
}
