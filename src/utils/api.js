/**
 * api.js — single source of truth for backend URL.
 *
 * Dev:  Vite proxy rewrites /api/... → https://vhecial-backend.onrender.com/...
 *       so BASE stays '' and all fetch('/api/...') calls work as-is.
 *
 * Prod: VITE_API_BASE_URL is injected at build time via .env or Vercel env vars.
 *       Falls back to the hardcoded backend URL if the env var is missing.
 */
const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '' : 'https://vhecial-backend.onrender.com');

/**
 * Converts a /api/... path to the full backend URL.
 * In dev (BASE='') it returns the path unchanged so the Vite proxy handles it.
 * In prod it strips /api and prepends the hosted backend URL.
 */
export function apiUrl(path) {
  if (!BASE) return path;                      // dev — proxy handles it
  return BASE + path.replace(/^\/api/, '');    // prod — full URL
}
