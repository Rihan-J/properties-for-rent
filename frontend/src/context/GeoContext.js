'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

/**
 * GeoContext — Fires geolocation permission prompt on FIRST APP LOAD.
 *
 * - Map & sidebar render instantly with the default location (Bangalore).
 * - Once the browser resolves the real position, every consumer updates smoothly.
 * - If denied/unavailable, the default stays and a status flag surfaces a message.
 *
 * Fast settings: enableHighAccuracy=false, timeout=5s, maximumAge=5min.
 */

const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 };
const GEO_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 300000, // 5 minutes — reuse cached position
};

const GeoContext = createContext(null);

export function GeoProvider({ children }) {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [status, setStatus] = useState('detecting'); // detecting | granted | denied | unavailable
  const [locationName, setLocationName] = useState('Bangalore (default)');
  const hasResolved = useRef(false);

  // ─── Trigger permission immediately on mount ───────────
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        setStatus('granted');
        setLocationName('Your location');
        hasResolved.current = true;
      },
      () => {
        // Denied or error — keep default, surface status
        setStatus('denied');
        hasResolved.current = true;
      },
      GEO_OPTIONS
    );
  }, []);

  // ─── Re-detect (e.g. recenter button) ──────────────────
  const redetect = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(null);

    setStatus('detecting');
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(coords);
          setStatus('granted');
          setLocationName('Your location');
          resolve(coords);
        },
        () => {
          setStatus('denied');
          resolve(null);
        },
        GEO_OPTIONS
      );
    });
  }, []);

  // ─── Allow consumers (search bar) to set a manual location ──
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
