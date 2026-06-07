/**
 * MapViewComponent — wrapper around react-native-maps
 * Mirrors frontend/src/components/map/MapView.js
 * Uses CARTO Voyager tiles and Airbnb-style price pill markers (same as website).
 */
import React, { useRef, useEffect, useMemo, useState, Component } from 'react';
import { View, StyleSheet, Text, Image, Platform, TouchableOpacity, Dimensions } from 'react-native';
import RNMapView, { Marker, Circle, UrlTile } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts, borderRadius, spacing } from '../theme';
import { RADIUS_TO_DELTA, DEFAULT_ZOOM_DELTA } from '../config/constants';
import { getOptimizedImageUrl } from '../lib/cloudinary';
import { getLat, getLng, getPropertyPricing } from '../lib/property';

const { width } = Dimensions.get('window');

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.warn('[MapErrorBoundary] Map crashed:', error?.message);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>🗺️</Text>
          <Text style={styles.errorTitle}>Map could not load</Text>
          <Text style={styles.errorSubtitle}>Properties are still available in the list below.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function getSafeCoordinate(property) {
  const rawLat = getLat(property);
  const rawLng = getLng(property);
  if (rawLat == null || rawLng == null) return null;
  const lat = Number(rawLat);
  const lng = Number(rawLng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { latitude: lat, longitude: lng };
}



function MapViewInner({
  center,
  zoom,
  radius,
  properties,
  userLocation,
  recenterTrigger,
  onMarkerPress,
}) {
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const [selectedProperty, setSelectedProperty] = useState(null);

  const validProperties = useMemo(() => {
    const valid = [];
    if (!Array.isArray(properties)) return valid;
    for (const p of properties) {
      if (!p) continue;
      const coord = getSafeCoordinate(p);
      if (coord) valid.push({ ...p, _safeCoord: coord });
    }
    return valid;
  }, [properties]);

  // Mirror web MapUpdater: flyTo(center, zoom)
  useEffect(() => {
    if (!mapRef.current) return;
    if (center && center[0] != null && center[1] != null) {
      const delta = radius ? RADIUS_TO_DELTA[radius] : DEFAULT_ZOOM_DELTA;
      mapRef.current.animateToRegion({
        latitude: center[0],
        longitude: center[1],
        latitudeDelta: delta ? delta.latitudeDelta : DEFAULT_ZOOM_DELTA.latitudeDelta,
        longitudeDelta: delta ? delta.longitudeDelta : DEFAULT_ZOOM_DELTA.longitudeDelta,
      }, 1000);
    }
  }, [center, recenterTrigger, radius]);

  // Clear selection if center changes
  useEffect(() => {
    setSelectedProperty(null);
  }, [center]);

  if (!center || center[0] == null || center[1] == null) return null;

  const handleMarkerPress = (e, p) => {
    e.stopPropagation();
    setSelectedProperty(p);
    if (onMarkerPress) onMarkerPress(p);
    if (mapRef.current) {
      const delta = radius ? RADIUS_TO_DELTA[radius] : DEFAULT_ZOOM_DELTA;
      mapRef.current.animateToRegion({
        latitude: p._safeCoord.latitude - (delta.latitudeDelta * 0.15),
        longitude: p._safeCoord.longitude,
        latitudeDelta: delta.latitudeDelta * 0.5,
        longitudeDelta: delta.longitudeDelta * 0.5,
      }, 600);
    }
  };

  return (
    <View style={styles.container}>
      <RNMapView
        ref={mapRef}
        style={styles.map}
        mapType="none"
        initialRegion={{
          latitude: center[0],
          longitude: center[1],
          latitudeDelta: DEFAULT_ZOOM_DELTA.latitudeDelta,
          longitudeDelta: DEFAULT_ZOOM_DELTA.longitudeDelta,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={() => setSelectedProperty(null)}
      >
        {/* CARTO Voyager tiles — exact same as website */}
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {/* Radius circle */}
        {radius && (
          <Circle
            center={{ latitude: center[0], longitude: center[1] }}
            radius={radius * 1000}
            fillColor="rgba(181, 147, 107, 0.12)"
            strokeColor="rgba(181, 147, 107, 0.8)"
            strokeWidth={1.5}
            zIndex={0}
          />
        )}

        {/* Center marker */}
        <Marker
          coordinate={{ latitude: center[0], longitude: center[1] }}
          zIndex={0}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.centerDot} />
        </Marker>

        {/* Property markers */}
        {validProperties.map((p) => {
          const isSelected = selectedProperty?.id === p.id;
          return (
            <Marker
              key={p.id}
              coordinate={p._safeCoord}
              onPress={(e) => handleMarkerPress(e, p)}
              zIndex={isSelected ? 999 : 1}
            >
              <View style={styles.markerContainer}>
                <View style={[styles.simpleDot, isSelected && styles.simpleDotSelected]} />
              </View>
            </Marker>
          );
        })}
      </RNMapView>

      {/* OSM Attribution overlay to replace hidden Google logo */}
      <View style={styles.osmAttribution} pointerEvents="none">
        <Text style={styles.osmAttributionText}>© OpenStreetMap contributors</Text>
      </View>

      {/* Property toast on marker tap (mobile equivalent of web Popup) */}
      {selectedProperty && (
        <View style={styles.toastWrapper}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedProperty(null)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toastCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('PropertyDetail', { propertyId: selectedProperty.id })}
          >
            <View style={styles.toastImageWrapper}>
              {selectedProperty.image_url ? (
                <Image
                  source={{ uri: getOptimizedImageUrl(selectedProperty.image_url, { width: 300 }) }}
                  style={styles.toastImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderBg}>
                  <Text style={styles.placeholderEmoji}>📷</Text>
                </View>
              )}
              {/* Price badge over image (exact web .apna-popup-price-badge) */}
              <View style={styles.toastPriceBadge}>
                <Text style={styles.toastPriceBadgeText}>
                  {getPropertyPricing(selectedProperty).isFlexible
                    ? `₹${getPropertyPricing(selectedProperty).hourly?.toLocaleString('en-IN')}/hr | ₹${getPropertyPricing(selectedProperty).daily?.toLocaleString('en-IN')}/day`
                    : `₹${getPropertyPricing(selectedProperty).amount.toLocaleString('en-IN')}${getPropertyPricing(selectedProperty).unitShort}`
                  }
                </Text>
              </View>
            </View>

            <View style={styles.toastContent}>
              <Text style={styles.toastTitle} numberOfLines={2}>
                {selectedProperty.title || 'Untitled Property'}
              </Text>

              {selectedProperty.category && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{selectedProperty.category.replace('_', ' ')}</Text>
                </View>
              )}

              {selectedProperty.distance_km !== undefined && (
                <Text style={styles.toastDistance}>
                  Distance: {Number(selectedProperty.distance_km).toFixed(1)} km
                </Text>
              )}

              <View style={styles.toastCta}>
                <Text style={styles.toastCtaText}>View Details →</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function MapViewComponent(props) {
  return (
    <MapErrorBoundary>
      <MapViewInner {...props} />
    </MapErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.borderLight, overflow: 'hidden', position: 'relative' },
  map: { position: 'absolute', top: -30, left: -10, right: -10, bottom: -30 },

  osmAttribution: { position: 'absolute', bottom: 4, right: 6, backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, zIndex: 10 },
  osmAttributionText: { fontSize: 9, color: '#444', fontFamily: fonts.regular },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0ece7',
  },
  errorEmoji: { fontSize: 40, marginBottom: 12 },
  errorTitle: { fontFamily: fonts.semiBold, fontSize: 16, color: '#1a1815', marginBottom: 4 },
  errorSubtitle: { fontFamily: fonts.regular, fontSize: 13, color: '#5a5550', textAlign: 'center', paddingHorizontal: 40 },

  // ─── Simple Dot Markers ────────────────────────────────
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  simpleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#b5936b',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  simpleDotSelected: {
    backgroundColor: '#1a1815',
    transform: [{ scale: 1.3 }],
  },

  // Center dot
  centerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(181, 147, 107, 0.8)',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },

  // ─── Toast / Popup Card (matches web .apna-popup-card) ─
  toastWrapper: {
    position: 'absolute',
    top: 90,
    left: spacing.md,
    right: spacing.md,
    zIndex: 1000,
  },
  toastCard: {
    flexDirection: 'row',
    height: 120,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: -12,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.25)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  closeIcon: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  toastImageWrapper: {
    width: 120,
    height: '100%',
    backgroundColor: colors.borderLight,
    position: 'relative',
  },
  toastImage: { width: '100%', height: '100%' },
  placeholderBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
  },
  placeholderEmoji: { fontSize: 24 },
  // Price badge over image (web .apna-popup-price-badge)
  toastPriceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(26, 24, 21, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  toastPriceBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: -0.1,
  },
  toastContent: {
    flex: 1,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  toastTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
    marginBottom: 2,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fdf8f4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#f0ece7',
    marginTop: 2,
    marginBottom: 4,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: '#8a6b4a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  toastDistance: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  // CTA button (web .apna-popup-cta)
  toastCta: {
    backgroundColor: '#1a1815',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  toastCtaText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: fonts.bold,
  },
});