/**
 * ============================================================================
 * 📁 Fichier : app/index.tsx
 * 📝 Description : Écran principal « Menu du jour » de l'espace client.
 * 🔒 Rôle : Reproduit la vue client mobile du web (`MobileClientView.jsx`) en
 *           natif. Assemble : navbar, hero, barre de filtres, pills de
 *           catégories et grille des plats. Toute la logique de données est
 *           déléguée aux hooks `useMenu` / `useCategories` — cet écran ne
 *           s'occupe que de l'UI et de l'état local (panier).
 * 💡 Auteur : Équipe Mobile
 * ----------------------------------------------------------------------------
 * 🧭 Parcours couvert par cette version :
 *    menu + filtres + ajout au panier (compteur local).
 *    Le checkout / suivi / profil arriveront dans de futurs écrans empilés.
 * ============================================================================
 */

import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryPills from '@/components/CategoryPills';
import DishCard from '@/components/DishCard';
import FilterBar from '@/components/FilterBar';
import ProfileModal from '@/components/ProfileModal';
import { Brand, FontSize, Radius, Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useClientProfile } from '@/hooks/useClientProfile';
import { useMenu } from '@/hooks/useMenu';
import type { Plat } from '@/types/menu';

export default function MenuScreen() {
  const { plats, isLoading, error, filters, setFilter, reload } = useMenu();
  const categories = useCategories();
  const { profile, saveProfile, logout } = useClientProfile();

  // État local de la modal profil
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // État local du panier (liste d'identifiants ajoutés).
  // TODO(checkout) : brancher sur un hook dédié + écran panier lors de la prochaine itération.
  const [cart, setCart] = useState<Plat[]>([]);

  // Noms de restaurants uniques, dérivés des plats chargés (alimente les chips du FilterBar).
  const restaurants = useMemo(() => {
    const names = plats.map((p) => p.restaurant?.name).filter((n): n is string => !!n);
    return [...new Set(names)].sort();
  }, [plats]);

  const handleAdd = (plat: Plat) => setCart((prev) => [...prev, plat]);

  /** En-tête de liste (hero + filtres + pills) — rendu au-dessus de la grille. */
  const ListHeader = (
    <View>
      {/* HERO */}
      <View style={styles.hero}>
        <Text style={styles.heroBadge}>Livraison partout à Ziguinchor</Text>
        <Text style={styles.heroTitle}>Les menus du jour{'\n'}à Ziguinchor.</Text>
        <Text style={styles.heroSubtitle}>
          Qui a cuisiné quoi, à quel prix, où le trouver.{'\n'}Publié du lundi au samedi à 10h30.
        </Text>
      </View>

      {/* BARRE DE FILTRES */}
      <View style={styles.section}>
        <FilterBar filters={filters} restaurants={restaurants} onFilterChange={setFilter} />
      </View>

      {/* PILLS CATÉGORIES */}
      <CategoryPills
        categories={categories}
        activeCategory={filters.moment || ''}
        onSelect={(c) => setFilter('moment', c)}
      />

      {/* Titre de section */}
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>Au menu aujourd&apos;hui</Text>
      </View>
    </View>
  );

  /** Rendu d'un état vide / erreur au centre de la grille. */
  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.stateWrap}>
          <ActivityIndicator size="large" color={Brand.primary} />
          <Text style={styles.stateText}>Chargement du menu…</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.stateWrap}>
          <Text style={styles.stateIcon}>📡</Text>
          <Text style={styles.stateTitle}>Impossible de charger le menu</Text>
          <Text style={styles.stateText}>{error}</Text>
          <Pressable onPress={reload} style={styles.retryButton}>
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.stateWrap}>
        <Text style={styles.stateIcon}>🍽️</Text>
        <Text style={styles.stateTitle}>Aucun plat trouvé avec ces filtres.</Text>
        <Text style={styles.stateText}>Essayez de modifier votre recherche.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* NAVBAR */}
      <View style={styles.navbar}>
        <View style={styles.navbarBrand}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoLetter}>L</Text>
          </View>
          <Text style={styles.brandText}>
            Lekk<Text style={styles.brandTextAccent}>Rek</Text>
          </Text>
        </View>

        {/* Actions de navigation : Profil / Connexion + Panier */}
        <View style={styles.navbarActions}>
          <Pressable
            onPress={() => setIsProfileModalOpen(true)}
            style={({ pressed }) => [
              styles.profileButton,
              profile?.phone ? styles.profileButtonActive : null,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={profile?.phone ? 'Mon profil' : 'Se connecter'}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.profileButtonText,
                profile?.phone ? styles.profileButtonTextActive : null,
              ]}
            >
              {profile?.phone
                ? `👋 ${profile.name ? profile.name.trim().split(' ')[0] : 'Client'}`
                : '👤 Connexion'}
            </Text>
          </Pressable>

          <Pressable style={styles.cartButton}>
            <Text style={styles.cartButtonText}>🛒 Panier</Text>
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* MODAL DE PROFIL / CONNEXION */}
      <ProfileModal
        visible={isProfileModalOpen}
        profile={profile}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={saveProfile}
        onLogout={logout}
      />

      {/* GRILLE DES PLATS */}
      <FlatList
        data={plats}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <DishCard plat={item} onAdd={handleAdd} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={Brand.primary} />}
        // Grille 1 colonne sur mobile (comme la vue mobile web).
        numColumns={1}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Brand.surfaceAlt,
  },

  /* ---------- NAVBAR ---------- */
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: Brand.surface,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  navbarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    color: '#ffffff',
    fontSize: FontSize.xl,
    fontWeight: '900',
  },
  brandText: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Brand.textDark,
    letterSpacing: -0.5,
  },
  brandTextAccent: {
    color: Brand.primary,
  },
  navbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    maxWidth: 120,
  },
  profileButtonActive: {
    backgroundColor: Brand.primaryLight,
    borderColor: '#FECACA',
  },
  profileButtonText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textDark,
  },
  profileButtonTextActive: {
    color: Brand.primary,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    backgroundColor: Brand.textDark,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  cartButtonText: {
    color: '#ffffff',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  cartBadge: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.pill,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: FontSize.xs,
    fontWeight: '900',
  },

  /* ---------- HERO ---------- */
  hero: {
    backgroundColor: Brand.primaryLight,
    padding: Spacing.four,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Brand.primary,
    color: '#ffffff',
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    marginBottom: Spacing.three,
  },
  heroTitle: {
    fontSize: FontSize.title,
    fontWeight: '900',
    color: Brand.textDark,
    lineHeight: 36,
    marginBottom: Spacing.two,
  },
  heroSubtitle: {
    fontSize: FontSize.sm,
    color: Brand.textMuted,
    lineHeight: 20,
  },

  /* ---------- SECTIONS ---------- */
  section: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  sectionTitleWrap: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Brand.textDark,
  },

  /* ---------- LISTE ---------- */
  listContent: {
    paddingBottom: Spacing.six,
  },

  /* ---------- ÉTATS VIDES / ERREUR ---------- */
  stateWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    gap: Spacing.two,
  },
  stateIcon: {
    fontSize: 48,
    marginBottom: Spacing.two,
  },
  stateTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Brand.textDark,
    textAlign: 'center',
  },
  stateText: {
    fontSize: FontSize.sm,
    color: Brand.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.three,
    backgroundColor: Brand.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Radius.md,
  },
  retryText: {
    color: '#ffffff',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
