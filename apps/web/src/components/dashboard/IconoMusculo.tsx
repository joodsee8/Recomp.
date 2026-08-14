export type GrupoMuscularIcono = 'pecho' | 'espalda' | 'hombros' | 'piernas' | 'biceps' | 'triceps' | 'core';

interface Props {
  grupo: GrupoMuscularIcono;
  size?: number;
}

/**
 * Íconos abstractos (no anatómicos literales) pero visualmente distintos
 * entre sí, en el mismo trazo/grosor que el resto del sistema de diseño
 * (currentColor, stroke 1.6, sin relleno salvo Hombros/Core donde el
 * relleno ayuda a la lectura a tamaño chico).
 */
export function IconoMusculo({ grupo, size = 22 }: Props) {
  const comunes = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (grupo) {
    case 'pecho':
      return (
        <svg {...comunes}>
          <path d="M12 6c-2.5-2-6-1.2-6 2.2 0 3.4 3.5 6.3 6 8 2.5-1.7 6-4.6 6-8 0-3.4-3.5-4.2-6-2.2Z" />
        </svg>
      );
    case 'espalda':
      return (
        <svg {...comunes}>
          <path d="M12 4v16" />
          <path d="M12 6 5 20" />
          <path d="M12 6l7 14" />
          <path d="M12 10 7 12" />
          <path d="M12 10l5 2" />
        </svg>
      );
    case 'hombros':
      return (
        <svg {...comunes}>
          <circle cx="7" cy="12" r="3.4" fill="currentColor" stroke="none" />
          <circle cx="17" cy="12" r="3.4" fill="currentColor" stroke="none" />
          <path d="M10.2 12h3.6" />
        </svg>
      );
    case 'piernas':
      return (
        <svg {...comunes}>
          <path d="M9 4h2l0.5 8-1.5 8H8l0.5-8Z" />
          <path d="M15 4h-2l-0.5 8 1.5 8h2l-0.5-8Z" />
        </svg>
      );
    case 'biceps':
      return (
        <svg {...comunes}>
          <path d="M6 18c0-6 1-10 5-11 3-0.8 6 1 6 4 0 2.4-2 3-4 3.2" />
          <path d="M13 14c2 0.3 4 1.6 4 4" />
        </svg>
      );
    case 'triceps':
      return (
        <svg {...comunes}>
          <path d="M7 6c0 5 1 9 2 12" />
          <path d="M15 6c1.5 3 1.5 6 0.3 8.4" />
          <path d="M9 6h6" />
        </svg>
      );
    case 'core':
      return (
        <svg {...comunes}>
          {[0, 1, 2].map((fila) =>
            [0, 1].map((col) => (
              <rect
                key={`${fila}-${col}`}
                x={8 + col * 5}
                y={5 + fila * 5}
                width={3.6}
                height={3.6}
                rx={0.8}
                fill="currentColor"
                stroke="none"
              />
            ))
          )}
        </svg>
      );
  }
}
