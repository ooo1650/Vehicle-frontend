/**
 * api.js — central API utility.
 *
 * Dev:  Vite proxy rewrites /api/... → https://vhecial-backend.onrender.com/...
 *       BASE stays '' so fetch('/api/...') goes through the proxy unchanged.
 *
 * Prod: Falls back to the hardcoded backend URL when VITE_API_BASE_URL is not set.
 */
const BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '' : 'https://vhecial-backend.onrender.com');

/**
 * Resolves a /api/... path to the full backend URL.
 */
export function apiUrl(path) {
  if (!BASE) return path;                       // dev — proxy handles it
  return BASE + path.replace(/^\/api/, '');     // prod — full URL
}

/**
 * Central fetch wrapper — always sends and expects JSON.
 *
 * Usage:
 *   apiFetch('/api/auth/signin.php', { method: 'POST', body: { email, password } })
 *
 * - body is automatically JSON.stringify'd and Content-Type is set.
 * - Always includes Accept: application/json.
 * - For file uploads pass a FormData as body — headers are left alone.
 * - Returns the parsed JSON response.
 * - Throws an Error with the server's message on non-2xx or { success: false }.
 */
export async function apiFetch(path, options = {}) {
  const { body, headers: extraHeaders = {}, ...rest } = options;

  const isFormData = body instanceof FormData;

  const headers = {
    Accept: 'application/json',
    // Don't set Content-Type for FormData — browser sets it with the boundary
    ...(!isFormData && body !== undefined
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...extraHeaders,
  };

  const res = await fetch(apiUrl(path), {
    ...rest,
    headers,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Try to parse JSON even on error responses
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned non-JSON response (${res.status})`);
  }

  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  return data;
}
