/**
 * PropertyDetailScreen — displays full details, reviews, and contact info.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { getPropertyPricing } from '../../lib/property';
import { getOptimizedImageUrl } from '../../lib/cloudinary';
import { openDirections, openWhatsApp, openPhone, openEmail } from '../../lib/geo';
import LoadingScreen from '../../components/LoadingScreen';
import Toast from '../../components/Toast';

export default function PropertyDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { propertyId } = route.params;
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await api.get(`/properties/${propertyId}`);
        setProperty(res.data.data.property);
      } catch (err) {
        setErrorMsg('Failed to load property details');
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [propertyId]);

  if (loading) return <LoadingScreen />;
  if (!property) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Property not found</Text>
      </View>
    );
  }

  const pricing = getPropertyPricing(property);

  const handleLoginPrompt = () => {
    navigation.navigate('Auth', {
      screen: 'Login',
      params: { redirect: 'PropertyDetail', propertyId },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image Header */}
        <Image
          source={{ uri: getOptimizedImageUrl(property.image_url, { width: 800 }) }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          {/* Title & Category */}
          <View style={styles.headerRow}>
            {property.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{property.category.replace('_', ' ')}</Text>
              </View>
            )}
            <Text style={styles.statusText}>{property.status}</Text>
          </View>
          
          <Text style={styles.title}>{property.title}</Text>
          
          {/* Price */}
          <View style={styles.priceContainer}>
            {pricing.isFlexible ? (
              <View>
                <Text style={styles.priceText}>
                  {'\u20B9'}{pricing.hourly?.toLocaleString('en-IN')}<Text style={styles.priceUnit}>/hr</Text>
                </Text>
                <Text style={styles.priceText}>
                  {'\u20B9'}{pricing.daily?.toLocaleString('en-IN')}<Text style={styles.priceUnit}>/day</Text>
                </Text>
              </View>
            ) : (
              <Text style={styles.priceText}>
                {'\u20B9'}{pricing.amount.toLocaleString('en-IN')}
                <Text style={styles.priceUnit}> {pricing.unitShort}</Text>
              </Text>
            )}
          </View>

          <View style={styles.divider} />

          {/* Details Grid */}
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.grid}>
            {property.dimensions && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Dimensions</Text>
                <Text style={styles.gridValue}>{property.dimensions}</Text>
              </View>
            )}
            {property.area_sqft && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Area (sqft)</Text>
                <Text style={styles.gridValue}>{property.area_sqft}</Text>
              </View>
            )}
            {property.municipal_status && (
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Municipal Status</Text>
                <Text style={styles.gridValue}>{property.municipal_status}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {property.description && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{property.description}</Text>
            </>
          )}

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
              <Text style={styles.ownerName}>{property.owner_name}</Text>
              
              <View style={styles.contactActions}>
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                  onPress={() => openWhatsApp(property.owner_phone, `Hi, I'm interested in your property: ${property.title}`)}
                >
                  <Text style={styles.actionBtnText}>WhatsApp</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  onPress={() => openPhone(property.owner_phone)}
                >
                  <Text style={styles.actionBtnText}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, { backgroundColor: colors.accent }]}
                  onPress={() => openEmail(property.owner_email)}
                >
                  <Text style={styles.actionBtnText}>Email</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.divider} />

          {/* Directions */}
          <TouchableOpacity 
            style={styles.directionsBtn}
            onPress={() => openDirections(property.latitude, property.longitude)}
          >
            <Text style={styles.directionsText}>📍 Get Directions in Maps</Text>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
      <Toast message={errorMsg} visible={!!errorMsg} type="error" onHide={() => setErrorMsg('')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: spacing['4xl'] },
  heroImage: { width: '100%', height: 300, backgroundColor: colors.borderLight },
  content: { padding: spacing.lg, backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  categoryBadge: { backgroundColor: colors.surfaceHover, borderWidth: 1, borderColor: colors.borderLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: borderRadius.sm },
  categoryText: { fontFamily: fonts.bold, fontSize: 10, textTransform: 'uppercase', color: colors.accent, letterSpacing: 0.5 },
  statusText: { fontFamily: fonts.bold, fontSize: 10, textTransform: 'uppercase', color: colors.textSecondary },
  title: { fontFamily: fonts.serif, fontSize: fontSizes['2xl'], color: colors.text, marginBottom: spacing.xs },
  priceContainer: { marginTop: spacing.xs },
  priceText: { fontFamily: fonts.bold, fontSize: fontSizes.xl, color: colors.primary },
  priceUnit: { fontFamily: fonts.medium, fontSize: fontSizes.md, color: colors.textSecondary },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.lg },
  sectionTitle: { fontFamily: fonts.serif, fontSize: fontSizes.xl, color: colors.text, marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridItem: { width: '45%' },
  gridLabel: { fontFamily: fonts.medium, fontSize: fontSizes.xs, color: colors.textSecondary, textTransform: 'uppercase' },
  gridValue: { fontFamily: fonts.semiBold, fontSize: fontSizes.base, color: colors.text, marginTop: 2 },
  description: { fontFamily: fonts.regular, fontSize: fontSizes.md, color: colors.textSecondary, lineHeight: 24 },
  loginPrompt: { backgroundColor: colors.surfaceAlt, padding: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center' },
  loginPromptText: { fontFamily: fonts.medium, fontSize: fontSizes.sm, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  primaryButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.md },
  primaryButtonText: { fontFamily: fonts.bold, fontSize: fontSizes.sm, color: '#fff' },
  contactCard: { backgroundColor: colors.surfaceAlt, padding: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.borderLight },
  ownerName: { fontFamily: fonts.semiBold, fontSize: fontSizes.lg, color: colors.text, marginBottom: spacing.md },
  contactActions: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: borderRadius.sm, alignItems: 'center' },
  actionBtnText: { fontFamily: fonts.bold, fontSize: fontSizes.sm, color: '#fff' },
  directionsBtn: { backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight },
  directionsText: { fontFamily: fonts.bold, fontSize: fontSizes.md, color: colors.text },
  errorText: { fontFamily: fonts.medium, fontSize: fontSizes.base, color: colors.errorText },
});
