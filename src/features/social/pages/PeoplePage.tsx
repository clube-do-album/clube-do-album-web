import { Search, UserRoundCheck, UserRoundPlus } from 'lucide-react';
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
  return (
    <section className="content-card glass-panel people-screen">
      <div className="section-heading">
        <h2>Pessoas</h2>
        <Search size={20} />
      </div>

      <form className="search-row" onSubmit={onSearch}>
        <input
          placeholder="Buscar por nome"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <button className="button primary" disabled={loading}>
          Buscar
        </button>
      </form>

      <div className="people-grid">
        {results.map((user) => {
          const isOwnUser = user.id === sessionUser.id;
          const isFollowing = isFollowingUser(following, user.id);

          return (
            <article className="person-card" key={user.id}>
              <button className="person-main" onClick={() => onOpenUserProfile(user)}>
                <span>{user.name.slice(0, 1).toUpperCase()}</span>
                <strong>{user.name}</strong>
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
            </article>
          );
        })}
      </div>
    </section>
  );
}
