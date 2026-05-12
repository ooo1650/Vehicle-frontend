/**
 * api.js — single source of truth for backend URL.
 *
 * Dev:  Vite proxy rewrites /api/... → https://vhecial-backend.onrender.com/...
 *       so BASE stays '' and all fetch('/api/...') calls work as-is.
 *
 * Prod: No proxy exists. VITE_API_BASE_URL is injected at build time.
 *       apiUrl('/api/auth/login.php') → 'https://vhecial-backend.onrender.com/auth/login.php'
 */
const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * Converts a /api/... path to the full backend URL.
 * In dev (BASE='') it returns the path unchanged so the Vite proxy handles it.
 * In prod it strips /api and prepends the hosted backend URL.
 */
export function apiUrl(path) {
  if (!BASE) return path;                          // dev — proxy handles it
  return BASE + path.replace(/^\/api/, '');        // prod — full URL
}
