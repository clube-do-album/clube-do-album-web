import { ArrowLeft, CalendarDays, Disc3, ListMusic, MessageSquareText, Sparkles, Star, UsersRound, X } from 'lucide-react';
import { useState, type CSSProperties, type FormEvent } from 'react';
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

function formatReviewDate(value?: string) {
  if (!value) {
    return 'agora';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'agora';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getReviewInitial(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || 'U';
}

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
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const canRate = Boolean(album.albumId);
  const previewRating = hoverRating ?? ratingValue;
  const ratingLabel = previewRating.toFixed(1).replace('.0', '');
  const visibleReviews = reviews.filter((review) => review.review?.trim());
  const ratingCount = album.totalRatings ?? reviews.length;
  const reviewCount = visibleReviews.length;
  const averageRating = formatRating(album.averageRating);
  const reviewDistribution = ratingOptions.map((option) => {
    const count = reviews.filter((review) => (review.rating ?? review.ratingValue) === option).length;
    const height = reviews.length > 0 ? Math.max(8, Math.round((count / reviews.length) * 42)) : 8;

    return { option, count, height };
  });
  const albumStyle = album.imageUrl
    ? ({ '--album-backdrop': `url("${album.imageUrl}")` } as CSSProperties)
    : undefined;

  function handleRatingSubmit(event: FormEvent<HTMLFormElement>) {
    onRate(event);
    setIsRatingModalOpen(false);
  }

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
                <strong>{averageRating}</strong>
                media
              </span>
              <span>
                <Disc3 size={16} />
                <strong>{ratingCount}</strong>
                avaliacoes
              </span>
            </div>
            <div className="rating-snapshot" aria-label="Distribuicao de notas">
              <div className="rating-bars">
                {reviewDistribution.map((item) => (
                  <span key={item.option} title={`${item.option} estrela(s): ${item.count}`}>
                    <i style={{ height: `${item.height}px` }} />
                  </span>
                ))}
              </div>
              <div className="rating-snapshot-footer">
                <span>{reviewCount} review(s)</span>
                <span>{reviews.length} nota(s) carregada(s)</span>
              </div>
            </div>
            <button className="button primary album-rate-trigger" onClick={() => setIsRatingModalOpen(true)} disabled={!canRate || loading}>
              <Star size={17} />
              Avaliar album
            </button>
          </aside>
        </div>
          <div className="reviews-panel">
            <div className="reviews-title">
              <div>
                <span className="eyebrow">Comunidade</span>
                <strong>Reviews</strong>
              </div>
              <div className="reviews-title-actions">
                <span><UsersRound size={14} /> {reviewCount}</span>
                <MessageSquareText size={20} />
              </div>
            </div>
            {visibleReviews.length > 0 ? (
              <div className="review-list">
                {visibleReviews.map((review) => {
                  const author = userCache[review.userId];
                  const authorName = review.userId === currentUserId ? 'Sua review' : author?.name ?? `Usuario ${review.userId.slice(0, 8)}`;
                  const reviewRating = formatRating(review.rating ?? review.ratingValue);

                  return (
                    <article className="review-card" key={review.id}>
                      <div className="review-card-header">
                        <span className="review-avatar" aria-hidden="true">{getReviewInitial(authorName)}</span>
                        <div>
                          <strong>{authorName}</strong>
                          <small>{formatReviewDate(review.updatedAt ?? review.createdAt)}</small>
                        </div>
                        <b><Star size={14} /> {reviewRating}</b>
                      </div>
                      <p>{review.review}</p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="album-empty-review">
                <Sparkles size={18} />
                <p>Nenhuma review escrita para este album ainda.</p>
                <span>Seja a primeira pessoa a registrar uma impressao mais completa.</span>
              </div>
            )}
          </div>
      </div>

      {isRatingModalOpen && (
        <div className="rating-modal-overlay" role="presentation" onMouseDown={() => setIsRatingModalOpen(false)}>
          <section
            className="rating-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rating-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="rating-modal-close" onClick={() => setIsRatingModalOpen(false)} aria-label="Fechar avaliacao">
              <X size={18} />
            </button>
            <form className="rating-form rating-panel rating-modal-form" onSubmit={handleRatingSubmit}>
              <div className="rating-modal-layout">
                <AlbumCover className="rating-modal-cover" imageUrl={album.imageUrl} title={album.title} />
                <div className="rating-modal-main">
                  <div className="rating-modal-album">
                    <span className="eyebrow">Avaliar album</span>
                    <h3 id="rating-modal-title">{album.title}</h3>
                    <p>{album.artist}</p>
                    {album.releaseDate && (
                      <small className="rating-modal-release">
                        <CalendarDays size={13} />
                        {album.releaseDate}
                      </small>
                    )}
                  </div>

                  <div className="rating-modal-divider" />

                  <div className="rating-header">
                    <div>
                      <span className="eyebrow">Sua avaliacao</span>
                      <strong>{ratingLabel}</strong>
                    </div>
                    <Star size={24} />
                  </div>
                  <div className="rating-stars-control" aria-label="Opcoes de nota" onMouseLeave={() => setHoverRating(null)}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const halfValue = star - 0.5;
                      const fullValue = star;
                      const isFull = previewRating >= fullValue;
                      const isHalf = previewRating === halfValue;

                      return (
                        <span className={`rating-star-unit ${isFull ? 'full' : ''} ${isHalf ? 'half' : ''}`} key={star}>
                          <button
                            className="rating-half-zone left"
                            disabled={!canRate || loading}
                            onMouseEnter={() => setHoverRating(halfValue)}
                            onFocus={() => setHoverRating(halfValue)}
                            onClick={() => onRatingChange(halfValue)}
                            type="button"
                            aria-label={`Nota ${halfValue.toFixed(1).replace('.0', '')}`}
                          />
                          <i className="rating-star-shape" aria-hidden="true" />
                          <button
                            className="rating-half-zone right"
                            disabled={!canRate || loading}
                            onMouseEnter={() => setHoverRating(fullValue)}
                            onFocus={() => setHoverRating(fullValue)}
                            onClick={() => onRatingChange(fullValue)}
                            type="button"
                            aria-label={`Nota ${fullValue.toFixed(1).replace('.0', '')}`}
                          />
                        </span>
                      );
                    })}
                  </div>
                  <small className="rating-helper">Clique em uma estrela para avaliar</small>
                </div>
              </div>
              <label className="rating-review-field">
                Sua review
                <textarea
                  value={reviewText}
                  maxLength={1000}
                  placeholder="Escreva o que esse album te fez sentir, lembrar ou pensar."
                  onChange={(event) => onReviewChange(event.target.value)}
                  disabled={!canRate || loading}
                />
              </label>
              <div className="rating-modal-footer">
                <span>Sua avaliacao ajuda outros fas a descobrir bons albuns.</span>
                <button className="button primary rating-save-button" disabled={loading || !canRate || ratingValue <= 0}>
                  Salvar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
