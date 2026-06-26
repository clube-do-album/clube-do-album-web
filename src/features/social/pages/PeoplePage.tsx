import { Search, UserRoundCheck, UserRoundPlus, UsersRound } from 'lucide-react';
import type { FormEvent } from 'react';
import type { Follow, User } from '../../../types';
import { isFollowingUser } from '../services/socialMappers';

type PeopleScreenProps = {
  sessionUser: User;
  query: string;
  results: User[];
  following: Follow[];
  loading: boolean;
  onQueryChange: (value: string) => void;
  onSearch: (event: FormEvent<HTMLFormElement>) => void;
  onOpenUserProfile: (user: User) => void;
  onFollowUser: (user: User) => void;
  onUnfollowUser: (user: User) => void;
};

export function PeopleScreen({
  sessionUser,
  query,
  results,
  following,
  loading,
  onQueryChange,
  onSearch,
  onOpenUserProfile,
  onFollowUser,
  onUnfollowUser,
}: PeopleScreenProps) {
  const hasQuery = query.trim().length > 0;

  return (
    <section className="people-screen">
      <header className="content-card glass-panel people-hero">
        <div>
          <span className="eyebrow">Social</span>
          <h2>Pessoas</h2>
          <p>Encontre perfis, veja avaliações e acompanhe quem tem gosto parecido com o seu.</p>
        </div>
        <span className="people-hero-count"><UsersRound size={16} /> {following.length} seguindo</span>
      </header>

      <article className="content-card glass-panel people-search-card">
        <form className="people-search-row" onSubmit={onSearch}>
          <Search size={18} />
          <input
            placeholder="Buscar perfil por nome"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <button className="button primary" disabled={loading}>
            Buscar
          </button>
        </form>
      </article>

      <article className="content-card glass-panel people-results-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Resultados</span>
            <h2>{results.length > 0 ? `${results.length} perfil(is)` : 'Perfis encontrados'}</h2>
          </div>
        </div>

        {!hasQuery && results.length === 0 && (
          <div className="people-empty-state">
            <UsersRound size={20} />
            <strong>Busque pessoas pelo nome.</strong>
            <p>Os perfis encontrados aparecem aqui com a opção de seguir ou abrir o perfil.</p>
          </div>
        )}

        {hasQuery && results.length === 0 && !loading && (
          <div className="people-empty-state">
            <Search size={20} />
            <strong>Nenhum perfil encontrado.</strong>
            <p>Tente buscar por outro nome ou parte do nome.</p>
          </div>
        )}

        <div className="people-grid">
          {results.map((user) => {
            const isOwnUser = user.id === sessionUser.id;
            const isFollowing = isFollowingUser(following, user.id);

            return (
              <article className="person-card" key={user.id}>
                <button className="person-main" onClick={() => onOpenUserProfile(user)}>
                  <span>{user.name.slice(0, 1).toUpperCase()}</span>
                  <strong>{user.name}</strong>
                  <small>{isOwnUser ? 'Você' : isFollowing ? 'Seguindo' : 'Perfil público'}</small>
                </button>

                <div className="person-actions">
                  <button className="button ghost" onClick={() => onOpenUserProfile(user)}>
                    Ver perfil
                  </button>
                  {!isOwnUser && (
                    <button
                      className={isFollowing ? 'button secondary' : 'button primary'}
                      onClick={() => isFollowing ? onUnfollowUser(user) : onFollowUser(user)}
                      disabled={loading}
                    >
                      {isFollowing ? <UserRoundCheck size={17} /> : <UserRoundPlus size={17} />}
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </article>
    </section>
  );
}
