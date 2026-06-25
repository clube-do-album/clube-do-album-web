import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AlbumScreen } from '../features/albums/pages/AlbumPage';
import { AuthScreen } from '../features/users/pages/AuthPage';
import { EditProfileScreen } from '../features/users/pages/EditProfilePage';
import { FeedScreen } from '../features/social/pages/FeedPage';
import { HomeScreen } from '../pages/HomePage';
import { LandingPage } from '../pages/LandingPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PeopleScreen } from '../features/social/pages/PeoplePage';
import { ProfileScreen } from '../features/users/pages/ProfilePage';
import { RankingScreen } from '../features/rankings/pages/RankingPage';
import { UserProfileScreen } from '../features/users/pages/UserProfilePage';
import { mergeAlbumDetails, rankingToAlbumPage } from '../features/albums/services/albumMappers';
import { isFollowingUser } from '../features/social/services/socialMappers';
import type {
  AlbumDetails,
  AlbumPage,
  AuthMode,
  FeedItem,
  Follow,
  Rating,
  Ranking,
  SearchAlbum,
  Session,
  SubmitHandler,
  User,
  UserRatingSummary,
} from '../types';

type AppRoutesProps = {
  session: Session | null;
  authMode: AuthMode;
  authName: string;
  authEmail: string;
  authPassword: string;
  loading: boolean;
  status: string;
  query: string;
  searchResults: SearchAlbum[];
  topAlbums: Ranking[];
  catalogAlbums: AlbumDetails[];
  catalogPage: number;
  catalogTotal: number;
  catalogTotalPages: number;
  catalogFilter: string;
  albumDetails: Record<string, AlbumDetails>;
  selectedAlbum: AlbumPage | null;
  albumReviews: Rating[];
  reviewText: string;
  ratingValue: number;
  ranking: Ranking[];
  feed: FeedItem[];
  peopleQuery: string;
  peopleResults: User[];
  following: Follow[];
  followers: Follow[];
  followingTotal: number;
  followersTotal: number;
  myRatings: Rating[];
  myRatingSummary: UserRatingSummary;
  userCache: Record<string, User>;
  profileLookupId: string;
  userSearchResults: User[];
  viewedUser: User | null;
  publicUserRatings: Rating[];
  onAuthModeChange: (value: AuthMode) => void;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onAuthSubmit: SubmitHandler;
  onLogout: () => void;
  onDismissStatus: () => void;
  onLoadMyRatings: () => void;
  onQueryChange: (value: string) => void;
  onSearchAlbums: SubmitHandler;
  onCatalogPageChange: (page: number) => void;
  onCatalogFilterChange: (value: string) => void;
  onOpenAlbum: (album: AlbumPage) => void;
  onOpenSearchAlbum: (album: SearchAlbum) => void;
  onResolveAlbum: (album: AlbumPage | null) => void;
  onLoadAlbumDetails: (albumId: string) => Promise<AlbumDetails>;
  onImportSelectedAlbum: () => void;
  onRateAlbum: (event: FormEvent<HTMLFormElement>) => void;
  onReviewChange: (value: string) => void;
  onRatingChange: (value: number) => void;
  onRefreshRanking: () => void;
  onRefreshFeed: () => void;
  onPeopleQueryChange: (value: string) => void;
  onSearchPeople: SubmitHandler;
  onFollowUser: (user: User) => void;
  onUnfollowUser: (user: User) => void;
  onEditProfile: () => void;
  onRefreshSocial: () => void;
  onProfileLookupChange: (value: string) => void;
  onSearchUsers: SubmitHandler;
  onOpenRatedAlbum: (rating: Rating) => void;
  onOpenUserProfile: (user: User) => void;
  onResolveUser: (user: User) => void;
  onLoadUser: (userId: string) => Promise<User>;
  onLoadPublicRatings: (userId: string) => Promise<void>;
  onBackToProfile: () => void;
  onFollowViewedUser: (user: User) => void;
  onUnfollowViewedUser: (user: User) => void;
};

