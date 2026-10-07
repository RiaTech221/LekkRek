/**
 * Configuration globale de l'API LekkRek.
 * Utilise VITE_API_URL si définie, sinon bascule dynamiquement sur l'hôte courant sur le port 8080.
 */
export const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname ? `${window.location.protocol}//${window.location.hostname}:8080` : 'http://localhost:8080');

/**
 * Normalise l'URL d'une image pour remplacer localhost ou une IP fixe par l'adresse configurée de l'API (VITE_API_URL).
 * Gère également les chemins relatifs (/uploads/...).
 */
export const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${API_URL}${cleanPath}`;
  }
  if (url.startsWith('http://localhost:8080') || url.startsWith('http://192.168.1.6:8080')) {
    return url.replace(/^http:\/\/(localhost|192\.168\.1\.6):8080/, API_URL);
  }
  return url;
};
