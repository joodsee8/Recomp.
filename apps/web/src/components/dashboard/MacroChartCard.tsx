import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { ResumenDelDia } from '../../types/api';
import { MacroProgressBar } from './MacroProgressBar';
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
    { nombre: 'Calorías', pct: calcularPct(totales.calorias, meta.calorias), fill: '#b1abe6' },
    { nombre: 'Proteína', pct: calcularPct(totales.proteinaG, meta.proteinaG), fill: '#ff5c7a' },
    { nombre: 'Carbohidratos', pct: calcularPct(totales.carbohidratosG, meta.carbohidratosG), fill: '#ff9f43' },
    { nombre: 'Grasas', pct: calcularPct(totales.grasasG, meta.grasasG), fill: '#3fd8ff' }
  ];

  return (
    <div className="tarjeta macro-chart-card">
      <h3>Calorías y macros de hoy</h3>

      <div className="macro-chart-card-cuerpo">
        <div className="macro-chart-card-grafica">
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart
              data={datos}
              innerRadius="38%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              barCategoryGap="18%"
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background={{ fill: '#0e0a28' }} dataKey="pct" cornerRadius={4} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="macro-chart-card-centro">
            <span className="dato-numerico macro-chart-card-kcal">{Math.round(totales.calorias)}</span>
            <span className="macro-chart-card-kcal-etiqueta">/ {Math.round(meta.calorias)} kcal</span>
          </div>
        </div>

        <div className="macro-chart-card-barras">
          <MacroProgressBar etiqueta="Calorías" actual={totales.calorias} meta={meta.calorias} unidad="kcal" color="neutral" />
          <MacroProgressBar etiqueta="Proteína" actual={totales.proteinaG} meta={meta.proteinaG} unidad="g" color="proteina" />
          <MacroProgressBar
            etiqueta="Carbohidratos"
            actual={totales.carbohidratosG}
            meta={meta.carbohidratosG}
            unidad="g"
            color="carbos"
          />
          <MacroProgressBar etiqueta="Grasas" actual={totales.grasasG} meta={meta.grasasG} unidad="g" color="grasa" />
        </div>
      </div>

      <p className="macro-chart-card-nota">
        {restante.calorias >= 0
          ? `Te quedan ${Math.round(restante.calorias)} kcal disponibles hoy.`
          : `Pasaste tu meta por ${Math.round(Math.abs(restante.calorias))} kcal.`}
      </p>
    </div>
  );
}
