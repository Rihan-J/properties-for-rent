'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
import SearchBar from '@/components/explore/SearchBar';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

/**
 * Click handler that sets lat/lng on map click.
 */
function LocationSelector({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/**
 * Pans the map to a new center when the position changes.
 */
const MapUpdater = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], 16, { animate: true });
    }
  }, [lat, lng, map]);

  return null;
};

// --- DMS → Decimal converter ---
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

// --- Unified coordinate parser (DMS or decimal) ---
function parseCoordinates(input) {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // DMS format: 14°02'43.9"N 75°27'47.1"E
  if (trimmed.includes('°')) {
    const parts = trimmed.split(/[\s,]+/).filter(p => p.includes('°'));
    if (parts.length === 2) {
      const lat = dmsToDecimal(parts[0]);
      const lng = dmsToDecimal(parts[1]);
      if (lat !== null && lng !== null) return { lat, lng };
    }
    return null;
  }

  // Decimal format: 12.9716, 77.5946
  const parts = trimmed.split(/[\s,]+/).filter(Boolean);
  if (parts.length === 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }

  return null;
}

/**
 * Map picker for selecting a location inside a form.
 * Features: click-to-set, coordinate input (decimal + DMS), "Use My Location", reset.
 * Must be loaded with ssr:false via next/dynamic.
 */
const KARNATAKA_BOUNDS = [
  [11.5, 74.0], // South West
  [18.5, 78.5], // North East
];

export default function MapPicker({ value, onChange }) {
  const [detecting, setDetecting] = useState(false);
  const [showLocationWarning, setShowLocationWarning] = useState(false);

  const center = value?.lat != null && value?.lng != null ? [value.lat, value.lng] : [15.3173, 75.7139];
  const zoom = value?.lat != null && value?.lng != null ? 14 : 6;

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;

    setDetecting(true);
    setShowLocationWarning(false);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onChange(coords);
        setDetecting(false);
        setShowLocationWarning(true);
      },
      (error) => {
        setDetecting(false);
        let msg = 'Could not detect your location. Please click on the map instead.';
        if (error.code === 1) msg = 'Location access denied. Please allow location access in your browser settings to use this feature.';
        else if (error.code === 2) msg = 'Location information is unavailable at the moment.';
        else if (error.code === 3) msg = 'Location request timed out. Please try again.';
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  function handleOpenGoogleMaps() {
    if (!value?.lat) return;
    window.open(
      `https://www.google.com/maps?q=${value.lat},${value.lng}`,
      '_blank'
    );
  }

  return (
    <div className="space-y-2">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={detecting}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 disabled:opacity-50 transition-colors"
        >
          {detecting ? (
            <>
              <span className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              Detecting...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Location
            </>
          )}
        </button>

        {value?.lat != null && value?.lng != null && (
          <>
            <button
              type="button"
              onClick={handleOpenGoogleMaps}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in Maps
            </button>
            <button
              type="button"
              onClick={() => { onChange({ lat: null, lng: null }); setShowLocationWarning(false); }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Reset Pin
            </button>
          </>
        )}
      </div>

      {/* Location accuracy warning — compact */}
      {showLocationWarning && (
        <p className="flex items-center gap-1.5 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1.5 rounded-lg">
          <span>⚠️</span>
          <span>Location may not be exact. Adjust the pin if needed.</span>
          <button
            type="button"
            onClick={() => setShowLocationWarning(false)}
            className="ml-auto text-yellow-400 hover:text-yellow-600 font-medium"
            aria-label="Dismiss"
          >
            ×
          </button>
        </p>
      )}

      {/* Search Bar */}
      <div className="relative z-[1000] mb-2">
        <SearchBar 
          onLocationSelect={(loc) => onChange({ lat: loc.lat, lng: loc.lng })} 
          onClear={() => {}}
        />
      </div>

      {/* Map */}
      <div className="w-full h-[400px] sm:h-[450px] lg:h-[500px] rounded-xl overflow-hidden border border-gray-300">
        <MapContainer 
          center={center} 
          zoom={zoom} 
          minZoom={6}
          maxBounds={KARNATAKA_BOUNDS}
          maxBoundsViscosity={1.0}
          className="w-full h-full" 
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            errorTileUrl="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector onSelect={onChange} />
          {value?.lat != null && value?.lng != null && (
            <>
              <Marker position={[value.lat, value.lng]} />
              <MapUpdater lat={value.lat} lng={value.lng} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Coordinates display */}
      {value?.lat != null && value?.lng != null && (
        <p className="text-xs text-gray-400">
          📍 {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}
