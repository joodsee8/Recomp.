import { useState, type FormEvent } from 'react';
import type { AlimentoCatalogo } from '../../types/api';
import { buscarAlimentos } from '../../services/alimentos.service';
import './AgregarAlimentoForm.css';

interface Props {
  onAgregar: (alimentoId: string, cantidadG: number) => Promise<void>;
}

export function AgregarAlimentoForm({ onAgregar }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<AlimentoCatalogo[]>([]);
  const [seleccionado, setSeleccionado] = useState<AlimentoCatalogo | null>(null);
  const [cantidadG, setCantidadG] = useState('100');
  const [buscando, setBuscando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarCambioBusqueda(valor: string) {
    setBusqueda(valor);
    setSeleccionado(null);

    if (valor.trim().length < 2) {
      setResultados([]);
      return;
    }

    setBuscando(true);
    try {
      const { alimentos } = await buscarAlimentos(valor.trim());
      setResultados(alimentos);
    } catch {
      setResultados([]);
    } finally {
      setBuscando(false);
    }
  }

  async function manejarSubmit(evento: FormEvent) {
    evento.preventDefault();
    if (!seleccionado) return;

    const cantidad = Number(cantidadG);
    if (!cantidad || cantidad <= 0) {
      setError('La cantidad tiene que ser mayor a 0');
      return;
    }

    setEnviando(true);
    setError(null);
    try {
      await onAgregar(seleccionado.alimentoId, cantidad);
      setBusqueda('');
      setResultados([]);
      setSeleccionado(null);
      setCantidadG('100');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar el alimento');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="agregar-alimento" onSubmit={manejarSubmit}>
      <div className="campo">
        <label htmlFor="buscar-alimento">Agregar alimento</label>
        <input
          id="buscar-alimento"
          type="text"
          placeholder="Ej. pechuga de pollo…"
          value={busqueda}
          onChange={(e) => manejarCambioBusqueda(e.target.value)}
          autoComplete="off"
        />
      </div>

      {busqueda.trim().length >= 2 && !seleccionado && (
        <div className="agregar-alimento-resultados">
          {buscando && <div className="agregar-alimento-vacio">Buscando…</div>}
          {!buscando && resultados.length === 0 && (
            <div className="agregar-alimento-vacio">Sin resultados para "{busqueda}"</div>
          )}
          {resultados.map((alimento) => (
            <button
              type="button"
              key={alimento.alimentoId}
              className="agregar-alimento-resultado"
              onClick={() => {
                setSeleccionado(alimento);
                setBusqueda(alimento.nombre);
                setResultados([]);
              }}
            >
              <span>{alimento.nombre}</span>
              <span className="dato-numerico agregar-alimento-resultado-kcal">
                {alimento.macrosPor100g.calorias} kcal/100g
              </span>
            </button>
          ))}
        </div>
      )}

      {seleccionado && (
        <div className="agregar-alimento-cantidad">
          <div className="campo">
            <label htmlFor="cantidad-g">Cantidad (g)</label>
            <input
              id="cantidad-g"
              type="number"
              min={1}
              value={cantidadG}
              onChange={(e) => setCantidadG(e.target.value)}
            />
          </div>
          <button type="submit" className="boton boton-primario" disabled={enviando}>
            {enviando ? 'Agregando…' : 'Agregar'}
          </button>
        </div>
      )}

      {error && <p className="error-mensaje">{error}</p>}
    </form>
  );
}
