import { ArrowLeft, UserRoundCheck, UserRoundPlus } from 'lucide-react';
import { RatedAlbumList } from '../../albums/components/RatedAlbumList';
import type { AlbumDetails, Rating, Session, User } from '../../../types';

type UserProfileScreenProps = {
  session: Session;
  user: User;
  isFollowing: boolean;
  ratings: Rating[];
  albumDetails: Record<string, AlbumDetails>;
  loading: boolean;
  onBack: () => void;
  onFollow: () => void;
  onUnfollow: () => void;
  onOpenRatedAlbum: (rating: Rating) => void;
};

export function UserProfileScreen({
  session,
  user,
  isFollowing,
  ratings,
  albumDetails,
  loading,
  onBack,
  onFollow,
  onUnfollow,
  onOpenRatedAlbum,
}: UserProfileScreenProps) {
  const isOwnProfile = user.id === session.user.id;

  return (
    <section className="user-profile-page">
      <button className="back-button profile-back-button" onClick={onBack}>
        <ArrowLeft size={18} />
        Meu perfil
      </button>

      <article className="public-profile-hero glass-panel">
        <div className="public-profile-avatar">{user.name.slice(0, 1).toUpperCase()}</div>
        <div className="public-profile-main">
          <span className="eyebrow">Perfil publico</span>
          <h2>{user.name}</h2>
          <div className="public-profile-meta">
            <span>{ratings.length} album(ns) avaliados</span>
            <span>{isOwnProfile ? 'Seu perfil' : isFollowing ? 'Voce segue este perfil' : 'Perfil disponivel para seguir'}</span>
          </div>
        </div>

        {!isOwnProfile && (
          <button
            className={isFollowing ? 'button secondary profile-follow-button' : 'button primary profile-follow-button'}
            onClick={isFollowing ? onUnfollow : onFollow}
            disabled={loading}
          >
            {isFollowing ? <UserRoundCheck size={18} /> : <UserRoundPlus size={18} />}
            {isFollowing ? 'Seguindo' : 'Seguir'}
          </button>
        )}
      </article>

      <article className="content-card glass-panel public-ratings-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Colecao</span>
            <h2>Albuns avaliados</h2>
          </div>
        </div>
        <RatedAlbumList
          ratings={ratings}
          albumDetails={albumDetails}
          emptyText="Este usuario ainda nao avaliou nenhum album."
          onOpenRatedAlbum={onOpenRatedAlbum}
        />
      </article>
    </section>
  );
}
