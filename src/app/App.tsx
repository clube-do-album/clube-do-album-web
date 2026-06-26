import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppRoutes } from './routes';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { getAlbumById, getAlbumsByIds, importAlbumFromSpotify, listAlbums, searchAlbumsByName } from '../features/albums/services/albumService';
import { getRatingSummaryByUser, listPublicRatingsByUser, listRatingsByAlbum, listRatingsByUser, saveRating } from '../features/albums/services/ratingService';
import { listRankings } from '../features/rankings/services/rankingService';
import { getUnreadNotificationCount, listNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../features/notifications/services/notificationService';
import { followUserById, listFeed, listFollowers, listFollowing, unfollowUserById } from '../features/social/services/socialService';
import { readSession, saveStoredSession, clearStoredSession } from '../features/users/services/sessionStorage';
import { createUser, getUserById as fetchUserById, getUsersByIds, login, searchUsersByQuery } from '../features/users/services/userService';
import { mergeAlbumDetails, searchAlbumToPage } from '../features/albums/services/albumMappers';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { usePageRevalidation } from '../hooks/usePageRevalidation';
import type { AlbumDetails, AlbumPage, AuthMode, FeedItem, Follow, NotificationItem, PaginatedResponse, Rating, Ranking, SearchAlbum, Session, User, UserRatingSummary } from '../types';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmDialog = useConfirmDialog();
  const [session, setSession] = useState<Session | null>(() => readSession());
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchAlbum[]>([]);
  const [catalogAlbums, setCatalogAlbums] = useState<AlbumDetails[]>([]);
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogFilter, setCatalogFilter] = useState('');
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [catalogTotalPages, setCatalogTotalPages] = useState(1);
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [albumDetails, setAlbumDetails] = useState<Record<string, AlbumDetails>>({});
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [myRatings, setMyRatings] = useState<Rating[]>([]);
  const [myRatingSummary, setMyRatingSummary] = useState<UserRatingSummary>({
    totalRatings: 0,
    reviewCount: 0,
    averageRating: 0,
  });
  const [albumReviews, setAlbumReviews] = useState<Rating[]>([]);
  const [publicUserRatings, setPublicUserRatings] = useState<Rating[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [followingTotal, setFollowingTotal] = useState(0);
  const [followersTotal, setFollowersTotal] = useState(0);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumPage | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [profileLookupId, setProfileLookupId] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [peopleQuery, setPeopleQuery] = useState('');
  const [peopleResults, setPeopleResults] = useState<User[]>([]);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasLoadedHome, setHasLoadedHome] = useState(false);

  const topAlbums = useMemo(() => (Array.isArray(ranking) ? ranking : []).slice(0, 12), [ranking]);

  useEffect(() => {
    if (session) {
      cacheUsers([session.user]);
      void loadNotifications(session);
    }
  }, [session]);

  useEffect(() => {
    if (!selectedAlbum?.albumId) {
      setAlbumReviews([]);
      setReviewText('');
      return;
    }

    void loadAlbumReviews(selectedAlbum.albumId);
  }, [selectedAlbum?.albumId]);

  useEffect(() => {
    if (!selectedAlbum?.albumId || !session) {
      return;
    }

    const currentRating =
      myRatings.find((rating) => rating.albumId === selectedAlbum.albumId) ??
      albumReviews.find((rating) => rating.albumId === selectedAlbum.albumId && rating.userId === session.user.id);

    if (currentRating) {
      setRatingValue(currentRating.rating ?? currentRating.ratingValue ?? 0);
      setReviewText(currentRating.review ?? '');
      return;
    }

    setRatingValue(0);
    setReviewText('');
  }, [albumReviews, myRatings, selectedAlbum?.albumId, session?.user.id]);

  async function refreshPublicData() {
    await Promise.allSettled([loadRanking(), loadFeed(), loadCatalogAlbums()]);
    setHasLoadedHome(true);
  }

  const revalidateCurrentPage = useCallback((pathname: string) => {
    if (!session) {
      return;
    }

    if (pathname === '/') {
      if (!hasLoadedHome) {
        void refreshPublicData();
      }
      return;
    }

    if (pathname === '/ranking') {
      void loadRanking();
      return;
    }

    if (pathname === '/feed') {
      void loadFeed();
      return;
    }

    if (pathname === '/profile') {
      setProfileLookupId('');
      setUserSearchResults([]);
      void loadProfileData();
      return;
    }

    if (pathname === '/people') {
      setPeopleQuery('');
      setPeopleResults([]);
      void loadSocialData();
      return;
    }

    if (pathname.startsWith('/album/') && selectedAlbum?.albumId) {
      void loadAlbumDetails(selectedAlbum.albumId);
      void loadAlbumReviews(selectedAlbum.albumId);
      return;
    }

    if (pathname.startsWith('/profile/users/') && viewedUser?.id) {
      void loadPublicUserRatings(viewedUser.id);
      void loadSocialData();
    }
  }, [hasLoadedHome, session?.accessToken, selectedAlbum?.albumId, viewedUser?.id]);

  usePageRevalidation(location.pathname, location.key, Boolean(session), revalidateCurrentPage);

  useEffect(() => {
    if (session && hasLoadedHome) {
      const timeoutId = window.setTimeout(() => {
        void loadCatalogAlbums(catalogPage, catalogFilter);
      }, 300);

      return () => window.clearTimeout(timeoutId);
    }
  }, [catalogPage, catalogFilter, hasLoadedHome, session?.accessToken]);

  async function loadCatalogAlbums(page = catalogPage, filter = catalogFilter) {
    const result = await listAlbums({ page, limit: 12, query: filter });
    const paginated = normalizePaginated(result, page, 12);

    setCatalogAlbums(paginated.items);
    setCatalogTotal(paginated.total);
    setCatalogTotalPages(paginated.totalPages);
  }

  function saveSession(nextSession: Session) {
    saveStoredSession(nextSession);
    setSession(nextSession);
    navigate('/');
  }

  function executeLogout() {
    clearStoredSession();
    setSession(null);
    setStatus('');
    navigate('/login');
  }

  function logout() {
    confirmDialog.confirm({
      title: 'Sair da conta?',
      message: 'Sua sessão local será encerrada e você precisará fazer login novamente.',
      confirmLabel: 'Sair',
      onConfirm: executeLogout,
    });
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      if (authMode === 'register') {
        await createUser({ name: authName, email: authEmail, password: authPassword });
      }

      const auth = await login({ email: authEmail, password: authPassword });

      saveSession({ accessToken: auth.accessToken, user: auth.user });
      setAuthPassword('');
      setStatus(authMode === 'register' ? 'Conta criada.' : 'Bem-vindo de volta.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível autenticar.');
    } finally {
      setLoading(false);
    }
  }

  async function loadRanking() {
    const result = await listRankings({ page: 1, limit: 24 });
    const safeResult = normalizePaginated(result, 1, 24).items;
    setRanking(safeResult);
    await hydrateRankingAlbums(safeResult);
  }

  async function hydrateRankingAlbums(items: Ranking[]) {
    const missing = (Array.isArray(items) ? items : [])
      .filter((item) => item?.albumId && !albumDetails[item.albumId])
      .slice(0, 12);

    if (missing.length === 0) {
      return;
    }

    const loaded = await Promise.allSettled(
      missing.map((item) => getAlbumById(item.albumId)),
    );

    setAlbumDetails((current) => {
      const next = { ...current };
      loaded.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          next[missing[index].albumId] = result.value;
        }
      });
      return next;
    });
  }

  async function loadFeed() {
    const result = await listFeed({ page: 1, limit: 24, type: 'ALBUM_RATED' });
    const safeResult = normalizePaginated(result, 1, 24).items.sort((a, b) => {
      const firstDate = new Date(a.occurredAt ?? a.createdAt ?? 0).getTime();
      const secondDate = new Date(b.occurredAt ?? b.createdAt ?? 0).getTime();
      return secondDate - firstDate;
    });
    setFeed(safeResult);
    await Promise.allSettled([hydrateFeedAlbums(safeResult), hydrateFeedUsers(safeResult)]);
  }

  async function loadNotifications(currentSession = session) {
    if (!currentSession) {
      return;
    }

    try {
      const [items, count] = await Promise.all([
        listNotifications(currentSession.accessToken, { limit: 12 }),
        getUnreadNotificationCount(currentSession.accessToken),
      ]);

      setNotifications(Array.isArray(items) ? items : []);
      setUnreadNotifications(count.unread ?? 0);
    } catch {
      setNotifications([]);
      setUnreadNotifications(0);
    }
  }

  async function readNotification(notification: NotificationItem) {
    if (!session) {
      return;
    }

    if (!notification.readAt) {
      await markNotificationAsRead(notification.id, session.accessToken);
      await loadNotifications(session);
    }

    if (notification.albumId) {
      openAlbum({
        albumId: notification.albumId,
        title: 'Álbum',
        artist: 'Artista',
      });
    }
  }

  async function readAllNotifications() {
    if (!session) {
      return;
    }

    await markAllNotificationsAsRead(session.accessToken);
    await loadNotifications(session);
  }

  async function hydrateFeedAlbums(items: FeedItem[]) {
    const missingAlbumIds = Array.from(new Set(
      (Array.isArray(items) ? items : [])
        .map((item) => item.albumId)
        .filter((albumId): albumId is string => Boolean(albumId)),
    ))
      .filter((albumId) => !albumDetails[albumId])
      .slice(0, 18);

    if (missingAlbumIds.length === 0) {
      return;
    }

    const loaded = await getAlbumsByIds(missingAlbumIds);

    setAlbumDetails((current) => {
      const next = { ...current };

      loaded.forEach((album) => {
        next[album.id] = album;
      });

      return next;
    });
  }

  async function hydrateFeedUsers(items: FeedItem[]) {
    if (!session) {
      return;
    }

    const ids = new Set<string>();

    (Array.isArray(items) ? items : []).forEach((item) => {
      ids.add(item.userId);
      if (item.targetUserId) {
        ids.add(item.targetUserId);
      }
    });

    const missingUserIds = Array.from(ids)
      .filter((userId) => !userCache[userId])
      .slice(0, 18);

    if (missingUserIds.length === 0) {
      return;
    }

    const loaded = await Promise.allSettled(
      missingUserIds.map((userId) => fetchUserById(userId, session.accessToken)),
    );

    const users = loaded
      .filter((result): result is PromiseFulfilledResult<User> => result.status === 'fulfilled')
      .map((result) => result.value);

    cacheUsers(users);
  }

  async function loadMyRatings(currentSession = session) {
    if (!currentSession) {
      return;
    }

    try {
      const [ratingsResult, summaryResult] = await Promise.all([
        listRatingsByUser(currentSession.user.id, currentSession.accessToken, { page: 1, limit: 15 }),
        getRatingSummaryByUser(currentSession.user.id, currentSession.accessToken),
      ]);
      const safeResult = normalizePaginated(ratingsResult, 1, 15).items;
      setMyRatings(safeResult);
      setMyRatingSummary(summaryResult);
      await hydrateRatingAlbums(safeResult);
    } catch {
      setMyRatings([]);
      setMyRatingSummary({ totalRatings: 0, reviewCount: 0, averageRating: 0 });
    }
  }

  async function loadProfileData(currentSession = session) {
    if (!currentSession) {
      return;
    }

    await Promise.allSettled([
      loadMyRatings(currentSession),
      loadSocialData(currentSession),
    ]);
  }

  async function loadAlbumReviews(albumId: string) {
    try {
      const result = await listRatingsByAlbum(albumId);
      const safeResult = normalizePaginated(result, 1, 20).items;
      setAlbumReviews(safeResult);
      await hydrateReviewUsers(safeResult);
    } catch {
      setAlbumReviews([]);
    }
  }

  async function loadPublicUserRatings(userId: string) {
    try {
      const result = await listPublicRatingsByUser(userId);
      const safeResult = normalizePaginated(result, 1, 15).items;
      setPublicUserRatings(safeResult);
      await hydrateRatingAlbums(safeResult);
    } catch {
      setPublicUserRatings([]);
    }
  }

  async function hydrateRatingAlbums(items: Rating[]) {
    const missingAlbumIds = Array.from(new Set((Array.isArray(items) ? items : []).map((item) => item.albumId)))
      .filter((albumId) => !albumDetails[albumId])
      .slice(0, 16);

    if (missingAlbumIds.length === 0) {
      return;
    }

    const loaded = await Promise.allSettled(
      missingAlbumIds.map((albumId) => getAlbumById(albumId)),
    );

    setAlbumDetails((current) => {
      const next = { ...current };

      loaded.forEach((result) => {
        if (result.status === 'fulfilled') {
          next[result.value.id] = result.value;
        }
      });

      return next;
    });
  }

  async function hydrateReviewUsers(items: Rating[]) {
    if (!session) {
      return;
    }

    const missingUserIds = Array.from(new Set((Array.isArray(items) ? items : []).map((item) => item.userId)))
      .filter((userId) => userId !== session.user.id && !userCache[userId])
      .slice(0, 12);

    if (missingUserIds.length === 0) {
      return;
    }

    const loaded = await Promise.allSettled(
      missingUserIds.map((userId) => fetchUserById(userId, session.accessToken)),
    );

    const users = loaded
      .filter((result): result is PromiseFulfilledResult<User> => result.status === 'fulfilled')
      .map((result) => result.value);

    cacheUsers(users);
  }

  async function loadSocialData(currentSession = session) {
    if (!currentSession) {
      return;
    }

    try {
      const [followingResult, followersResult] = await Promise.all([
        listFollowing(currentSession.accessToken, { page: 1, limit: 8 }),
        listFollowers(currentSession.accessToken, { page: 1, limit: 8 }),
      ]);
      const paginatedFollowing = normalizePaginated(followingResult, 1, 8);
      const paginatedFollowers = normalizePaginated(followersResult, 1, 8);
      const safeFollowing = paginatedFollowing.items;
      const safeFollowers = paginatedFollowers.items;

      setFollowing(safeFollowing);
      setFollowers(safeFollowers);
      setFollowingTotal(paginatedFollowing.total);
      setFollowersTotal(paginatedFollowers.total);
      await hydrateSocialUsers(safeFollowing, safeFollowers, currentSession);
    } catch {
      setFollowing([]);
      setFollowers([]);
      setFollowingTotal(0);
      setFollowersTotal(0);
    }
  }

  async function searchAlbums(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const result = await searchAlbumsByName(query);
      const safeResult = Array.isArray(result) ? result : [];
      setSearchResults(safeResult);
      setStatus(`${safeResult.length} resultado(s).`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível buscar álbuns.');
    } finally {
      setLoading(false);
    }
  }

  async function openAlbum(album: AlbumPage) {
    const albumRouteId = album.albumId ?? album.spotifyId ?? album.title;
    let nextAlbum = album;

    if (album.albumId && !album.tracks) {
      try {
        const details = await getAlbumById(album.albumId);
        setAlbumDetails((current) => ({ ...current, [details.id]: details }));
        nextAlbum = mergeAlbumDetails(album, details);
      } catch {
        nextAlbum = album;
      }
    }

    setSelectedAlbum(nextAlbum);
    navigate(`/album/${encodeURIComponent(albumRouteId)}`, {
      state: { album: nextAlbum },
    });
  }

  async function importAlbum(album: SearchAlbum | AlbumPage) {
    if (!session) {
      return null;
    }

    const spotifyId = album.spotifyId;

    if (!spotifyId) {
      setStatus('Não foi possível localizar este álbum.');
      return null;
    }

    setLoading(true);
    setStatus('');

    try {
      const imported = await importAlbumFromSpotify(spotifyId, session.accessToken);
      setAlbumDetails((current) => ({ ...current, [imported.id]: imported }));
      setStatus('Álbum pronto.');
      await Promise.allSettled([loadRanking(), loadCatalogAlbums()]);
      return imported;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível abrir este álbum.');
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function importAndOpen(album: SearchAlbum) {
    const imported = await importAlbum(album);
    if (imported) {
      openAlbum(mergeAlbumDetails(searchAlbumToPage(album), imported));
    }
  }

  async function ensureSelectedAlbumIsImported() {
    if (!selectedAlbum) {
      return;
    }

    const imported = await importAlbum(selectedAlbum);
    if (imported) {
      setSelectedAlbum((current) => current ? mergeAlbumDetails(current, imported) : current);
    }
  }

  async function rateSelectedAlbum(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || !selectedAlbum?.albumId) {
      setStatus('Importe o álbum antes de rankear.');
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      await saveRating(
        {
          albumId: selectedAlbum.albumId,
          rating: ratingValue,
          review: reviewText.trim() || null,
        },
        session.accessToken,
      );
      setStatus('Avaliação salva.');
      await Promise.allSettled([
        loadRanking(),
        loadFeed(),
        loadMyRatings(),
        loadAlbumReviews(selectedAlbum.albumId),
        loadNotifications(),
      ]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível avaliar.');
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || !profileLookupId.trim()) {
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const result = await searchUsersByQuery(profileLookupId.trim(), session.accessToken);
      const safeResult = Array.isArray(result) ? result : [];
      const visibleResults = safeResult.filter((user) => user.id !== session.user.id);
      cacheUsers(safeResult);
      setUserSearchResults(visibleResults);
      setStatus(`${visibleResults.length} usuário(s) encontrado(s).`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível buscar usuários.');
    } finally {
      setLoading(false);
    }
  }

  async function searchPeople(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session || !peopleQuery.trim()) {
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      const result = await searchUsersByQuery(peopleQuery.trim(), session.accessToken);
      const safeResult = Array.isArray(result) ? result : [];
      cacheUsers(safeResult);
      setPeopleResults(safeResult);
      setStatus(`${safeResult.length} perfil(is) encontrado(s).`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível buscar pessoas.');
    } finally {
      setLoading(false);
    }
  }

  function openUserProfile(user: User) {
    cacheUsers([user]);
    setViewedUser(user);
    navigate(`/profile/users/${user.id}`, {
      state: { user },
    });
  }

  function openRatedAlbum(rating: Rating) {
    const details = albumDetails[rating.albumId];
    openAlbum(mergeAlbumDetails({
      albumId: rating.albumId,
      spotifyId: details?.spotifyId,
      title: details?.albumName ?? details?.name ?? 'Álbum',
      artist: details?.artistName ?? 'Artista',
    }, details ?? {
      id: rating.albumId,
      albumName: 'Álbum',
      artistName: 'Artista',
    }));
  }

  async function followUser(user: User) {
    if (!session) {
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      await followUserById(user.id, session.accessToken);
      await Promise.allSettled([loadSocialData(), loadNotifications()]);
      setStatus(`Você está seguindo ${user.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível seguir o usuário.');
    } finally {
      setLoading(false);
    }
  }

  function unfollowUser(user: User) {
    if (!session) {
      return;
    }

    confirmDialog.confirm({
      title: 'Deixar de seguir?',
      message: `Você deixará de acompanhar as atividades de ${user.name}.`,
      confirmLabel: 'Deixar de seguir',
      onConfirm: () => executeUnfollowUser(user),
    });
  }

  async function executeUnfollowUser(user: User) {
    if (!session) {
      return;
    }

    setLoading(true);
    setStatus('');

    try {
      await unfollowUserById(user.id, session.accessToken);
      await Promise.allSettled([loadSocialData(), loadNotifications()]);
      setStatus(`Você deixou de seguir ${user.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível deixar de seguir.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppRoutes
      session={session}
      authMode={authMode}
      authName={authName}
      authEmail={authEmail}
      authPassword={authPassword}
      loading={loading}
      status={status}
      query={query}
      searchResults={searchResults}
      topAlbums={topAlbums}
      catalogAlbums={catalogAlbums}
      catalogPage={catalogPage}
      catalogTotal={catalogTotal}
      catalogTotalPages={catalogTotalPages}
      catalogFilter={catalogFilter}
      albumDetails={albumDetails}
      selectedAlbum={selectedAlbum}
      albumReviews={albumReviews}
      reviewText={reviewText}
      ratingValue={ratingValue}
      ranking={ranking}
      feed={feed}
      peopleQuery={peopleQuery}
      peopleResults={peopleResults}
      following={following}
      followers={followers}
      followingTotal={followingTotal}
      followersTotal={followersTotal}
      myRatings={myRatings}
      myRatingSummary={myRatingSummary}
      userCache={userCache}
      profileLookupId={profileLookupId}
      userSearchResults={userSearchResults}
      viewedUser={viewedUser}
      publicUserRatings={publicUserRatings}
      notifications={notifications}
      unreadNotifications={unreadNotifications}
      onAuthModeChange={setAuthMode}
      onNameChange={setAuthName}
      onEmailChange={setAuthEmail}
      onPasswordChange={setAuthPassword}
      onAuthSubmit={handleAuth}
      onLogout={logout}
      onDismissStatus={() => setStatus('')}
      onRefreshNotifications={() => void loadNotifications()}
      onReadNotification={(notification) => void readNotification(notification)}
      onReadAllNotifications={() => void readAllNotifications()}
      onLoadMyRatings={() => void loadMyRatings()}
      onQueryChange={setQuery}
      onSearchAlbums={searchAlbums}
      onCatalogPageChange={setCatalogPage}
      onCatalogFilterChange={(value) => {
        setCatalogFilter(value);
        setCatalogPage(1);
      }}
      onOpenAlbum={openAlbum}
      onOpenSearchAlbum={(album) => void importAndOpen(album)}
      onResolveAlbum={setSelectedAlbum}
      onLoadAlbumDetails={loadAlbumDetails}
      onImportSelectedAlbum={() => void ensureSelectedAlbumIsImported()}
      onRateAlbum={rateSelectedAlbum}
      onReviewChange={setReviewText}
      onRatingChange={setRatingValue}
      onRefreshRanking={() => void loadRanking()}
      onRefreshFeed={() => void loadFeed()}
      onPeopleQueryChange={setPeopleQuery}
      onSearchPeople={searchPeople}
      onFollowUser={(user) => void followUser(user)}
      onUnfollowUser={(user) => void unfollowUser(user)}
      onEditProfile={() => navigate('/profile/edit')}
      onRefreshSocial={() => void loadSocialData()}
      onProfileLookupChange={setProfileLookupId}
      onSearchUsers={searchUsers}
      onOpenRatedAlbum={openRatedAlbum}
      onOpenUserProfile={openUserProfile}
      onResolveUser={setViewedUser}
      onLoadUser={(userId) => loadUserById(userId, session?.accessToken ?? '')}
      onLoadPublicRatings={loadPublicUserRatings}
      onBackToProfile={() => navigate('/profile')}
      onFollowViewedUser={(user) => void followUser(user)}
        onUnfollowViewedUser={(user) => void unfollowUser(user)}
      />
      <ConfirmDialog {...confirmDialog.dialogProps} />
    </>
  );

  async function loadAlbumDetails(albumId: string) {
    const details = await getAlbumById(albumId);
    setAlbumDetails((current) => ({ ...current, [details.id]: details }));
    return details;
  }

  async function loadUserById(userId: string, accessToken: string) {
    const user = await fetchUserById(userId, accessToken);
    cacheUsers([user]);
    setViewedUser(user);
    return user;
  }

  async function hydrateSocialUsers(
    followingItems: Follow[],
    followerItems: Follow[],
    currentSession: Session,
  ) {
    const ids = new Set<string>();

    (Array.isArray(followingItems) ? followingItems : []).forEach((item) => ids.add(item.followedId));
    (Array.isArray(followerItems) ? followerItems : []).forEach((item) => ids.add(item.followerId));
    ids.delete(currentSession.user.id);

    const missingIds = Array.from(ids).filter((id) => !userCache[id]);

    if (missingIds.length === 0) {
      return;
    }

    const users = await getUsersByIds(missingIds, currentSession.accessToken);

    cacheUsers(users);
  }

  function cacheUsers(users: User[]) {
    if (users.length === 0) {
      return;
    }

    setUserCache((current) => {
      const next = { ...current };

      users.forEach((user) => {
        next[user.id] = user;
      });

      return next;
    });
  }
}

function normalizePaginated<T>(
  response: PaginatedResponse<T> | T[],
  page: number,
  limit: number,
): PaginatedResponse<T> {
  if (Array.isArray(response)) {
    return {
      items: response,
      page,
      limit,
      total: response.length,
      totalPages: Math.max(1, Math.ceil(response.length / limit)),
      hasNextPage: false,
    };
  }

  return response;
}
