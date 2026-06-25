'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import api from '@/lib/api';
import SearchBar from '@/components/explore/SearchBar';
import RadiusFilter from '@/components/explore/RadiusFilter';
import CategoryFilter from '@/components/explore/CategoryFilter';
import PropertyCard from '@/components/PropertyCard';
import EmptyState from '@/components/EmptyState';

const DEFAULT_CENTER = { lat: 13.9299, lng: 75.5681, name: 'Shivamogga (default)' };

const LOADING_MESSAGES = [
  { title: "Finding the best stays...", subtitle: "We are fetching the latest properties near you." },
  { title: "Scouting the neighborhood...", subtitle: "Looking for hidden gems in this area." },
  { title: "Curating your options...", subtitle: "Almost there! Getting the best matches." },
  { title: "Preparing your feed...", subtitle: "Filtering for the highest quality stays." }
];

const LOCATION_MESSAGES = [
  { title: "Fetching Location...", subtitle: "Please allow location access when prompted by your browser." },
  { title: "Pinpointing you...", subtitle: "Communicating with satellites..." },
  { title: "Almost got it...", subtitle: "Just need to confirm your coordinates." },
  { title: "Warming up the GPS...", subtitle: "This helps us find the best places around you." }
];

// Basic distance calculation for sorting
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Infinity;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function HomePage() {
  const [userLocation, setUserLocation] = useState(null); // The actual GPS location
  const [location, setLocation] = useState(DEFAULT_CENTER);
  const [radius, setRadius] = useState(50); // Increased to cover whole Shimoga district
  const [category, setCategory] = useState('all');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoStatus, setGeoStatus] = useState('searched');

  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [locMsgIdx, setLocMsgIdx] = useState(0);

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    let interval;
    if (geoStatus === 'detecting') {
      interval = setInterval(() => {
        setLocMsgIdx(prev => (prev + 1) % LOCATION_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [geoStatus]);

  const abortRef = useRef(null);

  const fetchProperties = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = { lat: location.lat, lng: location.lng, radius, limit: 50 };
      if (category !== 'all') params.category = category;

      const res = await api.get('/properties/nearby', { params, signal: controller.signal });
      if (!controller.signal.aborted) {
        let fetched = res.data?.data?.properties || [];
        fetched.sort((a, b) => {
          const d1 = calculateDistance(location.lat, location.lng, a.latitude, a.longitude);
          const d2 = calculateDistance(location.lat, location.lng, b.latitude, b.longitude);
          return d1 - d2;
        });
        setProperties(fetched);
      }
    } catch (err) {
      if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
        console.error('Failed to fetch nearby properties:', err);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [location, radius, category]);

  useEffect(() => {
    if (geoStatus !== 'detecting') {
      fetchProperties();
    }
  }, [geoStatus, fetchProperties]);

  // Handle location selection from SearchBar
  function handleLocationSelect(loc) {
    setLocation(loc);
    setGeoStatus('searched');
  }

  function handleClearLocation() {
    if (userLocation) {
      setLocation(userLocation);
      setGeoStatus('granted');
    } else {
      setLocation(DEFAULT_CENTER);
      setGeoStatus('searched');
    }
  }

  function requestLocationAccess() {
    executeLocationCheck(true);
  }

  function executeLocationCheck(isManualClick = false) {
    if (isManualClick) {
      setGeoStatus('detecting');
    }
    
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const loc = { ...coords, name: 'Your Location' };
        localStorage.setItem('user_precise_location', JSON.stringify(coords));
        setUserLocation(loc);
        setLocation(loc);
        setGeoStatus('granted');
        setShowLocationPrompt(false);
      },
      (error) => {
        setLocation(DEFAULT_CENTER);
        setGeoStatus('searched');
        if (isManualClick) {
          alert("Unable to access location. Please ensure it is enabled in your device/browser settings.");
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f4f0] pb-20">
      <h1 className="sr-only">Properties for Rents</h1>
      {/* Header / Search Area */}
      <div className="bg-white border-b border-[#e8e2db] sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchBar 
                onLocationSelect={handleLocationSelect} 
                onClear={handleClearLocation} 
                onDetectLocation={requestLocationAccess}
              />
              <p className="text-[10px] text-gray-500 mt-1.5 px-2 font-medium tracking-wide uppercase">
                Near: <span className="font-bold text-[#1a1815]">
                  {geoStatus === 'detecting' ? 'Detecting...' : location?.name}
                </span>
              </p>
            </div>
            <RadiusFilter value={radius} onChange={setRadius} />
          </div>
          <CategoryFilter selectedCategory={category} onSelectCategory={setCategory} />

        </div>
      </div>

      {/* Feed Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="w-10 h-10 border-4 border-[#e2ddd8] border-t-[#1a1815] rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-[#1a1815] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{LOADING_MESSAGES[loadingMsgIdx].title}</h3>
            <p className="text-sm text-[#5a5550]">{LOADING_MESSAGES[loadingMsgIdx].subtitle}</p>
          </div>
        ) : properties.length === 0 ? (
          <EmptyState 
            icon="😔"
            title="We couldn't find stays nearby yet" 
            subtitle="But don't worry - there are great options just a little further away. Try increasing your search radius."
            actionLabel="Explore Nearby Options"
            actionOnClick={() => setRadius(50)}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {properties.map(prop => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
