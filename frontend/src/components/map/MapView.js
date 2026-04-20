'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { useEffect, useMemo, useCallback, useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { getLat, getLng, getPropertyPricing } from '@/lib/property';

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
function createPriceIcon(property) {
  const pricing = getPropertyPricing(property);
  const amount = pricing.amount;

  const formatted = amount >= 100000
    ? `\u20B9${(amount / 100000).toFixed(1)}L`
    : amount >= 1000
      ? `\u20B9${(amount / 1000).toFixed(0)}K`
      : `\u20B9${amount.toLocaleString('en-IN')}`;

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
function MapView({
  center = [12.9716, 77.5946],
  zoom = 13,
  properties = [],
  userLocation = null,
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePropertyClick = useCallback((propertyId) => {
    if (!user) {
      router.push(`/auth/login?redirect=/properties/${propertyId}`);
    } else {
      router.push(`/properties/${propertyId}`);
    }
  }, [router, user]);

  // Memoize markers for performance
  const markers = useMemo(() => {
    return properties
    .filter((property) => getLat(property) !== null && getLng(property) !== null)
    .map((property) => {
      const icon = createPriceIcon(property);
      const pricing = getPropertyPricing(property);

      return (
        <Marker
          key={property.id}
          position={[getLat(property), getLng(property)]}
          icon={icon}
          eventHandlers={
            isMobile
              ? { click: () => setSelectedProperty(property) }
              : undefined
          }
        >
          {!isMobile && (
            <Popup offset={[0, 120]}>
              <div
                className="apna-popup-card cursor-pointer"
                onClick={() => handlePropertyClick(property.id)}
              >
                {property.image_url && (
                  <div className="apna-popup-img-wrap">
                    <img
                      src={getOptimizedImageUrl(property.image_url, { width: 320 })}
                      alt={property.title}
                      className="apna-popup-img"
                      loading="lazy"
                    />
                    <div className="apna-popup-price-badge">
                      {pricing.isFlexible ? (
                        <>{'\u20B9'}{pricing.hourly?.toLocaleString('en-IN')}/hr | {'\u20B9'}{pricing.daily?.toLocaleString('en-IN')}/day</>
                      ) : (
                        <>{'\u20B9'}{pricing.amount.toLocaleString('en-IN')}<span>{pricing.unitShort}</span></>
                      )}
                    </div>
                  </div>
                )}
                <div className="apna-popup-body">
                  <h3 className="apna-popup-title">{property.title}</h3>
                  {property.category && (
                    <span className="inline-block mt-0.5 mb-1.5 text-[9px] font-bold text-[#8a6b4a] uppercase px-1.5 py-0.5 bg-[#fdf8f4] border border-[#f0ece7] rounded-md tracking-wider self-start">
                      {property.category.replace('_', ' ')}
                    </span>
                  )}
                  {property.distance_km !== undefined && (
                    <p className="apna-popup-distance">
                      Distance: {Number(property.distance_km).toFixed(1)} km
                    </p>
                  )}
                  <div className="apna-popup-cta">
                    View Details -&gt;
                  </div>
                </div>
              </div>
            </Popup>
          )}
        </Marker>
      );
    });
  }, [properties, handlePropertyClick, isMobile]);

  return (
    <>
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

    {/* Mobile Bottom Property Card */}
    {isMobile && selectedProperty && (
      <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-[#e8e2db] overflow-hidden flex flex-row h-28" style={{ animation: 'badge-in 0.3s ease-out' }}>
         <button 
           onClick={(e) => { e.stopPropagation(); setSelectedProperty(null); }}
           className="absolute top-1.5 right-1.5 z-10 w-7 h-7 flex items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
         >
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
         </button>

         <div className="w-2/5 relative cursor-pointer" onClick={() => handlePropertyClick(selectedProperty.id)}>
           <img 
              src={getOptimizedImageUrl(selectedProperty.image_url, { width: 300 })} 
              alt={selectedProperty.title} 
              className="w-full h-full object-cover"
           />
           {getPropertyPricing(selectedProperty).isFlexible && (
             <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-500/90 text-white text-[8px] font-bold uppercase tracking-wider rounded-sm backdrop-blur-sm">
               Flex
             </div>
           )}
         </div>

         <div className="w-3/5 p-3 flex flex-col justify-center cursor-pointer bg-white" onClick={() => handlePropertyClick(selectedProperty.id)}>
            <h3 className="text-[13px] font-bold text-[#1a1815] leading-tight line-clamp-2">{selectedProperty.title}</h3>
            
            {selectedProperty.category && (
              <span className="inline-block mt-1 text-[9px] font-bold text-[#8a6b4a] uppercase px-1.5 py-0.5 bg-[#fdf8f4] border border-[#f0ece7] rounded-md tracking-wider self-start">
                {selectedProperty.category.replace('_', ' ')}
              </span>
            )}

            {selectedProperty.distance_km !== undefined && (
              <p className="text-[10px] text-gray-500 mt-1 font-medium">Distance: {Number(selectedProperty.distance_km).toFixed(1)} km</p>
            )}
            <div className="mt-auto pt-2 flex items-center justify-between">
               <span className="text-xs font-bold text-[#1a1815]">
                 {getPropertyPricing(selectedProperty).isFlexible 
                   ? `₹${getPropertyPricing(selectedProperty).hourly?.toLocaleString()}/hr`
                   : `₹${getPropertyPricing(selectedProperty).amount.toLocaleString()}${getPropertyPricing(selectedProperty).unitShort}`
                 }
               </span>
               <span className="text-[#8a6b4a] text-[10px] font-bold">View &rarr;</span>
            </div>
         </div>
      </div>
    )}
    </>
  );
}

export default memo(MapView);
