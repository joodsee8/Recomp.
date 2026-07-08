import { useCallback, useEffect, useState } from 'react';
import type { ResumenDelDia } from '../../types/api';
import * as macroLogsService from '../../services/macroLogs.service';
import { MacroProgressBar } from './MacroProgressBar';
import { AgregarAlimentoForm } from './AgregarAlimentoForm';
import { ListaAlimentosConsumidos } from './ListaAlimentosConsumidos';
import './MacroDashboard.css';

function fechaDeHoy(): string {
  return new Date().toISOString().slice(0, 10);
}

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

  async function manejarAgregar(alimentoId: string, cantidadG: number) {
    const actualizado = await macroLogsService.agregarAlimentoConsumido(fecha, alimentoId, cantidadG);
    setResumen(actualizado);
  }

  async function manejarEliminar(itemId: string) {
    const actualizado = await macroLogsService.eliminarAlimentoConsumido(fecha, itemId);
    setResumen(actualizado);
  }

  if (cargando && !resumen) {
    return <div className="estado-vacio">Cargando el día…</div>;
  }

  if (error && !resumen) {
    return <p className="error-mensaje">{error}</p>;
  }

  if (!resumen) return null;

  const { totales, meta, restante } = resumen;
  const porcentajeCalorias = meta.calorias > 0 ? Math.min(100, (totales.calorias / meta.calorias) * 100) : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-encabezado">
        <div>
          <h1>Dashboard</h1>
          <h2>Déficit del día</h2>
        </div>
        <input
          type="date"
          className="dashboard-fecha"
          value={fecha}
          max={fechaDeHoy()}
          onChange={(e) => setFecha(e.target.value)}
        />
      </header>

      <section className="tarjeta dashboard-hero">
        <div className="dashboard-hero-anillo" style={{ ['--pct' as string]: porcentajeCalorias }}>
          <div className="dashboard-hero-numero">
            <span className="dato-numerico dashboard-hero-consumido">{Math.round(totales.calorias)}</span>
            <span className="dashboard-hero-etiqueta">kcal de {Math.round(meta.calorias)}</span>
          </div>
        </div>
        <div className="dashboard-hero-detalle">
          <span className="dato-numerico dashboard-hero-restante">
            {restante.calorias >= 0 ? restante.calorias : `+${Math.abs(restante.calorias)}`}
          </span>
          <span className="dashboard-hero-restante-etiqueta">
            {restante.calorias >= 0 ? 'kcal disponibles todavía' : 'kcal por encima de la meta'}
          </span>
        </div>
      </section>

      <section className="tarjeta dashboard-macros">
        <MacroProgressBar etiqueta="Proteína" actual={totales.proteinaG} meta={meta.proteinaG} unidad="g" color="proteina" />
        <MacroProgressBar etiqueta="Carbohidratos" actual={totales.carbohidratosG} meta={meta.carbohidratosG} unidad="g" color="carbos" />
        <MacroProgressBar etiqueta="Grasas" actual={totales.grasasG} meta={meta.grasasG} unidad="g" color="grasa" />
      </section>

      <section className="tarjeta">
        <h3 className="dashboard-seccion-titulo">Agregar comida</h3>
        <AgregarAlimentoForm onAgregar={manejarAgregar} />
      </section>

      <section className="tarjeta">
        <h3 className="dashboard-seccion-titulo">Registrado hoy</h3>
        <ListaAlimentosConsumidos alimentos={resumen.alimentosConsumidos} onEliminar={manejarEliminar} />
      </section>
    </div>
  );
}
