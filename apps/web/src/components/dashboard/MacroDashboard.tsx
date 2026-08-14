import { useCallback, useEffect, useState } from 'react';
import type { ResumenDelDia } from '../../types/api';
import * as macroLogsService from '../../services/macroLogs.service';
import { MacroChartCard } from './MacroChartCard';
import { ProgresoMuscularCard } from './ProgresoMuscularCard';
import { ProyeccionCard } from './ProyeccionCard';
import './MacroDashboard.css';

function fechaDeHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * MacroDashboard
 * --------------
 * Solo gráficas + su información — nada de formularios ni listas. Registrar
 * comida y entrenamiento pasa por el Chat (home) y el Tracker; el Dashboard
 * es puramente de lectura/analítica.
 */
export function MacroDashboard() {
  const [fecha, setFecha] = useState(fechaDeHoy());
  const [resumen, setResumen] = useState<ResumenDelDia | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarResumen = useCallback(async (fechaConsulta: string) => {
    setCargando(true);
    setError(null);
    try {
      const datos = await macroLogsService.obtenerResumenDelDia(fechaConsulta);
      setResumen(datos);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el resumen del día');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarResumen(fecha);
  }, [fecha, cargarResumen]);

  return (
    <div className="dashboard">
      <header className="dashboard-encabezado">
        <div>
          <h1>Dashboard</h1>
          <h2>Tus analíticas</h2>
        </div>
        <input
          type="date"
          className="dashboard-fecha"
          value={fecha}
          max={fechaDeHoy()}
          onChange={(e) => setFecha(e.target.value)}
        />
      </header>

      {cargando && !resumen && <div className="estado-vacio">Cargando…</div>}
      {error && !resumen && <p className="error-mensaje">{error}</p>}
      {resumen && <MacroChartCard resumen={resumen} />}

      <ProgresoMuscularCard />

      <ProyeccionCard />
    </div>
  );
}
