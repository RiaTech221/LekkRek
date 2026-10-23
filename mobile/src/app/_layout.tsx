/**
 * ============================================================================
 * 📁 Fichier : app/_layout.tsx
 * 📝 Description : Layout racine de l'app (point d'entrée du routing Expo Router).
 * 🔒 Rôle : Définit le navigateur racine. On utilise un **Stack** (pile) et non
 *           les onglets du template : l'espace client LekkRek est une page
 *           unique qui scrolle (menu du jour), pas une app multi-onglets.
 *           Les futures écrans (panier, suivi, profil) s'empileront ici.
 * 💡 Auteur : Équipe Mobile
 * ----------------------------------------------------------------------------
 * 🔧 Simplification : le template embarquait `NativeTabs` (Home/Explore), sans
 *    rapport avec LekkRek. Remplacé par un Stack + header masqué (chaque écran
 *    gère sa propre barre de navigation pour coller au design web).
 * ============================================================================
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {/* Header natif masqué : nos écrans possèdent leur propre navbar (reproduit le web). */}
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Brand.surfaceAlt } }}>
        <Stack.Screen name="index" />
      </Stack>
    </SafeAreaProvider>
  );
}
