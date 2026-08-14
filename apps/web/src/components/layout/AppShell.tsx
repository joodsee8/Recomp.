import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AppShell.css';

function IconoChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16v11H8l-4 4V5Z" />
    </svg>
  );
}
function IconoDashboard() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19V10" />
      <path d="M11 19V5" />
      <path d="M18 19v-7" />
    </svg>
  );
}
function IconoTracker() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 7v10" />
      <path d="M18 7v10" />
      <path d="M2 9v6" />
      <path d="M22 9v6" />
      <path d="M6 12h12" />
    </svg>
  );
}
function IconoHistorial() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

const ENLACES = [
  { ruta: '/', etiqueta: 'Chat', codigo: '01', Icono: IconoChat },
  { ruta: '/dashboard', etiqueta: 'Dashboard', codigo: '02', Icono: IconoDashboard },
  { ruta: '/tracker', etiqueta: 'Tracker', codigo: '03', Icono: IconoTracker },
  { ruta: '/historial', etiqueta: 'Historial', codigo: '04', Icono: IconoHistorial }
];

interface Props {
  children: ReactNode;
  /** Quita el padding del área de contenido — lo usa el Chat para ir a pantalla completa. */
  sinPadding?: boolean;
}

export function AppShell({ children, sinPadding }: Props) {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <div className="shell">
      {/* --- Sidebar: solo desktop --- */}
      <aside className="shell-sidebar">
        <div className="shell-marca">
          RECOMP<span className="shell-marca-punto">.</span>
        </div>

        <nav className="shell-nav">
          {ENLACES.map(({ ruta, etiqueta, codigo, Icono }) => (
            <NavLink
              key={ruta}
              to={ruta}
              end={ruta === '/'}
              className={({ isActive }) => `shell-nav-link${isActive ? ' shell-nav-link--activo' : ''}`}
            >
              <Icono />
              <span className="shell-nav-texto">{etiqueta}</span>
              <span className="shell-nav-codigo">{codigo}</span>
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

      {/* --- Top bar: solo mobile --- */}
      <header className="shell-topbar-movil">
        <span className="shell-marca">
          RECOMP<span className="shell-marca-punto">.</span>
        </span>
        <button className="shell-topbar-movil-salir" onClick={cerrarSesion} aria-label="Cerrar sesión">
          ⏻
        </button>
      </header>

      <main className={`shell-contenido${sinPadding ? ' shell-contenido--sin-padding' : ''}`}>{children}</main>

      {/* --- Tab bar inferior: solo mobile --- */}
      <nav className="shell-tabbar-movil">
        {ENLACES.map(({ ruta, etiqueta, Icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            end={ruta === '/'}
            className={({ isActive }) => `shell-tabbar-link${isActive ? ' shell-tabbar-link--activo' : ''}`}
          >
            <Icono />
            <span>{etiqueta}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
