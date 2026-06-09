import { apiRequest } from '../../../services/api/apiClient';
import type { Ranking } from '../../../types';

export function listRankings(limit = 24) {
  return apiRequest<Ranking[]>(`/rankings?limit=${limit}`);
}
