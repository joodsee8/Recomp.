import { useEffect, useState } from 'react';
import type { Logro, PeriodoLogro } from '../../types/api';
import * as logrosService from '../../services/logros.service';
import { ApiError } from '../../services/apiClient';
import { LogroCard } from './LogroCard';
import './LogrosVentana.css';

interface Props {
  onCerrar: () => void;
}

const ORDEN_PERIODOS: PeriodoLogro[] = ['diario', 'semanal', 'mensual'];
const TITULO_PERIODO: Record<PeriodoLogro, string> = {
  diario: 'Hoy',
  semanal: 'Esta semana',
  mensual: 'Este mes'
};

export function LogrosVentana({ onCerrar }: Props) {
  const [activos, setActivos] = useState<Logro[]>([]);
  const [desbloqueados, setDesbloqueados] = useState<Logro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const datos = await logrosService.listarLogros();
      setActivos(datos.activos);
      setDesbloqueados(datos.desbloqueados);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar tus logros');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function manejarGenerar() {
    setGenerando(true);
    setError(null);
    try {
      await logrosService.generarLogros();
      await cargar();
    } catch (e) {
      const esFaltaDeAPIKey = e instanceof ApiError && e.statusCode === 503;
      setError(
        esFaltaDeAPIKey
          ? 'Falta configurar GEMINI_API_KEY en el servidor para generar logros nuevos.'
          : e instanceof Error
            ? e.message
            : 'No se pudieron generar logros nuevos'
      );
    } finally {
      setGenerando(false);
    }
  }

  const activosPorPeriodo = ORDEN_PERIODOS.map((periodo) => ({
    periodo,
    logros: activos.filter((l) => l.periodo === periodo)
  })).filter((grupo) => grupo.logros.length > 0);

  return (
    <div className="logros-overlay" role="dialog" aria-label="Logros">
      <div className="logros-ventana">
        <header className="logros-ventana-header">
          <h1>Logros</h1>
          <button className="logros-ventana-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <div className="logros-ventana-contenido">
          {cargando && <div className="estado-vacio">Cargando tus logros…</div>}

          {!cargando && error && activos.length === 0 && desbloqueados.length === 0 && (
            <p className="error-mensaje">{error}</p>
          )}

          {!cargando && activos.length === 0 && desbloqueados.length === 0 && !error && (
            <div className="estado-vacio">
              Todavía no tienes logros. Generá los primeros con tu historial real de entrenamiento y dieta.
            </div>
          )}

          {activosPorPeriodo.map((grupo) => (
            <section key={grupo.periodo} className="logros-ventana-seccion">
              <h2>{TITULO_PERIODO[grupo.periodo]}</h2>
              <div className="logros-ventana-grid">
                {grupo.logros.map((logro) => (
                  <LogroCard key={logro._id} logro={logro} />
                ))}
              </div>
            </section>
          ))}

          {desbloqueados.length > 0 && (
            <section className="logros-ventana-seccion">
              <h2>Desbloqueados</h2>
              <div className="logros-ventana-grid">
                {desbloqueados.map((logro) => (
                  <LogroCard key={logro._id} logro={logro} />
                ))}
              </div>
            </section>
          )}

          {error && (activos.length > 0 || desbloqueados.length > 0) && <p className="error-mensaje">{error}</p>}
        </div>

        <footer className="logros-ventana-footer">
          <button className="boton boton-primario" onClick={manejarGenerar} disabled={generando}>
            {generando ? 'Generando con IA…' : 'Generar nuevos logros'}
          </button>
        </footer>
      </div>
    </div>
  );
}
