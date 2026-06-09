import { rankingToAlbumPage, formatRating } from '../../albums/services/albumMappers';
import type { AlbumDetails, AlbumPage, Ranking } from '../../../types';

type RankingScreenProps = {
  ranking: Ranking[];
  albumDetails: Record<string, AlbumDetails>;
  onRefresh: () => void;
  onOpenAlbum: (album: AlbumPage) => void;
};

export function RankingScreen({ ranking, albumDetails, onRefresh, onOpenAlbum }: RankingScreenProps) {
  return (
    <section className="content-card glass-panel">
      <div className="section-heading">
        <h2>Ranking geral</h2>
        <button className="button ghost" onClick={onRefresh}>
          Atualizar
        </button>
      </div>
      <div className="ranking-table">
        {ranking.map((item) => (
          <button
            className="ranking-item"
            key={item.albumId}
            onClick={() => onOpenAlbum(rankingToAlbumPage(item, albumDetails[item.albumId]))}
          >
            <strong>#{item.position}</strong>
            <span>{item.albumName}</span>
            <small>{item.artistName}</small>
            <b>{formatRating(item.averageRating)}</b>
          </button>
        ))}
      </div>
    </section>
  );
}
