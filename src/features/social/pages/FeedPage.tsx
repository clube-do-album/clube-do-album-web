import { Disc3, RefreshCw, Star } from 'lucide-react';
import { AlbumCover } from '../../../components/common/AlbumCover';
import { getAlbumArtistName } from '../../albums/services/albumMappers';
import type { AlbumDetails, AlbumPage, FeedItem, User } from '../../../types';

type FeedScreenProps = {
  feed: FeedItem[];
  albumDetails: Record<string, AlbumDetails>;
  userCache: Record<string, User>;
  onRefresh: () => void;
  onOpenAlbum: (album: AlbumPage) => void;
  onOpenUserProfile: (user: User) => void;
};

export function FeedScreen({ feed, albumDetails, userCache, onRefresh, onOpenAlbum, onOpenUserProfile }: FeedScreenProps) {
  const safeFeed = (Array.isArray(feed) ? feed : []).filter((item) => getFeedType(item) !== 'USER_FOLLOWED');

  return (
    <section className="content-card glass-panel feed-screen">
      <div className="section-heading feed-heading">
        <div>
          <span className="eyebrow">Atividades recentes</span>
          <h2>Feed</h2>
        </div>
        <button className="button ghost" onClick={onRefresh}>
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      <div className="feed-list">
        {safeFeed.length > 0 ? (
          safeFeed.map((item) => {
            const actor = userCache[item.userId];
            const details = item.albumId ? albumDetails[item.albumId] : undefined;
            const albumTitle = details?.albumName ?? details?.name ?? item.albumName ?? 'Album avaliado';
            const artistName = details ? getAlbumArtistName(details) : item.artistName ?? 'Artista nao informado';

            return (
              <article className="feed-post rating-event" key={item.id}>
                <header className="feed-post-user">
                  <button className="feed-user-avatar" onClick={() => actor && onOpenUserProfile(actor)} disabled={!actor}>
                    {(actor?.name ?? 'U').slice(0, 1).toUpperCase()}
                  </button>
                  <p className="feed-post-title">
                    <button className="feed-text-button" onClick={() => actor && onOpenUserProfile(actor)} disabled={!actor}>
                      {actor?.name ?? shortId(item.userId)}
                    </button>{' '}
                    avaliou{' '}
                    <button className="feed-text-button" onClick={() => details && onOpenAlbum(toAlbumPage(details, item))} disabled={!details}>
                      {albumTitle}
                    </button>
                  </p>
                  <time>{formatFeedDate(item.occurredAt ?? item.createdAt)}</time>
                </header>

                <div className="feed-post-rating-layout">
                  <button
                    className="feed-cover-button"
                    onClick={() => details && onOpenAlbum(toAlbumPage(details, item))}
                    disabled={!details}
                    aria-label={`Abrir ${albumTitle}`}
                  >
                    <AlbumCover imageUrl={details?.imageUrl} title={albumTitle} className="feed-post-cover" />
                  </button>

                  <div className="feed-post-body">
                    <div className="feed-album-line">
                      <strong>{albumTitle}</strong>
                      <small>{artistName}</small>
                    </div>

                    <div className="feed-post-review">
                      <p>{item.review?.trim() || item.message || 'Sem review escrita.'}</p>
                    </div>

                    <footer className="feed-post-footer">
                      {typeof item.rating === 'number' && (
                        <span className="feed-rating">
                          <Star size={14} />
                          {item.rating.toFixed(1).replace('.0', '')}
                        </span>
                      )}
                    </footer>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="feed-empty-state">
            <Disc3 size={18} />
            <strong>Nenhuma atividade ainda.</strong>
            <p>Avaliacoes e reviews aparecem aqui quando a comunidade se movimenta.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function toAlbumPage(details: AlbumDetails, item: FeedItem): AlbumPage {
  return {
    albumId: details.id,
    spotifyId: details.spotifyId,
    title: details.albumName ?? details.name ?? item.albumName ?? 'Album',
    artist: getAlbumArtistName(details),
    imageUrl: details.imageUrl,
    releaseDate: details.releaseDate,
    totalTracks: details.totalTracks,
  };
}

function getFeedType(item: FeedItem) {
  return item.type ?? item.eventType;
}

function formatFeedDate(value?: string) {
  if (!value) {
    return 'agora';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function shortId(value?: string) {
  if (!value) {
    return 'usuario';
  }

  return value.length > 12 ? `${value.slice(0, 8)}...` : value;
}
