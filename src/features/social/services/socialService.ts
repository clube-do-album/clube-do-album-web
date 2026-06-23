import { apiRequest } from '../../../services/api/apiClient';
import type { FeedItem, Follow, PaginatedResponse } from '../../../types';

export function listFeed({ page = 1, limit = 24, type = 'ALBUM_RATED' } = {}) {
  return apiRequest<PaginatedResponse<FeedItem> | FeedItem[]>(`/feed?page=${page}&limit=${limit}&type=${type}`);
}

export function listFollowing(accessToken: string, { page = 1, limit = 24 } = {}) {
  return apiRequest<PaginatedResponse<Follow> | Follow[]>(`/follows/following?page=${page}&limit=${limit}`, {}, accessToken);
}

export function listFollowers(accessToken: string, { page = 1, limit = 24 } = {}) {
  return apiRequest<PaginatedResponse<Follow> | Follow[]>(`/follows/followers?page=${page}&limit=${limit}`, {}, accessToken);
}

export function followUserById(userId: string, accessToken: string) {
  return apiRequest(`/follows/${userId}`, { method: 'POST' }, accessToken);
}

export function unfollowUserById(userId: string, accessToken: string) {
  return apiRequest(`/follows/${userId}`, { method: 'DELETE' }, accessToken);
}
