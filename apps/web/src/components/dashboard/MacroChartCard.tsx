import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { ResumenDelDia } from '../../types/api';
import './MacroChartCard.css';

interface Props {
  resumen: ResumenDelDia;
}

interface AnilloData {
  nombre: string;
  pct: number;
  fill: string;
}

function calcularPct(actual: number, meta: number): number {
  return meta > 0 ? Math.min(100, Math.round((actual / meta) * 100)) : 0;
}

export function MacroChartCard({ resumen }: Props) {
  const { totales, meta, restante } = resumen;

  const datos: AnilloData[] = [
    { nombre: 'Calorías', pct: calcularPct(totales.calorias, meta.calorias), fill: '#8b9098' },
    { nombre: 'Proteína', pct: calcularPct(totales.proteinaG, meta.proteinaG), fill: '#c23b3b' },
    { nombre: 'Carbohidratos', pct: calcularPct(totales.carbohidratosG, meta.carbohidratosG), fill: '#d9a62e' },
    { nombre: 'Grasas', pct: calcularPct(totales.grasasG, meta.grasasG), fill: '#3e6fc2' }
  ];

  return (
    <div className="tarjeta macro-chart-card">
      <h3>Calorías y macros de hoy</h3>

      <div className="macro-chart-card-cuerpo">
        <div className="macro-chart-card-grafica">
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              data={datos}
              innerRadius="34%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              barCategoryGap="18%"
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: '#24282d' }} dataKey="pct" cornerRadius={4} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="macro-chart-card-centro">
            <span className="dato-numerico macro-chart-card-kcal">{Math.round(totales.calorias)}</span>
            <span className="macro-chart-card-kcal-etiqueta">/ {Math.round(meta.calorias)} kcal</span>
          </div>
        </div>

        <ul className="macro-chart-card-info">
          {datos.map((anillo) => (
            <li key={anillo.nombre}>
              <span className="macro-chart-card-punto" style={{ background: anillo.fill }} />
              <span className="macro-chart-card-info-nombre">{anillo.nombre}</span>
              <span className="dato-numerico macro-chart-card-info-pct">{anillo.pct}%</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="macro-chart-card-nota">
        {restante.calorias >= 0
          ? `Te quedan ${Math.round(restante.calorias)} kcal disponibles hoy.`
          : `Pasaste tu meta por ${Math.round(Math.abs(restante.calorias))} kcal.`}
      </p>
    </div>
  );
}
