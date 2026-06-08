/**
 * PropertyDetailScreen — displays full details, reviews, and contact info.
 * Fully hardened with defensive null checks for production stability.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { getPropertyPricing, getLat, getLng } from '../../lib/property';
import { getOptimizedImageUrl } from '../../lib/cloudinary';
import { openDirections, openWhatsApp, openPhone, openEmail } from '../../lib/geo';
import ReviewsSection from '../../components/ReviewsSection';
import LoadingScreen from '../../components/LoadingScreen';
import Toast from '../../components/Toast';

export default function PropertyDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { propertyId } = route.params || {};
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!propertyId) {
      setErrorMsg('Invalid property ID');
      setLoading(false);
      return;
    }

    async function fetchDetails() {
      try {
        const res = await api.get(`/properties/${propertyId}`);
        const prop = res?.data?.data?.property || res?.data?.data || null;
        setProperty(prop);
      } catch (err) {
        console.warn('[PropertyDetail] Fetch error:', err?.response?.status, err?.message);
        setErrorMsg('Failed to load property details');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [propertyId]);

  if (loading) return <LoadingScreen type="detail" />;
  if (!property) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Property not found</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
        <Toast message={errorMsg} visible={!!errorMsg} type="error" onHide={() => setErrorMsg('')} />
      </View>
    );
  }

  const pricing = getPropertyPricing(property);

  // Safe coordinate extraction — API may return lat/lng or latitude/longitude
  const propLat = getLat(property);
  const propLng = getLng(property);

  // Safe owner data extraction
  const ownerName = property.owner_name || property.owner?.name || 'Property Owner';
  const ownerPhone = property.owner_phone || property.owner?.phone || '';
  const ownerEmail = property.owner_email || property.owner?.email || '';

  // Safe image URL
  const imageUrl = property.image_url || '';

  const handleLoginPrompt = () => {
    navigation.navigate('Auth', {
      screen: 'Login',
      params: { redirect: 'PropertyDetail', params: { propertyId } },
    });
  };

  // Safe price formatting
  const formatAmount = (amount) => {
    const num = Number(amount);
    if (Number.isNaN(num)) return '0';
    return num.toLocaleString('en-IN');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Header */}
        {imageUrl ? (
          <Image
            source={{ uri: getOptimizedImageUrl(imageUrl, { width: 800 }) }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📷 No Image</Text>
          </View>
        )}
        
        <View style={styles.content}>
          {/* Title & Category */}
          <View style={styles.headerRow}>
            {property.category ? (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{property.category.replace('_', ' ')}</Text>
              </View>
            ) : null}
            {property.status ? (
              <Text style={styles.statusText}>{property.status}</Text>
            ) : null}
          </View>
          
          <Text style={styles.title}>{property.title || 'Untitled Property'}</Text>
          
          {/* Price */}
          <View style={styles.priceContainer}>
            {pricing.isFlexible ? (
              <View>
                {pricing.hourly != null && (
                  <Text style={styles.priceText}>
                    {'\u20B9'}{formatAmount(pricing.hourly)}<Text style={styles.priceUnit}>/hr</Text>
                  </Text>
                )}
                {pricing.daily != null && (
                  <Text style={styles.priceText}>
                    {'\u20B9'}{formatAmount(pricing.daily)}<Text style={styles.priceUnit}>/day</Text>
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.priceText}>
                {'\u20B9'}{formatAmount(pricing.amount)}
                <Text style={styles.priceUnit}> {pricing.unitShort || '/mo'}</Text>
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Details Grid */}
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.grid}>
            {property.dimensions ? (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Dimensions</Text>
                <Text style={styles.gridValue}>{property.dimensions}</Text>
              </View>
            ) : null}
            {property.area_sqft ? (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Area (sqft)</Text>
                <Text style={styles.gridValue}>{property.area_sqft}</Text>
              </View>
            ) : null}
            {property.municipal_status ? (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Municipal Status</Text>
                <Text style={styles.gridValue}>{property.municipal_status}</Text>
              </View>
            ) : null}
          </View>

          {/* Description */}
          {property.description ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{property.description}</Text>
            </>
          ) : null}

          <View style={styles.divider} />

          {/* Contact Section */}
          <Text style={styles.sectionTitle}>Owner Contact</Text>
          {!user ? (
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Login to view owner details and contact them directly.</Text>
              <TouchableOpacity style={styles.primaryButton} onPress={handleLoginPrompt}>
                <Text style={styles.primaryButtonText}>Login to View Details</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.contactCard}>
              <Text style={styles.ownerName}>{ownerName}</Text>
              
              <View style={styles.contactActions}>
                {ownerPhone ? (
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                    onPress={() => openWhatsApp(ownerPhone, `Hi, I'm interested in your property: ${property.title || 'Listing'}`)}
                  >
                    <Text style={styles.actionBtnText}>WhatsApp</Text>
                  </TouchableOpacity>
                ) : null}
                
                {ownerPhone ? (
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => openPhone(ownerPhone)}
                  >
                    <Text style={styles.actionBtnText}>Call</Text>
                  </TouchableOpacity>
                ) : null}

                {ownerEmail ? (
                  <TouchableOpacity 
                    style={[styles.actionBtn, { backgroundColor: colors.accent }]}
                    onPress={() => openEmail(ownerEmail)}
                  >
                    <Text style={styles.actionBtnText}>Email</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {!ownerPhone && !ownerEmail && (
                <Text style={styles.noContactText}>Contact information not available</Text>
              )}
            </View>
          )}

          <View style={styles.divider} />

          {/* Directions — uses safe getLat/getLng instead of raw .latitude/.longitude */}
          {propLat != null && propLng != null ? (
            <TouchableOpacity 
              style={styles.directionsBtn}
              onPress={() => openDirections(propLat, propLng)}
            >
              <Text style={styles.directionsText}>📍 Get Directions in Maps</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.directionsBtn}>
              <Text style={[styles.directionsText, { color: colors.textMuted }]}>📍 Location not available</Text>
            </View>
          )}

          <View style={styles.divider} />
          
          {/* Reviews Section */}
          <ReviewsSection propertyId={property.id} />
          
        </View>
      </ScrollView>
      <Toast message={errorMsg} visible={!!errorMsg} type="error" onHide={() => setErrorMsg('')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  scrollContent: { paddingBottom: spacing['4xl'] },
  heroImage: { width: '100%', height: 350, backgroundColor: colors.borderLight },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontFamily: fonts.medium, fontSize: fontSizes.xl, color: colors.textMuted },
  content: { padding: 24, backgroundColor: colors.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -32 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  categoryBadge: { backgroundColor: colors.surfaceHover, borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.sm },
  categoryText: { fontFamily: fonts.bold, fontSize: 10, textTransform: 'uppercase', color: colors.accent, letterSpacing: 0.5 },
  statusText: { fontFamily: fonts.bold, fontSize: 10, textTransform: 'uppercase', color: colors.textSecondary },
  title: { fontFamily: fonts.serif, fontSize: 32, color: colors.text, marginBottom: spacing.xs, lineHeight: 36 },
  priceContainer: { marginTop: 8, padding: 16, backgroundColor: '#f7f4f0', borderRadius: 16, borderWidth: 1, borderColor: '#e2ddd8', alignItems: 'center' },
  priceText: { fontFamily: fonts.bold, fontSize: 28, color: colors.primary, letterSpacing: -0.5 },
  priceUnit: { fontFamily: fonts.bold, fontSize: 12, color: colors.primary, textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.lg },
  sectionTitle: { fontFamily: fonts.serif, fontSize: fontSizes.xl, color: colors.text, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridItem: { width: '47%', backgroundColor: '#faf9f7', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e8e2db' },
  gridLabel: { fontFamily: fonts.bold, fontSize: 10, color: '#b8b0a6', textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.5 },
  gridValue: { fontFamily: fonts.semiBold, fontSize: 14, color: '#1a1815' },
  description: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, lineHeight: 24, padding: 20, backgroundColor: '#faf9f7', borderRadius: 16, borderWidth: 1, borderColor: '#e8e2db' },
  loginPrompt: { backgroundColor: colors.surfaceAlt, padding: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center' },
  loginPromptText: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  primaryButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.md },
  primaryButtonText: { fontFamily: fonts.bold, fontSize: fontSizes.sm, color: '#fff' },
  contactCard: { backgroundColor: '#ffffff', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#e8e2db', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  ownerName: { fontFamily: fonts.semiBold, fontSize: 18, color: colors.text, marginBottom: spacing.md },
  contactActions: { flexDirection: 'column', gap: 12 },
  actionBtn: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  actionBtnText: { fontFamily: fonts.bold, fontSize: fontSizes.sm, color: '#fff' },
  noContactText: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.textMuted, textAlign: 'center' },
  directionsBtn: { backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  directionsText: { fontFamily: fonts.bold, fontSize: fontSizes.md, color: colors.text },
  errorText: { fontFamily: fonts.medium, fontSize: fontSizes.base, color: colors.errorText, marginBottom: spacing.md },
  backBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.md },
  backBtnText: { fontFamily: fonts.bold, fontSize: fontSizes.sm, color: '#fff' },
});
