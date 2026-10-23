/**
 * ============================================================================
 * 📁 Fichier : types/menu.ts
 * 📝 Description : Types TypeScript du domaine « menu » pour l'app mobile LekkRek.
 * 🔒 Rôle : Contrat de données partagé entre la couche API, les hooks et les
 *           composants. Ces types miroient les entités JPA du backend Spring Boot
 *           (Plat.java / Restaurant.java) serialisées en JSON.
 * 💡 Auteur : Équipe Mobile
 * ----------------------------------------------------------------------------
 * ⚠️ Note : Si le backend ajoute/renomme un champ, le mettre à jour ICI en priorité.
 *           TypeScript attrapera automatiquement toute incohérence de consommation.
 * ============================================================================
 */

/**
 * Statut de disponibilité d'un plat.
 * Correspond à l'énum Java `Plat.DishStatus`.
 */
export type DishStatus = 'DISPO' | 'EPUISE';

/**
 * Restaurant partenaire attaché à un plat.
 * Sous-ensemble des champs de l'entité Java `Restaurant` exposés au public.
 */
export interface Restaurant {
  id: number;
  name: string;
  location: string;
  image?: string | null;
  telephone?: string | null;
}

/**
 * Plat du jour.
 * Tous les champs optionnels (?) viennent du fait que le backend peut renvoyer
 * `null` (ex: image absente, description non remplie).
 */
export interface Plat {
  id: number;
  name: string;
  description?: string | null;
  /** Prix en FCFA. Backend : BigDecimal → JSON number. */
  price: number;
  image?: string | null;
  status: DishStatus;
  /** Moment de la journée : 'dejeuner', 'diner', 'gouter', 'boisson'… (libre). */
  moment?: string | null;
  restaurant?: Restaurant | null;
}

/**
 * Filtres appliqués à la liste des plats.
 * Les champs correspondent 1:1 aux `@RequestParam` du backend `MenuController.searchPlats`.
 * Une valeur `''` (vide) ou `undefined` signifie « filtre inactif ».
 */
export interface MenuFilters {
  keyword?: string;
  resto?: string;
  budgetMax?: string;
  quartier?: string;
  moment?: string;
}
