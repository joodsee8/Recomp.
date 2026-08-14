import { useEffect, useState } from 'react';
import type { EjercicioCatalogo, PuntoDeProgreso } from '../../types/api';
import * as ejerciciosService from '../../services/ejercicios.service';
import * as workoutLogsService from '../../services/workoutLogs.service';
import { IconoMusculo, type GrupoMuscularIcono } from './IconoMusculo';
import { ProgresoChart } from '../history/ProgresoChart';
import './ProgresoMuscularCard.css';

const GRUPOS: { grupo: GrupoMuscularIcono; etiqueta: string }[] = [
  { grupo: 'pecho', etiqueta: 'Pecho' },
  { grupo: 'espalda', etiqueta: 'Espalda' },
  { grupo: 'hombros', etiqueta: 'Hombros' },
  { grupo: 'piernas', etiqueta: 'Piernas' },
  { grupo: 'biceps', etiqueta: 'Bíceps' },
  { grupo: 'triceps', etiqueta: 'Tríceps' },
  { grupo: 'core', etiqueta: 'Core' }
];

export function ProgresoMuscularCard() {
  const [grupoActivo, setGrupoActivo] = useState<GrupoMuscularIcono>('pecho');
  const [ejerciciosDelGrupo, setEjerciciosDelGrupo] = useState<EjercicioCatalogo[]>([]);
  const [ejercicioId, setEjercicioId] = useState<string>('');
  const [progreso, setProgreso] = useState<PuntoDeProgreso[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    ejerciciosService.listarEjercicios(grupoActivo).then(({ ejercicios }) => {
      setEjerciciosDelGrupo(ejercicios);
      setEjercicioId(ejercicios[0]?.ejercicioId ?? '');
    });
  }, [grupoActivo]);

  useEffect(() => {
    if (!ejercicioId) {
      setProgreso([]);
      setCargando(false);
      return;
    }
    setCargando(true);
    workoutLogsService
      .obtenerProgresoEjercicio(ejercicioId)
      .then(({ progreso: puntos }) => setProgreso(puntos))
      .finally(() => setCargando(false));
  }, [ejercicioId]);

  const ultimoPunto = progreso[progreso.length - 1];

  return (
    <div className="tarjeta progreso-muscular-card">
      <h3>Sobrecarga progresiva</h3>

      <div className="progreso-muscular-iconos">
        {GRUPOS.map(({ grupo, etiqueta }) => (
          <button
            key={grupo}
            className={`progreso-muscular-icono${grupo === grupoActivo ? ' progreso-muscular-icono--activo' : ''}`}
            onClick={() => setGrupoActivo(grupo)}
            title={etiqueta}
          >
            <IconoMusculo grupo={grupo} />
            <span>{etiqueta}</span>
          </button>
        ))}
      </div>

      {ejerciciosDelGrupo.length > 1 && (
        <div className="progreso-muscular-chips">
          {ejerciciosDelGrupo.map((ej) => (
            <button
              key={ej.ejercicioId}
              className={`progreso-muscular-chip${ej.ejercicioId === ejercicioId ? ' progreso-muscular-chip--activo' : ''}`}
              onClick={() => setEjercicioId(ej.ejercicioId)}
            >
              {ej.nombre}
            </button>
          ))}
        </div>
      )}

      {cargando ? (
        <div className="estado-vacio">Cargando…</div>
      ) : ejerciciosDelGrupo.length === 0 ? (
        <div className="estado-vacio">No hay ejercicios de {grupoActivo} en tu rutina todavía.</div>
      ) : (
        <>
          <ProgresoChart puntos={progreso} />
          {ultimoPunto && (
            <p className="progreso-muscular-nota">
              Último registro: <span className="dato-numerico">{ultimoPunto.pesoMaximoKg} kg</span> ×{' '}
              <span className="dato-numerico">{ultimoPunto.repsEnPesoMaximo}</span> reps
              {ultimoPunto.huboRecordPersonal && ' · récord personal 🔥'}
            </p>
          )}
        </>
      )}
    </div>
  );
}
