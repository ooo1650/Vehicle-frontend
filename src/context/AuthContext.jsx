import { createContext, useContext, useState } from 'react';
import { apiUrl } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Called when admin submits the login form
  async function login(username, password) {
    setLoading(true);
    setError(null);

    const response = await fetch(apiUrl('/api/admin/login.php'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!data.success) {
      setError(data.message || 'Login failed');
      throw new Error(data.message);
    }

    // Save admin info to localStorage (includes id and username)
    localStorage.setItem('admin', JSON.stringify(data.admin));
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
 * Helper for admin API calls — automatically adds X-Admin-Id header.
 * Usage: adminFetch(apiUrl('/api/admin/dashboard.php'))
 */
export function adminFetch(url, options = {}) {
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Id': admin.id || '',
      ...(options.headers || {}),
    },
  });
}
