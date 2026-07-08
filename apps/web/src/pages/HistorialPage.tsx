import { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { ProgresoChart } from '../components/history/ProgresoChart';
import { HistorialList } from '../components/history/HistorialList';
import * as ejerciciosService from '../services/ejercicios.service';
import * as workoutLogsService from '../services/workoutLogs.service';
import type { EjercicioCatalogo, WorkoutLog, PuntoDeProgreso } from '../types/api';

export function HistorialPage() {
  const [ejercicios, setEjercicios] = useState<EjercicioCatalogo[]>([]);
  const [ejercicioId, setEjercicioId] = useState('');
  const [progreso, setProgreso] = useState<PuntoDeProgreso[]>([]);
  const [cargandoProgreso, setCargandoProgreso] = useState(false);

  const [sesiones, setSesiones] = useState<WorkoutLog[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargandoSesiones, setCargandoSesiones] = useState(true);

  useEffect(() => {
    ejerciciosService.listarEjercicios().then(({ ejercicios: lista }) => {
      setEjercicios(lista);
      if (lista.length > 0) setEjercicioId(lista[0].ejercicioId);
    });
  }, []);

  useEffect(() => {
    if (!ejercicioId) return;
    setCargandoProgreso(true);
    workoutLogsService
      .obtenerProgresoEjercicio(ejercicioId)
      .then(({ progreso: puntos }) => setProgreso(puntos))
      .finally(() => setCargandoProgreso(false));
  }, [ejercicioId]);

  useEffect(() => {
    setCargandoSesiones(true);
    workoutLogsService
      .listarHistorial({ page: pagina, limit: 10 })
      .then(({ sesiones: lista, paginacion }) => {
        setSesiones(lista);
        setTotalPaginas(paginacion.totalPaginas);
      })
      .finally(() => setCargandoSesiones(false));
  }, [pagina]);

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <h1>Historial</h1>

        <section className="tarjeta">
          <div className="campo" style={{ marginBottom: 'var(--space-4)' }}>
            <label htmlFor="select-ejercicio">Sobrecarga progresiva</label>
            <select id="select-ejercicio" value={ejercicioId} onChange={(e) => setEjercicioId(e.target.value)}>
              {ejercicios.map((ej) => (
                <option key={ej.ejercicioId} value={ej.ejercicioId}>
                  {ej.nombre}
                </option>
              ))}
            </select>
          </div>

          {cargandoProgreso ? <div className="estado-vacio">Cargando…</div> : <ProgresoChart puntos={progreso} />}
        </section>

        <section className="tarjeta">
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Sesiones pasadas</h3>
          {cargandoSesiones ? (
            <div className="estado-vacio">Cargando…</div>
          ) : (
            <>
              <HistorialList sesiones={sesiones} />
              {totalPaginas > 1 && (
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', justifyContent: 'center' }}>
                  <button className="boton" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
                    Anterior
                  </button>
                  <span className="dato-numerico" style={{ alignSelf: 'center', color: 'var(--color-text-muted)' }}>
                    {pagina} / {totalPaginas}
                  </span>
                  <button className="boton" disabled={pagina >= totalPaginas} onClick={() => setPagina((p) => p + 1)}>
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </AppShell>
  );
}
