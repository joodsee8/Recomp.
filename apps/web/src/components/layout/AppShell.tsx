import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AppShell.css';

const ENLACES = [
  { ruta: '/', etiqueta: 'Dashboard', codigo: '01' },
  { ruta: '/tracker', etiqueta: 'Tracker', codigo: '02' },
  { ruta: '/historial', etiqueta: 'Historial', codigo: '03' }
];

export function AppShell({ children }: { children: ReactNode }) {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <div className="shell">
      <aside className="shell-sidebar">
        <div className="shell-marca">
          RECOMP<span className="shell-marca-punto">.</span>
        </div>

        <nav className="shell-nav">
          {ENLACES.map((enlace) => (
            <NavLink
              key={enlace.ruta}
              to={enlace.ruta}
              end={enlace.ruta === '/'}
              className={({ isActive }) => `shell-nav-link${isActive ? ' shell-nav-link--activo' : ''}`}
            >
              <span className="shell-nav-codigo">{enlace.codigo}</span>
              {enlace.etiqueta}
            </NavLink>
          ))}
        </nav>

        <div className="shell-usuario">
          <div className="shell-usuario-nombre">{usuario?.nombre}</div>
          <button className="shell-usuario-salir" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="shell-contenido">{children}</main>
    </div>
  );
}
