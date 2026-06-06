/**
 * CategoryFilter — horizontal scrollable category pills.
 * Mirrors the web app's category filter bar in the sidebar.
 */
import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';
import { CATEGORIES, BOOKING_TYPES } from '../config/constants';

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  selectedBookingType = 'all',
  onBookingTypeChange,
}) {
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.pill,
              selectedCategory === cat.id && styles.pillActive,
            ]}
            onPress={() => onCategoryChange(cat.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.pillIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.pillText,
                selectedCategory === cat.id && styles.pillTextActive,
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedCategory === 'lodge' && onBookingTypeChange && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={[styles.scroll, { marginTop: spacing.sm }]}
        >
          {BOOKING_TYPES.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.subPill,
                selectedBookingType === opt.id && styles.pillActive,
              ]}
              onPress={() => onBookingTypeChange(opt.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.subPillText,
                  selectedBookingType === opt.id && styles.pillTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillIcon: {
    fontSize: 14,
  },
  pillText: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bold,
    color: colors.text,
  },
  pillTextActive: {
    color: '#ffffff',
  },
  subPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subPillText: {
    fontSize: fontSizes.xs,
    fontFamily: fonts.bold,
    color: colors.text,
  },
});
