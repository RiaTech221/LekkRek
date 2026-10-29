/**
 * ============================================================================
 * 📁 Fichier : components/FloatingTrackingBanner.tsx
 * 📝 Description : Bannière flottante contextuelle de suivi de commande (Option 1).
 * 🔒 Rôle : Apparaît discrètement au-dessus du bas de l'écran (façon Uber Eats / Glovo)
 *           lorsqu'une commande est active. Affiche le statut en temps réel,
 *           le numéro de commande, le nom du restaurant et un bouton d'action tactile.
 * 💡 Auteur : Équipe Mobile
 * ============================================================================
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, FontSize, Radius, Spacing } from '@/constants/theme';

export interface FloatingTrackingBannerProps {
  /** Numéro de la commande suivie (ex: 'CMD-849201'). */
  orderNumber: string;
  /** Statut actuel de la commande. */
  status?: 'NOUVELLE' | 'EN_PREPARATION' | 'PRETE' | 'LIVREE' | 'ANNULEE' | string;
  /** Nom du restaurant préparateur. */
  restaurantName?: string;
  /** Action au clic sur la bannière (ouvre l'écran / modal de suivi détaillé). */
  onPress?: () => void;
  /** Action pour fermer ou masquer temporairement la bannière. */
  onDismiss?: () => void;
  /** Permet de masquer ou d'afficher la bannière. */
  visible?: boolean;
}

/** Configuration visuelle par statut de commande. */
const STATUS_CONFIG: Record<string, { label: string; icon: string; dotColor: string }> = {
  NOUVELLE: {
    label: 'Commande transmise',
    icon: '⏳',
    dotColor: '#F59E0B', // Amber
  },
  EN_PREPARATION: {
    label: 'En préparation...',
    icon: '🍳',
    dotColor: '#3B82F6', // Blue
  },
  PRETE: {
    label: 'Prête • Livreur en route',
    icon: '🛵',
    dotColor: '#10B981', // Green
  },
  LIVREE: {
    label: 'Commande livrée',
    icon: '✅',
    dotColor: '#10B981',
  },
  ANNULEE: {
    label: 'Commande annulée',
    icon: '❌',
    dotColor: '#EF4444', // Red
  },
};

export default function FloatingTrackingBanner({
  orderNumber,
  status = 'EN_PREPARATION',
  restaurantName,
  onPress,
  onDismiss,
  visible = true,
}: FloatingTrackingBannerProps) {
  const insets = useSafeAreaInsets();

  if (!visible || !orderNumber) return null;

  const currentStatus = STATUS_CONFIG[status] || {
    label: 'Commande en cours',
    icon: '🛵',
    dotColor: '#10B981',
  };

  return (
    <View
      style={[
        styles.wrapper,
        {
          bottom: Math.max(insets.bottom, Spacing.two) + Spacing.two,
        },
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Suivi de la commande ${orderNumber}. Statut : ${currentStatus.label}`}
        style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      >
        {/* Icône avec pastille d'activité pulsante */}
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{currentStatus.icon}</Text>
          <View style={[styles.statusDot, { backgroundColor: currentStatus.dotColor }]} />
        </View>

        {/* Détails textuels */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.statusLabel} numberOfLines={1}>
              {currentStatus.label}
            </Text>
          </View>
          <Text style={styles.metaText} numberOfLines={1}>
            #{orderNumber}
            {restaurantName ? ` • ${restaurantName}` : ''}
          </Text>
        </View>

        {/* Bouton d'action / Pastille "Suivre" */}
        <View style={styles.actionPill}>
          <Text style={styles.actionPillText}>Suivre</Text>
          <Text style={styles.actionChevron}>›</Text>
        </View>

        {/* Bouton de clôture uniquement quand la commande est terminée (livrée ou annulée) */}
        {onDismiss && (status === 'LIVREE' || status === 'ANNULEE') && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Fermer le suivi de commande"
            style={({ pressed }) => [styles.dismissButton, pressed && styles.dismissButtonPressed]}
          >
            <Text style={styles.dismissButtonText}>✕</Text>
          </Pressable>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    zIndex: 99,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.textDark, // #111827 : contraste fort et premium
    paddingVertical: Spacing.two + Spacing.one,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    // Ombre profonde portée vers le bas
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  iconContainer: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  iconText: {
    fontSize: 22,
  },
  statusDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Brand.textDark,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginRight: Spacing.two,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: 2,
  },
  statusLabel: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Brand.textLight, // #9CA3AF
    fontWeight: '500',
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.primary, // Rouge LekkRek
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + Spacing.half,
    borderRadius: Radius.pill,
    gap: 3,
  },
  actionPillText: {
    color: '#FFFFFF',
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  actionChevron: {
    color: '#FFFFFF',
    fontSize: FontSize.base,
    fontWeight: '800',
    lineHeight: 16,
  },
  dismissButton: {
    marginLeft: Spacing.two,
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dismissButtonText: {
    color: Brand.textLight,
    fontSize: 10,
    fontWeight: '700',
  },
});
