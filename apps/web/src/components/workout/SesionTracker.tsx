import { useState } from 'react';
import type { DiaDeRutinaResuelto, EjercicioRegistrado } from '../../types/api';
import * as workoutLogsService from '../../services/workoutLogs.service';
import type { EstadoEjercicio, FaseSesion } from './tiposSesion';
import { FaseCalentamiento } from './FaseCalentamiento';
import { FaseInicioEjercicio } from './FaseInicioEjercicio';
import { FaseRegistrarSerie } from './FaseRegistrarSerie';
import { FaseDescanso } from './FaseDescanso';
import { FaseResumen } from './FaseResumen';
import './SesionTracker.css';

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

/** Devuelve una copia del array de ejercicios con una serie puntual actualizada, sin mutar el original. */
function conSerieActualizada(
  ejercicios: EstadoEjercicio[],
  indiceEjercicio: number,
  indiceSerie: number,
  pesoKg: number,
  reps: number
): EstadoEjercicio[] {
  return ejercicios.map((ej, i) =>
    i !== indiceEjercicio
      ? ej
      : {
          ...ej,
          series: ej.series.map((s, j) =>
            j !== indiceSerie ? s : { ...s, pesoKg: String(pesoKg), repsLogradas: String(reps), completada: true }
          )
        }
  );
}

interface Props {
  dia: DiaDeRutinaResuelto;
  onSesionGuardada: () => void;
  onCambiarDia?: () => void;
}

export function SesionTracker({ dia, onSesionGuardada, onCambiarDia }: Props) {
  const [fase, setFase] = useState<FaseSesion>({ tipo: 'calentamiento' });
  const [ejercicios, setEjercicios] = useState<EstadoEjercicio[]>(() => construirEstadoInicial(dia));
  const [error, setError] = useState<string | null>(null);

  async function guardarSesion(ejerciciosFinales: EstadoEjercicio[]) {
    setFase({ tipo: 'guardando' });
    setError(null);

    const ejerciciosRegistrados: EjercicioRegistrado[] = ejerciciosFinales.map((ej) => ({
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

    try {
      const { sesion } = await workoutLogsService.crearSesion({
        fecha: fechaDeHoy(),
        diaRutinaId: dia.rutinaId,
        nombreDia: dia.nombreDia,
        ejerciciosRegistrados
      });

      // Refleja los esRecordPersonal calculados por el backend en el estado local.
      setEjercicios((prev) =>
        prev.map((ej, i) => ({
          ...ej,
          series: ej.series.map((s, j) => ({
            ...s,
            esRecordPersonal: sesion.ejerciciosRegistrados[i]?.series[j]?.esRecordPersonal
          }))
        }))
      );
      setFase({ tipo: 'resumen' });
      onSesionGuardada();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la sesión');
      setFase({ tipo: 'inicio_ejercicio', indiceEjercicio: ejerciciosFinales.length - 1 });
    }
  }

  function registrarSerie(indiceEjercicio: number, indiceSerie: number, pesoKg: number, reps: number) {
    const actualizados = conSerieActualizada(ejercicios, indiceEjercicio, indiceSerie, pesoKg, reps);
    setEjercicios(actualizados);

    const esUltimaSerieDelEjercicio = indiceSerie + 1 >= actualizados[indiceEjercicio].series.length;
    const esUltimoEjercicio = indiceEjercicio + 1 >= actualizados.length;

    if (!esUltimaSerieDelEjercicio) {
      setFase({ tipo: 'descanso_serie', indiceEjercicio, indiceSerieSiguiente: indiceSerie + 1 });
    } else if (!esUltimoEjercicio) {
      setFase({ tipo: 'descanso_ejercicio', indiceEjercicioSiguiente: indiceEjercicio + 1 });
    } else {
      guardarSesion(actualizados);
    }
  }

  if (fase.tipo === 'calentamiento') {
    return (
      <FaseCalentamiento
        onContinuar={() => setFase({ tipo: 'inicio_ejercicio', indiceEjercicio: 0 })}
        onCambiarDia={onCambiarDia}
        calentamiento={dia.calentamiento}
      />
    );
  }

  if (fase.tipo === 'inicio_ejercicio') {
    const ej = ejercicios[fase.indiceEjercicio];
    return (
      <>
        {error && <p className="error-mensaje">{error}</p>}
        <FaseInicioEjercicio
          nombreEjercicio={ej.nombreEjercicio}
          numeroEjercicio={fase.indiceEjercicio + 1}
          totalEjercicios={ejercicios.length}
          series={ej.series.length}
          repsMin={ej.repsMin}
          repsMax={ej.repsMax}
          descansoSegundos={ej.descansoSegundos}
          notas={ej.notas}
          onComenzar={() => setFase({ tipo: 'registrar_serie', indiceEjercicio: fase.indiceEjercicio, indiceSerie: 0 })}
        />
      </>
    );
  }

  if (fase.tipo === 'registrar_serie') {
    const ej = ejercicios[fase.indiceEjercicio];
    return (
      <FaseRegistrarSerie
        nombreEjercicio={ej.nombreEjercicio}
        numeroSerie={fase.indiceSerie + 1}
        totalSeries={ej.series.length}
        repsSugeridas={ej.repsMax}
        onRegistrar={(peso, reps) => registrarSerie(fase.indiceEjercicio, fase.indiceSerie, peso, reps)}
      />
    );
  }

  if (fase.tipo === 'descanso_serie') {
    const ej = ejercicios[fase.indiceEjercicio];
    return (
      <FaseDescanso
        segundos={ej.descansoSegundos}
        etiqueta="Descanso entre series"
        onFinalizar={() =>
          setFase({ tipo: 'registrar_serie', indiceEjercicio: fase.indiceEjercicio, indiceSerie: fase.indiceSerieSiguiente })
        }
      />
    );
  }

  if (fase.tipo === 'descanso_ejercicio') {
    const ejAnterior = ejercicios[fase.indiceEjercicioSiguiente - 1];
    return (
      <FaseDescanso
        segundos={ejAnterior.descansoSegundos}
        etiqueta="Descanso antes del siguiente ejercicio"
        onFinalizar={() => setFase({ tipo: 'inicio_ejercicio', indiceEjercicio: fase.indiceEjercicioSiguiente })}
      />
    );
  }

  if (fase.tipo === 'guardando') {
    return <div className="estado-vacio">Guardando sesión…</div>;
  }

  return (
    <FaseResumen
      nombreDia={dia.nombreDia}
      ejercicios={ejercicios}
      onNuevaSesion={() => {
        setEjercicios(construirEstadoInicial(dia));
        setFase({ tipo: 'calentamiento' });
      }}
    />
  );
}