export function AppRoutes(props: AppRoutesProps) {
  const location = useLocation();

  if (!props.session) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage onAuthModeChange={props.onAuthModeChange} />} />
        <Route
          path="/login"
          element={
            <AuthScreen
              authMode={props.authMode}
              authName={props.authName}
              authEmail={props.authEmail}
              authPassword={props.authPassword}
              loading={props.loading}
              status={props.status}
              onAuthModeChange={props.onAuthModeChange}
              onNameChange={props.onNameChange}
              onEmailChange={props.onEmailChange}
              onPasswordChange={props.onPasswordChange}
              onSubmit={props.onAuthSubmit}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  const heroAlbum = props.topAlbums[0]
    ? rankingToAlbumPage(props.topAlbums[0], props.albumDetails[props.topAlbums[0].albumId])
    : null;
  const homeElement = (
    <HomeScreen
      heroAlbum={heroAlbum}
      query={props.query}
      loading={props.loading}
      searchResults={props.searchResults}
      topAlbums={props.topAlbums}
      catalogAlbums={props.catalogAlbums}
      catalogPage={props.catalogPage}
      catalogTotal={props.catalogTotal}
      catalogTotalPages={props.catalogTotalPages}
      catalogFilter={props.catalogFilter}
      albumDetails={props.albumDetails}
      onQueryChange={props.onQueryChange}
      onSearch={props.onSearchAlbums}
      onCatalogPageChange={props.onCatalogPageChange}
      onCatalogFilterChange={props.onCatalogFilterChange}
      onOpenAlbum={props.onOpenAlbum}
      onOpenSearchAlbum={props.onOpenSearchAlbum}
    />
  );

  return (
    <MainLayout
      session={props.session}
      status={props.status}
      onLogout={props.onLogout}
      onDismissStatus={props.onDismissStatus}
    >
      {location.pathname === '/' ? homeElement : (
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={homeElement} />
        <Route
          path="/album/:albumId"
          element={
            <AlbumRoute
              selectedAlbum={props.selectedAlbum}
              currentUserId={props.session.user.id}
              userCache={props.userCache}
              reviews={props.albumReviews}
              reviewText={props.reviewText}
              loading={props.loading}
              ratingValue={props.ratingValue}
              onResolveAlbum={props.onResolveAlbum}
              onLoadAlbumDetails={props.onLoadAlbumDetails}
              onImport={props.onImportSelectedAlbum}
              onRate={props.onRateAlbum}
              onReviewChange={props.onReviewChange}
              onRatingChange={props.onRatingChange}
            />
          }
        />
        <Route
          path="/ranking"
          element={
            <RankingScreen
              ranking={props.ranking}
              albumDetails={props.albumDetails}
              onRefresh={props.onRefreshRanking}
              onOpenAlbum={props.onOpenAlbum}
            />
          }
        />
        <Route
          path="/feed"
          element={
            <FeedScreen
              feed={props.feed}
              albumDetails={props.albumDetails}
              userCache={props.userCache}
              onRefresh={props.onRefreshFeed}
              onOpenAlbum={props.onOpenAlbum}
              onOpenUserProfile={props.onOpenUserProfile}
            />
          }
        />
        <Route
          path="/people"
          element={
            <PeopleScreen
              sessionUser={props.session.user}
              query={props.peopleQuery}
              results={props.peopleResults}
              following={props.following}
              loading={props.loading}
              onQueryChange={props.onPeopleQueryChange}
              onSearch={props.onSearchPeople}
              onOpenUserProfile={props.onOpenUserProfile}
              onFollowUser={props.onFollowUser}
              onUnfollowUser={props.onUnfollowUser}
            />
          }
        />
        <Route
          path="/profile"
          element={
            <ProfileScreen
              session={props.session}
              myRatings={props.myRatings}
              albumDetails={props.albumDetails}
              following={props.following}
              followers={props.followers}
              followingTotal={props.followingTotal}
              followersTotal={props.followersTotal}
              userCache={props.userCache}
              ratingSummary={props.myRatingSummary}
              profileLookupId={props.profileLookupId}
              userSearchResults={props.userSearchResults}
              loading={props.loading}
              onEditProfile={props.onEditProfile}
              onRefreshRatings={props.onLoadMyRatings}
              onRefreshSocial={props.onRefreshSocial}
              onProfileLookupChange={props.onProfileLookupChange}
              onSearchUsers={props.onSearchUsers}
              onOpenRatedAlbum={props.onOpenRatedAlbum}
              onOpenUserProfile={props.onOpenUserProfile}
            />
          }
        />
        <Route
          path="/profile/users/:userId"
          element={
            <UserProfileRoute
              session={props.session}
              viewedUser={props.viewedUser}
              userCache={props.userCache}
              following={props.following}
              ratings={props.publicUserRatings}
              albumDetails={props.albumDetails}
              loading={props.loading}
              onResolveUser={props.onResolveUser}
              onLoadUser={props.onLoadUser}
              onLoadPublicRatings={props.onLoadPublicRatings}
              onBack={props.onBackToProfile}
              onFollow={props.onFollowViewedUser}
              onUnfollow={props.onUnfollowViewedUser}
              onOpenRatedAlbum={props.onOpenRatedAlbum}
            />
          }
        />
        <Route path="/profile/edit" element={<EditProfileScreen session={props.session} onBack={props.onBackToProfile} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      )}
    </MainLayout>
  );
}

function UserProfileRoute({
  session,
  viewedUser,
  userCache,
  following,
  ratings,
  albumDetails,
  loading,
  onResolveUser,
  onLoadUser,
  onLoadPublicRatings,
  onBack,
  onFollow,
  onUnfollow,
  onOpenRatedAlbum,
}: {
  session: Session;
  viewedUser: User | null;
  userCache: Record<string, User>;
  following: Follow[];
  ratings: Rating[];
  albumDetails: Record<string, AlbumDetails>;
  loading: boolean;
  onResolveUser: (user: User) => void;
  onLoadUser: (userId: string) => Promise<User>;
  onLoadPublicRatings: (userId: string) => Promise<void>;
  onBack: () => void;
  onFollow: (user: User) => void;
  onUnfollow: (user: User) => void;
  onOpenRatedAlbum: (rating: Rating) => void;
}) {
  const location = useLocation();
  const { userId } = useParams();
  const routeUser = (location.state as { user?: User } | null)?.user;
  const cachedUser = userId ? userCache[userId] : undefined;
  const user = viewedUser?.id === userId ? viewedUser : routeUser?.id === userId ? routeUser : cachedUser;
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const localUser = routeUser?.id === userId ? routeUser : cachedUser;

    if (localUser) {
      setLoadError('');
      onResolveUser(localUser);
      return;
    }

    if ((!user || user.id !== userId) && userId) {
      setIsLoadingUser(true);
      setLoadError('');
      void onLoadUser(userId)
        .then(() => setLoadError(''))
        .catch((error) => {
          setLoadError(error instanceof Error ? error.message : 'Nao foi possivel carregar este perfil.');
        })
        .finally(() => setIsLoadingUser(false));
    }
  }, [cachedUser, routeUser, user, userId]);

  useEffect(() => {
    if (user?.id) {
      void onLoadPublicRatings(user.id);
    }
  }, [user?.id]);

  if (!user) {
    return (
      <section className="content-card narrow-card glass-panel">
        <p className="muted-text">
          {isLoadingUser ? 'Carregando perfil...' : loadError || 'Perfil nao encontrado ou ainda nao carregado.'}
        </p>
        <button className="button primary" onClick={onBack}>
          Voltar ao meu perfil
        </button>
      </section>
    );
  }

  return (
    <UserProfileScreen
      session={session}
      user={user}
      isFollowing={isFollowingUser(following, user.id)}
      ratings={ratings}
      albumDetails={albumDetails}
      loading={loading}
      onBack={onBack}
      onFollow={() => onFollow(user)}
      onUnfollow={() => onUnfollow(user)}
      onOpenRatedAlbum={onOpenRatedAlbum}
    />
  );
}

