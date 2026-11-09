import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdamAvatar } from '../components/adam/AdamAvatar';
import './AuthPage.css';

export function LoginPage() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function manejarSubmit(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      await iniciarSesion(email, password);
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-pagina">
      <div className="auth-cabecera">
        <div className="auth-marca">
          RECOMP<span className="auth-marca-punto">.</span>
        </div>
        <div className="auth-adam">
          <span className="auth-adam-retrato">
            <AdamAvatar tamano={64} />
          </span>
          <p className="auth-adam-dialogo">Soy A.D.A.M., tu coach. Entra para seguir con tu entreno.</p>
        </div>
      </div>

      <form className="tarjeta auth-tarjeta" onSubmit={manejarSubmit}>
        <h1>Iniciar sesión</h1>

        <div className="campo">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="error-mensaje">{error}</p>}

        <button type="submit" className="boton boton-primario" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="auth-alterno">
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </form>
    </div>
  );
}
