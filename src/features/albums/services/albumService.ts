import { apiRequest } from '../../../services/api/apiClient';
import type { AlbumDetails, SearchAlbum } from '../../../types';

export function listAlbums() {
  return apiRequest<AlbumDetails[]>('/albums');
}

export function getAlbumById(albumId: string) {
  return apiRequest<AlbumDetails>(`/albums/${albumId}`);
}

export function searchAlbumsByName(query: string) {
  return apiRequest<SearchAlbum[]>(`/albums/search?query=${encodeURIComponent(query)}`);
}

export function importAlbumFromSpotify(spotifyId: string, accessToken: string) {
  return apiRequest<AlbumDetails>(
    '/albums/import',
    { method: 'POST', body: JSON.stringify({ spotifyId }) },
    accessToken,
  );
}
