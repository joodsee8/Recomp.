import type { AlimentoConsumido } from '../../types/api';
import './ListaAlimentosConsumidos.css';

interface Props {
  alimentos: AlimentoConsumido[];
  onEliminar: (itemId: string) => void;
}

export function ListaAlimentosConsumidos({ alimentos, onEliminar }: Props) {
  if (alimentos.length === 0) {
    return <div className="estado-vacio">Todavía no registraste nada hoy. Agrega tu primera comida arriba.</div>;
  }

  return (
    <ul className="lista-consumidos">
      {alimentos.map((item) => (
        <li key={item._id} className="lista-consumidos-item">
          <div className="lista-consumidos-info">
            <span className="lista-consumidos-nombre">{item.nombreAlimento}</span>
            <span className="dato-numerico lista-consumidos-cantidad">{item.cantidadG} g</span>
          </div>
          <div className="lista-consumidos-macros dato-numerico">
            <span>{item.macros.calorias} kcal</span>
            <span className="lista-consumidos-macro-detalle">
              P {item.macros.proteinaG} · C {item.macros.carbohidratosG} · G {item.macros.grasasG}
            </span>
          </div>
          <button
            className="lista-consumidos-eliminar"
            onClick={() => onEliminar(item._id)}
            aria-label={`Eliminar ${item.nombreAlimento}`}
            title="Eliminar"
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}
