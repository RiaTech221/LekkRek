/**
 * ============================================================================
 * 📁 Fichier : services/menuApi.ts
 * 📝 Description : Couche d'accès aux données « menu » de l'API LekkRek.
 * 🔒 Rôle : Centralise TOUS les appels HTTP liés au menu (liste, recherche,
 *           recommandations). Aucun `fetch()` dispersé dans les écrans/hooks :
 *           si l'API change, on ne modifie qu'ici.
 * 💡 Auteur : Équipe Mobile
 * ----------------------------------------------------------------------------
 * Toutes les fonctions sont async et lèvent une `ApiError` typée en cas
 * d'échec HTTP ou réseau, pour que les hooks puissent distinguer erreur/vide.
 * ============================================================================
 */

import { API_URL, API_PREFIX } from './config';
import type { Plat, MenuFilters } from '../types/menu';

/**
 * Erreur métier levée par la couche API.
 * Permet de transporter le statut HTTP et un message exploitable par l'UI.
 */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Construit la query string à partir des filtres actifs.
 * Ignore les champs vides/undefined pour ne pas envoyer `?keyword=&resto=…`.
 */
function buildQuery(filters: MenuFilters): string {
  const params = new URLSearchParams();
  if (filters.keyword) params.append('keyword', filters.keyword);
  if (filters.resto) params.append('resto', filters.resto);
  if (filters.budgetMax) params.append('budgetMax', filters.budgetMax);
  if (filters.quartier) params.append('quartier', filters.quartier);
  if (filters.moment) params.append('moment', filters.moment);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Récupère la liste des plats du jour, éventuellement filtrée.
 *
 * @param filters Filtres (recherche, restaurant, budget, quartier, moment).
 * @returns Liste de plats (peut être vide).
 * @throws ApiError en cas d'échec réseau ou HTTP.
 */
export async function fetchMenu(filters: MenuFilters = {}): Promise<Plat[]> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${API_PREFIX}/menu${buildQuery(filters)}`);
  } catch {
    // Pas de réseau / backend injoignable.
    throw new ApiError('Impossible de joindre le serveur.', 0);
  }

  if (!res.ok) {
    throw new ApiError(`Erreur serveur (${res.status}).`, res.status);
  }

  const data: unknown = await res.json();
  // Garde-fou : le backend renvoie une liste ; on s'assure du type avant d'exploiter.
  return Array.isArray(data) ? (data as Plat[]) : [];
}

/**
 * Récupère les plats recommandés pour un numéro (favoris) ou populaires (fallback).
 * Correspond à `GET /menu/recommendations?phone=…`.
 */
export async function fetchRecommendations(phone?: string): Promise<Plat[]> {
  const qs = phone ? `?phone=${encodeURIComponent(phone)}` : '';
  let res: Response;
  try {
    res = await fetch(`${API_URL}${API_PREFIX}/menu/recommendations${qs}`);
  } catch {
    throw new ApiError('Impossible de joindre le serveur.', 0);
  }

  if (!res.ok) {
    throw new ApiError(`Erreur serveur (${res.status}).`, res.status);
  }

  const data: unknown = await res.json();
  return Array.isArray(data) ? (data as Plat[]) : [];
}
