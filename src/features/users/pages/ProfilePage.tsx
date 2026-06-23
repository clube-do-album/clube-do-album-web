import { Disc3, Edit3, MessageSquareText, RefreshCw, Star, UserRound, UserRoundPlus } from 'lucide-react';
import { RatedAlbumList } from '../../albums/components/RatedAlbumList';
import type { AlbumDetails, Follow, Rating, Session, SubmitHandler, User, UserRatingSummary } from '../../../types';

type ProfileScreenProps = {
  session: Session;
  myRatings: Rating[];
  ratingSummary: UserRatingSummary;
  albumDetails: Record<string, AlbumDetails>;
  following: Follow[];
  followers: Follow[];
  followingTotal: number;
  followersTotal: number;
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
  ratingSummary,
  albumDetails,
  following,
  followers,
  followingTotal,
  followersTotal,
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
      <div className="profile-sidebar-column">
        <article className="profile-card glass-panel">
          <span className="eyebrow">Meu perfil</span>
          <div className="profile-avatar"><UserRound size={34} /></div>
          <h2>{session.user.name}</h2>
          <p>{session.user.email}</p>
          <div className="social-stats">
            <span><strong>{ratingSummary.totalRatings}</strong> albuns</span>
            <span><strong>{ratingSummary.reviewCount}</strong> reviews</span>
            <span><strong>{ratingSummary.averageRating ? ratingSummary.averageRating.toFixed(1) : '-'}</strong> media</span>
            <span><strong>{followersTotal}</strong> seguidores</span>
          </div>
          <div className="profile-actions">
            <button className="button primary" onClick={onEditProfile}>
              <Edit3 size={18} />
              Editar perfil
            </button>
          </div>
        </article>

        <article className="content-card glass-panel profile-discovery-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Comunidade</span>
              <h2>Encontrar pessoa</h2>
            </div>
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
      </div>

      <article className="content-card glass-panel profile-ratings-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Historico</span>
            <h2>Reviews e notas</h2>
          </div>
          <button className="button ghost" onClick={onRefreshRatings}>
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
        <RatedAlbumList
          ratings={myRatings}
          albumDetails={albumDetails}
          emptyText="Voce ainda nao avaliou nenhum album."
          onOpenRatedAlbum={onOpenRatedAlbum}
        />
        {ratingSummary.totalRatings > myRatings.length && (
          <div className="rating-list-limit">
            <span>Exibindo {myRatings.length} de {ratingSummary.totalRatings} albuns avaliados.</span>
          </div>
        )}
      </article>

      <article className="content-card glass-panel profile-network-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Conexoes</span>
            <h2>Rede social</h2>
          </div>
          <button className="button ghost" onClick={onRefreshSocial}>
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
        <div className="social-columns">
          <div className="profile-summary-strip">
            <span><Disc3 size={14} /> {followingTotal} seguindo</span>
            <span><Star size={14} /> {followersTotal} seguidores</span>
            <span><MessageSquareText size={14} /> {ratingSummary.reviewCount} reviews</span>
          </div>
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
