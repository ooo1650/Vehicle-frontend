/**
 * Session management utility
 * - Stores user + lastActivity in localStorage
 * - Session expires after 30 minutes of inactivity
 * - Provides helpers used across the app
 */

const SESSION_KEY     = 'user';
const TIMEOUT_MS      = 30 * 60 * 1000; // 30 minutes

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session?.user) return null;

    const now = Date.now();
    const last = session.lastActivity || 0;

    if (now - last > TIMEOUT_MS) {
      // Session expired
      destroySession();
      return null;
    }

    return session.user;
  } catch {
    destroySession();
    return null;
  }
}

export function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    user,
    lastActivity: Date.now(),
  }));
}

export function touchSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return;
    const session = JSON.parse(raw);
    if (!session?.user) return;
    session.lastActivity = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function destroySession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isSessionValid() {
  return getSession() !== null;
}
