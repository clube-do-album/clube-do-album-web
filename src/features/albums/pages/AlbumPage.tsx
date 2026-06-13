import { ArrowLeft, CalendarDays, Disc3, ListMusic, MessageSquareText, Star } from 'lucide-react';
import type { CSSProperties } from 'react';
import { AlbumCover } from '../../../components/common/AlbumCover';
import { formatRating } from '../services/albumMappers';
import type { AlbumPage, Rating, SubmitHandler, User } from '../../../types';

type AlbumScreenProps = {
  album: AlbumPage;
  currentUserId: string;
  userCache: Record<string, User>;
  loading: boolean;
  reviews: Rating[];
  reviewText: string;
  ratingValue: number;
  onBack: () => void;
  onImport: () => void;
  onRate: SubmitHandler;
  onReviewChange: (value: string) => void;
  onRatingChange: (value: number) => void;
};

const ratingOptions = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export function AlbumScreen({
  album,
  currentUserId,
  userCache,
  loading,
  reviews,
  reviewText,
  ratingValue,
  onBack,
  onImport,
  onRate,
  onReviewChange,
  onRatingChange,
}: AlbumScreenProps) {
  const canRate = Boolean(album.albumId);
  const ratingLabel = ratingValue.toFixed(1).replace('.0', '');
  const visibleReviews = reviews.filter((review) => review.review?.trim());
  const albumStyle = album.imageUrl
    ? ({ '--album-backdrop': `url("${album.imageUrl}")` } as CSSProperties)
    : undefined;

  return (
    <section className="album-screen">
      <div className={`album-detail ${album.imageUrl ? 'has-backdrop' : ''}`} style={albumStyle}>
        <button className="album-back-icon" onClick={onBack} aria-label="Voltar">
          <ArrowLeft size={18} />
        </button>
        <div className="album-main-row">
          <AlbumCover className="album-cover-large" imageUrl={album.imageUrl} title={album.title} />
          <div className="album-info">
            <p className="eyebrow">{album.position ? `#${album.position} no ranking` : canRate ? 'Disponivel na plataforma' : 'Preparando album'}</p>
            <h2>{album.title}</h2>
            <p className="album-artist">{album.releaseDate ? `${album.releaseDate.slice(0, 4)} • ` : ''}{album.artist}</p>
            <div className="album-meta-line">
              <span>
                <CalendarDays size={15} />
                {album.releaseDate ?? 'Lancamento nao informado'}
              </span>
              <span>
                <ListMusic size={15} />
                {album.totalTracks ? `${album.totalTracks} faixas` : 'Faixas nao informadas'}
              </span>
            </div>
            <div className={`album-state ${canRate ? 'ready' : 'pending'}`}>
              <strong>{canRate ? 'Pronto para avaliar' : 'Preparando para avaliacao'}</strong>
              <span>
                {canRate
                  ? 'Este album ja esta disponivel no catalogo da plataforma.'
                  : 'Vamos preparar este album para liberar sua avaliacao e entrar no ranking.'}
              </span>
            </div>
            <div className="album-actions">
              {!canRate && (
                <button className="button secondary" onClick={onImport} disabled={loading || !album.spotifyId}>
                  Preparar avaliacao
                </button>
              )}
            </div>
          </div>
          <aside className="album-side-panel">
            <div className="metric-strip">
              <span>
                <Star size={16} />
                <strong>{formatRating(album.averageRating)}</strong>
                media
              </span>
              <span>
                <Disc3 size={16} />
                <strong>{album.totalRatings ?? 0}</strong>
                avaliacoes
              </span>
            </div>
            <form className="rating-form rating-panel" onSubmit={onRate}>
            <div className="rating-header">
              <div>
                <span className="eyebrow">Sua nota</span>
                <strong>{ratingLabel}</strong>
              </div>
              <Star size={24} />
            </div>
            <input
              aria-label="Sua nota"
              className="rating-slider"
              type="range"
              value={ratingValue}
              min="0.5"
              max="5"
              step="0.5"
              onChange={(event) => onRatingChange(Number(event.target.value))}
              disabled={!canRate || loading}
            />
            <div className="rating-options" aria-label="Opcoes de nota">
              {ratingOptions.map((option) => (
                <button
                  className={`rating-chip ${option === ratingValue ? 'active' : ''}`}
                  disabled={!canRate || loading}
                  key={option}
                  onClick={() => onRatingChange(option)}
                  type="button"
                >
                  {option.toFixed(1).replace('.0', '')}
                </button>
              ))}
            </div>
            <label>
              Review opcional
              <textarea
                value={reviewText}
                maxLength={1000}
                placeholder="Escreva o que esse album te fez sentir, lembrar ou pensar."
                onChange={(event) => onReviewChange(event.target.value)}
                disabled={!canRate || loading}
              />
            </label>
            <button className="button primary" disabled={loading || !canRate}>
              <Star size={18} />
              Salvar avaliacao
            </button>
          </form>
          </aside>
        </div>
          <div className="reviews-panel">
            <div className="reviews-title">
              <div>
                <span className="eyebrow">Comunidade</span>
                <strong>Reviews</strong>
              </div>
              <MessageSquareText size={22} />
            </div>
            {visibleReviews.length > 0 ? (
              <div className="review-list">
                {visibleReviews.map((review) => {
                  const author = userCache[review.userId];
                  const authorName = review.userId === currentUserId ? 'Sua review' : author?.name ?? `Usuario ${review.userId.slice(0, 8)}`;

                  return (
                    <article className="review-card" key={review.id}>
                      <div>
                        <strong>{authorName}</strong>
                        <span>{formatRating(review.rating ?? review.ratingValue)} estrelas</span>
                      </div>
                      <p>{review.review}</p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="muted-text">Nenhuma review escrita para este album ainda.</p>
            )}
          </div>
      </div>
    </section>
  );
}
