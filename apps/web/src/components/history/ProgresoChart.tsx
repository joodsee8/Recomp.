import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Dot } from 'recharts';
import type { PuntoDeProgreso } from '../../types/api';
import './ProgresoChart.css';

interface Props {
  puntos: PuntoDeProgreso[];
}

interface PuntoDelGrafico {
  fecha: string;
  pesoMaximoKg: number;
  huboRecordPersonal: boolean;
}

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}

function PuntoPersonalizado(props: { cx?: number; cy?: number; payload?: PuntoDelGrafico }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return null;

  if (payload?.huboRecordPersonal) {
    return <Dot cx={cx} cy={cy} r={7} fill="#7cff8a" stroke="#07041a" strokeWidth={2} />;
  }
  return <Dot cx={cx} cy={cy} r={4} fill="#b1abe6" stroke="none" />;
}

export function ProgresoChart({ puntos }: Props) {
  if (puntos.length === 0) {
    return <div className="estado-vacio">Todavía no hay sesiones registradas para este ejercicio.</div>;
  }

  const datos: PuntoDelGrafico[] = puntos.map((p) => ({
    fecha: formatearFecha(p.fecha),
    pesoMaximoKg: p.pesoMaximoKg,
    huboRecordPersonal: p.huboRecordPersonal
  }));

  return (
    <div className="progreso-chart">
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={datos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#2b2476" vertical={false} />
          <XAxis
            dataKey="fecha"
            tick={{ fill: '#b1abe6', fontSize: 13, fontFamily: 'var(--font-display)' }}
            axisLine={{ stroke: '#4237b0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#b1abe6', fontSize: 13, fontFamily: 'var(--font-display)' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: '#2b2476',
              border: '3px solid #6a5cf0',
              borderRadius: 10,
              fontFamily: 'var(--font-display)',
              fontSize: 14
            }}
            labelStyle={{ color: '#b1abe6' }}
            formatter={(valor: number) => [`${valor} kg`, 'Peso máximo']}
          />
          <Line
            type="monotone"
            dataKey="pesoMaximoKg"
            stroke="#ffd23f"
            strokeWidth={3}
            dot={<PuntoPersonalizado />}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="progreso-chart-nota">
        <span className="progreso-chart-nota-punto" /> récord personal
      </p>
    </div>
  );
}
