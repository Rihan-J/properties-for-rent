/**
 * HomeScreen — full-screen map with bottom sheet list.
 */
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../config/api';
import { useGeo } from '../../context/GeoContext';
import { calculateDistance } from '../../lib/geo';
import { getLat, getLng } from '../../lib/property';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import MapViewComponent from '../../components/MapViewComponent';
import SearchBar from '../../components/SearchBar';
import RadiusFilter from '../../components/RadiusFilter';
import CategoryFilter from '../../components/CategoryFilter';
import PropertyCard from '../../components/PropertyCard';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';

const DEFAULT_CENTER = [12.9716, 77.5946];
const FALLBACK_ZOOM = 13;

export default function HomeScreen() {
  const geo = useGeo();
  const insets = useSafeAreaInsets();
  
  // ─── State ─────────────────────────────────────────────
  const [lat, setLat] = useState(DEFAULT_CENTER[0]);
  const [lng, setLng] = useState(DEFAULT_CENTER[1]);
  const [radius, setRadius] = useState(10);
  const [category, setCategory] = useState('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const [zoom, setZoom] = useState(FALLBACK_ZOOM);
  const [properties, setProperties] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  const [geoStatus, setGeoStatus] = useState('detecting'); 
  const [locationName, setLocationName] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  const abortRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const hasInitialized = useRef(false);
  const bottomSheetRef = useRef(null);
  
  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['20%', '50%', '90%'], []);

  // ─── Fetch properties ──────────────────────────────────
  const fetchNearbyProperties = useCallback(async (newLat, newLng, newRadius, newCategory, newBookingType = 'all') => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFetchingProperties(true);

    try {
      const params = { lat: newLat, lng: newLng, radius: newRadius, limit: 50 };
      if (newCategory && newCategory !== 'all') params.category = newCategory;
      if (newCategory === 'lodge' && newBookingType !== 'all') params.booking_type = newBookingType;
      
      const res = await api.get('/properties/nearby', { params, signal: controller.signal });
      
      if (!controller.signal.aborted) {
        const fetchedProps = res.data.data.properties || [];
        const sortedProps = fetchedProps.sort((a, b) => {
          const d1 = calculateDistance(newLat, newLng, getLat(a), getLng(a));
          const d2 = calculateDistance(newLat, newLng, getLat(b), getLng(b));
          return Number(d1 || Infinity) - Number(d2 || Infinity);
        });
        setProperties(sortedProps);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        setErrorMsg('Failed to load nearby properties');
      }
    } finally {
      if (!controller.signal.aborted) {
        setFetchingProperties(false);
      }
    }
  }, []);

  const debouncedFetch = useCallback((...args) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => fetchNearbyProperties(...args), 350);
  }, [fetchNearbyProperties]);

  // ─── Geo sync ──────────────────────────────────────────
  useEffect(() => {
    if (geo.isDetecting) return;
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (geo.isGranted) {
      setLat(geo.location.lat);
      setLng(geo.location.lng);
      setZoom(FALLBACK_ZOOM);
      setGeoStatus('granted');
      setUserLocation([geo.location.lat, geo.location.lng]);
      setLocationName('Your location');
      fetchNearbyProperties(geo.location.lat, geo.location.lng, radius, category, bookingTypeFilter);
    } else {
      setLat(DEFAULT_CENTER[0]);
      setLng(DEFAULT_CENTER[1]);
      setZoom(FALLBACK_ZOOM);
      setGeoStatus('denied');
      setLocationName('Bangalore (default)');
      fetchNearbyProperties(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radius, category, bookingTypeFilter);
    }
    setInitialLoading(false);
  }, [geo.isDetecting, geo.isGranted, geo.location, fetchNearbyProperties, radius, category, bookingTypeFilter]);

  useEffect(() => {
    if (!hasInitialized.current) {
      fetchNearbyProperties(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radius, category, bookingTypeFilter);
    }
  }, []);

  // ─── Handlers ──────────────────────────────────────────
  const handleLocationSelect = useCallback(async ({ lat: newLat, lng: newLng, name }) => {
    setLat(newLat);
    setLng(newLng);
    setGeoStatus('searched');
    setLocationName(name || 'Selected location');
    await fetchNearbyProperties(newLat, newLng, radius, category, bookingTypeFilter);
  }, [radius, category, bookingTypeFilter, fetchNearbyProperties]);

  const handleRecenter = useCallback(async () => {
    const coords = await geo.redetect();
    if (coords) {
      setLat(coords.lat);
      setLng(coords.lng);
      setGeoStatus('granted');
      setUserLocation([coords.lat, coords.lng]);
      setLocationName('Your location');
      setRecenterTrigger(prev => prev + 1);
      await fetchNearbyProperties(coords.lat, coords.lng, radius, category, bookingTypeFilter);
    } else {
      setErrorMsg('Location permission denied');
    }
  }, [geo, radius, category, bookingTypeFilter, fetchNearbyProperties]);

  const handleRadiusChange = useCallback((newRadius) => {
    setRadius(newRadius);
    debouncedFetch(lat, lng, newRadius, category, bookingTypeFilter);
  }, [lat, lng, category, bookingTypeFilter, debouncedFetch]);

  const handleCategoryChange = useCallback((newCategory) => {
    setCategory(newCategory);
    setBookingTypeFilter('all');
    debouncedFetch(lat, lng, radius, newCategory, 'all');
  }, [lat, lng, radius, debouncedFetch]);

  const handleBookingTypeChange = useCallback((newBookingType) => {
    setBookingTypeFilter(newBookingType);
    debouncedFetch(lat, lng, radius, category, newBookingType);
  }, [lat, lng, radius, category, debouncedFetch]);

  // ─── Render ────────────────────────────────────────────
  const mapCenter = useMemo(() => [lat, lng], [lat, lng]);

  return (
    <View style={styles.container}>
      <SearchBar
        onLocationSelect={handleLocationSelect}
        onClear={handleRecenter}
        disabled={false}
      />
      <RadiusFilter
        value={radius}
        onChange={handleRadiusChange}
        disabled={false}
      />
      
      <MapViewComponent
        center={mapCenter}
        zoom={zoom}
        radius={radius}
        properties={properties}
        userLocation={userLocation}
        recenterTrigger={recenterTrigger}
      />

      {/* Recenter FAB */}
      <TouchableOpacity
        style={[styles.recenterFab, { bottom: '25%' }]}
        onPress={handleRecenter}
      >
        <Text style={styles.fabIcon}>📍</Text>
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBg}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {geoStatus === 'searched' ? locationName : geoStatus === 'granted' ? 'Nearby Properties' : 'Properties'}
          </Text>
          <Text style={styles.sheetSubtitle}>{properties.length} found within {radius} km</Text>
        </View>

        <View style={styles.filtersContainer}>
          <CategoryFilter
            selectedCategory={category}
            onCategoryChange={handleCategoryChange}
            selectedBookingType={bookingTypeFilter}
            onBookingTypeChange={handleBookingTypeChange}
          />
        </View>

        {fetchingProperties ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Finding properties...</Text>
          </View>
        ) : properties.length === 0 ? (
          <EmptyState
            title="We couldn't find stays nearby yet"
            subtitle="Try increasing your search radius or exploring another area."
            actionLabel="Explore 100km Radius"
            onAction={() => handleRadiusChange(100)}
          />
        ) : (
          <BottomSheetFlatList
            data={properties}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
              <PropertyCard
                property={item}
                userLat={lat}
                userLng={lng}
                style={styles.propertyCard}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
        )}
      </BottomSheet>

      <Toast 
        message={errorMsg} 
        visible={!!errorMsg} 
        type="error"
        onHide={() => setErrorMsg('')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  recenterFab: {
    position: 'absolute',
    right: spacing.base,
    backgroundColor: colors.surface,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 90,
  },
  fabIcon: {
    fontSize: 20,
  },
  bottomSheetBg: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  bottomSheetIndicator: {
    backgroundColor: colors.border,
    width: 40,
  },
  sheetHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  sheetTitle: {
    fontFamily: fonts.serif,
    fontSize: fontSizes['2xl'],
    color: colors.text,
  },
  sheetSubtitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filtersContainer: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing['4xl'], // Safe area for tabs
  },
  propertyCard: {
    marginBottom: spacing.md,
  },
  centerContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});
