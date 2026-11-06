/**
 * ============================================================================
 * 📁 Fichier : hooks/useCategories.ts
 * 📝 Description : Hook de chargement des catégories (moments) du menu.
 * 🔒 Rôle : Reproduit le comportement web où la liste des catégories est dérivée
 *           du menu COMPLET (non filtré), pour que les pills de filtre ne
 *           disparaissent jamais quand on affine une recherche.
 * 💡 Auteur : Équipe Mobile
 * ----------------------------------------------------------------------------
 * Le web gardait aussi un cache localStorage des catégories en cas d'échec
 * réseau. Ici on garde simplement l'état en mémoire : le menu du jour est
 * rechargé à chaque ouverture d'app de toute façon.
 * ============================================================================
 */

import { useEffect, useState } from 'react';

import { fetchMenu } from '../services/menuApi';

/**
 * Extrait et trie les catégories (champ `moment`) d'une liste de plats.
 * Filtre les valeurs null/undefined/vides et supprime les doublons.
 *
 * @param moments Liste brute des champs `moment`.
 * @returns Liste de chaînes triées par ordre alphabétique.
 */
export function extractCategories(moments: (string | null | undefined)[]): string[] {
  return [...new Set(moments.filter((m): m is string => !!m && m.trim() !== ''))].sort();
}

/**
 * Hook retournant la liste triée des catégories disponibles.
 */
export function useCategories(): string[] {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetchMenu()
      .then((allPlats) => {
        if (cancelled) return;
        setCategories(extractCategories(allPlats.map((p) => p.moment)));
      })
      .catch(() => {
        // En cas d'erreur on laisse la liste vide : les pills se masquent proprement.
        if (!cancelled) setCategories([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return categories;
}
