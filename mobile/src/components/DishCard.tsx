/**
 * ============================================================================
 * 📁 Fichier : components/DishCard.tsx
 * 📝 Description : Carte affichant un plat du jour dans la grille du menu.
 * 🔒 Rôle : Composant UI PUR (sans état global, sans appel API). Reproduit le
 *           rendu de `DishCard.jsx` du frontend web : image + badge de statut,
 *           nom du restaurant, nom du plat, description tronquée, prix et
 *           bouton d'ajout au panier.
 * 💡 Auteur : Équipe Mobile
 * ----------------------------------------------------------------------------
 * 🎨 Design : aligné sur la carte web (arrondi xl, ombres douces, badge pill).
 * 🔌 Props  : `plat` (données) + `onAdd` (callback appelé au tap sur « + »).
 *             Le panier lui-même est géré par l'écran parent (pas de state ici).
 * ============================================================================
 */

import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatImageUrl } from '../services/config';
import { Brand, FontSize, Radius, Spacing } from '../constants/theme';
import type { Plat } from '../types/menu';

/** Image de repli si le plat n'a pas de photo (reprend le fallback web). */
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800';

interface DishCardProps {
  plat: Plat;
  onAdd: (plat: Plat) => void;
}

export default function DishCard({ plat, onAdd }: DishCardProps) {
  const isAvailable = plat.status === 'DISPO';
  const imageUri = formatImageUrl(plat.image) || FALLBACK_IMAGE;

  return (
    <View style={styles.card}>
      {/* Zone image + badge statut */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" transition={200} />
        <View style={[styles.badge, isAvailable ? styles.badgeAvailable : styles.badgeDepleted]}>
          <Text style={[styles.badgeText, isAvailable ? styles.badgeTextAvailable : styles.badgeTextDepleted]}>
            {isAvailable ? 'Disponible' : 'Épuisé'}
          </Text>
        </View>
      </View>

      {/* Contenu texte */}
      <View style={styles.content}>
        <View style={styles.restoRow}>
          <Text style={styles.restoIcon}>🏪</Text>
          <Text style={styles.restoName} numberOfLines={1}>
            {plat.restaurant?.name || 'Restaurant Partenaire'}
          </Text>
        </View>

        <Text style={styles.name} numberOfLines={1}>
          {plat.name}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {plat.description || 'Un délicieux plat préparé avec soin.'}
        </Text>

        {/* Prix + bouton d'ajout */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Prix</Text>
            <Text style={styles.price}>
              {plat.price.toLocaleString('fr-FR')} <Text style={styles.currency}>FCFA</Text>
            </Text>
          </View>

          <Pressable
            onPress={() => onAdd(plat)}
            disabled={!isAvailable}
            accessibilityRole="button"
            accessibilityLabel={isAvailable ? `Ajouter ${plat.name} au panier` : `${plat.name} épuisé`}
            style={({ pressed }) => [
              styles.addButton,
              !isAvailable && styles.addButtonDisabled,
              pressed && isAvailable && styles.addButtonPressed,
            ]}>
            <Text style={[styles.addButtonText, !isAvailable && styles.addButtonTextDisabled]}>
              {isAvailable ? '+' : '—'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Brand.border,
    overflow: 'hidden',
    marginBottom: Spacing.four,
    // Ombre douce (équivalent Tailwind shadow-sm, relevée pour Android).
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  imageWrap: {
    height: 180,
    backgroundColor: Brand.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  badgeAvailable: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  badgeDepleted: {
    backgroundColor: 'rgba(220,38,38,0.9)',
  },
  badgeText: {
    fontSize: FontSize.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeTextAvailable: {
    color: Brand.success,
  },
  badgeTextDepleted: {
    color: '#ffffff',
  },
  content: {
    padding: Spacing.four,
  },
  restoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  restoIcon: {
    fontSize: FontSize.sm,
  },
  restoName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Brand.textMuted,
    flexShrink: 1,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Brand.textDark,
    marginBottom: Spacing.one,
  },
  description: {
    fontSize: FontSize.sm,
    color: Brand.textMuted,
    marginBottom: Spacing.three,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    paddingTop: Spacing.three,
  },
  priceLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  price: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Brand.textDark,
  },
  currency: {
    fontSize: FontSize.base,
    fontWeight: '700',
    color: Brand.textMuted,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    backgroundColor: Brand.textDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    backgroundColor: Brand.border,
  },
  addButtonPressed: {
    backgroundColor: Brand.primary,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: FontSize.xxl,
    fontWeight: '300',
    lineHeight: 30,
  },
  addButtonTextDisabled: {
    color: Brand.textLight,
  },
});
