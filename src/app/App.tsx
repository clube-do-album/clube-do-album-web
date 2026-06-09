import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppRoutes } from './routes';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { getAlbumById, importAlbumFromSpotify, listAlbums, searchAlbumsByName } from '../features/albums/services/albumService';
import { listPublicRatingsByUser, listRatingsByAlbum, listRatingsByUser, saveRating } from '../features/albums/services/ratingService';
import { listRankings } from '../features/rankings/services/rankingService';
import { followUserById, listFeed, listFollowers, listFollowing, unfollowUserById } from '../features/social/services/socialService';
import { readSession, saveStoredSession, clearStoredSession } from '../features/users/services/sessionStorage';
import { createUser, getUserById as fetchUserById, login, searchUsersByQuery } from '../features/users/services/userService';
import { mergeAlbumDetails, searchAlbumToPage } from '../features/albums/services/albumMappers';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { usePageRevalidation } from '../hooks/usePageRevalidation';
import type { AlbumDetails, AlbumPage, AuthMode, FeedItem, Follow, Rating, Ranking, SearchAlbum, Session, User } from '../types';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const confirmDialog = useConfirmDialog();
  const [session, setSession] = useState<Session | null>(() => readSession());
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [query, setQuery] = useState('abbey road');
  const [searchResults, setSearchResults] = useState<SearchAlbum[]>([]);
  const [catalogAlbums, setCatalogAlbums] = useState<AlbumDetails[]>([]);
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [albumDetails, setAlbumDetails] = useState<Record<string, AlbumDetails>>({});
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [myRatings, setMyRatings] = useState<Rating[]>([]);
  const [albumReviews, setAlbumReviews] = useState<Rating[]>([]);
  const [publicUserRatings, setPublicUserRatings] = useState<Rating[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [userCache, setUserCache] = useState<Record<string, User>>({});
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumPage | null>(null);
  const [ratingValue, setRatingValue] = useState(4.5);
  const [reviewText, setReviewText] = useState('');
  const [profileLookupId, setProfileLookupId] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
  const [peopleQuery, setPeopleQuery] = useState('');
  const [peopleResults, setPeopleResults] = useState<User[]>([]);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const topAlbums = useMemo(() => ranking.slice(0, 12), [ranking]);

  useEffect(() => {
    if (session) {
      cacheUsers([session.user]);
      void refreshPublicData();
      void loadMyRatings(session);
      void loadSocialData(session);
    }
  }, [session]);

  useEffect(() => {
    if (!selectedAlbum?.albumId) {
      setAlbumReviews([]);
      setReviewText('');
      return;
    }

    const currentRating = myRatings.find((rating) => rating.albumId === selectedAlbum.albumId);
    if (currentRating) {
      setRatingValue(currentRating.rating ?? currentRating.ratingValue ?? 4.5);
      setReviewText(currentRating.review ?? '');
    } else {
      setRatingValue(4.5);
      setReviewText('');
    }

    void loadAlbumReviews(selectedAlbum.albumId);
  }, [myRatings, selectedAlbum?.albumId]);

  async function refreshPublicData() {
    await Promise.allSettled([loadRanking(), loadFeed(), loadCatalogAlbums()]);
  }

  const revalidateCurrentPage = useCallback((pathname: string) => {
    if (!session) {
      return;
    }

    if (pathname === '/') {
      void refreshPublicData();
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
      void loadMyRatings();
      void loadSocialData();
    }
  }, [session?.accessToken]);

  usePageRevalidation(location.pathname, Boolean(session), revalidateCurrentPage);

  async function loadCatalogAlbums() {
    const result = await listAlbums();
    setCatalogAlbums(result);
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
      message: 'Sua sessao local sera encerrada e voce precisara fazer login novamente.',
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
      setStatus(error instanceof Error ? error.message : 'Nao foi possivel autenticar.');
    } finally {
      setLoading(false);
    }
  }

  async function loadRanking() {
    const result = await listRankings(24);
    setRanking(result);
    await hydrateRankingAlbums(result);
  }

  async function hydrateRankingAlbums(items: Ranking[]) {
    const missing = items.filter((item) => !albumDetails[item.albumId]).slice(0, 12);

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
    const result = await listFeed(24);
    setFeed(result);
  }

  async function loadMyRatings(currentSession = session) {
    if (!currentSession) {
      return;
    }

    try {
      const result = await listRatingsByUser(currentSession.user.id, currentSession.accessToken);
      setMyRatings(result);
      await hydrateRatingAlbums(result);
    } catch {
      setMyRatings([]);
    }
  }

  async function loadAlbumReviews(albumId: string) {
    try {
      const result = await listRatingsByAlbum(albumId);
      setAlbumReviews(result);
      await hydrateReviewUsers(result);
    } catch {
      setAlbumReviews([]);
    }
  }

  async function loadPublicUserRatings(userId: string) {
    try {
      const result = await listPublicRatingsByUser(userId);
      setPublicUserRatings(result);
      await hydrateRatingAlbums(result);
    } catch {
      setPublicUserRatings([]);
    }
  }

  async function hydrateRatingAlbums(items: Rating[]) {
    const missingAlbumIds = Array.from(new Set(items.map((item) => item.albumId)))
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

    const missingUserIds = Array.from(new Set(items.map((item) => item.userId)))
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
        listFollowing(currentSession.accessToken),
        listFollowers(currentSession.accessToken),
      ]);

      setFollowing(followingResult);
      setFollowers(followersResult);
      await hydrateSocialUsers(followingResult, followersResult, currentSession);
    } catch {
      setFollowing([]);
      setFollowers([]);
    }
  }

  async function searchAlbums(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const result = await searchAlbumsByName(query);
      setSearchResults(result);
      setStatus(`${result.length} resultado(s).`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Nao foi possivel buscar albuns.');
    } finally {
      setLoading(false);
    }
  }

  function openAlbum(album: AlbumPage) {
    setSelectedAlbum(album);
    navigate(`/album/${encodeURIComponent(album.albumId ?? album.spotifyId ?? album.title)}`, {
      state: { album },
    });
  }

  async function importAlbum(album: SearchAlbum | AlbumPage) {
    if (!session) {
      return null;
    }

    const spotifyId = album.spotifyId;

    if (!spotifyId) {
      setStatus('Album sem Spotify ID.');
      return null;
    }

    setLoading(true);
    setStatus('');

    try {
      const imported = await importAlbumFromSpotify(spotifyId, session.accessToken);
      setAlbumDetails((current) => ({ ...current, [imported.id]: imported }));
      setStatus('Album importado.');
      await loadRanking();
      return imported;
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Nao foi possivel importar.');
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
      setStatus('Importe o album antes de rankear.');
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
      setStatus('Avaliacao salva.');
      await Promise.allSettled([loadRanking(), loadFeed(), loadMyRatings(), loadAlbumReviews(selectedAlbum.albumId)]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Nao foi possivel avaliar.');
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
      const visibleResults = result.filter((user) => user.id !== session.user.id);
      cacheUsers(result);
      setUserSearchResults(visibleResults);
      setStatus(`${visibleResults.length} usuario(s) encontrado(s).`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Nao foi possivel buscar usuarios.');
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
      cacheUsers(result);
      setPeopleResults(result);
      setStatus(`${result.length} perfil(is) encontrado(s).`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Nao foi possivel buscar pessoas.');
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
      title: details?.albumName ?? details?.name ?? 'Album',
      artist: details?.artistName ?? 'Artista',
    }, details ?? {
      id: rating.albumId,
      albumName: 'Album',
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
      await loadSocialData();
      setStatus(`Voce esta seguindo ${user.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Nao foi possivel seguir o usuario.');
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
      message: `Voce deixara de acompanhar as atividades de ${user.name}.`,
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
      await loadSocialData();
      setStatus(`Voce deixou de seguir ${user.name}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Nao foi possivel deixar de seguir.');
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
      myRatings={myRatings}
      userCache={userCache}
      profileLookupId={profileLookupId}
      userSearchResults={userSearchResults}
      viewedUser={viewedUser}
      publicUserRatings={publicUserRatings}
      onAuthModeChange={setAuthMode}
      onNameChange={setAuthName}
      onEmailChange={setAuthEmail}
      onPasswordChange={setAuthPassword}
      onAuthSubmit={handleAuth}
      onLogout={logout}
      onDismissStatus={() => setStatus('')}
      onLoadMyRatings={() => void loadMyRatings()}
      onQueryChange={setQuery}
      onSearchAlbums={searchAlbums}
      onOpenAlbum={openAlbum}
      onImportAlbum={(album) => void importAndOpen(album)}
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

    followingItems.forEach((item) => ids.add(item.followedId));
    followerItems.forEach((item) => ids.add(item.followerId));
    ids.delete(currentSession.user.id);

    const missingIds = Array.from(ids).filter((id) => !userCache[id]);

    if (missingIds.length === 0) {
      return;
    }

    const loaded = await Promise.allSettled(
      missingIds.map((id) => fetchUserById(id, currentSession.accessToken)),
    );

    const users = loaded
      .filter((result): result is PromiseFulfilledResult<User> => result.status === 'fulfilled')
      .map((result) => result.value);

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
