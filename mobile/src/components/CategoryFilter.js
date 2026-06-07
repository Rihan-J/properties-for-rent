/**
 * CategoryFilter — horizontal scrollable category pills.
 * Mirrors a premium luxury UI (Airbnb/Zillow style).
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
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
        // iOS bounce
        bounces={true}
        decelerationRate="fast"
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.pill,
                isActive && styles.pillActive,
              ]}
              onPress={() => onCategoryChange(cat.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.pillIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.pillText,
                  isActive && styles.pillTextActive,
                ]}
                numberOfLines={1}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedCategory === 'lodge' && onBookingTypeChange && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={[styles.scroll, { marginTop: spacing.sm }]}
        >
          {BOOKING_TYPES.map((opt) => {
            const isActive = selectedBookingType === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.subPill,
                  isActive && styles.pillActive,
                ]}
                onPress={() => onBookingTypeChange(opt.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.subPillText,
                    isActive && styles.pillTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
    paddingHorizontal: 16,
    paddingVertical: 4, // Prevents shadow clipping
    gap: 8, // Native Flexbox gap for perfect consistent spacing
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40, // Consistent premium height
    paddingHorizontal: 14,
    borderRadius: 20, // Perfectly rounded pills (height / 2)
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e2e2', // Subtle gray border for unselected
    // Explicitly NO shadow on unselected state to keep it clean
  },
  pillActive: {
    backgroundColor: '#1a1815', // Premium black background
    borderColor: '#1a1815',
    // Shadow ONLY on the selected state
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  pillIcon: {
    fontSize: 14,
    marginRight: 6,
    lineHeight: 18,
  },
  pillText: {
    fontSize: 13,
    fontFamily: fonts.semiBold,
    color: '#4a4a4a', // Dark but not pitch black for unselected
    flexShrink: 0, // Prevent text clipping
    letterSpacing: -0.2,
  },
  pillTextActive: {
    color: '#ffffff', // White text when selected
    fontFamily: fonts.bold,
  },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36, // Slightly smaller than main pills
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e2e2',
  },
  subPillText: {
    fontSize: 12,
    fontFamily: fonts.semiBold,
    color: '#4a4a4a',
    flexShrink: 0,
  },
});
