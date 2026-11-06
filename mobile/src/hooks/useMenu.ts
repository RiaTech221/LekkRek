/**
 * ============================================================================
 * 📁 Fichier : hooks/useMenu.ts
 * 📝 Description : Hook de gestion de l'état du menu (chargement + filtres).
 * 🔒 Rôle : Encapsule la logique « charger les plats quand les filtres changent »,
 *           le debounce de la recherche et la gestion loading/erreur. Les écrans
 *           consomment ce hook et n'ont qu'à rendre l'UI.
 * 💡 Auteur : Équipe Mobile
 * ----------------------------------------------------------------------------
 * 🔄 Comportement reproduit du web (MobileClientView.jsx) :
 *    - Rechargement à chaque changement de filtre.
 *    - Seul le champ RECHERCHE est DEBOUNCÉ (600ms) ; les autres filtres
 *      (restaurant, budget, quartier, catégorie) sont appliqués immédiatement.
 *
 * 🧹 Points de conformité React Compiler (lint) :
 *    - Aucun `setState` SYNCHRONE dans le corps de l'effect : tout passe par un
 *      `setTimeout` (frontière asynchrone) puis par les callbacks du fetch.
 *    - Aucune ref écrite pendant le render.
 *    - UN SEUL effet (pas d'effet « immédiat » + effet « debounce » qui
 *      auraient causé un double fetch sur la recherche).
 * ============================================================================
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchMenu } from '../services/menuApi';
import type { Plat, MenuFilters } from '../types/menu';

/** Délai (ms) avant de déclencher la recherche après la dernière frappe. */
const SEARCH_DEBOUNCE_MS = 600;

/**
 * État exposé par le hook.
 */
export interface UseMenuResult {
  plats: Plat[];
  isLoading: boolean;
  /** Message d'erreur réseau/serveur à afficher (null si tout va bien). */
  error: string | null;
  /** Filtres actuellement appliqués. */
  filters: MenuFilters;
  /** Met à jour un filtre ; déclenche un rechargement (debouncé si `keyword`). */
  setFilter: <K extends keyof MenuFilters>(key: K, value: MenuFilters[K]) => void;
  /** Réinitialise tous les filtres et recharge la liste complète. */
  resetFilters: () => void;
  /** Recharge manuellement (pull-to-refresh / bouton réessayer). */
  reload: () => void;
}

/**
 * Hook principal du menu.
 */
export function useMenu(): UseMenuResult {
  const [plats, setPlats] = useState<Plat[]>([]);
  // `true` au montage → spinner affiché dès le premier rendu.
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MenuFilters>({});

  // Compteur de requêtes : on ignore le résultat des requêtes OBSOLÈTES
  // (race condition si l'utilisateur change de filtre rapidement).
  // Muté uniquement dans les callbacks (jamais pendant le render) → conforme.
  const requestIdRef = useRef(0);

  /**
   * Déclenche le chargement des plats pour un jeu de filtres donné.
   * Tout `setState` se trouve APRÈS le `await` (contexte asynchrone).
   */
  const load = useCallback(async (activeFilters: MenuFilters): Promise<void> => {
    const id = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchMenu(activeFilters);
      // On n'applique le résultat que s'il s'agit de la DERNIÈRE requête lancée.
      if (id === requestIdRef.current) {
        setPlats(result);
        setIsLoading(false);
      }
    } catch (e) {
      if (id === requestIdRef.current) {
        setPlats([]);
        setError(e instanceof Error ? e.message : 'Erreur inattendue.');
        setIsLoading(false);
      }
    }
  }, []);

  // EFFET UNIQUE : à chaque changement de filtre, on programme le chargement.
  // - Si un filtre de recherche est saisi → délai de 600ms (debounce) et on
  //   annule le précédent programme (clearTimeout) à chaque nouvelle frappe.
  // - Sinon → délai de 0ms (application quasi immédiate).
  // Le `setState` interne à `load` n'est jamais synchrone ici : il passe par le
  // timer puis par les callbacks du fetch.
  useEffect(() => {
    const delay = filters.keyword ? SEARCH_DEBOUNCE_MS : 0;
    const timer = setTimeout(() => {
      void load(filters);
    }, delay);
    return () => clearTimeout(timer);
  }, [filters, load]);

  const setFilter = useCallback(
    <K extends keyof MenuFilters>(key: K, value: MenuFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Handler déclenché par l'UI (pull-to-refresh / bouton) → setState autorisé.
  const reload = useCallback(() => {
    setIsLoading(true);
    void load(filters);
  }, [load, filters]);

  return { plats, isLoading, error, filters, setFilter, resetFilters, reload };
}
