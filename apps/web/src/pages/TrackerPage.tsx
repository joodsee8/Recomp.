import { useState } from 'react';
import { SelectorDia } from '../components/workout/SelectorDia';
import { SesionTracker } from '../components/workout/SesionTracker';
import type { DiaDeRutinaResuelto } from '../types/api';

export function TrackerPage() {
  const [dia, setDia] = useState<DiaDeRutinaResuelto | null>(null);

  if (!dia) {
    return (
      <div className="tracker-pagina">
        <h1>Tracker</h1>
        <h2 style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>Elige el día de hoy</h2>
        <SelectorDia onDiaListo={setDia} />
      </div>
    );
  }

  return <SesionTracker dia={dia} onSesionGuardada={() => {}} onCambiarDia={() => setDia(null)} />;
}
