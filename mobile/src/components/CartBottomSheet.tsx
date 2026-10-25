/**
 * ============================================================================
 * 📁 Fichier : components/CartBottomSheet.tsx
 * 📝 Description : Bottom Sheet native pour le panier et la commande mobile.
 * 🔒 Rôle : Émerge du bas de l'écran (85-90% de hauteur). Gère le panier vide,
 *           la liste des plats avec suppression, le calcul du total avec
 *           suppléments livraison, le formulaire de livraison (pré-rempli avec
 *           le profil client), et la gestion optimisée du clavier virtuel.
 * 💡 Auteur : Équipe Mobile
 * ============================================================================
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, FontSize, Radius, Spacing } from '@/constants/theme';
import { normalizeSenegalPhone, validateSenegalPhone } from '@/hooks/useClientProfile';
import { formatImageUrl } from '@/services/config';
import { submitOrder } from '@/services/orderApi';
import type { Plat, Restaurant } from '@/types/menu';
import type { OrderRequest, OrderResponse, OrderType, PaymentMethod } from '@/types/order';
import type { ClientProfile } from '@/types/profile';

interface CartBottomSheetProps {
  visible: boolean;
  cart: Plat[];
  profile: ClientProfile | null;
  onClose: () => void;
  onAddItem: (plat: Plat) => void;
  onRemoveOne: (platId: number) => void;
  onRemoveAllOfDish: (platId: number) => void;
  onClearCart: () => void;
  onUpdateProfile: (name: string, phone: string, address?: string) => Promise<ClientProfile>;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400';

function CartBottomSheetContent({
  cart,
  profile,
  onClose,
  onAddItem,
  onRemoveOne,
  onRemoveAllOfDish,
  onClearCart,
  onUpdateProfile,
}: Omit<CartBottomSheetProps, 'visible'>) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const [clientName, setClientName] = useState(profile?.name || '');
  const [clientPhone, setClientPhone] = useState(profile?.phone || '');
  const [clientAddress, setClientAddress] = useState(profile?.address || '');
  const [orderType, setOrderType] = useState<OrderType>('LIVRAISON');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WAVE');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderResponse | null>(null);

  // Détecte l'ouverture du clavier pour passer en plein écran dynamique
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const formY = useRef<number>(0);

  const scrollToPosition = (offsetY: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, offsetY),
        animated: true,
      });
    }, 100);
  };

  // Regroupe les plats identiques pour l'affichage en pile avec compteurs
  const groupedItems = useMemo(() => {
    const map = new Map<number, { plat: Plat; quantity: number }>();
    for (const item of cart) {
      const existing = map.get(item.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        map.set(item.id, { plat: item, quantity: 1 });
      }
    }
    return Array.from(map.values());
  }, [cart]);

  // Restaurants uniques concernés par le panier
  const uniqueRestaurants = useMemo(() => {
    const map = new Map<number, Restaurant>();
    for (const item of cart) {
      if (item.restaurant?.id) {
        map.set(item.restaurant.id, item.restaurant);
      }
    }
    return Array.from(map.values());
  }, [cart]);

  // Contrôle des modes autorisés
  const canSurPlace = uniqueRestaurants.every((r) => r.surPlace !== false);
  const canEmporter = uniqueRestaurants.every((r) => r.aEmporter !== false);
  const canLivraison = uniqueRestaurants.every((r) => r.livraison !== false);

  // Calculs financiers
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  }, [cart]);

  const deliverySupplement = useMemo(() => {
    if (orderType !== 'LIVRAISON') return 0;
    return uniqueRestaurants.reduce((sum, r) => sum + (Number(r?.supplementLivraison) || 0), 0);
  }, [orderType, uniqueRestaurants]);

  const total = subtotal + deliverySupplement;

  // Validation et soumission de la commande
  const handleCheckout = async () => {
    setError(null);

    if (cart.length === 0) {
      setError('Votre panier est vide.');
      return;
    }

    if (orderType === 'LIVRAISON' && !canLivraison) {
      setError("La livraison n'est pas acceptée par au moins un des restaurants.");
      return;
    }
    if (orderType === 'EMPORTER' && !canEmporter) {
      setError("La vente à emporter n'est pas acceptée par au moins un des restaurants.");
      return;
    }
    if (orderType === 'SUR_PLACE' && !canSurPlace) {
      setError("Le service sur place n'est pas disponible pour ces restaurants.");
      return;
    }

    if (!clientName || clientName.trim().length < 2) {
      setError('Veuillez renseigner votre nom (minimum 2 caractères).');
      return;
    }

    const cleanPhone = normalizeSenegalPhone(clientPhone);
    if (!validateSenegalPhone(cleanPhone)) {
      setError('Numéro sénégalais invalide (ex: 77 123 45 67).');
      return;
    }

    if (orderType === 'LIVRAISON' && (!clientAddress || clientAddress.trim().length < 5)) {
      setError('Veuillez renseigner une adresse de livraison précise (quartier, repère).');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload: OrderRequest = {
        clientName: clientName.trim(),
        clientPhone: cleanPhone,
        clientAddress: orderType === 'LIVRAISON' ? clientAddress.trim() : undefined,
        type: orderType,
        paymentMethod,
        platIds: cart.map((p) => p.id),
      };

      const result = await submitOrder(orderPayload);

      // Sauvegarde du profil pour les prochaines commandes
      void onUpdateProfile(clientName.trim(), cleanPhone, clientAddress.trim());

      // Vide le panier et affiche la confirmation de succès
      onClearCart();
      setConfirmedOrder(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. ÉTAT SUCCÈS (Commande confirmée)
  if (confirmedOrder) {
    return (
      <View style={styles.sheetContainer}>
        <View style={styles.dragHandle} />
        <View style={styles.successWrapper}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successIconText}>🎉</Text>
          </View>
          <Text style={styles.successTitle}>Commande Confirmée !</Text>
          <Text style={styles.successSubtitle}>
            Votre commande a bien été transmise à la cuisine.
          </Text>

          <View style={styles.orderBadge}>
            <Text style={styles.orderBadgeLabel}>Numéro de commande</Text>
            <Text style={styles.orderBadgeNumber}>{confirmedOrder.orderNumber}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total réglé</Text>
              <Text style={styles.summaryValue}>
                {confirmedOrder.totalAmount?.toLocaleString() || total.toLocaleString()} FCFA
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mode</Text>
              <Text style={styles.summaryValue}>{confirmedOrder.type || orderType}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Paiement</Text>
              <Text style={styles.summaryValue}>{paymentMethod}</Text>
            </View>
          </View>

          <Pressable style={[styles.primaryButton, styles.emptyActionButton]} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Retour au menu</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 2. ÉTAT PANIER VIDE
  if (cart.length === 0) {
    return (
      <View style={[styles.sheetContainer, styles.emptySheetContainer]}>
        <View style={styles.dragHandle} />
        <View style={styles.emptyWrapper}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIconText}>🛒</Text>
          </View>
          <Text style={styles.emptyTitle}>Votre panier est vide</Text>
          <Text style={styles.emptySubtitle}>
            Découvrez les spécialités locales au menu aujourd&apos;hui et ajoutez vos plats préférés.
          </Text>
          <Pressable style={[styles.primaryButton, styles.emptyActionButton]} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Découvrir les plats</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 3. ÉTAT PANIER AVEC ARTICLES
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? (isKeyboardVisible ? insets.top : 0) : 0}
      style={[
        styles.sheetContainer,
        isKeyboardVisible && [styles.fullscreenSheet, { paddingTop: insets.top }],
      ]}
    >
      {!isKeyboardVisible && <View style={styles.dragHandle} />}

      {/* Header du panier */}
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>
          Votre Panier <Text style={styles.cartCount}>({cart.length})</Text>
        </Text>
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
          style={styles.closeButton}
          hitSlop={10}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>

      {/* Message d'erreur s'il y en a */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Contenu scrollable avec gestion du clavier */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollArea}
        contentContainerStyle={[
          styles.scrollContent,
          isKeyboardVisible && styles.fullscreenScrollContent,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Liste des plats empilés */}
        <View style={styles.itemsSection}>
          {groupedItems.map(({ plat, quantity }) => {
            const imageUri = formatImageUrl(plat.image) || FALLBACK_IMAGE;
            return (
              <View key={plat.id} style={styles.stackWrapper}>
                {/* Couche d'empilement 2 (si 3 portions ou plus) */}
                {quantity >= 3 && <View style={[styles.stackLayer, styles.stackLayerBack]} />}

                {/* Couche d'empilement 1 (si 2 portions ou plus) */}
                {quantity >= 2 && <View style={[styles.stackLayer, styles.stackLayerMiddle]} />}

                {/* Carte principale */}
                <View
                  style={[
                    styles.cartItem,
                    quantity === 2 && styles.cartItemStacked2,
                    quantity >= 3 && styles.cartItemStacked3,
                  ]}
                >
                  {/* Image avec badge xN si empilé */}
                  <View style={styles.imageWrap}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.itemImage}
                      contentFit="cover"
                      transition={200}
                    />
                    {quantity > 1 && (
                      <View style={styles.stackBadge}>
                        <Text style={styles.stackBadgeText}>x{quantity}</Text>
                      </View>
                    )}
                  </View>

                  {/* Détails du plat */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {plat.name}
                    </Text>
                    {plat.restaurant?.name ? (
                      <Text style={styles.itemRestaurant} numberOfLines={1}>
                        {plat.restaurant.name}
                      </Text>
                    ) : null}
                    <Text style={styles.itemPrice}>
                      {(plat.price * quantity).toLocaleString()} FCFA
                      {quantity > 1 ? (
                        <Text style={styles.itemUnitPrice}> ({plat.price.toLocaleString()} / u)</Text>
                      ) : null}
                    </Text>
                  </View>

                  {/* Contrôles de quantité : [ − ]  [ Qte ]  [ + ] */}
                  <View style={styles.quantityControls}>
                    <Pressable
                      style={styles.qtyButton}
                      onPress={() => onRemoveOne(plat.id)}
                      hitSlop={8}
                      accessibilityLabel={`Diminuer la quantité de ${plat.name}`}
                    >
                      <Text style={styles.qtyButtonText}>−</Text>
                    </Pressable>

                    <Text style={styles.qtyNumber}>{quantity}</Text>

                    <Pressable
                      style={[styles.qtyButton, styles.qtyButtonPlus]}
                      onPress={() => onAddItem(plat)}
                      hitSlop={8}
                      accessibilityLabel={`Augmenter la quantité de ${plat.name}`}
                    >
                      <Text style={[styles.qtyButtonText, styles.qtyButtonTextPlus]}>+</Text>
                    </Pressable>
                  </View>

                  {/* Retrait de toute la pile */}
                  <Pressable
                    style={styles.removeButton}
                    onPress={() => onRemoveAllOfDish(plat.id)}
                    hitSlop={10}
                    accessibilityLabel={`Retirer ${plat.name} du panier`}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {/* Détails financiers */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sous-total plats</Text>
            <Text style={styles.summaryValue}>{subtotal.toLocaleString()} FCFA</Text>
          </View>
          {orderType === 'LIVRAISON' && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, styles.deliveryLabel]}>Frais de livraison</Text>
              <Text style={[styles.summaryValue, styles.deliveryValue]}>
                {deliverySupplement > 0 ? `+${deliverySupplement.toLocaleString()} FCFA` : 'Inclus (0 FCFA)'}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total à payer</Text>
            <Text style={styles.totalValue}>{total.toLocaleString()} FCFA</Text>
          </View>
        </View>

        {/* Formulaire de commande */}
        <View
          style={styles.formSection}
          onLayout={(e) => {
            formY.current = e.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionHeading}>Options de service</Text>

          {/* Sélecteur de type de service */}
          <View style={styles.typeSelector}>
            {[
              { type: 'SUR_PLACE' as OrderType, label: 'Sur place', allowed: canSurPlace },
              { type: 'EMPORTER' as OrderType, label: 'À emporter', allowed: canEmporter },
              { type: 'LIVRAISON' as OrderType, label: 'Livraison', allowed: canLivraison },
            ].map(({ type, label, allowed }) => (
              <Pressable
                key={type}
                disabled={!allowed}
                onPress={() => setOrderType(type)}
                style={[
                  styles.typeChip,
                  !allowed && styles.typeChipDisabled,
                  orderType === type && styles.typeChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    !allowed && styles.typeChipTextDisabled,
                    orderType === type && styles.typeChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.sectionHeading}>Vos Coordonnées</Text>

          {/* Champ Nom */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Votre Nom Complet *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: Jean Dupont"
              placeholderTextColor={Brand.textLight}
              value={clientName}
              onChangeText={setClientName}
              onFocus={() => scrollToPosition(formY.current)}
              autoCapitalize="words"
            />
          </View>

          {/* Champ Téléphone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Numéro de téléphone *</Text>
            <View style={styles.phoneInputWrap}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>+221</Text>
              </View>
              <TextInput
                style={styles.phoneTextInput}
                placeholder="771234567"
                placeholderTextColor={Brand.textLight}
                keyboardType="phone-pad"
                maxLength={9}
                value={clientPhone}
                onChangeText={(text) => setClientPhone(normalizeSenegalPhone(text))}
                onFocus={() => scrollToPosition(formY.current + 50)}
              />
            </View>
          </View>

          {/* Champ Adresse (uniquement si LIVRAISON) */}
          {orderType === 'LIVRAISON' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Adresse de livraison *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Quartier, rue, repère (ex: près de la pharmacie de garde)"
                placeholderTextColor={Brand.textLight}
                multiline
                numberOfLines={3}
                value={clientAddress}
                onChangeText={setClientAddress}
                onFocus={() => scrollToPosition(formY.current + 160)}
              />
            </View>
          )}

          {/* Mode de paiement */}
          <Text style={styles.sectionHeading}>Mode de paiement</Text>
          <View style={styles.paymentSelector}>
            {[
              { id: 'WAVE' as PaymentMethod, label: 'Wave' },
              { id: 'ORANGE_MONEY' as PaymentMethod, label: 'Orange Money' },
              { id: 'ESPECES' as PaymentMethod, label: 'Espèces' },
            ].map(({ id, label }) => (
              <Pressable
                key={id}
                onPress={() => setPaymentMethod(id)}
                style={[
                  styles.paymentChip,
                  paymentMethod === id && styles.paymentChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.paymentChipText,
                    paymentMethod === id && styles.paymentChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bouton de confirmation Sticky */}
      <View style={[styles.stickyFooter, isKeyboardVisible && styles.stickyFooterWithKeyboard]}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
            isSubmitting && styles.primaryButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>
              Confirmer la commande • {total.toLocaleString()} FCFA
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function CartBottomSheet(props: CartBottomSheetProps) {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="slide"
      onRequestClose={props.onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={props.onClose} />
        {props.visible ? <CartBottomSheetContent {...props} /> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Brand.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '90%',
    minHeight: '65%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  fullscreenSheet: {
    height: '100%',
    maxHeight: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  emptySheetContainer: {
    minHeight: '40%',
    maxHeight: '50%',
  },
  dragHandle: {
    width: 44,
    height: 5,
    backgroundColor: Brand.borderStrong,
    borderRadius: Radius.pill,
    alignSelf: 'center',
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Brand.border,
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: Brand.textDark,
  },
  cartCount: {
    color: Brand.primary,
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
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Brand.textMuted,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  fullscreenScrollContent: {
    paddingBottom: Spacing.four,
  },
  itemsSection: {
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  stackWrapper: {
    position: 'relative',
    marginVertical: Spacing.one + 2,
  },
  stackLayer: {
    position: 'absolute',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
  },
  stackLayerBack: {
    top: -6,
    bottom: -6,
    left: 10,
    right: 10,
    backgroundColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },
  stackLayerMiddle: {
    top: -3,
    bottom: -3,
    left: 5,
    right: 5,
    backgroundColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    gap: Spacing.two + Spacing.half,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cartItemStacked2: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cartItemStacked3: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 7,
  },
  imageWrap: {
    position: 'relative',
  },
  itemImage: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
  },
  stackBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: Brand.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1.5,
    borderColor: Brand.surface,
  },
  stackBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '900',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Brand.textDark,
  },
  itemRestaurant: {
    fontSize: FontSize.xs,
    color: Brand.textMuted,
    marginTop: 1,
  },
  itemPrice: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.primary,
    marginTop: 2,
  },
  itemUnitPrice: {
    fontSize: 10,
    color: Brand.textMuted,
    fontWeight: '500',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surfaceAlt,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  qtyButton: {
    width: 26,
    height: 26,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  qtyButtonPlus: {
    backgroundColor: Brand.primaryLight,
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Brand.textDark,
    lineHeight: 18,
  },
  qtyButtonTextPlus: {
    color: Brand.primary,
  },
  qtyNumber: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Brand.textDark,
    paddingHorizontal: Spacing.one,
    minWidth: 18,
    textAlign: 'center',
  },
  removeButton: {
    padding: Spacing.one,
  },
  removeButtonText: {
    fontSize: FontSize.sm,
    color: Brand.textLight,
    fontWeight: '700',
  },
  summaryCard: {
    backgroundColor: Brand.surfaceAlt,
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: Brand.border,
    gap: Spacing.one,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: FontSize.xs,
    color: Brand.textMuted,
  },
  summaryValue: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textDark,
  },
  deliveryLabel: {
    color: '#059669',
  },
  deliveryValue: {
    color: '#059669',
  },
  totalRow: {
    marginTop: Spacing.two,
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  totalLabel: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: Brand.textDark,
  },
  totalValue: {
    fontSize: FontSize.base,
    fontWeight: '900',
    color: Brand.textDark,
  },
  formSection: {
    gap: Spacing.three,
  },
  sectionHeading: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    color: Brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  typeChip: {
    flex: 1,
    paddingVertical: Spacing.two + Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  typeChipActive: {
    backgroundColor: Brand.primaryLight,
    borderColor: '#FECACA',
  },
  typeChipDisabled: {
    opacity: 0.4,
  },
  typeChipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textMuted,
  },
  typeChipTextActive: {
    color: Brand.primary,
  },
  typeChipTextDisabled: {
    color: Brand.textLight,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textDark,
  },
  textInput: {
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: FontSize.sm,
    color: Brand.textDark,
    fontWeight: '600',
    minHeight: 48,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    minHeight: 48,
  },
  phonePrefix: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRightWidth: 1,
    borderRightColor: Brand.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phonePrefixText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Brand.textMuted,
  },
  phoneTextInput: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: FontSize.sm,
    color: Brand.textDark,
    fontWeight: '700',
  },
  paymentSelector: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  paymentChip: {
    flex: 1,
    paddingVertical: Spacing.two + Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.md,
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  paymentChipActive: {
    backgroundColor: Brand.textDark,
    borderColor: Brand.textDark,
  },
  paymentChipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textDark,
  },
  paymentChipTextActive: {
    color: '#ffffff',
  },
  errorBox: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.two,
    backgroundColor: Brand.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Brand.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  stickyFooter: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Platform.OS === 'ios' ? Spacing.five : Spacing.four,
    backgroundColor: Brand.surface,
    borderTopWidth: 1,
    borderTopColor: Brand.border,
  },
  stickyFooterWithKeyboard: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  primaryButton: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.lg,
    minHeight: 54,
    paddingVertical: Spacing.three + Spacing.half,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonPressed: {
    backgroundColor: Brand.primaryDark,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: FontSize.base,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  emptyActionButton: {
    minWidth: 240,
    paddingHorizontal: Spacing.five,
    minHeight: 54,
    marginTop: Spacing.two,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.five,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  emptyIconText: {
    fontSize: 34,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Brand.textDark,
    marginBottom: Spacing.one,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Brand.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.three,
  },
  successWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    backgroundColor: '#DCFCE7', // green-100
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  successIconText: {
    fontSize: 34,
  },
  successTitle: {
    fontSize: FontSize.xl,
    fontWeight: '900',
    color: Brand.textDark,
    marginBottom: Spacing.half,
  },
  successSubtitle: {
    fontSize: FontSize.xs,
    color: Brand.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.four,
  },
  orderBadge: {
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  orderBadgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Brand.textMuted,
    textTransform: 'uppercase',
  },
  orderBadgeNumber: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: Brand.primary,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
