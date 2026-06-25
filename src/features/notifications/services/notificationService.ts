import { apiRequest } from '../../../services/api/apiClient';
import type { NotificationItem } from '../../../types';

export type UnreadNotificationCount = {
  unread: number;
};

export function listNotifications(accessToken: string, { limit = 12, unreadOnly = false } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
  });

  if (unreadOnly) {
    params.set('unread', 'true');
  }

  return apiRequest<NotificationItem[]>(`/notifications?${params.toString()}`, {}, accessToken);
}

export function getUnreadNotificationCount(accessToken: string) {
  return apiRequest<UnreadNotificationCount>('/notifications/unread-count', {}, accessToken);
}

export function markNotificationAsRead(notificationId: string, accessToken: string) {
  return apiRequest<{ updated: number }>(
    `/notifications/${notificationId}/read`,
    { method: 'PATCH' },
    accessToken,
  );
}

export function markAllNotificationsAsRead(accessToken: string) {
  return apiRequest<{ updated: number }>(
    '/notifications/read-all',
    { method: 'PATCH' },
    accessToken,
  );
}
