import { RefreshCw, Star, Trophy, UsersRound } from 'lucide-react';
import { AlbumCover } from '../../../components/common/AlbumCover';
import { rankingToAlbumPage, formatRating } from '../../albums/services/albumMappers';
import type { AlbumDetails, AlbumPage, Ranking } from '../../../types';

type RankingScreenProps = {
  ranking: Ranking[];
  albumDetails: Record<string, AlbumDetails>;
  onRefresh: () => void;
  onOpenAlbum: (album: AlbumPage) => void;
};

export function RankingScreen({ ranking, albumDetails, onRefresh, onOpenAlbum }: RankingScreenProps) {
  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <section className="ranking-screen">
      <header className="content-card glass-panel ranking-hero">
        <div>
          <span className="eyebrow">Comunidade</span>
          <h2>Ranking geral</h2>
          <p>Álbuns mais bem avaliados pela comunidade do Clube do Álbum.</p>
        </div>
        <div className="ranking-hero-actions">
          <span><Trophy size={16} /> {ranking.length} álbuns</span>
          <button className="button ghost" onClick={onRefresh}>
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
      </header>

      {podium.length > 0 && (
        <div className="ranking-podium">
          {podium.map((item) => {
            const details = albumDetails[item.albumId];
            const album = rankingToAlbumPage(item, details);

            return (
              <button className={`podium-card position-${item.position}`} key={item.albumId} onClick={() => onOpenAlbum(album)}>
                <AlbumCover className="podium-cover" imageUrl={album.imageUrl} title={album.title} />
                <span>#{item.position}</span>
                <strong>{item.albumName}</strong>
                <small>{item.artistName}</small>
                <b><Star size={15} /> {formatRating(item.averageRating)}</b>
              </button>
            );
          })}
        </div>
      )}

      <article className="content-card glass-panel ranking-list-panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Tabela</span>
            <h2>Lista completa</h2>
          </div>
        </div>
        {ranking.length === 0 ? (
          <div className="feed-empty-state">
            <Trophy size={20} />
            <strong>Nenhum álbum ranqueado ainda.</strong>
            <p>O ranking aparece quando a comunidade começar a avaliar álbuns.</p>
          </div>
        ) : (
          <div className="ranking-table">
            {(rest.length > 0 ? rest : ranking).map((item) => (
              <button
                className="ranking-item"
                key={item.albumId}
                onClick={() => onOpenAlbum(rankingToAlbumPage(item, albumDetails[item.albumId]))}
              >
                <strong>#{item.position}</strong>
                <span>{item.albumName}</span>
                <small>{item.artistName}</small>
                <b><Star size={14} /> {formatRating(item.averageRating)}</b>
                <em><UsersRound size={13} /> {item.totalRatings}</em>
              </button>
            ))}
          </div>
        )}
        {ranking.length > 0 && (
          <p className="ranking-rule-note">
            Para entrar no ranking, o álbum precisa ter pelo menos 3 avaliações.
          </p>
        )}
      </article>
    </section>
  );
}
