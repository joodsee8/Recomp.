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
    return <Dot cx={cx} cy={cy} r={5} fill="var(--color-proteina)" stroke="none" />;
  }
  return <Dot cx={cx} cy={cy} r={3} fill="var(--color-text-muted)" stroke="none" />;
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
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={datos} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="fecha"
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: 'var(--color-border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--color-text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface-raised)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 12
            }}
            labelStyle={{ color: 'var(--color-text-muted)' }}
            formatter={(valor: number) => [`${valor} kg`, 'Peso máximo']}
          />
          <Line
            type="monotone"
            dataKey="pesoMaximoKg"
            stroke="var(--color-carbos)"
            strokeWidth={2}
            dot={<PuntoPersonalizado />}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="progreso-chart-nota">
        <span className="progreso-chart-nota-punto" /> récord personal
      </p>
    </div>
  );
}
