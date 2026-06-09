/**
 * MapPicker — precise map picker using WebView + Leaflet (OSM).
 * Supports manual coordinates, Use My Location, Open in Google Maps, and map tap-to-pin.
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../theme';
import SearchBar from './SearchBar';

export default function MapPicker({ initialLocation, onLocationSelect }) {
  const [detecting, setDetecting] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  
  const [markerCoord, setMarkerCoord] = useState(initialLocation || null);
  const webviewRef = useRef(null);

  const htmlContent = useMemo(() => {
    const lat = initialLocation?.lat || 15.3173;
    const lng = initialLocation?.lng || 75.7139;
    const hasInitial = !!initialLocation;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { padding: 0; margin: 0; }
    html, body, #map { height: 100%; width: 100%; touch-action: none; overscroll-behavior: none; }
    .leaflet-control-attribution a[title="A JavaScript library for interactive maps"] { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], ${hasInitial ? '15' : '10'});
    L.tileLayer('https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var marker = null;
    ${hasInitial ? `
      marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);
      marker.on('dragend', function(event) {
        var pos = event.target.getLatLng();
        map.panTo(pos);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'locationSelect', lat: pos.lat, lng: pos.lng }));
      });
    ` : ''}

    map.on('click', function(e) {
      var lat = e.latlng.lat;
      var lng = e.latlng.lng;
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng, { draggable: true }).addTo(map);
        marker.on('dragend', function(event) {
          var pos = event.target.getLatLng();
          map.panTo(pos);
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'locationSelect', lat: pos.lat, lng: pos.lng }));
        });
      }
      map.panTo(e.latlng);
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'locationSelect', lat: lat, lng: lng }));
    });

    window.updateMarker = function(lat, lng) {
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on('dragend', function(event) {
          var pos = event.target.getLatLng();
          map.panTo(pos);
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'locationSelect', lat: pos.lat, lng: pos.lng }));
        });
      }
      map.setView([lat, lng], 15);
    };

    window.resetMarker = function() {
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
    };
  </script>
</body>
</html>
    `;
  }, []);

  useEffect(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      setMarkerCoord({ lat: initialLocation.lat, lng: initialLocation.lng });
      webviewRef.current?.injectJavaScript(`window.updateMarker(${initialLocation.lat}, ${initialLocation.lng}); true;`);
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
      setShowLocationWarning(true);
      webviewRef.current?.injectJavaScript(`window.updateMarker(${coords.lat}, ${coords.lng}); true;`);
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
    webviewRef.current?.injectJavaScript(`window.resetMarker(); true;`);
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'locationSelect') {
        const coords = { lat: data.lat, lng: data.lng };
        setMarkerCoord(coords);
        onLocationSelect?.(coords);
      }
    } catch (e) {
      console.warn('Error parsing webview message', e);
    }
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
            webviewRef.current?.injectJavaScript(`window.updateMarker(${loc.lat}, ${loc.lng}); true;`);
          }} 
        />
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webviewRef}
          source={{ html: htmlContent }}
          onMessage={handleMessage}
          style={styles.map}
          nestedScrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
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

  mapContainer: { width: '100%', height: 350, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#d1d5db', position: 'relative', marginBottom: 8 },
  map: { flex: 1 },

  mapOverlay: { position: 'absolute', top: 12, left: 0, right: 0, alignItems: 'center' },
  mapHint: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, fontSize: 11, color: '#374151', fontFamily: fonts.medium, overflow: 'hidden' },

  coordDisplay: { fontSize: 12, color: '#9ca3af', fontFamily: fonts.regular, marginTop: 4 },
});
