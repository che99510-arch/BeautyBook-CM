// Central API base URL — reads from env or falls back to current host
// Works on localhost AND when accessed from other devices on the network (192.168.x.x)

const getApiBase = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    // Only append :8000 on localhost / LAN — never on a production domain
    if (hostname === 'localhost' || hostname === '127.0.0.1' || /^192\.168\./.test(hostname)) {
      return `${protocol}//${hostname}:8000/api`;
    }
  }
  return 'http://localhost:8000/api';
};

export const API_BASE = getApiBase();

// For media files (images, videos) — strip /api suffix to get root domain
export const MEDIA_BASE = API_BASE.replace(/\/api$/, '');

/**
 * Converts a relative media path from the backend into a full URL.
 * e.g. "/media/salon_images/photo.jpg" → "https://beautybook-cm-api.onrender.com/media/salon_images/photo.jpg"
 */
export function buildMediaUrl(path: string | null | undefined, fallback = ''): string {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/media/')) return `${MEDIA_BASE}${path}`;
  return `${MEDIA_BASE}/media/${path}`;
}

export default API_BASE;
