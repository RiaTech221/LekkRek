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
  Alert,
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
import FloatingTrackingBanner from '@/components/FloatingTrackingBanner';
import ProfileModal from '@/components/ProfileModal';
import CartBottomSheet from '@/components/CartBottomSheet';
import { Brand, FontSize, Radius, Spacing } from '@/constants/theme';
import { useCategories } from '@/hooks/useCategories';
import { useClientProfile } from '@/hooks/useClientProfile';
import { useMenu } from '@/hooks/useMenu';
import type { Plat } from '@/types/menu';
import type { ActiveOrderInfo, OrderResponse, OrderTrackingStatus } from '@/types/order';

export default function MenuScreen() {
  const { plats, isLoading, error, filters, setFilter, reload } = useMenu();
  const categories = useCategories();
  const { profile, saveProfile, logout } = useClientProfile();

  // États des modals et tiroirs
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Commande active suivie via la bannière flottante (Option 1)
  const [activeOrder, setActiveOrder] = useState<ActiveOrderInfo | null>({
    orderNumber: 'CMD-849201',
    status: 'EN_PREPARATION',
    restaurantName: 'Le Régal de Ziguinchor',
    totalAmount: 7500,
  });

  // État local du panier (liste des plats ajoutés).
  const [cart, setCart] = useState<Plat[]>([]);

  // Noms de restaurants uniques, dérivés des plats chargés (alimente les chips du FilterBar).
  const restaurants = useMemo(() => {
    const names = plats.map((p) => p.restaurant?.name).filter((n): n is string => !!n);
    return [...new Set(names)].sort();
  }, [plats]);

  const handleAdd = (plat: Plat) => setCart((prev) => [...prev, plat]);
  const handleRemoveOne = (platId: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === platId);
      if (idx === -1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  };
  const handleRemoveAllOfDish = (platId: number) => {
    setCart((prev) => prev.filter((p) => p.id !== platId));
  };
  const handleClearCart = () => setCart([]);

  const handleOrderPlaced = (order: OrderResponse) => {
    setActiveOrder({
      orderNumber: order.orderNumber,
      status: (order.status as OrderTrackingStatus) || 'EN_PREPARATION',
      restaurantName: order.restaurantName,
      totalAmount: order.totalAmount,
    });
  };

  const handlePressTracking = () => {
    if (!activeOrder) return;
    Alert.alert(
      '🛵 Suivi de commande',
      `Commande #${activeOrder.orderNumber}\nRestaurant : ${activeOrder.restaurantName || 'Partenaire'}\nStatut : En cours de préparation`,
      [{ text: "D'accord", style: 'default' }]
    );
  };

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

          {/* Bouton Panier compact : icône + badge flottant */}
          <Pressable
            onPress={() => setIsCartOpen(true)}
            style={({ pressed }) => [
              styles.cartButton,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Panier, ${cart.length} article${cart.length > 1 ? 's' : ''}`}
          >
            <Text style={styles.cartIcon}>🛒</Text>
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cart.length > 99 ? '99+' : cart.length}</Text>
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

      {/* BOTTOM SHEET DU PANIER / CHECKOUT */}
      <CartBottomSheet
        visible={isCartOpen}
        cart={cart}
        profile={profile}
        onClose={() => setIsCartOpen(false)}
        onAddItem={handleAdd}
        onRemoveOne={handleRemoveOne}
        onRemoveAllOfDish={handleRemoveAllOfDish}
        onClearCart={handleClearCart}
        onUpdateProfile={saveProfile}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* GRILLE DES PLATS */}
      <FlatList
        data={plats}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <DishCard plat={item} onAdd={handleAdd} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, activeOrder ? styles.listContentWithBanner : null]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={Brand.primary} />}
        // Grille 1 colonne sur mobile (comme la vue mobile web).
        numColumns={1}
      />

      {/* BANNIÈRE FLOTTANTE DE SUIVI (OPTION 1) */}
      {activeOrder && (
        <FloatingTrackingBanner
          orderNumber={activeOrder.orderNumber}
          status={activeOrder.status}
          restaurantName={activeOrder.restaurantName}
          onPress={handlePressTracking}
          onDismiss={() => setActiveOrder(null)}
        />
      )}
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
    justifyContent: 'center',
    height: 38,
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    paddingHorizontal: Spacing.two + Spacing.half,
    borderRadius: Radius.pill,
    maxWidth: 130,
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
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Brand.textDark,
    borderRadius: Radius.pill,
    position: 'relative',
  },
  cartIcon: {
    fontSize: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: Brand.primary,
    borderRadius: Radius.pill,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: Brand.surface,
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 9,
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
  listContentWithBanner: {
    paddingBottom: 110,
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
