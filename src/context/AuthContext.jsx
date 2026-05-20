import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { apiUrl, apiFetch } from '../utils/api';
import { getSession, setSession, destroySession, touchSession } from '../utils/session';

const AuthContext = createContext(null);

const TIMEOUT_MS      = 30 * 60 * 1000; // 30 minutes
const WARNING_MS      = 2  * 60 * 1000; // warn 2 min before expiry
const CHECK_INTERVAL  = 60 * 1000;      // check every 60 seconds

export function AuthProvider({ children }) {
  // ── Admin auth (unchanged) ────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // ── User session ──────────────────────────────────────────────────────────
  const [user,        setUser]        = useState(() => getSession());
  const [showWarning, setShowWarning] = useState(false);
  const timerRef  = useRef(null);
  const warningRef = useRef(null);

  // ── Activity tracking — reset timer on any user interaction ──────────────
  const resetTimer = useCallback(() => {
    if (!getSession()) return;
    touchSession();
    setShowWarning(false);

    clearTimeout(timerRef.current);
    clearTimeout(warningRef.current);

    // Warn 2 min before expiry
    warningRef.current = setTimeout(() => {
      if (getSession()) setShowWarning(true);
    }, TIMEOUT_MS - WARNING_MS);

    // Auto-logout after 30 min
    timerRef.current = setTimeout(() => {
      logoutUser('Session expired due to inactivity.');
    }, TIMEOUT_MS);
  }, []);

  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer(); // start timer immediately

    // Periodic check — catches expiry across tabs
    const interval = setInterval(() => {
      if (!getSession()) {
        logoutUser('Session expired due to inactivity.');
      }
    }, CHECK_INTERVAL);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
      clearTimeout(warningRef.current);
      clearInterval(interval);
    };
  }, [user, resetTimer]);

  function logoutUser(reason) {
    destroySession();
    setUser(null);
    setShowWarning(false);
    clearTimeout(timerRef.current);
    clearTimeout(warningRef.current);
    // Redirect to login — use location.replace so back button doesn't return to protected page
    window.location.replace('/login' + (reason ? `?reason=${encodeURIComponent(reason)}` : ''));
  }

  function loginUser(userData) {
    setSession(userData);
    setUser(userData);
  }

  // ── Admin auth ────────────────────────────────────────────────────────────
  async function login(username, password) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch('/api/admin/login.php', {
        method: 'POST',
        body: { username, password },
      });
      localStorage.setItem('admin', JSON.stringify(data.admin));
    } catch (e) {
      setError(e.message || 'Login failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('admin');
  }

  return (
    <AuthContext.Provider value={{
      // Admin
      login, logout, loading, error, setError,
      // User
      user, loginUser, logoutUser,
    }}>
      {children}

      {/* ── Inactivity warning banner ── */}
      {showWarning && user && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', borderRadius: 12,
          padding: '14px 24px', zIndex: 9999, display: 'flex',
          alignItems: 'center', gap: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          fontSize: 14, maxWidth: 420, width: '90%',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ flex: 1 }}>You'll be logged out in 2 minutes due to inactivity.</span>
          <button
            onClick={resetTimer}
            style={{
              background: '#2563eb', color: '#fff', border: 'none',
              borderRadius: 8, padding: '7px 16px', fontSize: 13,
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Stay logged in
          </button>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Admin fetch — adds X-Admin-Id header and always sends/receives JSON.
 */
export function adminFetch(path, options = {}) {
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const { body, headers: extraHeaders = {}, ...rest } = options;
  const isFormData = body instanceof FormData;

  const headers = {
    Accept: 'application/json',
    'X-Admin-Id': admin.id || '',
    ...(!isFormData && body !== undefined
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...extraHeaders,
  };

  return fetch(apiUrl(path), {
    ...rest,
    headers,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
}
