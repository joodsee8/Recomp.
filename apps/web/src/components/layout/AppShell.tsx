import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChatFlotante } from '../chat/ChatFlotante';
import { PixelIcon, type NombreIcono } from '../ui/PixelIcon';
import './AppShell.css';

const ENLACES: { ruta: string; etiqueta: string; icono: NombreIcono }[] = [
  { ruta: '/dashboard', etiqueta: 'Dashboard', icono: 'panel' },
  { ruta: '/tracker', etiqueta: 'Tracker', icono: 'pesas' },
  { ruta: '/historial', etiqueta: 'Historial', icono: 'reloj' }
];

/**
 * Layout de toda la app autenticada. Es una ruta padre: las pantallas se
 * dibujan en <Outlet />, y la barra, el HUD y el chat de A.D.A.M. se quedan
 * montados al cambiar de pestaña.
 */
export function AppShell() {
  const { usuario, cerrarSesion } = useAuth();
  const { pathname } = useLocation();
  const contenidoRef = useRef<HTMLElement>(null);

  // Cada pestaña empieza arriba.
  useEffect(() => {
    contenidoRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="shell">
      <header className="shell-hud">
        <span className="shell-marca">
          RECOMP<span className="shell-marca-punto">.</span>
        </span>
        <span className="shell-jugador">
          <span className="shell-jugador-etiqueta">P1</span>
          <span className="shell-jugador-nombre">{usuario?.nombre}</span>
        </span>
        <button className="shell-salir" onClick={cerrarSesion} aria-label="Cerrar sesión">
          <PixelIcon nombre="salir" tamano={20} />
        </button>
      </header>

      <main className="shell-contenido" ref={contenidoRef}>
        <Outlet />
      </main>

      <nav className="shell-tabbar" aria-label="Secciones">
        {ENLACES.map(({ ruta, etiqueta, icono }) => (
          <NavLink
            key={ruta}
            to={ruta}
            className={({ isActive }) => `shell-tab${isActive ? ' shell-tab--activo' : ''}`}
          >
            <PixelIcon nombre={icono} tamano={24} />
            <span>{etiqueta}</span>
          </NavLink>
        ))}
      </nav>

      <ChatFlotante />
    </div>
  );
}
