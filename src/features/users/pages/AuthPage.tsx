import { Eye, LogIn, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useState } from 'react';
import type { AuthMode, SubmitHandler } from '../../../types';

type AuthScreenProps = {
  authMode: AuthMode;
  authName: string;
  authEmail: string;
  authPassword: string;
  loading: boolean;
  status: string;
  onAuthModeChange: (mode: AuthMode) => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: SubmitHandler;
};

export function AuthScreen({
  authMode,
  authName,
  authEmail,
  authPassword,
  loading,
  status,
  onAuthModeChange,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="auth-screen">
      <section className="auth-copy">
        <p className="eyebrow">Clube do Álbum</p>
        <h1>Seu diario de albuns, notas e descobertas.</h1>
        <div className="auth-stats">
          <span>Ranking vivo</span>
          <span>Feed social</span>
          <span>Catalogo musical</span>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <p className="eyebrow">Bem-vindo</p>
          <h2>{authMode === 'login' ? 'Entrar no Clube do Álbum' : 'Criar sua conta'}</h2>
          <span>
            {authMode === 'login'
              ? 'Continue de onde parou e avalie seus próximos álbuns.'
              : 'Monte seu perfil para salvar notas, reviews e seguir outros ouvintes.'}
          </span>
        </div>
        <div className="auth-tabs">
          <button className={authMode === 'login' ? 'active' : ''} onClick={() => onAuthModeChange('login')}>
            <LogIn size={17} />
            Login
          </button>
          <button className={authMode === 'register' ? 'active' : ''} onClick={() => onAuthModeChange('register')}>
            <UserRound size={17} />
            Cadastro
          </button>
        </div>
        <form onSubmit={onSubmit}>
          {authMode === 'register' && (
            <label className="auth-field">
              Nome
              <span>
                <UserRound size={17} />
                <input value={authName} onChange={(event) => onNameChange(event.target.value)} required />
              </span>
            </label>
          )}
          <label className="auth-field">
            Email
            <span>
              <Mail size={17} />
              <input type="email" value={authEmail} onChange={(event) => onEmailChange(event.target.value)} required />
            </span>
          </label>
          <label className="auth-field">
            Senha
            <span>
              <LockKeyhole size={17} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={authPassword}
                onChange={(event) => onPasswordChange(event.target.value)}
                minLength={6}
                required
              />
              <button
                className="auth-password-toggle"
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <Eye size={16} />
              </button>
            </span>
          </label>
          <button className="button primary auth-submit-button" disabled={loading}>
            <LogIn size={18} />
            {authMode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
        {authMode === 'login' && (
          <button className="auth-forgot-button" type="button">
            <LockKeyhole size={13} />
            Esqueceu sua senha?
          </button>
        )}
        {status && <p className="status-line">{status}</p>}
      </section>
    </main>
  );
}
