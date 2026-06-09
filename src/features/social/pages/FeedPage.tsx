import { Star, UserRoundPlus } from 'lucide-react';
import type { FeedItem } from '../../../types';

type FeedScreenProps = {
  feed: FeedItem[];
  onRefresh: () => void;
};

export function FeedScreen({ feed, onRefresh }: FeedScreenProps) {
  return (
    <section className="content-card glass-panel">
      <div className="section-heading">
        <h2>Feed</h2>
        <button className="button ghost" onClick={onRefresh}>
          Atualizar
        </button>
      </div>
      <div className="feed-list">
        {feed.map((item) => (
          <article className={`feed-item ${getFeedItemClassName(item)}`} key={item.id}>
            <span className="feed-icon">{getFeedIcon(item)}</span>
            <div>
              <strong>{getFeedTitle(item)}</strong>
              <p>{getFeedDescription(item)}</p>
              <small>{formatFeedDate(item.occurredAt ?? item.createdAt)}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function getFeedType(item: FeedItem) {
  return item.type ?? item.eventType;
}

function getFeedItemClassName(item: FeedItem) {
  return getFeedType(item) === 'USER_FOLLOWED' ? 'social-event' : 'rating-event';
}

function getFeedIcon(item: FeedItem) {
  return getFeedType(item) === 'USER_FOLLOWED' ? <UserRoundPlus size={18} /> : <Star size={18} />;
}

function getFeedTitle(item: FeedItem) {
  if (getFeedType(item) === 'USER_FOLLOWED') {
    return 'Novo vinculo social';
  }

  return item.albumName ?? 'Album avaliado';
}

function getFeedDescription(item: FeedItem) {
  if (item.message) {
    return item.message;
  }

  if (getFeedType(item) === 'USER_FOLLOWED') {
    return `${shortId(item.userId)} comecou a seguir ${shortId(item.targetUserId)}.`;
  }

  const album = item.albumName ?? shortId(item.albumId);
  const artist = item.artistName ? ` de ${item.artistName}` : '';
  const rating = typeof item.rating === 'number' ? ` com nota ${item.rating}` : '';

  return `${shortId(item.userId)} avaliou ${album}${artist}${rating}.`;
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
