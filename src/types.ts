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

export type FeedItem = {
  id: string;
  type?: 'ALBUM_RATED' | 'USER_FOLLOWED';
  albumId?: string;
  userId: string;
  targetUserId?: string;
  albumName?: string;
  artistName?: string;
  rating?: number;
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
};

export type ApiError = {
  message?: string;
  error?: string;
};

export type SubmitHandler = (event: FormEvent<HTMLFormElement>) => void;

export type ChildrenProps = {
  children: ReactNode;
};
