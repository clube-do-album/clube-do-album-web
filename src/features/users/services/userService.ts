import { apiRequest } from '../../../services/api/apiClient';
import type { Session, User } from '../../../types';

type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export function createUser(payload: CreateUserPayload) {
  return apiRequest<User>('/users', { method: 'POST', body: JSON.stringify(payload) });
}

export function login(payload: LoginPayload) {
  return apiRequest<Session & { tokenType: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function searchUsersByQuery(query: string, accessToken: string) {
  return apiRequest<User[]>(`/users?query=${encodeURIComponent(query)}`, {}, accessToken);
}

export function getUserById(userId: string, accessToken: string) {
  return apiRequest<User>(`/users/${userId}`, {}, accessToken);
}
