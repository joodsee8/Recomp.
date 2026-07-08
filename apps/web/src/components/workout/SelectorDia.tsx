import { useEffect, useState } from 'react';
import type { RutinaResumen, RutinaCompleta, DiaDeRutinaResuelto } from '../../types/api';
import * as rutinasService from '../../services/rutinas.service';
import './SelectorDia.css';

interface Props {
  onDiaListo: (dia: DiaDeRutinaResuelto) => void;
}

export function SelectorDia({ onDiaListo }: Props) {
  const [rutinas, setRutinas] = useState<RutinaResumen[]>([]);
  const [rutinaId, setRutinaId] = useState<string>('');
  const [rutina, setRutina] = useState<RutinaCompleta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    rutinasService
      .listarRutinas()
      .then(({ rutinas: lista }) => {
        setRutinas(lista);
        if (lista.length > 0) setRutinaId(lista[0].rutinaId);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudieron cargar las rutinas'))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    if (!rutinaId) return;
    rutinasService
      .obtenerRutina(rutinaId)
      .then(({ rutina: completa }) => setRutina(completa))
      .catch((e) => setError(e instanceof Error ? e.message : 'No se pudo cargar la rutina'));
  }, [rutinaId]);

  async function elegirDia(diaId: string) {
    if (!rutinaId) return;
    setError(null);
    try {
      const dia = await rutinasService.obtenerDiaDeRutina(rutinaId, diaId);
      onDiaListo(dia);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el día');
    }
  }

  if (cargando) return <div className="estado-vacio">Cargando rutinas…</div>;
  if (error) return <p className="error-mensaje">{error}</p>;
  if (rutinas.length === 0) {
    return <div className="estado-vacio">No hay ninguna rutina cargada todavía.</div>;
  }

  return (
    <div className="selector-dia">
      {rutinas.length > 1 && (
        <div className="campo">
          <label htmlFor="select-rutina">Programa</label>
          <select id="select-rutina" value={rutinaId} onChange={(e) => setRutinaId(e.target.value)}>
            {rutinas.map((r) => (
              <option key={r.rutinaId} value={r.rutinaId}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {rutina && (
        <div className="selector-dia-grid">
          {rutina.dias.map((dia) => (
            <button key={dia.diaId} className="selector-dia-boton" onClick={() => elegirDia(dia.diaId)}>
              <span className="selector-dia-nombre">{dia.nombreDia}</span>
              {dia.gruposMusculares && dia.gruposMusculares.length > 0 && (
                <span className="selector-dia-grupos">{dia.gruposMusculares.join(' · ')}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
