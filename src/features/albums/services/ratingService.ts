import { apiRequest } from '../../../services/api/apiClient';
import type { Rating } from '../../../types';

type SaveRatingPayload = {
  albumId: string;
  rating: number;
  review?: string | null;
};

export function listRatingsByUser(userId: string, accessToken: string) {
  return apiRequest<Rating[]>(`/ratings/users/${userId}`, {}, accessToken);
}

export function listPublicRatingsByUser(userId: string) {
  return apiRequest<Rating[]>(`/ratings/users/${userId}/public`);
}

export function listRatingsByAlbum(albumId: string) {
  return apiRequest<Rating[]>(`/ratings/albums/${albumId}`);
}

export function saveRating(payload: SaveRatingPayload, accessToken: string) {
  return apiRequest('/ratings', { method: 'POST', body: JSON.stringify(payload) }, accessToken);
}
