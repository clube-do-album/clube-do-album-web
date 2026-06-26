import { ArrowLeft, Disc3, MessageSquareText, Star, UserRound, UserRoundCheck, UserRoundPlus } from 'lucide-react';
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
  const reviewCount = ratings.filter((rating) => rating.review?.trim()).length;
  const averageRating = ratings.length > 0
    ? ratings.reduce((total, rating) => total + (rating.rating ?? rating.ratingValue ?? 0), 0) / ratings.length
    : 0;

  return (
    <section className="user-profile-page">
      <button className="back-button profile-back-button" onClick={onBack}>
        <ArrowLeft size={18} />
        Meu perfil
      </button>

      <article className="public-profile-hero glass-panel">
        <div className="public-profile-avatar"><UserRound size={34} /></div>
        <div className="public-profile-main">
          <span className="eyebrow">Perfil público</span>
          <h2>{user.name}</h2>
          <p>{isOwnProfile ? 'Este é o seu perfil público.' : isFollowing ? 'Você acompanha as avaliações deste perfil.' : 'Acompanhe este perfil para ver novas avaliações no feed.'}</p>
          <div className="public-profile-meta">
            <span><Disc3 size={14} /> <strong>{ratings.length}</strong> álbuns</span>
            <span><MessageSquareText size={14} /> <strong>{reviewCount}</strong> reviews</span>
            <span><Star size={14} /> <strong>{averageRating ? averageRating.toFixed(1) : '-'}</strong> média</span>
            <span>{isOwnProfile ? 'Seu perfil' : isFollowing ? 'Seguindo' : 'Não seguindo'}</span>
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
            <span className="eyebrow">Coleção</span>
            <h2>Reviews e notas</h2>
          </div>
        </div>
        <RatedAlbumList
          ratings={ratings}
          albumDetails={albumDetails}
          emptyText="Este usuário ainda não avaliou nenhum álbum."
          limit={8}
          onOpenRatedAlbum={onOpenRatedAlbum}
        />
      </article>
    </section>
  );
}
