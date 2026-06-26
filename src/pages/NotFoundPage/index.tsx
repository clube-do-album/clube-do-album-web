import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="content-card narrow-card glass-panel">
      <p className="eyebrow">404</p>
      <h2>Página não encontrada</h2>
      <p className="muted-text">A rota acessada não existe no Clube do Álbum.</p>
      <button className="button primary" onClick={() => navigate('/')}>
        Voltar ao início
      </button>
    </section>
  );
}
