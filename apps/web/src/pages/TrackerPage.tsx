import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { SelectorDia } from '../components/workout/SelectorDia';
import { SesionTracker } from '../components/workout/SesionTracker';
import type { DiaDeRutinaResuelto } from '../types/api';

export function TrackerPage() {
  const [dia, setDia] = useState<DiaDeRutinaResuelto | null>(null);

  return (
    <AppShell>
      {!dia ? (
        <div>
          <h1>Tracker</h1>
          <h2 style={{ marginBottom: '1.5rem' }}>Elegí el día de hoy</h2>
          <SelectorDia onDiaListo={setDia} />
        </div>
      ) : (
        <SesionTracker dia={dia} onSesionGuardada={() => {}} />
      )}

      {dia && (
        <button className="boton" style={{ marginTop: '1.5rem' }} onClick={() => setDia(null)}>
          ← Elegir otro día
        </button>
      )}
    </AppShell>
  );
}
