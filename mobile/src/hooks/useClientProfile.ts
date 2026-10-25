/**
 * ============================================================================
 * 📁 Fichier : hooks/useClientProfile.ts
 * 📝 Description : Hook de gestion de l'identité et de la session client mobile.
 * 🔒 Rôle : Persistance du profil (nom, téléphone, adresse) via AsyncStorage,
 *           avec la même clé que le web (`lekkrek_client_profile`).
 * 💡 Auteur : Équipe Mobile
 * ============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ClientProfile } from '@/types/profile';

export const CLIENT_PROFILE_STORAGE_KEY = 'lekkrek_client_profile';

/**
 * Valide un numéro de téléphone mobile au Sénégal (9 chiffres, préfixes autorisés 70, 75, 76, 77, 78).
 */
export function validateSenegalPhone(phone: string): boolean {
  const clean = (phone || '').replace(/\D/g, '');
  return /^(70|75|76|77|78)\d{7}$/.test(clean);
}

/**
 * Normalise le numéro pour enlever tout caractère non numérique.
 */
export function normalizeSenegalPhone(phone: string): string {
  return (phone || '').replace(/\D/g, '').slice(0, 9);
}

export function useClientProfile() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charge le profil sauvegardé au montage
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const raw = await AsyncStorage.getItem(CLIENT_PROFILE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ClientProfile;
        if (parsed && parsed.phone) {
          setProfile(parsed);
          return;
        }
      }
      setProfile(null);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadProfile]);

  /**
   * Sauvegarde ou met à jour les informations du profil.
   */
  const saveProfile = useCallback(async (name: string, phone: string, address?: string) => {
    const cleanPhone = normalizeSenegalPhone(phone);
    if (!validateSenegalPhone(cleanPhone)) {
      throw new Error('Numéro de téléphone sénégalais invalide (ex: 77 123 45 67).');
    }

    const newProfile: ClientProfile = {
      name: name.trim(),
      phone: cleanPhone,
      address: address?.trim() || profile?.address || '',
    };

    await AsyncStorage.setItem(CLIENT_PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
    setProfile(newProfile);
    return newProfile;
  }, [profile]);

  /**
   * Déconnexion : supprime le profil stocké et réinitialise l'état local.
   */
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(CLIENT_PROFILE_STORAGE_KEY);
    setProfile(null);
  }, []);

  return {
    profile,
    isLoading,
    saveProfile,
    logout,
    reloadProfile: loadProfile,
  };
}
