/**
 * MapPicker — draggable marker for selecting property location.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';
import { MAP_PROVIDER, DEFAULT_ZOOM_DELTA, DEFAULT_LOCATION } from '../config/constants';

export default function MapPicker({ initialLocation, onLocationSelect }) {
  const [region, setRegion] = useState({
    latitude: initialLocation?.lat || DEFAULT_LOCATION.lat,
    longitude: initialLocation?.lng || DEFAULT_LOCATION.lng,
    ...DEFAULT_ZOOM_DELTA,
  });

  const [markerCoord, setMarkerCoord] = useState({
    latitude: initialLocation?.lat || DEFAULT_LOCATION.lat,
    longitude: initialLocation?.lng || DEFAULT_LOCATION.lng,
  });

  useEffect(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      setRegion({
        latitude: initialLocation.lat,
        longitude: initialLocation.lng,
        ...DEFAULT_ZOOM_DELTA,
      });
      setMarkerCoord({
        latitude: initialLocation.lat,
        longitude: initialLocation.lng,
      });
    }
  }, [initialLocation]);

  const handleDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerCoord({ latitude, longitude });
    onLocationSelect({ lat: latitude, lng: longitude });
  };

  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const pos = await Location.getCurrentPositionAsync({});
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setRegion({ ...coords, ...DEFAULT_ZOOM_DELTA });
      setMarkerCoord(coords);
      onLocationSelect({ lat: coords.latitude, lng: coords.longitude });
    } catch (err) {
      console.warn('Failed to get current location', err);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={MAP_PROVIDER}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        <Marker
          coordinate={markerCoord}
          draggable
          onDragEnd={handleDragEnd}
          pinColor={colors.primary}
        />
      </MapView>

      <TouchableOpacity style={styles.gpsBtn} onPress={useCurrentLocation}>
        <Text style={styles.gpsIcon}>📍</Text>
      </TouchableOpacity>

      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>Hold and drag the pin to set exact location</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', height: 250, borderRadius: borderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, position: 'relative' },
  map: { width: '100%', height: '100%' },
  gpsBtn: { position: 'absolute', right: spacing.md, bottom: spacing.xl, backgroundColor: colors.surface, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  gpsIcon: { fontSize: 18 },
  instructionBox: { position: 'absolute', top: spacing.sm, left: spacing.md, right: spacing.md, backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center' },
  instructionText: { fontFamily: fonts.medium, fontSize: fontSizes.xs, color: colors.textSecondary },
});
