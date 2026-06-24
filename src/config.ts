// In production: route all API calls through Next.js proxy (/api/proxy/...)
// The proxy runs server-side, so the browser never makes cross-origin requests → no CORS.
// In development: hit the local backend directly.
const REAL_BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Detect whether we're running in browser on the production domain
const isProductionBrowser =
  typeof window !== 'undefined' &&
  !window.location.hostname.includes('localhost') &&
  !window.location.hostname.includes('127.0.0.1');

// In production browser context, use the same-origin proxy to avoid CORS.
// In dev (or server-side), use the real backend URL directly.
export const API_URL = isProductionBrowser
  ? '/api/proxy'   // same-origin → Next.js proxy → backend (no CORS)
  : REAL_BACKEND_URL;

// Image URLs always point to the real backend since <img> tags don't have CORS restrictions
// (images are fetched as resources, not API calls, so CORS doesn't apply)
export const ASSETS_URL = REAL_BACKEND_URL;

export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBase = ASSETS_URL.endsWith('/') ? ASSETS_URL.slice(0, -1) : ASSETS_URL;
  return `${cleanBase}/${cleanPath}`;
};

