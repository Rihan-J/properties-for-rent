/**
 * PropertyCard — reusable component for property list and map bottom sheet.
 * Adapted from frontend/src/components/PropertyCard.js
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import { getPropertyPricing, getLat, getLng } from '../lib/property';
import { calculateDistance } from '../lib/geo';
import { useAuth } from '../context/AuthContext';

export default function PropertyCard({
  property,
  userLat,
  userLng,
  showDelete,
  onDelete,
  isDeleting,
  style,
}) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const pricing = getPropertyPricing(property);
  const distance = calculateDistance(userLat, userLng, getLat(property), getLng(property));

  const handlePress = () => {
    navigation.navigate('PropertyDetail', { propertyId: property.id });
  };

  const handleLoginPrompt = () => {
    navigation.navigate('Auth', {
      screen: 'Login',
      params: { redirect: 'PropertyDetail', propertyId: property.id },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={user ? handlePress : handleLoginPrompt}
      style={[styles.card, isDeleting && styles.cardDeleting, style]}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: getOptimizedImageUrl(property.image_url, { width: 500 }) }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.priceBadge}>
          {pricing.isFlexible ? (
            <Text style={styles.priceText}>
              {'\u20B9'}{pricing.hourly?.toLocaleString('en-IN')}<Text style={styles.priceUnit}>/hr</Text>
              <Text style={styles.priceDot}> • </Text>
              {'\u20B9'}{pricing.daily?.toLocaleString('en-IN')}<Text style={styles.priceUnit}>/day</Text>
            </Text>
          ) : (
            <Text style={styles.priceText}>
              {'\u20B9'}{pricing.amount.toLocaleString('en-IN')}
              <Text style={styles.priceUnit}> {pricing.unitShort}</Text>
            </Text>
          )}
        </View>
        {pricing.isFlexible && (
          <View style={styles.flexibleBadge}>
            <Text style={styles.flexibleText}>FLEXIBLE PRICING</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.row}>
          {property.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {property.category.replace('_', ' ')}
              </Text>
            </View>
          )}

          {distance ? (
            <Text style={styles.distanceText}>📍 {distance} km away</Text>
          ) : property.distance_km !== undefined ? (
            <Text style={styles.distanceText}>
              Distance: {Number(property.distance_km).toFixed(1)} km
            </Text>
          ) : null}
        </View>

        {/* Footer actions */}
        <View style={styles.footer}>
          {property.status && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{property.status}</Text>
            </View>
          )}
          <View style={styles.actions}>
            {showDelete && (
              <TouchableOpacity
                onPress={() => onDelete?.(property.id)}
                disabled={isDeleting}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.viewText}>View →</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardDeleting: {
    opacity: 0.5,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: colors.borderLight,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  priceText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.md,
    color: colors.text,
  },
  priceUnit: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.xs,
    color: colors.primary,
  },
  priceDot: {
    color: colors.textMuted,
  },
  flexibleBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  flexibleText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#fff',
    letterSpacing: 0.5,
  },
  content: {
    padding: spacing.md,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.base,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    backgroundColor: colors.surfaceHover,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  categoryText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    textTransform: 'uppercase',
    color: colors.accent,
    letterSpacing: 0.5,
  },
  distanceText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  statusBadge: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    textTransform: 'uppercase',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    justifyContent: 'flex-end',
  },
  deleteButton: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  deleteText: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.xs,
    color: colors.errorText,
  },
  viewText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.sm,
    color: colors.primary,
  },
});
