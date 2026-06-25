import type { FormEvent, ReactNode } from 'react';

export type AuthMode = 'login' | 'register';

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Session = {
  accessToken: string;
  user: User;
};

export type SearchAlbum = {
  id?: string;
  spotifyId?: string;
  name?: string;
  albumName?: string;
  artistName?: string;
  releaseDate?: string;
  imageUrl?: string;
  totalTracks?: number;
};

export type AlbumDetails = {
  id: string;
  spotifyId?: string;
  name?: string;
  albumName?: string;
  artistName?: string;
  imageUrl?: string;
  releaseDate?: string;
  totalTracks?: number;
  status?: string;
  artists?: Array<{
    id?: string;
    spotifyId?: string;
    name: string;
  }>;
  tracks?: AlbumTrack[];
};

export type AlbumTrack = {
  id?: string;
  spotifyId?: string;
  name: string;
  discNumber?: number;
  trackNumber?: number;
  durationMs?: number;
  explicit?: boolean;
};

export type Ranking = {
  albumId: string;
  spotifyId?: string;
  albumName: string;
  artistName: string;
  averageRating: number;
  totalRatings: number;
  score: number;
  position: number;
};

export type Rating = {
  id: string;
  albumId: string;
  userId: string;
  rating: number;
  ratingValue?: number;
  review?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserRatingSummary = {
  totalRatings: number;
  reviewCount: number;
  averageRating: number;
};

export type FeedItem = {
  id: string;
  type?: 'ALBUM_RATED' | 'USER_FOLLOWED';
  albumId?: string;
  userId: string;
  targetUserId?: string;
  albumName?: string;
  artistName?: string;
  rating?: number;
  review?: string;
  message?: string;
  eventType?: string;
  occurredAt?: string;
  createdAt?: string;
};

export type Follow = {
  id: string;
  followerId: string;
  followedId: string;
  createdAt: string;
};

export type NotificationType = 'ALBUM_RATED' | 'USER_FOLLOWED' | 'RANKING_UPDATED';

export type NotificationItem = {
  id: string;
  type: NotificationType;
  recipientUserId: string;
  actorUserId?: string | null;
  albumId?: string | null;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
  occurredAt: string;
  readAt?: string | null;
  createdAt: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type AlbumPage = {
  albumId?: string;
  spotifyId?: string;
  title: string;
  artist: string;
  imageUrl?: string;
  releaseDate?: string;
  totalTracks?: number;
  position?: number;
  averageRating?: number;
  totalRatings?: number;
  tracks?: AlbumTrack[];
};

export type ApiError = {
  message?: string;
  error?: string;
};

export type SubmitHandler = (event: FormEvent<HTMLFormElement>) => void;

export type ChildrenProps = {
  children: ReactNode;
};
