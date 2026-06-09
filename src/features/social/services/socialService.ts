import { apiRequest } from '../../../services/api/apiClient';
import type { FeedItem, Follow } from '../../../types';

export function listFeed(limit = 24) {
  return apiRequest<FeedItem[]>(`/feed?limit=${limit}`);
}

export function listFollowing(accessToken: string) {
  return apiRequest<Follow[]>('/follows/following', {}, accessToken);
}

export function listFollowers(accessToken: string) {
  return apiRequest<Follow[]>('/follows/followers', {}, accessToken);
}

export function followUserById(userId: string, accessToken: string) {
  return apiRequest(`/follows/${userId}`, { method: 'POST' }, accessToken);
}

export function unfollowUserById(userId: string, accessToken: string) {
  return apiRequest(`/follows/${userId}`, { method: 'DELETE' }, accessToken);
}
