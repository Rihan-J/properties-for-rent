'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { getCurrentPosition } from '@/lib/geo';
import MapSkeleton from '@/components/map/MapSkeleton';
import SearchBar from '@/components/map/SearchBar';
import RadiusFilter from '@/components/map/RadiusFilter';
import PropertyCard from '@/components/PropertyCard';
import SidebarSkeleton from '@/components/skeletons/SidebarSkeleton';
import EmptyState from '@/components/EmptyState';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// Default fallback: Bangalore
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 };
const DEFAULT_ZOOM = 13;
const FALLBACK_ZOOM = 13;

export default function MapExplorer() {
  // ─── Core State ───────────────────────────────────────
  const [lat, setLat] = useState(DEFAULT_CENTER.lat);
  const [lng, setLng] = useState(DEFAULT_CENTER.lng);
  const [radius, setRadius] = useState(10);
  const [category, setCategory] = useState('all');
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  const [geoStatus, setGeoStatus] = useState('detecting'); // detecting | granted | denied | searched
  const [error, setError] = useState('');
  const [locationName, setLocationName] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const abortRef = useRef(null);

  // ─── Fetch nearby properties ──────────────────────────
  const fetchNearbyProperties = useCallback(async (newLat, newLng, newRadius, newCategory) => {
    // Abort previous request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFetchingProperties(true);
    setError('');

    try {
      const params = { lat: newLat, lng: newLng, radius: newRadius, limit: 50 };
      if (newCategory && newCategory !== 'all') {
        params.category = newCategory;
      }
      const res = await api.get('/properties/nearby', {
        params,
        signal: controller.signal,
      });
      if (!controller.signal.aborted) {
        setProperties(res.data.data.properties);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        setError('Failed to load nearby properties');
      }
    } finally {
      if (!controller.signal.aborted) {
        setFetchingProperties(false);
      }
    }
  }, []);

  // ─── Initial geolocation ─────────────────────────────
  useEffect(() => {
    async function init() {
      setLoading(true);
      const pos = await getCurrentPosition();

      if (pos) {
        setLat(pos.lat);
        setLng(pos.lng);
        setZoom(DEFAULT_ZOOM);
        setGeoStatus('granted');
        setUserLocation([pos.lat, pos.lng]);
        setLocationName('Your location');
        await fetchNearbyProperties(pos.lat, pos.lng, radius, category);
      } else {
        // Fallback to Bangalore
        setLat(DEFAULT_CENTER.lat);
        setLng(DEFAULT_CENTER.lng);
        setZoom(FALLBACK_ZOOM);
        setGeoStatus('denied');
        setLocationName('Bangalore (default)');
        await fetchNearbyProperties(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, radius, category);
      }

      setLoading(false);
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Handle search location select ────────────────────
  const handleLocationSelect = useCallback(async ({ lat: newLat, lng: newLng, name }) => {
    setLat(newLat);
    setLng(newLng);
    setZoom(13);
    setGeoStatus('searched');
    setLocationName(name || 'Selected location');
    await fetchNearbyProperties(newLat, newLng, radius, category);
  }, [radius, category, fetchNearbyProperties]);

  // ─── Handle radius change ────────────────────────────
  const handleRadiusChange = useCallback(async (newRadius) => {
    setRadius(newRadius);

    // Adjust zoom based on radius
    const zoomMap = { 2: 15, 5: 14, 10: 13, 20: 12 };
    setZoom(zoomMap[newRadius] || 13);

    await fetchNearbyProperties(lat, lng, newRadius, category);
  }, [lat, lng, category, fetchNearbyProperties]);

  // ─── Handle category change ────────────────────────────
  const handleCategoryChange = useCallback(async (newCategory) => {
    setCategory(newCategory);
    await fetchNearbyProperties(lat, lng, radius, newCategory);
  }, [lat, lng, radius, fetchNearbyProperties]);

  // ─── Recenter on user location ────────────────────────
  const handleRecenter = useCallback(async () => {
    const pos = await getCurrentPosition();
    if (pos) {
      setLat(pos.lat);
      setLng(pos.lng);
      setZoom(DEFAULT_ZOOM);
      setGeoStatus('granted');
      setUserLocation([pos.lat, pos.lng]);
      setLocationName('Your location');
      await fetchNearbyProperties(pos.lat, pos.lng, radius, category);
    }
  }, [radius, category, fetchNearbyProperties]);

  // ─── Status badge info ────────────────────────────────
  function getStatusBadge() {
    if (loading) {
      return {
        icon: '⟳',
        text: 'Detecting your location…',
        className: 'apna-badge-detecting',
      };
    }
    if (fetchingProperties) {
      return {
        icon: '⟳',
        text: 'Finding properties…',
        className: 'apna-badge-detecting',
      };
    }

    const count = properties.length;
    switch (geoStatus) {
      case 'granted':
        return {
          icon: '📍',
          text: `${count} propert${count === 1 ? 'y' : 'ies'} near you`,
          className: 'apna-badge-granted',
        };
      case 'searched':
        return {
          icon: '🔍',
          text: `${count} propert${count === 1 ? 'y' : 'ies'} in ${locationName}`,
          className: 'apna-badge-searched',
        };
      case 'denied':
        return {
          icon: '📍',
          text: `${count} propert${count === 1 ? 'y' : 'ies'} in Bangalore`,
          className: 'apna-badge-denied',
        };
      default:
        return null;
    }
  }

  const badge = getStatusBadge();

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      {/* ─── Map Section ────────────────────────────────── */}
      <div className="flex-1 relative">
        {/* Controls overlay */}
        <div className="apna-map-controls">
          <SearchBar
            onLocationSelect={handleLocationSelect}
            onClear={handleRecenter}
            disabled={loading}
          />
          <RadiusFilter
            value={radius}
            onChange={handleRadiusChange}
            disabled={loading}
          />
        </div>

        {/* Map */}
        <MapView
          center={[lat, lng]}
          zoom={zoom}
          properties={properties}
          userLocation={userLocation}
        />

        {/* Status badge */}
        {badge && (
          <div className={`apna-status-badge ${badge.className}`}>
            {(loading || fetchingProperties) ? (
              <div className="apna-spinner-sm" />
            ) : (
              <span>{badge.icon}</span>
            )}
            <span>{badge.text}</span>
          </div>
        )}

        {/* Recenter button */}
        {!loading && geoStatus !== 'granted' && (
          <button
            onClick={handleRecenter}
            className="apna-recenter-btn"
            title="Go to my location"
            type="button"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}

        {/* Empty state overlay */}
        {!loading && !fetchingProperties && properties.length === 0 && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center pointer-events-none">
            <div className="apna-map-empty pointer-events-auto">
              <div className="apna-map-empty-icon">
                <span className="text-2xl">📍</span>
              </div>
              <p className="text-lg font-semibold text-[#1a1815]">No properties found in this area</p>
              <p className="text-sm text-black mt-1.5">Try a different location or expand your search radius</p>
              <a
                href="/properties"
                className="inline-block mt-6 px-6 py-3 bg-[#1a1815] text-white text-sm font-bold rounded-xl hover:bg-[#2e2a25] hover:shadow-md transition-all duration-300 active:scale-[0.98]"
              >
                Browse All Properties
              </a>
            </div>
          </div>
        )}

        {/* Error toast */}
        {error && (
          <div className="apna-error-toast">
            {error}
          </div>
        )}
      </div>

      {/* ─── Sidebar ────────────────────────────────────── */}
      <div className="lg:w-[420px] h-[40vh] lg:h-full overflow-y-auto bg-white shadow-sm lg:shadow-[-8px_0_20px_rgba(0,0,0,0.03)] border-t lg:border-t-0 lg:border-l border-[#e8e2db] z-[450]">
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2
                className="text-lg font-semibold text-[#1a1815]"
                style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem' }}
              >
                {geoStatus === 'searched' ? locationName : geoStatus === 'granted' ? 'Nearby Properties' : 'Properties'}
              </h2>
              {!loading && (
                <p className="text-xs text-black mt-1">
                  Within {radius} km radius
                </p>
              )}
            </div>
            <span className="apna-sidebar-count">
              {properties.length} found
            </span>
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'all', label: 'All' },
              { id: 'home', label: 'Home' },
              { id: 'room', label: 'Room' },
              { id: 'shop', label: 'Shop' },
              { id: 'pg', label: 'PG' },
              { id: 'site', label: 'Site / Plot' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                  category === cat.id
                    ? 'bg-[#1a1815] text-white border-[#1a1815]'
                    : 'bg-[#f7f4f0] text-black border-[#e8e2db] hover:border-[#b5936b] hover:bg-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {loading ? (
            <SidebarSkeleton count={3} />
          ) : properties.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No properties found"
              subtitle="Try expanding your search radius or searching a different area"
              actionLabel="Browse All"
              actionHref="/properties"
            />
          ) : (
            <div className="space-y-5">
              {properties.map((p) => (
                <PropertyCard key={p.id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
