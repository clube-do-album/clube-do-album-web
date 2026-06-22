import { CalendarDays, Disc3, Star } from 'lucide-react';
import { AlbumCover } from '../../../../components/common/AlbumCover';
import { formatRating, getAlbumArtistName } from '../../services/albumMappers';
import type { AlbumDetails, Rating } from '../../../../types';

type RatedAlbumListProps = {
  ratings: Rating[];
  albumDetails: Record<string, AlbumDetails>;
  emptyText: string;
  onOpenRatedAlbum: (rating: Rating) => void;
};

export function RatedAlbumList({ ratings, albumDetails, emptyText, onOpenRatedAlbum }: RatedAlbumListProps) {
  return (
    <div className="rating-list">
      {ratings.length === 0 && <p className="muted-text">{emptyText}</p>}
      {ratings.map((item) => {
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
