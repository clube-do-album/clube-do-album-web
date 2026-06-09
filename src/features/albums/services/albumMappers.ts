import type { AlbumDetails, AlbumPage, Ranking, SearchAlbum } from '../../../types';

export function searchAlbumToPage(album: SearchAlbum): AlbumPage {
  return {
    albumId: album.id,
    spotifyId: album.spotifyId ?? album.id,
    title: album.albumName ?? album.name ?? 'Album sem nome',
    artist: album.artistName ?? 'Artista desconhecido',
    imageUrl: album.imageUrl,
    releaseDate: album.releaseDate,
    totalTracks: album.totalTracks,
  };
}

export function rankingToAlbumPage(item: Ranking, details?: AlbumDetails): AlbumPage {
  return {
    albumId: item.albumId,
    spotifyId: item.spotifyId ?? details?.spotifyId,
    title: item.albumName,
    artist: item.artistName,
    imageUrl: details?.imageUrl,
    releaseDate: details?.releaseDate,
    totalTracks: details?.totalTracks,
    position: item.position,
    averageRating: item.averageRating,
    totalRatings: item.totalRatings,
  };
}

export function mergeAlbumDetails(album: AlbumPage, details: AlbumDetails): AlbumPage {
  return {
    ...album,
    albumId: details.id,
    spotifyId: details.spotifyId ?? album.spotifyId,
    title: details.albumName ?? details.name ?? album.title,
    artist: details.artistName ?? album.artist,
    imageUrl: details.imageUrl ?? album.imageUrl,
    releaseDate: details.releaseDate ?? album.releaseDate,
    totalTracks: details.totalTracks ?? album.totalTracks,
  };
}

export function formatRating(value?: number) {
  return Number(value ?? 0).toFixed(2);
}
