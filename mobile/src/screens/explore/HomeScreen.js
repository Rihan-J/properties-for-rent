/**
 * HomeScreen — Property discovery feed without map.
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../config/api';
import { useGeo } from '../../context/GeoContext';
import { calculateDistance } from '../../lib/geo';
import { getLat, getLng } from '../../lib/property';
import { colors, fonts, fontSizes, spacing } from '../../theme';
import SearchBar from '../../components/SearchBar';
import RadiusFilter from '../../components/RadiusFilter';
import CategoryFilter from '../../components/CategoryFilter';
import PropertyCard from '../../components/PropertyCard';
import EmptyState from '../../components/EmptyState';
import Toast from '../../components/Toast';
import LoadingScreen from '../../components/LoadingScreen';

// Default fallback: Bangalore (same as web)
const DEFAULT_CENTER = [12.9716, 77.5946];

export default function HomeScreen() {
  const geo = useGeo();
  const insets = useSafeAreaInsets();
  
  // ─── Core State ──────
  const [lat, setLat] = useState(DEFAULT_CENTER[0]);
  const [lng, setLng] = useState(DEFAULT_CENTER[1]);
  const [radius, setRadius] = useState(20);
  const [category, setCategory] = useState('all');
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const [properties, setProperties] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  const [geoStatus, setGeoStatus] = useState('detecting'); // detecting | granted | denied | searched
  const [locationName, setLocationName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const abortRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const hasInitialized = useRef(false);

  // ─── Fetch nearby properties ─────────
  const fetchNearbyProperties = useCallback(async (newLat, newLng, newRadius, newCategory, newBookingType = 'all') => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFetchingProperties(true);

    try {
      const params = { lat: newLat, lng: newLng, radius: newRadius, limit: 50 };
      if (newCategory && newCategory !== 'all') {
        params.category = newCategory;
      }
      if (newCategory === 'lodge' && newBookingType !== 'all') {
        params.booking_type = newBookingType;
      }
      const res = await api.get('/properties/nearby', { params, signal: controller.signal });
      
      if (!controller.signal.aborted) {
        const fetchedProps = res?.data?.data?.properties || [];
        const cleanProps = fetchedProps.filter(p => p != null && p.id != null);
        const sortedProps = cleanProps.sort((a, b) => {
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

  const handleExplore = useCallback(() => {
    setRadius(100);
    fetchNearbyProperties(lat, lng, 100, category, bookingTypeFilter);
  }, [lat, lng, category, bookingTypeFilter, fetchNearbyProperties]);

  const debouncedFetch = useCallback((...args) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchNearbyProperties(...args);
    }, 350);
  }, [fetchNearbyProperties]);

  // ─── React to GeoContext ─────────────
  useEffect(() => {
    if (geo.isDetecting) return;
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (geo.isGranted && geo.location) {
      setLat(geo.location.lat);
      setLng(geo.location.lng);
      setGeoStatus('granted');
      setLocationName('Your location');
      fetchNearbyProperties(geo.location.lat, geo.location.lng, radius, category, bookingTypeFilter);
    } else {
      setLat(DEFAULT_CENTER[0]);
      setLng(DEFAULT_CENTER[1]);
      setGeoStatus('denied');
      setLocationName('Bangalore (default)');
      fetchNearbyProperties(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radius, category, bookingTypeFilter);
    }

    setInitialLoading(false);
  }, [geo.isDetecting, geo.isGranted, geo.location]);

  useEffect(() => {
    if (!hasInitialized.current) {
      fetchNearbyProperties(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radius, category, bookingTypeFilter);
    }
  }, []);

  const handleLocationSelect = useCallback(async ({ lat: newLat, lng: newLng, name }) => {
    setLat(newLat);
    setLng(newLng);
    setGeoStatus('searched');
    setLocationName(name || 'Selected location');
    await fetchNearbyProperties(newLat, newLng, radius, category, bookingTypeFilter);
  }, [radius, category, bookingTypeFilter, fetchNearbyProperties]);

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

  const handleRecenter = useCallback(async () => {
    const coords = geo.location;

    if (coords) {
      setLat(coords.lat);
      setLng(coords.lng);
      setGeoStatus('granted');
      setLocationName('Your location');
      await fetchNearbyProperties(coords.lat, coords.lng, radius, category, bookingTypeFilter);
    } else {
      setLat(DEFAULT_CENTER[0]);
      setLng(DEFAULT_CENTER[1]);
      setGeoStatus('denied');
      setLocationName('Bangalore (default)');
      await fetchNearbyProperties(DEFAULT_CENTER[0], DEFAULT_CENTER[1], radius, category, bookingTypeFilter);
    }
  }, [radius, category, bookingTypeFilter, fetchNearbyProperties, geo]);

  // ─── Render ────────────────────────────────────────────
  
  const headerElement = (
    <View style={styles.headerWrapper}>
      <View style={styles.searchWrapper}>
        <SearchBar
          onLocationSelect={handleLocationSelect}
          onClear={handleRecenter}
          disabled={false}
        />
      </View>
      
      <View style={styles.radiusWrapper}>
        <RadiusFilter
          value={radius}
          onChange={handleRadiusChange}
          disabled={false}
        />
      </View>

      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>
          {geoStatus === 'searched' ? locationName : geoStatus === 'granted' ? 'Nearby Properties' : 'Properties'}
        </Text>
        <Text style={styles.sheetSubtitle}>
          {fetchingProperties ? 'Finding properties…' : `${properties.length} found within ${radius} km`}
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <CategoryFilter
          selectedCategory={category}
          onCategoryChange={handleCategoryChange}
          selectedBookingType={bookingTypeFilter}
          onBookingTypeChange={handleBookingTypeChange}
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={properties}
        keyExtractor={(i, index) => i?.id ?? `property-${index}`}
        ListHeaderComponent={headerElement}
        ListEmptyComponent={() => (
          fetchingProperties ? (
            <View style={styles.loadingWrapper}>
               <LoadingScreen type="list" />
            </View>
          ) : (
            <EmptyState
              title="We couldn't find stays nearby yet"
              subtitle="But don't worry — there are great options just a little further away. Try increasing your search radius."
              actionLabel="Explore Nearby Options"
              onAction={handleExplore}
            />
          )
        )}
        renderItem={({ item }) => {
          if (!item) return null;
          return (
            <PropertyCard
              property={item}
              userLat={lat}
              userLng={lng}
              style={styles.propertyCard}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Toast 
        message="Loading properties..." 
        visible={fetchingProperties && !initialLoading} 
        type="info"
        duration={0}
      />
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
  headerWrapper: {
    paddingTop: spacing.md,
    backgroundColor: colors.background,
  },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
  },
  radiusWrapper: {
    paddingHorizontal: spacing.lg,
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
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing['4xl'],
  },
  propertyCard: {
    marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
  },
  loadingWrapper: {
    marginTop: spacing.xl,
  }
});
