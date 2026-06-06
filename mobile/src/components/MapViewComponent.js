/**
 * MapViewComponent — wrapper around react-native-maps
 * Mirrors MapView.js from web but uses native mapping.
 */
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { colors, fonts } from '../theme';
import { MAP_PROVIDER, RADIUS_TO_DELTA, DEFAULT_ZOOM_DELTA } from '../config/constants';
import { getOptimizedImageUrl } from '../lib/cloudinary';

export default function MapViewComponent({
  center,
  zoom,
  radius,
  properties,
  userLocation,
  recenterTrigger,
}) {
  const mapRef = useRef(null);
  const navigation = useNavigation();

  // Recenter when center or trigger changes
  useEffect(() => {
    if (mapRef.current && center && center[0] && center[1]) {
      const delta = radius ? RADIUS_TO_DELTA[radius] : DEFAULT_ZOOM_DELTA;
      mapRef.current.animateToRegion(
        {
          latitude: center[0],
          longitude: center[1],
          latitudeDelta: delta ? delta.latitudeDelta : DEFAULT_ZOOM_DELTA.latitudeDelta,
          longitudeDelta: delta ? delta.longitudeDelta : DEFAULT_ZOOM_DELTA.longitudeDelta,
        },
        1000
      );
    }
  }, [center, recenterTrigger, radius]);

  if (!center) return null;

  const delta = radius ? RADIUS_TO_DELTA[radius] : DEFAULT_ZOOM_DELTA;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={MAP_PROVIDER}
        style={styles.map}
        initialRegion={{
          latitude: center[0],
          longitude: center[1],
          latitudeDelta: delta ? delta.latitudeDelta : DEFAULT_ZOOM_DELTA.latitudeDelta,
          longitudeDelta: delta ? delta.longitudeDelta : DEFAULT_ZOOM_DELTA.longitudeDelta,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false} // We provide our own custom button
        showsCompass={false}
      >
        {properties.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.lat, longitude: p.lng }}
            pinColor={colors.accent}
          >
            <Callout
              tooltip
              onPress={() => navigation.navigate('PropertyDetail', { propertyId: p.id })}
            >
              <View style={styles.calloutContainer}>
                <Image
                  source={{ uri: getOptimizedImageUrl(p.image_url, { width: 150 }) }}
                  style={styles.calloutImage}
                  resizeMode="cover"
                />
                <View style={styles.calloutContent}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {p.title}
                  </Text>
                  <Text style={styles.calloutPrice}>₹{p.price}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.borderLight,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  calloutContainer: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  calloutImage: {
    width: '100%',
    height: 80,
  },
  calloutContent: {
    padding: 8,
  },
  calloutTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.text,
  },
  calloutPrice: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
  },
});
