import type { Session } from '../../../types';

const sessionKey = 'clube-do-album-session';

export function readSession(): Session | null {
  const stored = localStorage.getItem(sessionKey);

  if (!stored) {
    return null;
  }

  try {
    const session = JSON.parse(stored) as Session;

    if (!isValidSession(session)) {
      localStorage.removeItem(sessionKey);
      return null;
    }

    return session;
  } catch {
    localStorage.removeItem(sessionKey);
    return null;
  }
}

export function saveStoredSession(session: Session) {
  localStorage.setItem(sessionKey, JSON.stringify(session));
}

export function clearStoredSession() {
  localStorage.removeItem(sessionKey);
}

function isValidSession(session: Session | null | undefined): session is Session {
  return Boolean(
    session?.accessToken &&
      session.user?.id &&
      session.user?.name &&
      session.user?.email,
  );
}