function AlbumRoute({
  selectedAlbum,
  currentUserId,
  userCache,
  reviews,
  reviewText,
  loading,
  ratingValue,
  onResolveAlbum,
  onLoadAlbumDetails,
  onImport,
  onRate,
  onReviewChange,
  onRatingChange,
}: {
  selectedAlbum: AlbumPage | null;
  currentUserId: string;
  userCache: Record<string, User>;
  reviews: Rating[];
  reviewText: string;
  loading: boolean;
  ratingValue: number;
  onResolveAlbum: (album: AlbumPage | null) => void;
  onLoadAlbumDetails: (albumId: string) => Promise<AlbumDetails>;
  onImport: () => void;
  onRate: (event: FormEvent<HTMLFormElement>) => void;
  onReviewChange: (value: string) => void;
  onRatingChange: (value: number) => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { albumId } = useParams();
  const routeAlbum = (location.state as { album?: AlbumPage } | null)?.album;
  const selectedAlbumMatchesRoute = Boolean(
    selectedAlbum &&
      (!albumId || selectedAlbum.albumId === albumId || selectedAlbum.spotifyId === albumId || selectedAlbum.title === albumId),
  );
  const routeAlbumMatchesRoute = Boolean(
    routeAlbum &&
      (!albumId || routeAlbum.albumId === albumId || routeAlbum.spotifyId === albumId || routeAlbum.title === albumId),
  );
  const album = selectedAlbumMatchesRoute ? selectedAlbum : routeAlbumMatchesRoute ? routeAlbum : null;

  useEffect(() => {
    const currentAlbum = album ?? routeAlbum;
    const currentAlbumId = currentAlbum?.albumId ?? albumId;

    if (routeAlbum && (!album || album.albumId !== routeAlbum.albumId)) {
      onResolveAlbum(routeAlbum);
    }

    if (currentAlbum && currentAlbumId && !currentAlbum.tracks) {
      void onLoadAlbumDetails(currentAlbumId)
        .then((details) => onResolveAlbum(mergeAlbumDetails(currentAlbum, details)))
        .catch(() => undefined);
      return;
    }

    if (!currentAlbum && albumId) {
      void onLoadAlbumDetails(albumId)
        .then((details) =>
          onResolveAlbum(
            mergeAlbumDetails(
              {
                albumId: details.id,
                spotifyId: details.spotifyId,
                title: details.albumName ?? details.name ?? 'Album',
                artist: details.artistName ?? 'Artista',
              },
              details,
            ),
          ),
        )
        .catch(() => undefined);
    }
  }, [album, albumId, routeAlbum]);

  if (!album) {
    return (
      <section className="content-card narrow-card glass-panel">
        <p className="muted-text">Album nao encontrado ou ainda nao carregado.</p>
        <button className="button primary" onClick={() => navigate('/')}>
          Voltar ao inicio
        </button>
      </section>
    );
  }

  return (
    <AlbumScreen
      album={album}
      currentUserId={currentUserId}
      userCache={userCache}
      loading={loading}
      reviews={reviews}
      reviewText={reviewText}
      ratingValue={ratingValue}
      onBack={() => navigate(-1)}
      onImport={onImport}
      onRate={onRate}
      onReviewChange={onReviewChange}
      onRatingChange={onRatingChange}
    />
  );
}
