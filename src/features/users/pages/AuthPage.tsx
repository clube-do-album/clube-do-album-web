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
  return (
    <main className="auth-screen">
      <section className="auth-copy">
        <p className="eyebrow">Clube do Album</p>
        <h1>Seu diario de albuns, notas e descobertas.</h1>
        <div className="auth-stats">
          <span>Ranking vivo</span>
          <span>Feed social</span>
          <span>Catalogo Spotify</span>
        </div>
      </section>

      <section className="auth-card">
        <div className="auth-card-header">
          <p className="eyebrow">Bem-vindo</p>
          <h2>{authMode === 'login' ? 'Entrar no Clube do Album' : 'Criar sua conta'}</h2>
          <span>
            {authMode === 'login'
              ? 'Continue de onde parou e avalie seus proximos albuns.'
              : 'Monte seu perfil para salvar notas, reviews e seguir outros ouvintes.'}
          </span>
        </div>
        <div className="auth-tabs">
          <button className={authMode === 'login' ? 'active' : ''} onClick={() => onAuthModeChange('login')}>
            Login
          </button>
          <button className={authMode === 'register' ? 'active' : ''} onClick={() => onAuthModeChange('register')}>
            Cadastro
          </button>
        </div>
        <form onSubmit={onSubmit}>
          {authMode === 'register' && (
            <label>
              Nome
              <input value={authName} onChange={(event) => onNameChange(event.target.value)} required />
            </label>
          )}
          <label>
            Email
            <input type="email" value={authEmail} onChange={(event) => onEmailChange(event.target.value)} required />
          </label>
          <label>
            Senha
            <input
              type="password"
              value={authPassword}
              onChange={(event) => onPasswordChange(event.target.value)}
              minLength={6}
              required
            />
          </label>
          <button className="button primary" disabled={loading}>
            {authMode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
        {status && <p className="status-line">{status}</p>}
      </section>
    </main>
  );
}
