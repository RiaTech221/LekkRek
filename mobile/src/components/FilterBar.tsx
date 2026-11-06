/**
 * ============================================================================
 * 📁 Fichier : components/FilterBar.tsx
 * 📝 Description : Barre de recherche + panneau de filtres repliable.
 * 🔒 Rôle : Composant UI contrôlé reproduisant le panneau « Airbnb style » du
 *           web (MobileClientView) : un en-tête repliable, puis les champs
 *           Quoi ? / Restaurant / Quartier / Budget max. Toute la logique de
 *           chargement vit dans l'écran parent (via useMenu) ; ici on ne fait
 *           que déclencher `onFilterChange`.
 * 💡 Auteur : Équipe Mobile
 * ----------------------------------------------------------------------------
 * 🎨 Design : panneau blanc arrondi, champs séparés par des libellés microscopiques,
 *             exactement comme le panneau web déplié.
 * ============================================================================
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Brand, FontSize, Radius, Spacing } from '../constants/theme';
import type { MenuFilters } from '../types/menu';

interface FilterBarProps {
  filters: MenuFilters;
  /** Noms de restaurants disponibles (dérivés des plats chargés). */
  restaurants: string[];
  onFilterChange: (key: keyof MenuFilters, value: string) => void;
}

export default function FilterBar({ filters, restaurants, onFilterChange }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Indique si au moins un filtre est actif (pour afficher « Filtres actifs... »).
  const hasActiveFilters = Boolean(filters.keyword || filters.resto || filters.quartier || filters.budgetMax);

  return (
    <View style={styles.wrap}>
      {/* En-tête repliable (tap pour ouvrir/fermer) */}
      <Pressable
        onPress={() => setIsExpanded((prev) => !prev)}
        accessibilityRole="button"
        style={styles.header}>
        <Text style={styles.headerIcon}>🔍</Text>
        <Text style={[styles.headerText, hasActiveFilters && styles.headerTextActive]} numberOfLines={1}>
          {hasActiveFilters ? 'Filtres actifs...' : 'Rechercher (Plat, Resto...)'}
        </Text>
        <View style={styles.chevron}>
          <Text style={styles.chevronText}>{isExpanded ? '▲' : '▼'}</Text>
        </View>
      </Pressable>

      {/* Contenu déplié */}
      {isExpanded && (
        <View style={styles.panel}>
          {/* Quoi ? */}
          <Field icon="🔍" label="Quoi ?">
            <TextInput
              style={styles.input}
              placeholder="Plat, ingrédient..."
              placeholderTextColor={Brand.textLight}
              value={filters.keyword || ''}
              onChangeText={(v) => onFilterChange('keyword', v)}
              returnKeyType="search"
            />
          </Field>

          {/* Restaurant */}
          <Field icon="🏪" label="Restaurant">
            <View style={styles.selectWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Tous les restos"
                placeholderTextColor={Brand.textLight}
                value={filters.resto || ''}
                onChangeText={(v) => onFilterChange('resto', v)}
              />
            </View>
            {/* Suggestions rapides sous forme de chips (équivalent du <select> web). */}
            {restaurants.length > 0 && (
              <View style={styles.chipsRow}>
                {restaurants.slice(0, 6).map((name) => (
                  <Pressable
                    key={name}
                    onPress={() => onFilterChange('resto', filters.resto === name ? '' : name)}
                    style={[styles.chip, filters.resto === name && styles.chipActive]}>
                    <Text style={[styles.chipText, filters.resto === name && styles.chipTextActive]} numberOfLines={1}>
                      {name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </Field>

          {/* Quartier + Budget max côte à côte */}
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Field icon="📍" label="Quartier">
                <TextInput
                  style={styles.input}
                  placeholder="Où livrer ?"
                  placeholderTextColor={Brand.textLight}
                  value={filters.quartier || ''}
                  onChangeText={(v) => onFilterChange('quartier', v)}
                />
              </Field>
            </View>
            <View style={styles.halfField}>
              <Field icon="💰" label="Budget max">
                <TextInput
                  style={styles.input}
                  placeholder="ex: 2000"
                  placeholderTextColor={Brand.textLight}
                  keyboardType="number-pad"
                  value={filters.budgetMax || ''}
                  // On n'autorise que des chiffres (reprend la validation web).
                  onChangeText={(v) => onFilterChange('budgetMax', v.replace(/[^0-9]/g, ''))}
                />
              </Field>
            </View>
          </View>

          {/* Bouton Appliquer (referme le panneau) */}
          <Pressable onPress={() => setIsExpanded(false)} style={styles.applyButton}>
            <Text style={styles.applyText}>Appliquer</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/**
 * Petit sous-composant : un champ avec icône et libellé microscopique au-dessus.
 */
function Field({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldIcon}>{icon}</Text>
      <View style={styles.fieldBody}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Brand.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Brand.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  headerIcon: {
    fontSize: FontSize.lg,
    marginRight: Spacing.three,
  },
  headerText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Brand.textLight,
  },
  headerTextActive: {
    color: Brand.textDark,
  },
  chevron: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: FontSize.xs,
    color: Brand.textMuted,
  },
  panel: {
    borderTopWidth: 1,
    borderTopColor: Brand.border,
    padding: Spacing.three,
    gap: Spacing.three,
    backgroundColor: Brand.surfaceAlt,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Brand.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Brand.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  fieldIcon: {
    fontSize: FontSize.base,
    marginRight: Spacing.two,
  },
  fieldBody: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '700',
    color: Brand.textMuted,
    marginBottom: 2,
  },
  input: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Brand.textDark,
    padding: 0,
  },
  selectWrapper: {
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surfaceAlt,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
    maxWidth: 140,
  },
  chipActive: {
    backgroundColor: Brand.primaryLight,
    borderColor: Brand.primary,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Brand.textMuted,
  },
  chipTextActive: {
    color: Brand.primary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  halfField: {
    flex: 1,
  },
  applyButton: {
    backgroundColor: Brand.textDark,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  applyText: {
    color: '#ffffff',
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});
