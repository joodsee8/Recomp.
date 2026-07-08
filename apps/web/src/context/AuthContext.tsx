import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { Usuario } from '../types/api';
import * as authService from '../services/auth.service';
import { guardarToken, borrarToken, obtenerToken } from '../services/apiClient';

interface AuthContextValor {
  usuario: Usuario | null;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrar: (email: string, password: string, nombre: string) => Promise<void>;
  cerrarSesion: () => void;
}

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  // Al montar la app: si hay token guardado de una sesión anterior, valida
  // que siga sirviendo pidiendo el perfil. Si el token expiró/es inválido,
  // se limpia silenciosamente y el usuario vuelve al login.
  useEffect(() => {
    const token = obtenerToken();
    if (!token) {
      setCargando(false);
      return;
    }

    authService
      .obtenerPerfil()
      .then(({ usuario: perfil }) => setUsuario(perfil))
      .catch(() => borrarToken())
      .finally(() => setCargando(false));
  }, []);

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const { token, usuario: perfil } = await authService.iniciarSesion(email, password);
    guardarToken(token);
    setUsuario(perfil);
  }, []);

  const registrar = useCallback(async (email: string, password: string, nombre: string) => {
    const { token, usuario: perfil } = await authService.registrar(email, password, nombre);
    guardarToken(token);
    setUsuario(perfil);
  }, []);

  const cerrarSesion = useCallback(() => {
    borrarToken();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, registrar, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValor {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
