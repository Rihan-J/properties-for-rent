'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
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
 * MapContainer ignores center updates after initial render — this fixes that.
 */
function MapPanner({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1 });
    }
  }, [center, map]);
  return null;
}

/**
 * Small map for picking a location inside a form.
 * Features: click-to-set, auto-detect, "Use My Location" button.
 * Must be loaded with ssr:false via next/dynamic.
 */
const KARNATAKA_BOUNDS = [
  [11.5, 74.0], // South West
  [18.5, 78.5], // North East
];

export default function MapPicker({ value, onChange }) {
  const [detecting, setDetecting] = useState(false);
  const center = value?.lat != null && value?.lng != null ? [value.lat, value.lng] : [15.3173, 75.7139];
  const zoom = value?.lat != null && value?.lng != null ? 14 : 6;

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        onChange(coords);
        setDetecting(false);
      },
      () => {
        setDetecting(false);
        alert('Could not detect your location. Please click on the map instead.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
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
      <div className="flex gap-2">
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
          <button
            type="button"
            onClick={handleOpenGoogleMaps}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in Google Maps
          </button>
        )}
      </div>

      {/* Map */}
      <div className="w-full h-[300px] rounded-xl overflow-hidden border border-gray-300">
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
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector onSelect={onChange} />
          {value?.lat != null && value?.lng != null && (
            <>
              <Marker position={[value.lat, value.lng]} />
              <MapPanner center={[value.lat, value.lng]} />
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
