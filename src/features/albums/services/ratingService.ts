import { apiRequest } from '../../../services/api/apiClient';
import type { PaginatedResponse, Rating, UserRatingSummary } from '../../../types';

type SaveRatingPayload = {
  albumId: string;
  rating: number;
  review?: string | null;
};

export function listRatingsByUser(userId: string, accessToken: string, { page = 1, limit = 15 } = {}) {
  return apiRequest<PaginatedResponse<Rating> | Rating[]>(`/ratings/users/${userId}?page=${page}&limit=${limit}`, {}, accessToken);
}

export function getRatingSummaryByUser(userId: string, accessToken: string) {
  return apiRequest<UserRatingSummary>(`/ratings/users/${userId}/summary`, {}, accessToken);
}

export function listPublicRatingsByUser(userId: string, { page = 1, limit = 15 } = {}) {
  return apiRequest<PaginatedResponse<Rating> | Rating[]>(`/ratings/users/${userId}/public?page=${page}&limit=${limit}`);
}

export function listRatingsByAlbum(albumId: string, { page = 1, limit = 20 } = {}) {
  return apiRequest<PaginatedResponse<Rating> | Rating[]>(`/ratings/albums/${albumId}?page=${page}&limit=${limit}`);
}

export function saveRating(payload: SaveRatingPayload, accessToken: string) {
  return apiRequest('/ratings', { method: 'POST', body: JSON.stringify(payload) }, accessToken);
}
