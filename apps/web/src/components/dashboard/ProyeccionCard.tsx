import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { obtenerProyeccionMock } from '../../data/proyeccionMock';
import './ProyeccionCard.css';

export function ProyeccionCard() {
  const proyeccion = obtenerProyeccionMock();
  const kgPorPerder = proyeccion.pesoActualKg - proyeccion.pesoObjetivoKg;

  return (
    <div className="tarjeta proyeccion-card">
      <div className="proyeccion-card-encabezado">
        <h3>Proyección al objetivo</h3>
        <span className="proyeccion-card-badge">Estimado</span>
      </div>

      <div className="proyeccion-card-sparkline">
        <ResponsiveContainer width="100%" height={70}>
          <AreaChart data={proyeccion.tendencia} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
            <Area
              type="monotone"
              dataKey="pesoKg"
              stroke="var(--color-carbos)"
              strokeWidth={2}
              fill="var(--color-carbos-bg)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="proyeccion-card-metricas">
        <div className="proyeccion-card-metrica">
          <span className="dato-numerico proyeccion-card-valor">{proyeccion.pesoActualKg}</span>
          <span className="proyeccion-card-etiqueta">kg actual</span>
        </div>
        <div className="proyeccion-card-metrica">
          <span className="dato-numerico proyeccion-card-valor">{proyeccion.grasaActualPct}%</span>
          <span className="proyeccion-card-etiqueta">grasa estimada</span>
        </div>
        <div className="proyeccion-card-metrica">
          <span className="dato-numerico proyeccion-card-valor">{proyeccion.semanasEstimadas}</span>
          <span className="proyeccion-card-etiqueta">semanas al objetivo</span>
        </div>
      </div>

      <p className="proyeccion-card-nota">
        Meta: {proyeccion.pesoObjetivoKg} kg · {proyeccion.grasaObjetivoPct}% grasa — te faltan ~{kgPorPerder.toFixed(1)} kg
        al ritmo actual. Estos valores los va a calcular la IA con tu progreso real una vez que conectemos el chat.
      </p>
    </div>
  );
}
