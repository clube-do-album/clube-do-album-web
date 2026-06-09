import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <section className="content-card narrow-card glass-panel">
      <p className="eyebrow">404</p>
      <h2>Pagina nao encontrada</h2>
      <p className="muted-text">A rota acessada nao existe no Clube do Album.</p>
      <button className="button primary" onClick={() => navigate('/')}>
        Voltar ao inicio
      </button>
    </section>
  );
}
