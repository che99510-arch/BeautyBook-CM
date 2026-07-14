// Central API base URL — reads from env or falls back to current host
// Works on localhost AND when accessed from other devices on the network (192.168.x.x)

const getApiBase = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:8000/api`;
  }
  return 'http://localhost:8000/api';
};

export const API_BASE = getApiBase();

// For media files (images, videos) — same host, no /api suffix
export const MEDIA_BASE = API_BASE.replace('/api', '');

export default API_BASE;
