import { CalendarDays, Disc3, Star } from 'lucide-react';
import { useState } from 'react';
import { AlbumCover } from '../../../../components/common/AlbumCover';
import { formatRating, getAlbumArtistName } from '../../services/albumMappers';
import type { AlbumDetails, Rating } from '../../../../types';

type RatedAlbumListProps = {
  ratings: Rating[];
  albumDetails: Record<string, AlbumDetails>;
  emptyText: string;
  limit?: number;
  onOpenRatedAlbum: (rating: Rating) => void;
};

export function RatedAlbumList({ ratings, albumDetails, emptyText, limit, onOpenRatedAlbum }: RatedAlbumListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldLimit = typeof limit === 'number' && !isExpanded;
  const visibleRatings = shouldLimit ? ratings.slice(0, limit) : ratings;
  const hiddenCount = Math.max(0, ratings.length - visibleRatings.length);

  return (
    <div className="rating-list">
      {ratings.length === 0 && <p className="muted-text">{emptyText}</p>}
      {visibleRatings.map((item) => {
        const details = albumDetails[item.albumId];
        const title = details?.albumName ?? details?.name ?? 'Album carregando';
        const artist = details ? getAlbumArtistName(details) : 'Artista carregando';
        const date = formatRatingDate(item.updatedAt ?? item.createdAt);

        return (
          <button className="rating-item rating-album-card" key={item.id} onClick={() => onOpenRatedAlbum(item)}>
            <AlbumCover className="rating-album-cover" imageUrl={details?.imageUrl} title={title} />
            <span>
              <strong>{title}</strong>
              <small>{artist}</small>
              {item.review && <em>{item.review}</em>}
              {date && (
                <small className="rating-date">
                  <CalendarDays size={13} />
                  {date}
                </small>
              )}
            </span>
            <b>
              <Star size={16} />
              {formatRating(item.rating ?? item.ratingValue)}
            </b>
            <Disc3 size={18} />
          </button>
        );
      })}
      {hiddenCount > 0 && (
        <div className="rating-list-limit">
          <span>Exibindo {visibleRatings.length} de {ratings.length} albuns avaliados.</span>
          <button type="button" onClick={() => setIsExpanded(true)}>
            Ver mais
          </button>
        </div>
      )}
      {isExpanded && typeof limit === 'number' && ratings.length > limit && (
        <div className="rating-list-limit">
          <span>Exibindo todos os {ratings.length} albuns avaliados.</span>
          <button type="button" onClick={() => setIsExpanded(false)}>
            Ver menos
          </button>
        </div>
      )}
    </div>
  );
}

function formatRatingDate(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
