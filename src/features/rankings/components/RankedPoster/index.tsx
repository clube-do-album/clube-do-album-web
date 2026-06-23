import { rankingToAlbumPage, formatRating } from '../../../albums/services/albumMappers';
import type { PointerEvent } from 'react';
import type { AlbumDetails, Ranking } from '../../../../types';
import { AlbumCover } from '../../../../components/common/AlbumCover';

type RankedPosterProps = {
  item: Ranking;
  details?: AlbumDetails;
  onOpen: (event: PointerEvent<HTMLButtonElement>) => void;
};

export function RankedPoster({ item, details, onOpen }: RankedPosterProps) {
  const album = rankingToAlbumPage(item, details);

  return (
    <button className="ranked-poster" onPointerUp={onOpen}>
      <AlbumCover imageUrl={album.imageUrl} title={album.title} />
      <span>#{item.position}</span>
      <strong>{item.albumName}</strong>
      <small>{item.artistName}</small>
      <b>{formatRating(item.averageRating)}</b>
    </button>
  );
}
