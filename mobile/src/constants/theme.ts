/**
 * ============================================================================
 * 📁 Fichier : constants/theme.ts
 * 📝 Description : Design system centralisé de l'app mobile LekkRek.
 * 🔒 Rôle : Définit les couleurs, espacements, rayons et typographies utilisés
 *           partout dans l'app. C'est LA source de vérité du design : pour
 *           reproduire fidèlement le frontend web (Tailwind), on translate les
 *           classes Tailwind en tokens d'ici plutôt que de les recopier en dur
 *           dans chaque écran.
 * 💡 Auteur : Équipe Mobile
 * ----------------------------------------------------------------------------
 * 🎨 Palette : reprend les valeurs du frontend web (Tailwind red-600 = #dc2626,
 *              gray-900 = #111827, etc.) pour un rendu visuel identique.
 * ⚠️ Si le web change sa charte, on met à jour UNIQUEMENT ce fichier.
 * ============================================================================
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * Thème couleur (clair / sombre).
 * Les clés `text`, `background`, `backgroundElement`, `backgroundSelected`,
 * `textSecondary` sont utilisées par les composants du template (themed-text,
 * themed-view) — on les garde pour ne pas les casser, en les re-teintant LekkRek.
 */
export const Colors = {
  light: {
    text: '#111827', // gray-900
    background: '#ffffff',
    backgroundElement: '#F3F4F6', // gray-100
    backgroundSelected: '#E5E7EB', // gray-200
    textSecondary: '#6B7280', // gray-500
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#1F2937', // gray-800
    backgroundSelected: '#374151', // gray-700
    textSecondary: '#9CA3AF', // gray-400
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Tokens de marque LekkRek.
 * Regroupe la palette « produit » (rouge primaire, états, surfaces) utilisée par
 * les écrans client. Distinct de `Colors` (thème générique clair/sombre du template).
 */
export const Brand = {
  /** Rouge primaire — boutons, prix, accents (Tailwind red-600). */
  primary: '#dc2626',
  primaryDark: '#b91c1c', // red-700 (hover/pressé)
  primaryLight: '#fef2f2', // red-50 (fonds doux)

  /** Textes. */
  textDark: '#111827', // gray-900
  textMuted: '#6B7280', // gray-500
  textLight: '#9CA3AF', // gray-400

  /** Surfaces & bordures. */
  surface: '#ffffff',
  surfaceAlt: '#F9FAFB', // gray-50 (fond d'écran)
  border: '#F3F4F6', // gray-100
  borderStrong: '#E5E7EB', // gray-200

  /** Statuts plat. */
  success: '#16a34a', // green-600 (Disponible)
  danger: '#dc2626', // red-600 (Épuisé)
} as const;

/**
 * Espacements (échelle reprend Tailwind : 4px par unité de base).
 */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/**
 * Rayons de bordure (arrondis).
 */
export const Radius = {
  md: 12,
  lg: 16,
  xl: 24, // rounded-3xl des cartes web
  pill: 999,
} as const;

/**
 * Tailles de typographie (approximation des échelles Tailwind).
 */
export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  title: 30,
} as const;

/** Police système par plateforme (export du template, conservé). */
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
