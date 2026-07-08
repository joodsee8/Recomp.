import { useState } from 'react';
import type { DiaDeRutinaResuelto, EjercicioRegistrado } from '../../types/api';
import * as workoutLogsService from '../../services/workoutLogs.service';
import { SerieInputRow } from './SerieInputRow';
import './SesionTracker.css';

interface EstadoSerie {
  numeroSerie: number;
  pesoKg: string;
  repsLogradas: string;
  completada: boolean;
  esRecordPersonal?: boolean;
}

interface EstadoEjercicio {
  ejercicioId: string;
  nombreEjercicio: string;
  repsMin: number;
  repsMax: number;
  descansoSegundos: number;
  notas?: string;
  series: EstadoSerie[];
}

function fechaDeHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function construirEstadoInicial(dia: DiaDeRutinaResuelto): EstadoEjercicio[] {
  return dia.ejercicios.map((ej) => ({
    ejercicioId: ej.ejercicioId,
    nombreEjercicio: ej.nombre,
    repsMin: ej.repsMin,
    repsMax: ej.repsMax,
    descansoSegundos: ej.descansoSegundos,
    notas: ej.notas,
    series: Array.from({ length: ej.series }, (_, i) => ({
      numeroSerie: i + 1,
      pesoKg: '',
      repsLogradas: String(ej.repsMax),
      completada: true
    }))
  }));
}

interface Props {
  dia: DiaDeRutinaResuelto;
  onSesionGuardada: () => void;
}

export function SesionTracker({ dia, onSesionGuardada }: Props) {
  const [ejercicios, setEjercicios] = useState<EstadoEjercicio[]>(() => construirEstadoInicial(dia));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardada, setGuardada] = useState(false);

  function actualizarSerie(
    indiceEjercicio: number,
    indiceSerie: number,
    cambios: Partial<EstadoSerie>
  ) {
    setEjercicios((prev) =>
      prev.map((ej, i) =>
        i !== indiceEjercicio
          ? ej
          : { ...ej, series: ej.series.map((s, j) => (j !== indiceSerie ? s : { ...s, ...cambios })) }
      )
    );
  }

  async function guardarSesion() {
    setError(null);

    const seriesIncompletas = ejercicios.some((ej) =>
      ej.series.some((s) => s.completada && (!s.pesoKg || Number(s.pesoKg) <= 0))
    );
    if (seriesIncompletas) {
      setError('Hay series marcadas como completadas sin peso registrado. Ponle el peso o desmárcalas.');
      return;
    }

    const ejerciciosRegistrados: EjercicioRegistrado[] = ejercicios.map((ej) => ({
      ejercicioId: ej.ejercicioId,
      nombreEjercicio: ej.nombreEjercicio,
      notas: ej.notas,
      series: ej.series.map((s) => ({
        numeroSerie: s.numeroSerie,
        pesoKg: Number(s.pesoKg) || 0,
        repsLogradas: Number(s.repsLogradas) || 0,
        completada: s.completada
      }))
    }));

    setGuardando(true);
    try {
      const { sesion } = await workoutLogsService.crearSesion({
        fecha: fechaDeHoy(),
        diaRutinaId: dia.rutinaId,
        nombreDia: dia.nombreDia,
        ejerciciosRegistrados
      });

      // Refleja los esRecordPersonal calculados por el backend en el estado
      // local, para pintar el sello PR sin recargar toda la pantalla.
      setEjercicios((prev) =>
        prev.map((ej, i) => {
          const guardado = sesion.ejerciciosRegistrados[i];
          return {
            ...ej,
            series: ej.series.map((s, j) => ({ ...s, esRecordPersonal: guardado?.series[j]?.esRecordPersonal }))
          };
        })
      );
      setGuardada(true);
      onSesionGuardada();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la sesión');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="sesion-tracker">
      <header className="sesion-tracker-encabezado">
        <div>
          <h1>{dia.nombreDia}</h1>
          {dia.gruposMusculares.length > 0 && <h2>{dia.gruposMusculares.join(' · ')}</h2>}
        </div>
        {guardada && <span className="sesion-tracker-guardada">Sesión guardada</span>}
      </header>

      <div className="sesion-tracker-lista">
        {ejercicios.map((ej, indiceEjercicio) => (
          <div key={ej.ejercicioId} className="tarjeta sesion-tracker-ejercicio">
            <div className="sesion-tracker-ejercicio-encabezado">
              <h3>{ej.nombreEjercicio}</h3>
              <span className="sesion-tracker-objetivo dato-numerico">
                objetivo: {ej.repsMin}–{ej.repsMax} reps · descanso {ej.descansoSegundos}s
              </span>
            </div>
            {ej.notas && <p className="sesion-tracker-notas">{ej.notas}</p>}

            <div className="sesion-tracker-series">
              {ej.series.map((serie, indiceSerie) => (
                <SerieInputRow
                  key={serie.numeroSerie}
                  numeroSerie={serie.numeroSerie}
                  pesoKg={serie.pesoKg}
                  repsLogradas={serie.repsLogradas}
                  completada={serie.completada}
                  soloLectura={guardada}
                  esRecordPersonal={serie.esRecordPersonal}
                  onCambiarPeso={(v) => actualizarSerie(indiceEjercicio, indiceSerie, { pesoKg: v })}
                  onCambiarReps={(v) => actualizarSerie(indiceEjercicio, indiceSerie, { repsLogradas: v })}
                  onCambiarCompletada={(v) => actualizarSerie(indiceEjercicio, indiceSerie, { completada: v })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="error-mensaje">{error}</p>}

      {!guardada && (
        <button className="boton boton-primario sesion-tracker-guardar" onClick={guardarSesion} disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar sesión'}
        </button>
      )}
    </div>
  );
}
