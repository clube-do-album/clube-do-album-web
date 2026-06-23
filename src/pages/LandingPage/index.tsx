import { useNavigate } from 'react-router-dom';
import type { AuthMode } from '../../types';

type LandingPageProps = {
  onAuthModeChange: (mode: AuthMode) => void;
};

export function LandingPage({ onAuthModeChange }: LandingPageProps) {
  const navigate = useNavigate();

  function openAuth(mode: AuthMode) {
    onAuthModeChange(mode);
    navigate('/login');
  }

  return (
    <main className="landing-screen">
      <header className="landing-header">
        <button className="landing-brand" onClick={() => openAuth('login')}>
          Clube do Álbum
        </button>
        <nav className="landing-nav" aria-label="Apresentacao">
          <button onClick={() => openAuth('login')}>Entrar</button>
          <button onClick={() => openAuth('register')}>Criar conta</button>
          <button onClick={() => openAuth('login')}>Albuns</button>
          <button onClick={() => openAuth('login')}>Ranking</button>
          <button onClick={() => openAuth('login')}>Feed</button>
        </nav>
      </header>

      <section className="landing-hero">
        <p className="eyebrow">Ranking social de musica</p>
        <h1>
          Registre os albuns que voce ouviu.
          <br />
          Guarde os favoritos.
          <br />
          Descubra o que seus amigos amam.
        </h1>
        <div className="landing-actions">
          <button className="button primary" onClick={() => openAuth('register')}>
            Criar minha conta
          </button>
          <button className="button ghost" onClick={() => openAuth('login')}>
            Ja tenho conta
          </button>
        </div>
      </section>

      <aside className="landing-caption">
        Clube do Álbum
        <span>diario, ranking e comunidade</span>
      </aside>
    </main>
  );
}
