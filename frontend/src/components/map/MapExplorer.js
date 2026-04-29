'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
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
  const [bookingTypeFilter, setBookingTypeFilter] = useState('all');
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  const [geoStatus, setGeoStatus] = useState('detecting'); // detecting | granted | denied | searched
  const [error, setError] = useState('');
  const [locationName, setLocationName] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const abortRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // ─── Fetch nearby properties ──────────────────────────
  const fetchNearbyProperties = useCallback(async (newLat, newLng, newRadius, newCategory, newBookingType = 'all') => {
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
      if (newCategory === 'lodge' && newBookingType !== 'all') {
        params.booking_type = newBookingType;
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

  // ─── Debounced fetch — coalesces rapid filter changes into one API call ──
  const debouncedFetch = useCallback((...args) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchNearbyProperties(...args);
    }, 350);
  }, [fetchNearbyProperties]);

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
        await fetchNearbyProperties(pos.lat, pos.lng, radius, category, bookingTypeFilter);
      } else {
        // Fallback to Bangalore
        setLat(DEFAULT_CENTER.lat);
        setLng(DEFAULT_CENTER.lng);
        setZoom(FALLBACK_ZOOM);
        setGeoStatus('denied');
        setLocationName('Bangalore (default)');
        await fetchNearbyProperties(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng, radius, category, bookingTypeFilter);
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
    await fetchNearbyProperties(newLat, newLng, radius, category, bookingTypeFilter);
  }, [radius, category, bookingTypeFilter, fetchNearbyProperties]);

  // ─── Handle radius change ────────────────────────────
  const handleRadiusChange = useCallback((newRadius) => {
    setRadius(newRadius);

    // Adjust zoom based on radius
    const zoomMap = { 2: 15, 5: 14, 10: 13, 20: 12 };
    setZoom(zoomMap[newRadius] || 13);

    debouncedFetch(lat, lng, newRadius, category, bookingTypeFilter);
  }, [lat, lng, category, bookingTypeFilter, debouncedFetch]);

  // ─── Handle category change ────────────────────────────
  const handleCategoryChange = useCallback((newCategory) => {
    setCategory(newCategory);
    setBookingTypeFilter('all');
    debouncedFetch(lat, lng, radius, newCategory, 'all');
  }, [lat, lng, radius, debouncedFetch]);

  const handleBookingTypeChange = useCallback((newBookingType) => {
    setBookingTypeFilter(newBookingType);
    debouncedFetch(lat, lng, radius, category, newBookingType);
  }, [lat, lng, radius, category, debouncedFetch]);

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
      await fetchNearbyProperties(pos.lat, pos.lng, radius, category, bookingTypeFilter);
    }
  }, [radius, category, bookingTypeFilter, fetchNearbyProperties]);

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
  const mapCenter = useMemo(() => [lat, lng], [lat, lng]);

  return (
    <div className="flex flex-col lg:flex-row w-full lg:h-[calc(100vh-64px)]">
      {/* ─── Map Section ────────────────────────────────── */}
      <div className="w-full h-[60vh] lg:h-full lg:flex-1 relative z-0">
        {/* Controls overlay */}
        <div className="apna-map-controls z-[1000]">
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
          center={mapCenter}
          zoom={zoom}
          properties={properties}
          userLocation={userLocation}
        />

        {/* Status badge */}
        {badge && (
          <div className={`apna-status-badge z-[1000] ${badge.className}`}>
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
            className="apna-recenter-btn z-[1000]"
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
              <Link
                href="/properties"
                className="inline-block mt-6 px-6 py-3 bg-[#1a1815] text-white text-sm font-bold rounded-xl hover:bg-[#2e2a25] hover:shadow-md transition-all duration-300 active:scale-[0.98]"
              >
                Browse All Properties
              </Link>
            </div>
          </div>
        )}

        {/* Error toast */}
        {error && (
          <div className="apna-error-toast z-[1000]">
            {error}
          </div>
        )}
      </div>

      {/* ─── Sidebar ────────────────────────────────────── */}
      <div className="w-full lg:w-[420px] lg:h-full lg:overflow-y-auto z-10 lg:z-[450] bg-white lg:shadow-[-8px_0_20px_rgba(0,0,0,0.03)] border-t lg:border-t-0 lg:border-l border-[#e8e2db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:p-6">
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
              { id: 'lodge', label: 'Lodge' },
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
          {category === 'lodge' && (
            <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'all', label: 'All' },
                { id: 'hourly', label: 'Hourly' },
                { id: 'daily', label: 'Daily' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleBookingTypeChange(opt.id)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                    bookingTypeFilter === opt.id
                      ? 'bg-[#1a1815] text-white border-[#1a1815]'
                      : 'bg-[#f7f4f0] text-black border-[#e8e2db] hover:border-[#b5936b] hover:bg-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-5">
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
