import type { Session } from '../../../types';

const sessionKey = 'clube-do-album-session';

export function readSession(): Session | null {
  const stored = localStorage.getItem(sessionKey);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as Session;
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
