import { apiRequest } from '../../../services/api/apiClient';
import type { PaginatedResponse, Ranking } from '../../../types';

export function listRankings({ page = 1, limit = 24 } = {}) {
  return apiRequest<PaginatedResponse<Ranking> | Ranking[]>(`/rankings?page=${page}&limit=${limit}`);
}
