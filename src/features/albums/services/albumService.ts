import { apiRequest } from '../../../services/api/apiClient';
import type { AlbumDetails, PaginatedResponse, SearchAlbum } from '../../../types';

export function listAlbums({ page = 1, limit = 24, query = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (query.trim()) {
    params.set('query', query.trim());
  }

  return apiRequest<PaginatedResponse<AlbumDetails> | AlbumDetails[]>(`/albums?${params.toString()}`);
}

export function getAlbumById(albumId: string) {
  return apiRequest<AlbumDetails>(`/albums/${albumId}`);
}

export function getAlbumsByIds(albumIds: string[]) {
  const ids = Array.from(new Set(albumIds.filter(Boolean))).slice(0, 50);

  if (ids.length === 0) {
    return Promise.resolve([]);
  }

  return apiRequest<AlbumDetails[]>(`/albums?ids=${encodeURIComponent(ids.join(','))}`);
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
