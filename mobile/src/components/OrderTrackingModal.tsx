/**
 * ============================================================================
 * 📁 Fichier : components/OrderTrackingModal.tsx
 * 📝 Description : Modal de suivi de commande « Zéro saisie » pour mobile.
 * 🔒 Rôle : Affiche directement la progression en temps réel (timeline) de la
 *           commande active sans rien forcer à copier/coller. Permet aussi
 *           de consulter les commandes récentes ou de rechercher un autre numéro.
 * 💡 Auteur : Équipe Mobile
 * ============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { Brand, FontSize, Radius, Spacing } from '@/constants/theme';
import { trackOrder } from '@/services/orderApi';
import type { ActiveOrderInfo, OrderTrackingDTO, OrderTrackingStatus } from '@/types/order';

interface OrderTrackingModalProps {
  visible: boolean;
  orderNumber?: string | null;
  recentOrders?: ActiveOrderInfo[];
  onClose: () => void;
  onOrderUpdated?: (order: ActiveOrderInfo) => void;
}

const STEPS: { status: OrderTrackingStatus; label: string; icon: string; desc: string }[] = [
  {
    status: 'NOUVELLE',
    label: 'Transmise',
    icon: '⏳',
    desc: 'Commande enregistrée par le restaurant.',
  },
  {
    status: 'EN_PREPARATION',
    label: 'En cuisine',
    icon: '🍳',
    desc: 'Le chef prépare vos délicieux plats.',
  },
  {
    status: 'PRETE',
    label: 'Livreur en route',
    icon: '🛵',
    desc: 'La commande est prête pour la livraison ou le retrait.',
  },
  {
    status: 'LIVREE',
    label: 'Livrée',
    icon: '✅',
    desc: 'Bon appétit ! Commande réceptionnée.',
  },
];

function getStepIndex(status?: OrderTrackingStatus): number {
  if (!status) return 0;
  if (status === 'ANNULEE') return -1;
  const idx = STEPS.findIndex((s) => s.status === status);
  return idx !== -1 ? idx : 0;
}

function OrderTrackingModalContent({
  orderNumber,
  recentOrders = [],
  onClose,
  onOrderUpdated,
}: Omit<OrderTrackingModalProps, 'visible'>) {
  const [selectedNumber, setSelectedNumber] = useState<string>(orderNumber || (recentOrders[0]?.orderNumber ?? ''));
  const [trackingData, setTrackingData] = useState<OrderTrackingDTO | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState<boolean>(false);

  // Mode recherche manuelle repliable
  const [isManualSearchOpen, setIsManualSearchOpen] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const fetchTracking = useCallback(async (num: string) => {
    if (!num || !num.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await trackOrder(num.trim());
      setTrackingData(data);
      onOrderUpdated?.({
        orderNumber: data.orderNumber,
        status: data.status,
        restaurantName: data.restaurantName,
        totalAmount: Number(data.totalAmount) || undefined,
        createdAt: data.createdAt,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors du suivi.');
    } finally {
      setIsLoading(false);
    }
  }, [onOrderUpdated]);

  // Chargement automatique dès l'ouverture
  useEffect(() => {
    const target = orderNumber || recentOrders[0]?.orderNumber;
    if (!target) return;

    const timer = setTimeout(() => {
      setSelectedNumber(target);
      void fetchTracking(target);
    }, 0);

    return () => clearTimeout(timer);
  }, [orderNumber, recentOrders, fetchTracking]);

  const handleCopy = async () => {
    if (!selectedNumber) return;
    await Clipboard.setStringAsync(selectedNumber);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleManualSearch = () => {
    if (!manualInput.trim()) return;
    const clean = manualInput.trim();
    setSelectedNumber(clean);
    void fetchTracking(clean);
    setIsManualSearchOpen(false);
  };

  const activeStepIdx = getStepIndex(trackingData?.status);
  const isCancelled = trackingData?.status === 'ANNULEE';

  return (
    <View style={styles.card}>
      {/* Header Modal */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerIcon}>🛵</Text>
          <Text style={styles.headerTitle}>Suivi en direct</Text>
        </View>
        <Pressable onPress={onClose} style={styles.closeButton} hitSlop={10}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Chips des commandes récentes si plusieurs */}
        {recentOrders.length > 1 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Vos commandes récentes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentChips}>
              {recentOrders.map((ro) => {
                const isSelected = ro.orderNumber === selectedNumber;
                return (
                  <Pressable
                    key={ro.orderNumber}
                    style={[styles.recentChip, isSelected && styles.recentChipActive]}
                    onPress={() => {
                      setSelectedNumber(ro.orderNumber);
                      void fetchTracking(ro.orderNumber);
                    }}
                  >
                    <Text style={[styles.recentChipText, isSelected && styles.recentChipTextActive]}>
                      #{ro.orderNumber}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Badge numéro de commande et bouton copier */}
        <View style={styles.orderBadgeCard}>
          <View>
            <Text style={styles.orderBadgeLabel}>Numéro de suivi</Text>
            <Text style={styles.orderBadgeNumber}>#{selectedNumber || '---'}</Text>
          </View>
          <View style={styles.orderBadgeActions}>
            <Pressable
              style={({ pressed }) => [styles.copyBtn, hasCopied && styles.copyBtnSuccess, pressed && styles.btnPressed]}
              onPress={handleCopy}
            >
              <Text style={[styles.copyBtnText, hasCopied && styles.copyBtnTextSuccess]}>
                {hasCopied ? '✅ Copié' : '📋 Copier'}
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.refreshBtn, pressed && styles.btnPressed]}
              onPress={() => void fetchTracking(selectedNumber)}
              disabled={isLoading}
              accessibilityRole="button"
              accessibilityLabel="Actualiser le statut de la commande"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={Brand.textDark} />
              ) : (
                <Text style={styles.refreshBtnText}>↻ Actualiser</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Indicateur de chargement */}
        {isLoading && !trackingData && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={Brand.primary} />
            <Text style={styles.loadingText}>Actualisation du statut…</Text>
          </View>
        )}

        {/* Erreur */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <Pressable style={styles.retryBtn} onPress={() => void fetchTracking(selectedNumber)}>
              <Text style={styles.retryBtnText}>Réessayer</Text>
            </Pressable>
          </View>
        )}

        {/* Cas Annulé */}
        {isCancelled && (
          <View style={styles.cancelledBox}>
            <Text style={styles.cancelledTitle}>❌ Commande annulée</Text>
            <Text style={styles.cancelledDesc}>Cette commande a été annulée par le restaurant ou le service client.</Text>
          </View>
        )}

        {/* Timeline des étapes */}
        {trackingData && !isCancelled && (
          <View style={styles.timelineCard}>
            <Text style={styles.timelineHeading}>Progression de la livraison</Text>
            <View style={styles.stepperContainer}>
              {STEPS.map((step, idx) => {
                const isPassed = idx <= activeStepIdx;
                const isCurrent = idx === activeStepIdx;
                return (
                  <View key={step.status} style={styles.stepRow}>
                    <View style={styles.stepIndicatorCol}>
                      <View
                        style={[
                          styles.stepCircle,
                          isPassed && styles.stepCirclePassed,
                          isCurrent && styles.stepCircleCurrent,
                        ]}
                      >
                        <Text style={styles.stepCircleIcon}>{step.icon}</Text>
                      </View>
                      {idx < STEPS.length - 1 && (
                        <View style={[styles.stepLine, idx < activeStepIdx && styles.stepLinePassed]} />
                      )}
                    </View>
                    <View style={styles.stepTextCol}>
                      <View style={styles.stepTitleRow}>
                        <Text style={[styles.stepLabel, isPassed && styles.stepLabelPassed]}>{step.label}</Text>
                        {isCurrent && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>EN COURS</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Détails complémentaires */}
        {trackingData && (
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Restaurant</Text>
              <Text style={styles.detailValue}>{trackingData.restaurantName}</Text>
            </View>
            {trackingData.restaurantLocation ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Lieu</Text>
                <Text style={styles.detailValue}>{trackingData.restaurantLocation}</Text>
              </View>
            ) : null}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Service</Text>
              <Text style={styles.detailValue}>{trackingData.type}</Text>
            </View>
            <View style={[styles.detailRow, styles.totalDetailRow]}>
              <Text style={styles.totalDetailLabel}>Montant total</Text>
              <Text style={styles.totalDetailValue}>
                {Number(trackingData.totalAmount).toLocaleString()} FCFA
              </Text>
            </View>
          </View>
        )}

        {/* Section optionnelle : Suivre un autre numéro */}
        <View style={styles.manualSection}>
          <Pressable
            onPress={() => setIsManualSearchOpen((prev) => !prev)}
            style={styles.manualToggle}
          >
            <Text style={styles.manualToggleText}>
              {isManualSearchOpen ? '▲ Masquer la recherche manuelle' : '🔍 Suivre une autre commande par numéro'}
            </Text>
          </Pressable>

          {isManualSearchOpen && (
            <View style={styles.manualBox}>
              <TextInput
                style={styles.manualInput}
                placeholder="Ex: CMD-123456"
                placeholderTextColor={Brand.textLight}
                value={manualInput}
                onChangeText={setManualInput}
                autoCapitalize="characters"
              />
              <Pressable style={styles.manualSubmitBtn} onPress={handleManualSearch}>
                <Text style={styles.manualSubmitText}>Rechercher</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export default function OrderTrackingModal(props: OrderTrackingModalProps) {
  return (
    <Modal visible={props.visible} transparent animationType="slide" onRequestClose={props.onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={props.onClose} />
        {props.visible ? <OrderTrackingModalContent {...props} /> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: Brand.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '90%',
    paddingBottom: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headerIcon: {
    fontSize: 22,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: Brand.textDark,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Brand.textMuted,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  recentSection: {
    marginBottom: Spacing.two,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.two,
  },
  recentChips: {
    gap: Spacing.two,
  },
  recentChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + Spacing.half,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
  },
  recentChipActive: {
    backgroundColor: Brand.primaryLight,
    borderColor: '#FECACA',
  },
  recentChipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textDark,
  },
  recentChipTextActive: {
    color: Brand.primary,
  },
  orderBadgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.lg,
    padding: Spacing.three,
  },
  orderBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Brand.textMuted,
    textTransform: 'uppercase',
  },
  orderBadgeNumber: {
    fontSize: FontSize.base,
    fontWeight: '900',
    color: Brand.primary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  orderBadgeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  copyBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
  },
  copyBtnSuccess: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  copyBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textDark,
  },
  copyBtnTextSuccess: {
    color: '#166534',
  },
  refreshBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    paddingHorizontal: Spacing.two + Spacing.half,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  refreshBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textDark,
  },
  btnPressed: {
    opacity: 0.8,
  },
  loadingWrap: {
    paddingVertical: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  loadingText: {
    fontSize: FontSize.xs,
    color: Brand.textMuted,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: Radius.md,
    padding: Spacing.three,
    alignItems: 'center',
    gap: Spacing.two,
  },
  errorText: {
    color: Brand.danger,
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Brand.primary,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.md,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  cancelledBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: Radius.lg,
    padding: Spacing.four,
    alignItems: 'center',
  },
  cancelledTitle: {
    fontSize: FontSize.base,
    fontWeight: '800',
    color: Brand.danger,
    marginBottom: Spacing.one,
  },
  cancelledDesc: {
    fontSize: FontSize.xs,
    color: Brand.textMuted,
    textAlign: 'center',
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.xl,
    padding: Spacing.four,
  },
  timelineHeading: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Brand.textDark,
    marginBottom: Spacing.three,
  },
  stepperContainer: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  stepIndicatorCol: {
    alignItems: 'center',
    width: 36,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 2,
    borderColor: Brand.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepCirclePassed: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  stepCircleCurrent: {
    borderColor: Brand.primary,
    backgroundColor: Brand.primaryLight,
  },
  stepCircleIcon: {
    fontSize: 13,
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: Brand.borderStrong,
    marginVertical: -2,
    zIndex: 1,
  },
  stepLinePassed: {
    backgroundColor: '#10B981',
  },
  stepTextCol: {
    flex: 1,
    paddingLeft: Spacing.two,
    paddingBottom: Spacing.two,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Brand.textLight,
  },
  stepLabelPassed: {
    color: Brand.textDark,
  },
  currentBadge: {
    backgroundColor: Brand.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: Radius.pill,
  },
  currentBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  stepDesc: {
    fontSize: FontSize.xs,
    color: Brand.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  detailsCard: {
    backgroundColor: Brand.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Brand.textMuted,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: FontSize.xs,
    color: Brand.textDark,
    fontWeight: '700',
  },
  totalDetailRow: {
    borderTopWidth: 1,
    borderTopColor: Brand.borderStrong,
    paddingTop: Spacing.two,
    marginTop: 2,
  },
  totalDetailLabel: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Brand.textDark,
  },
  totalDetailValue: {
    fontSize: FontSize.sm,
    fontWeight: '900',
    color: Brand.primary,
  },
  manualSection: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  manualToggle: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  manualToggleText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.primary,
  },
  manualBox: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  manualInput: {
    flex: 1,
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Brand.textDark,
  },
  manualSubmitBtn: {
    backgroundColor: Brand.textDark,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSubmitText: {
    color: '#ffffff',
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
