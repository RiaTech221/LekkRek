/**
 * ============================================================================
 * 📁 Fichier : components/CategoryPills.tsx
 * 📝 Description : Barre de pills horizontales filtrant par catégorie (moment).
 * 🔒 Rôle : Composant UI présentant la liste des catégories (Déjeuner, Dîner…)
 *           + un bouton « Tout voir ». Reproduit la rangée de pills scrollable
 *           du web (MobileClientView). Composant contrôlé : l'état (catégorie
 *           active) vit dans l'écran parent, pas ici.
 * 💡 Auteur : Équipe Mobile
 * ----------------------------------------------------------------------------
 * 🎨 Design : pills arrondies, la pill active passe en rouge (Brand.primary)
 *             comme sur le web. Scroll horizontal avec masquage de la scrollbar.
 * ============================================================================
 */

import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Brand, FontSize, Radius, Spacing } from '../constants/theme';

/** Libellés d'affichage pour les catégories connues (reprend le mapping web). */
const CATEGORY_LABELS: Record<string, string> = {
  dejeuner: '🍽️ Déjeuner',
  gouter: '☕ Goûter',
  diner: '🍷 Dîner',
  'fast food': '🍔 Fast food',
  boisson: '🍹 Cocktails & Jus',
  dessert: '🍰 Desserts',
};

/** Retourne le libellé d'affichage d'une catégorie (emoji + nom, ou nom brut capitalisé). */
function labelFor(category: string): string {
  const known = CATEGORY_LABELS[category.toLowerCase()];
  if (known) return known;
  // Fallback : capitalise la première lettre.
  return category.charAt(0).toUpperCase() + category.slice(1);
}

interface CategoryPillsProps {
  categories: string[];
  /** Catégorie active ('' = tout voir). Contrôlée par le parent. */
  activeCategory: string;
  onSelect: (category: string) => void;
}

export default function CategoryPills({ categories, activeCategory, onSelect }: CategoryPillsProps) {
  // On construit la liste : « Tout voir » toujours en premier, puis les catégories.
  const items = [{ value: '', label: '🍴 Tout voir' }, ...categories.map((c) => ({ value: c, label: labelFor(c) }))];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {items.map(({ value, label }) => {
        const isActive = activeCategory === value;
        return (
          <Pressable
            key={value || 'all'}
            onPress={() => onSelect(value)}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            style={({ pressed }) => [styles.pill, isActive && styles.pillActive, pressed && styles.pillPressed]}>
            <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  pill: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.borderStrong,
  },
  pillActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  pillPressed: {
    opacity: 0.8,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Brand.textDark,
  },
  pillTextActive: {
    color: '#ffffff',
  },
});
