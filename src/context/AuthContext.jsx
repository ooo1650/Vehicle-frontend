import { createContext, useContext, useState } from 'react';
import { apiUrl, apiFetch } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

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
    <AuthContext.Provider value={{ login, logout, loading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Admin fetch — adds X-Admin-Id header and always sends/receives JSON.
 * For file uploads pass a FormData as body.
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
