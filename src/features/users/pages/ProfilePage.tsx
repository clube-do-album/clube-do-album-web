import { Edit3, RefreshCw, UserRound, UserRoundPlus } from 'lucide-react';
import { RatedAlbumList } from '../../albums/components/RatedAlbumList';
import type { AlbumDetails, Follow, Rating, Session, SubmitHandler, User } from '../../../types';

type ProfileScreenProps = {
  session: Session;
  myRatings: Rating[];
  albumDetails: Record<string, AlbumDetails>;
  following: Follow[];
  followers: Follow[];
  userCache: Record<string, User>;
  profileLookupId: string;
  userSearchResults: User[];
  loading: boolean;
  onEditProfile: () => void;
  onRefreshRatings: () => void;
  onRefreshSocial: () => void;
  onProfileLookupChange: (value: string) => void;
  onSearchUsers: SubmitHandler;
  onOpenRatedAlbum: (rating: Rating) => void;
  onOpenUserProfile: (user: User) => void;
};

export function ProfileScreen({
  session,
  myRatings,
  albumDetails,
  following,
  followers,
  userCache,
  profileLookupId,
  userSearchResults,
  loading,
  onEditProfile,
  onRefreshRatings,
  onRefreshSocial,
  onProfileLookupChange,
  onSearchUsers,
  onOpenRatedAlbum,
  onOpenUserProfile,
}: ProfileScreenProps) {
  return (
    <section className="profile-grid">
      <article className="profile-card glass-panel">
        <div className="profile-avatar">{session.user.name.slice(0, 1).toUpperCase()}</div>
        <h2>{session.user.name}</h2>
        <p>{session.user.email}</p>
        <div className="social-stats">
          <span>
            <strong>{following.length}</strong>
            seguindo
          </span>
          <span>
            <strong>{followers.length}</strong>
            seguidores
          </span>
        </div>
        <div className="profile-actions">
          <button className="button primary" onClick={onEditProfile}>
            <Edit3 size={18} />
            Editar perfil
          </button>
        </div>
      </article>

      <article className="content-card glass-panel">
        <div className="section-heading">
          <h2>Albuns rankeados</h2>
          <button className="button ghost" onClick={onRefreshRatings}>
            Atualizar
          </button>
        </div>
        <RatedAlbumList
          ratings={myRatings}
          albumDetails={albumDetails}
          emptyText="Voce ainda nao avaliou nenhum album."
          onOpenRatedAlbum={onOpenRatedAlbum}
        />
      </article>

      <article className="content-card glass-panel">
        <div className="section-heading">
          <h2>Encontrar pessoa</h2>
          <UserRoundPlus size={20} />
        </div>
        <form className="search-row" onSubmit={onSearchUsers}>
          <input
            placeholder="Buscar por nome"
            value={profileLookupId}
            onChange={(event) => onProfileLookupChange(event.target.value)}
          />
          <button className="button primary" disabled={loading}>Buscar</button>
        </form>
        <div className="user-result-list">
          {userSearchResults.map((user) => (
            <button className="user-result" key={user.id} onClick={() => onOpenUserProfile(user)}>
              <span>{user.name.slice(0, 1).toUpperCase()}</span>
              <strong>{user.name}</strong>
            </button>
          ))}
        </div>
      </article>

      <article className="content-card glass-panel">
        <div className="section-heading">
          <h2>Rede social</h2>
          <button className="button ghost" onClick={onRefreshSocial}>
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
        <div className="social-columns">
          <SocialList
            title="Seguindo"
            emptyText="Voce ainda nao segue ninguem."
            items={following}
            mode="following"
            userCache={userCache}
            onOpenUserProfile={onOpenUserProfile}
          />
          <SocialList
            title="Seguidores"
            emptyText="Ninguem segue voce ainda."
            items={followers}
            mode="followers"
            userCache={userCache}
            onOpenUserProfile={onOpenUserProfile}
          />
        </div>
      </article>
    </section>
  );
}

function SocialList({
  title,
  emptyText,
  items,
  mode,
  userCache,
  onOpenUserProfile,
}: {
  title: string;
  emptyText: string;
  items: Follow[];
  mode: 'following' | 'followers';
  userCache: Record<string, User>;
  onOpenUserProfile: (user: User) => void;
}) {
  return (
    <div className="social-list">
      <h3>{title}</h3>
      {items.length === 0 && <p className="muted-text">{emptyText}</p>}
      {items.map((item) => {
        const userId = mode === 'following' ? item.followedId : item.followerId;
        const user = userCache[userId];

        return (
          <button
            className="social-row"
            key={item.id}
            onClick={user ? () => onOpenUserProfile(user) : undefined}
            disabled={!user}
          >
            <UserRound size={16} />
            <span>
              <strong>{user?.name ?? userId}</strong>
            </span>
          </button>
        );
      })}
    </div>
  );
}
