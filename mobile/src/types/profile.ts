/**
 * ============================================================================
 * 📁 Fichier : types/profile.ts
 * 📝 Description : Types TypeScript pour le profil client mobile LekkRek.
 * 🔒 Rôle : Contrat de données pour l'identité client (nom, téléphone, adresse).
 *           Miroir du format stocké dans `localStorage` / `AsyncStorage`.
 * 💡 Auteur : Équipe Mobile
 * ============================================================================
 */

export interface ClientProfile {
  name?: string;
  phone: string;
  address?: string;
}
