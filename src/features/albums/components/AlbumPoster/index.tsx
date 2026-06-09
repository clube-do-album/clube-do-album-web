import { AlbumCover } from '../../../../components/common/AlbumCover';

type AlbumPosterProps = {
  title: string;
  artist: string;
  imageUrl?: string;
  meta: string;
  actionLabel: string;
  onOpen: () => void;
  onAction: () => void;
};

export function AlbumPoster({ title, artist, imageUrl, meta, actionLabel, onOpen, onAction }: AlbumPosterProps) {
  return (
    <article className="poster-card">
      <button className="poster-art" onClick={onOpen}>
        <AlbumCover imageUrl={imageUrl} title={title} />
      </button>
      <h3>{title}</h3>
      <p>{artist}</p>
      <small>{meta}</small>
      <button className="button ghost" onClick={onAction}>
        {actionLabel}
      </button>
    </article>
  );
}
