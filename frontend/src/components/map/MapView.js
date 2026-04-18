'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Syncs the map center/zoom when props change.
 */
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2, easeLinearity: 0.25 });
    }
  }, [center, zoom, map]);
  return null;
}

/**
 * Create a custom DivIcon showing the price as a pill.
 */
function createPriceIcon(price) {
  const formatted = Number(price) >= 100000
    ? `₹${(Number(price) / 100000).toFixed(1)}L`
    : Number(price) >= 1000
      ? `₹${(Number(price) / 1000).toFixed(0)}K`
      : `₹${Number(price).toLocaleString('en-IN')}`;

  return L.divIcon({
    className: 'apna-price-marker',
    html: `<div class="apna-price-pill">${formatted}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -8],
  });
}

/**
 * Custom cluster icon showing count.
 */
function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  return L.divIcon({
    className: 'apna-cluster-icon',
    html: `<div class="apna-cluster-pill">${count}</div>`,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

/**
 * Main map component with Airbnb-style price markers and clustering.
 * Must be loaded with next/dynamic ssr:false.
 */
export default function MapView({
  center = [12.9716, 77.5946],
  zoom = 13,
  properties = [],
  userLocation = null,
}) {
  const router = useRouter();

  const handlePropertyClick = useCallback((propertyId) => {
    router.push(`/properties/${propertyId}`);
  }, [router]);

  // Memoize markers for performance
  const markers = useMemo(() => {
    return properties.map((property) => {
      const icon = createPriceIcon(property.price);
      return (
        <Marker
          key={property.id}
          position={[property.latitude, property.longitude]}
          icon={icon}
        >
          <Popup>
            <div
              className="apna-popup-card cursor-pointer"
              onClick={() => handlePropertyClick(property.id)}
            >
              {property.image_url && (
                <div className="apna-popup-img-wrap">
                  <img
                    src={property.image_url}
                    alt={property.title}
                    className="apna-popup-img"
                    loading="lazy"
                  />
                  <div className="apna-popup-price-badge">
                    ₹{Number(property.price).toLocaleString('en-IN')}<span>/mo</span>
                  </div>
                </div>
              )}
              <div className="apna-popup-body">
                <h3 className="apna-popup-title">{property.title}</h3>
                {property.distance_km !== undefined && (
                  <p className="apna-popup-distance">
                    📍 {Number(property.distance_km).toFixed(1)} km away
                  </p>
                )}
                <div className="apna-popup-cta">
                  View Details →
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [properties, handlePropertyClick]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={4}
      className="w-full h-full"
      scrollWheelZoom={true}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapUpdater center={center} zoom={zoom} />

      {/* User location pulsing dot */}
      {userLocation && (
        <>
          <CircleMarker
            center={userLocation}
            radius={8}
            pathOptions={{
              fillColor: '#4285F4',
              fillOpacity: 1,
              color: '#ffffff',
              weight: 3,
              opacity: 1,
            }}
          />
          <CircleMarker
            center={userLocation}
            radius={20}
            pathOptions={{
              fillColor: '#4285F4',
              fillOpacity: 0.15,
              color: '#4285F4',
              weight: 1,
              opacity: 0.3,
            }}
            className="apna-pulse-ring"
          />
        </>
      )}

      {/* Clustered property markers */}
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={50}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        iconCreateFunction={createClusterIcon}
        animate={true}
        animateAddingMarkers={true}
      >
        {markers}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
