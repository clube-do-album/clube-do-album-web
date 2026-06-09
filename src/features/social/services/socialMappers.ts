import type { Follow } from '../../../types';

export function isFollowingUser(following: Follow[], userId?: string) {
  if (!userId) {
    return false;
  }

  return following.some((item) => item.followedId === userId);
}
