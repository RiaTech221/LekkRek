/**
 * ============================================================================
 * 📁 Fichier : components/ProfileModal.tsx
 * 📝 Description : Modal de connexion et de gestion de profil pour le client mobile.
 * 🔒 Rôle : Miroir de la modal web (`MobileClientView.jsx`). Permet la saisie
 *           du nom et du numéro de téléphone sénégalais (+221), sans mot de passe,
 *           avec validation stricte du format (70, 75, 76, 77, 78).
 * 💡 Auteur : Équipe Mobile
 * ============================================================================
 */

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Brand, FontSize, Radius, Spacing } from '@/constants/theme';
import type { ClientProfile } from '@/types/profile';
import { normalizeSenegalPhone, validateSenegalPhone } from '@/hooks/useClientProfile';

interface ProfileModalProps {
  visible: boolean;
  profile: ClientProfile | null;
  onClose: () => void;
  onSave: (name: string, phone: string) => Promise<ClientProfile>;
  onLogout: () => Promise<void>;
}

function ProfileModalContent({
  profile,
  onClose,
  onSave,
  onLogout,
}: Omit<ProfileModalProps, 'visible'>) {
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    const cleanPhone = normalizeSenegalPhone(phone);

    if (!cleanPhone) {
      setError('Veuillez renseigner votre numéro de téléphone.');
      return;
    }

    if (!validateSenegalPhone(cleanPhone)) {
      setError('Numéro sénégalais invalide (9 chiffres commençant par 70, 75, 76, 77 ou 78).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(name, cleanPhone);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsSubmitting(true);
      await onLogout();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConnected = !!profile?.phone;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.overlay}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.card}>
        {/* Bouton Fermer */}
        <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>

        {/* Icône & Titres */}
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>👤</Text>
          </View>
          <Text style={styles.title}>{isConnected ? 'Mon Profil' : 'Bon retour !'}</Text>
          <Text style={styles.subtitle}>
            {isConnected
              ? 'Vérifiez ou modifiez vos coordonnées personnelles.'
              : 'Connectez-vous pour retrouver vos favoris et commander en un clic.'}
          </Text>
        </View>

        {/* Message d'erreur */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Formulaire */}
        <View style={styles.form}>
          {/* Champ Nom */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Votre Nom <Text style={styles.labelOptional}>(Optionnel)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Jean Dupont"
              placeholderTextColor={Brand.textLight}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Champ Téléphone */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Numéro de téléphone <Text style={styles.labelRequired}>*</Text>
            </Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>+221</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="771234567"
                placeholderTextColor={Brand.textLight}
                keyboardType="phone-pad"
                maxLength={9}
                value={phone}
                onChangeText={(text) => setPhone(normalizeSenegalPhone(text))}
              />
            </View>
          </View>

          {/* Bouton principal de soumission */}
          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isConnected ? 'Mettre à jour' : 'Me connecter'}
            </Text>
          </Pressable>

          {/* Bouton Se déconnecter (si déjà connecté) */}
          {isConnected && (
            <Pressable
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={isSubmitting}
            >
              <Text style={styles.logoutButtonText}>Se déconnecter</Text>
            </Pressable>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

export default function ProfileModal(props: ProfileModalProps) {
  return (
    <Modal visible={props.visible} transparent animationType="fade" onRequestClose={props.onClose}>
      {props.visible ? <ProfileModalContent {...props} /> : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Brand.surface,
    borderRadius: Radius.xl,
    padding: Spacing.four,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: FontSize.base,
    color: Brand.textMuted,
    fontWeight: '700',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  iconText: {
    fontSize: 26,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: Brand.textDark,
    marginBottom: Spacing.half,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: Brand.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.two,
  },
  errorBox: {
    backgroundColor: Brand.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.two,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Brand.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  form: {
    gap: Spacing.three,
  },
  field: {
    gap: Spacing.one,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelOptional: {
    color: Brand.textLight,
    textTransform: 'none',
    fontWeight: '500',
  },
  labelRequired: {
    color: Brand.primary,
  },
  input: {
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: FontSize.sm,
    color: Brand.textDark,
    fontWeight: '600',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRightWidth: 1,
    borderRightColor: Brand.borderStrong,
    backgroundColor: Brand.surfaceAlt,
  },
  phonePrefixText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Brand.textMuted,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: FontSize.sm,
    color: Brand.textDark,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: Brand.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    shadowColor: Brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonPressed: {
    backgroundColor: Brand.primaryDark,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: FontSize.base,
    fontWeight: '800',
  },
  logoutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.one,
    marginTop: Spacing.half,
  },
  logoutButtonText: {
    color: Brand.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
