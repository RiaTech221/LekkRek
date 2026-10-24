/**
 * ============================================================================
 * 📁 Fichier : services/config.ts
 * 📝 Description : Configuration centralisée de l'URL de l'API backend LekkRek.
 * 🔒 Rôle : Point UNIQUE où l'adresse du backend est résolue. Toute la couche
 *           API passe par `API_URL` — plus jamais d'IP en dur dans les écrans.
 * 💡 Auteur : Équipe Mobile
 * ----------------------------------------------------------------------------
 * 🔧 Comment changer l'URL en dev/prod :
 *    - Dev  : valeur par défaut ci-dessous (localhost = simulateur iOS uniquement).
 *    - Prod : définir `expo.extra.apiBaseUrl` dans app.json (ou app.config.js),
 *             idéalement piloté par variable d'environnement au build EAS.
 * ============================================================================
 */

import Constants from 'expo-constants';

/**
 * 🐛 BUG (corrigé) : l'ancienne coque WebView hardcodait `http://192.168.1.6:5173/mobile`.
 *    Cette IP LAN était inutilisable hors du poste du dev. On externalise donc
 *    la config via `expo-constants`.
 *
 * ⚠️ IMPORTANT — Physique vs simulateur :
 *    - `localhost` fonctionne UNIQUEMENT sur le simulateur iOS (et web).
 *    - Sur un téléphone réel (Android/iOS physique), `localhost` pointe vers LE
 *      téléphone, pas vers votre machine → il faut l'IP LAN de votre machine
 *      (ex: `http://192.168.1.10:8080`). Renseignez-la dans `extra.apiBaseUrl`.
 */
const DEV_FALLBACK_URL = 'http://localhost:8080';

/** Base URL du backend Spring Boot (port 8080). */
export const API_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ?? DEV_FALLBACK_URL;

/**
 * Préfixe des endpoints publics côté backend (`MenuController`, etc.).
 * Le backend expose tout sous `/api/v1/public`.
 */
export const API_PREFIX = '/api/v1/public';

/**
 * Normalise une URL d'image renvoyée par le backend.
 * Le backend stocke parfois des chemins relatifs (`/uploads/xxx.jpg`) ou des URLs
 * pointant vers une IP de dev. On les re-réécrit vers `API_URL` courant.
 *
 * @param url URL brute venant de l'API (peut être null/undefined/vide).
 * @returns URL absolue utilisable par `expo-image`, ou '' si absente.
 */
export function formatImageUrl(url?: string | null): string {
  if (!url) return '';

  // Chemin relatif vers les fichiers uploadés.
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${API_URL}${cleanPath}`;
  }

  // URL complète pointant vers une ancienne IP de dev → réécriture vers l'API actuelle.
  if (/^https?:\/\/(localhost|192\.168\.\d+\.\d+):\d+/.test(url)) {
    return url.replace(/^https?:\/\/(localhost|192\.168\.\d+\.\d+):\d+/, API_URL);
  }

  return url;
}
