/**
 * GeoContext — adapted from frontend/src/context/GeoContext.js
 *
 * Key changes:
 * - expo-location instead of navigator.geolocation
 * - Requests foreground permission immediately on mount
 * - Same state shape for seamless component compatibility
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { DEFAULT_LOCATION } from '../config/constants';

const GEO_TIMEOUT = 5000;

const GeoContext = createContext(null);

export function GeoProvider({ children }) {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [status, setStatus] = useState('detecting'); // detecting | granted | denied | unavailable
  const [locationName, setLocationName] = useState('Bangalore (default)');
  const hasResolved = useRef(false);

  // ─── Request permission and get location on mount ─────
  useEffect(() => {
    let isMounted = true;

    async function detectLocation() {
      try {
        const { status: permStatus } = await Location.requestForegroundPermissionsAsync();

        if (permStatus !== 'granted') {
          if (isMounted) {
            setStatus('denied');
            hasResolved.current = true;
          }
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: GEO_TIMEOUT,
        });

        if (isMounted) {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          setStatus('granted');
          setLocationName('Your location');
          hasResolved.current = true;
        }
      } catch {
        if (isMounted) {
          setStatus('denied');
          hasResolved.current = true;
        }
      }
    }

    detectLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── Re-detect (e.g. recenter button) ──────────────────
  const redetect = useCallback(async () => {
    setStatus('detecting');
    try {
      const { status: permStatus } = await Location.requestForegroundPermissionsAsync();

      if (permStatus !== 'granted') {
        setStatus('denied');
        return null;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: GEO_TIMEOUT,
      });

      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setLocation(coords);
      setStatus('granted');
      setLocationName('Your location');
      return coords;
    } catch {
      setStatus('denied');
      return null;
    }
  }, []);

  // ─── Allow consumers to set a manual location ──────────
  const setManualLocation = useCallback((coords, name) => {
    setLocation(coords);
    setLocationName(name || 'Selected location');
    setStatus('searched');
  }, []);

  return (
    <GeoContext.Provider
      value={{
        location,
        status,
        locationName,
        isDetecting: status === 'detecting',
        isDenied: status === 'denied',
        isGranted: status === 'granted',
        redetect,
        setManualLocation,
      }}
    >
      {children}
    </GeoContext.Provider>
  );
}

export function useGeo() {
  const ctx = useContext(GeoContext);
  if (!ctx) throw new Error('useGeo must be used within <GeoProvider>');
  return ctx;
}
