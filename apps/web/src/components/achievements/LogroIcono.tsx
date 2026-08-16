import './LogroIcono.css';

interface Props {
  /** Nombre exacto del archivo (sin extensión) que Gemini eligió del catálogo cerrado — ver apps/api/src/data/iconosLogros.ts */
  icono: string;
  desbloqueado: boolean;
  tamano?: number;
}

/**
 * LogroIcono
 * ----------
 * El backend valida `icono` contra un catálogo cerrado antes de guardar
 * cualquier logro (ver logrosGenerator.service.ts), así que en teoría
 * siempre corresponde a un archivo real en /assets/icons/. Aun así,
 * `onError` cae a un ícono neutro por si el archivo llegara a faltar — un
 * ícono roto no debería tumbar toda la pantalla de logros.
 */
export function LogroIcono({ icono, desbloqueado, tamano = 40 }: Props) {
  return (
    <img
      src={`/assets/icons/${icono}.svg`}
      alt=""
      width={tamano}
      height={tamano}
      className={`logro-icono${desbloqueado ? '' : ' logro-icono--bloqueado'}`}
      onError={(e) => {
        e.currentTarget.src = '/assets/icons/estrella.svg';
      }}
    />
  );
}
