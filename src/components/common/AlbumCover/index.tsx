import { Album as AlbumIcon } from 'lucide-react';

type AlbumCoverProps = {
  imageUrl?: string;
  title: string;
  className?: string;
};

export function AlbumCover({ imageUrl, title, className = '' }: AlbumCoverProps) {
  return (
    <div className={`album-cover ${className}`}>
      {imageUrl ? <img src={imageUrl} alt={`Capa de ${title}`} referrerPolicy="no-referrer" /> : <AlbumIcon size={48} />}
    </div>
  );
}
