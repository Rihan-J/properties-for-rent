/**
 * MapPicker — precise map picker matching frontend implementation.
 * Supports manual coordinates, Use My Location, Open in Google Maps, and map tap-to-pin.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import RNMapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';
import SearchBar from './SearchBar';

// --- DMS → Decimal converter (from web) ---
function dmsToDecimal(dms) {
  const parts = dms.match(/(\d+)[°](\d+)['\u2032]([\d.]+)["\u2033]([NSEW])/i);
  if (!parts) return null;
  const degrees = parseFloat(parts[1]);
  const minutes = parseFloat(parts[2]);
  const seconds = parseFloat(parts[3]);
  const direction = parts[4].toUpperCase();
  let decimal = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') decimal *= -1;
  return decimal;
}

function parseCoordinates(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (trimmed.includes('°')) {
    const parts = trimmed.split(/[\s,]+/).filter(p => p.includes('°'));
    if (parts.length === 2) {
      const lat = dmsToDecimal(parts[0]);
      const lng = dmsToDecimal(parts[1]);
      if (lat !== null && lng !== null) return { lat, lng };
    }
    return null;
  }
  const parts = trimmed.split(/[\s,]+/).filter(Boolean);
  if (parts.length === 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

export default function MapPicker({ initialLocation, onLocationSelect }) {
  const [detecting, setDetecting] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [coordInput, setCoordInput] = useState('');
  const [coordError, setCoordError] = useState('');
  
  const [markerCoord, setMarkerCoord] = useState(initialLocation || null);

  const [region, setRegion] = useState({
    latitude: initialLocation?.lat || 15.3173,
    longitude: initialLocation?.lng || 75.7139,
    latitudeDelta: initialLocation ? 0.05 : 10,
    longitudeDelta: initialLocation ? 0.05 : 10,
  });

  useEffect(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      setMarkerCoord({ lat: initialLocation.lat, lng: initialLocation.lng });
      setRegion({
        latitude: initialLocation.lat,
        longitude: initialLocation.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [initialLocation]);

  const handleUseMyLocation = async () => {
    try {
      setDetecting(true);
      setShowLocationWarning(false);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        setDetecting(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      
      setMarkerCoord(coords);
      onLocationSelect?.(coords);
      setRegion({ latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      setShowLocationWarning(true);
    } catch (err) {
      console.warn('Failed to get current location', err);
      alert('Could not detect your location. Please click on the map instead.');
    } finally {
      setDetecting(false);
    }
  };

  const handleOpenGoogleMaps = () => {
    if (!markerCoord?.lat) return;
    Linking.openURL(`https://www.google.com/maps?q=${markerCoord.lat},${markerCoord.lng}`);
  };

  const handleResetPin = () => {
    setMarkerCoord(null);
    onLocationSelect?.(null);
    setShowLocationWarning(false);
  };

  const handleMapPress = (e) => {
    const coordinate = e?.nativeEvent?.coordinate;
    if (!coordinate) return;
    const coords = { lat: coordinate.latitude, lng: coordinate.longitude };
    setMarkerCoord(coords);
    onLocationSelect?.(coords);
  };

  return (
    <View style={styles.container}>
      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnEmerald]} onPress={handleUseMyLocation} disabled={detecting}>
          {detecting ? (
            <ActivityIndicator size="small" color="#047857" style={styles.actionIconLoading} />
          ) : (
            <Text style={styles.actionIcon}>🎯</Text>
          )}
          <Text style={styles.actionBtnEmeraldText}>{detecting ? 'Detecting...' : 'Use My Location'}</Text>
        </TouchableOpacity>

        {markerCoord && (
          <>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnGray]} onPress={handleOpenGoogleMaps}>
              <Text style={styles.actionIcon}>🗺️</Text>
              <Text style={styles.actionBtnGrayText}>Open in Maps</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnRed]} onPress={handleResetPin}>
              <Text style={styles.actionIcon}>✖</Text>
              <Text style={styles.actionBtnRedText}>Reset Pin</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Location warning */}
      {showLocationWarning && (
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>Location may not be exact. Adjust the pin if needed.</Text>
          <TouchableOpacity onPress={() => setShowLocationWarning(false)} hitSlop={{top:10, bottom:10, left:10, right:10}}>
            <Text style={styles.warningClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={{ zIndex: 100, marginBottom: 12 }}>
        <SearchBar 
          onLocationSelect={(loc) => {
            setMarkerCoord(loc);
            onLocationSelect?.(loc);
            setRegion({ latitude: loc.lat, longitude: loc.lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });
          }} 
        />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <RNMapView
          style={styles.map}
          region={region}
          onPress={handleMapPress}
          mapType="none"
        >
          {/* Using CARTO Voyager tiles to prevent OSM User-Agent blocking */}
          <UrlTile
            urlTemplate="https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
            maximumZ={19}
            flipY={false}
          />
          {markerCoord && (
            <Marker coordinate={{ latitude: markerCoord.lat, longitude: markerCoord.lng }} />
          )}
        </RNMapView>
        {/* OSM Attribution overlay */}
        <View style={styles.osmAttribution} pointerEvents="none">
          <Text style={styles.osmAttributionText}>© OpenStreetMap contributors</Text>
        </View>
        <View style={styles.mapOverlay} pointerEvents="none">
          <Text style={styles.mapHint}>Click anywhere on the map to drop a pin</Text>
        </View>
      </View>

      {/* Coordinates display */}
      {markerCoord && (
        <Text style={styles.coordDisplay}>
          📍 {markerCoord.lat.toFixed(6)}, {markerCoord.lng.toFixed(6)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  actionIcon: { fontSize: 14, marginRight: 6 },
  actionIconLoading: { marginRight: 6 },
  
  actionBtnEmerald: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  actionBtnEmeraldText: { color: '#047857', fontFamily: fonts.medium, fontSize: 12 },
  
  actionBtnGray: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' },
  actionBtnGrayText: { color: '#4b5563', fontFamily: fonts.medium, fontSize: 12 },
  
  actionBtnRed: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  actionBtnRedText: { color: '#dc2626', fontFamily: fonts.medium, fontSize: 12 },

  warningBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fefce8', borderColor: '#fef08a', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginBottom: 12 },
  warningIcon: { fontSize: 14, marginRight: 6 },
  warningText: { flex: 1, color: '#a16207', fontSize: 11, fontFamily: fonts.regular },
  warningClose: { color: '#facc15', fontSize: 14, fontFamily: fonts.bold },

  coordBox: { backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  coordInputRow: { flexDirection: 'row', gap: 8 },
  coordInput: { flex: 1, backgroundColor: '#f9fafb', borderColor: '#e5e7eb', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: colors.text, fontFamily: fonts.regular },
  coordApplyBtn: { backgroundColor: '#1f2937', paddingHorizontal: 16, justifyContent: 'center', borderRadius: 8 },
  coordApplyText: { color: '#ffffff', fontSize: 12, fontFamily: fonts.semiBold },
  coordError: { color: '#ef4444', fontSize: 11, marginTop: 4, fontFamily: fonts.medium },
  coordHint: { color: '#9ca3af', fontSize: 10, marginTop: 4, fontFamily: fonts.regular },

  mapContainer: { width: '100%', height: 350, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#d1d5db', position: 'relative', marginBottom: 8 },
  map: { position: 'absolute', top: -30, left: -10, right: -10, bottom: -30 },

  osmAttribution: { position: 'absolute', bottom: 4, right: 6, backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, zIndex: 10 },
  osmAttributionText: { fontSize: 9, color: '#444', fontFamily: fonts.regular },
  mapOverlay: { position: 'absolute', top: 12, left: 0, right: 0, alignItems: 'center' },
  mapHint: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, fontSize: 11, color: '#374151', fontFamily: fonts.medium, overflow: 'hidden' },

  coordDisplay: { fontSize: 12, color: '#9ca3af', fontFamily: fonts.regular, marginTop: 4 },
});
