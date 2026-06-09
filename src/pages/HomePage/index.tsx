import { ChevronLeft, ChevronRight, Flame, Search, SlidersHorizontal } from 'lucide-react';
import type { CSSProperties, PointerEvent } from 'react';
import { useMemo, useRef, useState } from 'react';
import { AlbumPoster } from '../../features/albums/components/AlbumPoster';
import { RankedPoster } from '../../features/rankings/components/RankedPoster';
import { mergeAlbumDetails, rankingToAlbumPage, searchAlbumToPage, formatRating } from '../../features/albums/services/albumMappers';
import type { AlbumDetails, AlbumPage, Ranking, SearchAlbum, SubmitHandler } from '../../types';

type HomeScreenProps = {
  heroAlbum: AlbumPage | null;
  query: string;
  loading: boolean;
  searchResults: SearchAlbum[];
  topAlbums: Ranking[];
  catalogAlbums: AlbumDetails[];
  albumDetails: Record<string, AlbumDetails>;
  onQueryChange: (value: string) => void;
  onSearch: SubmitHandler;
  onOpenAlbum: (album: AlbumPage) => void;
  onImportAlbum: (album: SearchAlbum) => void;
};

export function HomeScreen({
  heroAlbum,
  query,
  loading,
  searchResults,
  topAlbums,
  catalogAlbums,
  albumDetails,
  onQueryChange,
  onSearch,
  onOpenAlbum,
  onImportAlbum,
}: HomeScreenProps) {
  const [albumPage, setAlbumPage] = useState(1);
  const [catalogFilter, setCatalogFilter] = useState('');
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const isCarouselDragging = useRef(false);
  const hasCarouselMoved = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);
  const albumsPerPage = 12;
  const filteredCatalogAlbums = useMemo(() => {
    const filter = catalogFilter.trim().toLowerCase();

    if (!filter) {
      return catalogAlbums;
    }

    return catalogAlbums.filter((album) => {
      const albumName = `${album.albumName ?? ''} ${album.name ?? ''}`.toLowerCase();
      const artistName = `${album.artistName ?? ''} ${album.artists?.map((artist) => artist.name).join(' ') ?? ''}`.toLowerCase();

      return albumName.includes(filter) || artistName.includes(filter);
    });
  }, [catalogAlbums, catalogFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredCatalogAlbums.length / albumsPerPage));
  const paginatedAlbums = useMemo(
    () => filteredCatalogAlbums.slice((albumPage - 1) * albumsPerPage, albumPage * albumsPerPage),
    [albumPage, filteredCatalogAlbums],
  );
  const heroStyle = heroAlbum?.imageUrl
    ? ({ '--hero-image': `url("${heroAlbum.imageUrl}")` } as CSSProperties)
    : undefined;

  function openCatalogAlbum(album: AlbumDetails) {
    const artistName = album.artistName ?? album.artists?.map((artist) => artist.name).join(', ') ?? 'Artista nao informado';

    onOpenAlbum(mergeAlbumDetails({
      albumId: album.id,
      spotifyId: album.spotifyId,
      title: album.albumName ?? album.name ?? 'Album',
      artist: artistName,
    }, {
      ...album,
      artistName,
    }));
  }

  function startCarouselDrag(event: PointerEvent<HTMLDivElement>) {
    const carousel = carouselRef.current;

    if (!carousel || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }

    isCarouselDragging.current = true;
    hasCarouselMoved.current = false;
    dragStartX.current = event.clientX;
    dragStartScrollLeft.current = carousel.scrollLeft;
    carousel.setPointerCapture(event.pointerId);
  }

  function moveCarouselDrag(event: PointerEvent<HTMLDivElement>) {
    const carousel = carouselRef.current;

    if (!carousel || !isCarouselDragging.current) {
      return;
    }

    const delta = event.clientX - dragStartX.current;

    if (Math.abs(delta) > 4) {
      hasCarouselMoved.current = true;
      carousel.classList.add('dragging');
      event.preventDefault();
    }

    carousel.scrollLeft = dragStartScrollLeft.current - delta;
  }

  function stopCarouselDrag(event: PointerEvent<HTMLDivElement>) {
    const carousel = carouselRef.current;

    if (carousel?.hasPointerCapture(event.pointerId)) {
      carousel.releasePointerCapture(event.pointerId);
    }

    isCarouselDragging.current = false;
    carousel?.classList.remove('dragging');

    window.setTimeout(() => {
      hasCarouselMoved.current = false;
    }, 0);
  }

  function openRankedAlbum(item: Ranking) {
    if (hasCarouselMoved.current) {
      return;
    }

    onOpenAlbum(rankingToAlbumPage(item, albumDetails[item.albumId]));
  }

  return (
    <section className="screen-grid">
      <article className="search-panel glass-panel">
        <div className="section-heading search-heading">
          <div>
            <span className="eyebrow">Spotify</span>
            <h2>Descobrir albuns</h2>
          </div>
          <Search size={20} />
        </div>
        <form className="search-row" onSubmit={onSearch}>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Busque por album ou artista"
          />
          <button className="button primary" disabled={loading}>
            Buscar
          </button>
        </form>
        <div className="poster-grid compact search-results-grid">
          {searchResults.slice(0, 8).map((album) => (
            <AlbumPoster
              key={album.spotifyId ?? album.id ?? album.name}
              title={album.albumName ?? album.name ?? 'Album'}
              artist={album.artistName ?? 'Artista'}
              imageUrl={album.imageUrl}
              meta={album.releaseDate ?? `${album.totalTracks ?? 0} faixas`}
              actionLabel="Importar"
              onOpen={() => onOpenAlbum(searchAlbumToPage(album))}
              onAction={() => onImportAlbum(album)}
            />
          ))}
        </div>
      </article>

      <article className="wide-panel glass-panel">
        <div className="section-heading">
          <h2>Principais albuns</h2>
          <Flame size={20} />
        </div>
        <div
          className="album-carousel"
          aria-label="Principais albuns rankeados"
          ref={carouselRef}
          onPointerCancel={stopCarouselDrag}
          onPointerDown={startCarouselDrag}
          onPointerMove={moveCarouselDrag}
          onPointerUp={stopCarouselDrag}
        >
          {topAlbums.map((item) => (
            <RankedPoster
              key={item.albumId}
              item={item}
              details={albumDetails[item.albumId]}
              onOpen={() => openRankedAlbum(item)}
            />
          ))}
        </div>
      </article>

      <article className={`hero-panel ${heroAlbum?.imageUrl ? 'has-cover' : ''}`} style={heroStyle}>
        <div>
          <p className="eyebrow">Em alta na plataforma</p>
          <h2>{heroAlbum?.title ?? 'Busque e importe seu primeiro album.'}</h2>
          <p>{heroAlbum?.artist ?? 'Depois de avaliar, o ranking e o feed começam a ganhar vida.'}</p>
          {heroAlbum && (
            <button className="button primary" onClick={() => onOpenAlbum(heroAlbum)}>
              Ver album
            </button>
          )}
        </div>
        <div className="score-orbit">
          <strong>{heroAlbum ? formatRating(heroAlbum.averageRating) : '0.00'}</strong>
          <span>media</span>
        </div>
      </article>

      <article className="wide-panel glass-panel">
        <div className="section-heading catalog-heading">
          <div>
            <h2>Todos os albuns</h2>
            <span className="muted-text">{filteredCatalogAlbums.length} album(ns)</span>
          </div>
          <label className="catalog-filter">
            <SlidersHorizontal size={16} />
            <input
              value={catalogFilter}
              onChange={(event) => {
                setCatalogFilter(event.target.value);
                setAlbumPage(1);
              }}
              placeholder="Filtrar por album ou artista"
            />
          </label>
        </div>
        <div className="poster-grid catalog-grid">
          {paginatedAlbums.map((album) => (
            <AlbumPoster
              key={album.id}
              title={album.albumName ?? album.name ?? 'Album'}
              artist={album.artistName ?? album.artists?.map((artist) => artist.name).join(', ') ?? 'Album importado'}
              imageUrl={album.imageUrl}
              meta={album.releaseDate ?? `${album.totalTracks ?? 0} faixas`}
              actionLabel="Ver album"
              onOpen={() => openCatalogAlbum(album)}
              onAction={() => openCatalogAlbum(album)}
            />
          ))}
        </div>
        {paginatedAlbums.length === 0 && (
          <p className="muted-text">Nenhum album encontrado para esse filtro.</p>
        )}
        <div className="pagination-bar">
          <button className="button ghost" onClick={() => setAlbumPage((page) => Math.max(1, page - 1))} disabled={albumPage === 1}>
            <ChevronLeft size={16} />
            Anterior
          </button>
          <span>
            Pagina {albumPage} de {totalPages}
          </span>
          <button
            className="button ghost"
            onClick={() => setAlbumPage((page) => Math.min(totalPages, page + 1))}
            disabled={albumPage === totalPages}
          >
            Proxima
            <ChevronRight size={16} />
          </button>
        </div>
      </article>
    </section>
  );
}
