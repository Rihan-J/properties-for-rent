'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { uploadImage } from '@/lib/cloudinary';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import MapSkeleton from '@/components/map/MapSkeleton';

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

const CATEGORY_OPTIONS = [
  { id: 'home', label: 'Home', icon: '🏠', desc: 'House / Apartment' },
  { id: 'room', label: 'Room', icon: '🛏️', desc: 'Single room rental' },
  { id: 'shop', label: 'Shop', icon: '🏪', desc: 'Commercial space' },
  { id: 'pg', label: 'PG', icon: '🧑‍🎓', desc: 'Shared accommodation' },
  { id: 'lodge', label: 'Lodge', icon: '🏨', desc: 'Hourly / Daily stay' },
  { id: 'site', label: 'Site / Plot', icon: '🌍', desc: 'Land for sale' },
];

// ─── tiny helpers ────────────────────────────────────────────────────────────
const inputCls =
  'w-full px-4 py-3 bg-[#faf9f7] border border-[#e2ddd8] rounded-xl ' +
  'focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5936b]/40 focus:border-[#b5936b] ' +
  'transition-all duration-200 text-[#1a1815] text-sm placeholder:text-[#b8b0a6] font-[450]';

const labelCls = 'block text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-2';

// ─── step indicator ──────────────────────────────────────────────────────────
function StepDot({ n, active, done }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${done
          ? 'bg-[#1a1815] text-white'
          : active
            ? 'bg-[#b5936b] text-white shadow-md shadow-[#b5936b]/30'
            : 'bg-[#f0ece7] text-[#b8b0a6]'
          }`}
      >
        {done ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          n
        )}
      </div>
    </div>
  );
}

// ─── section wrapper ─────────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div className="space-y-2">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

// ─── main form ───────────────────────────────────────────────────────────────
function AddPropertyForm() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [listingType, setListingType] = useState('rent');
  const [bookingTypes, setBookingTypes] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); // Monthly Rent
  const [pricePerHour, setPricePerHour] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [phone, setPhone] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [areaSqft, setAreaSqft] = useState('');
  const [pricePerSqft, setPricePerSqft] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [municipalStatus, setMunicipalStatus] = useState('');
  const [revenueType, setRevenueType] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // derived completeness (for step indicators)
  const step1Done = !!selectedCategory;
  const lodgePriceFilled = selectedCategory === 'lodge' && bookingTypes.length > 0 &&
    (bookingTypes.includes('hourly') ? !!pricePerHour : true) &&
    (bookingTypes.includes('daily') ? !!pricePerDay : true);
  const step2Done = step1Done && title.length >= 3 && (
    selectedCategory === 'site' ? totalPrice : selectedCategory === 'lodge' ? lodgePriceFilled : price
  );
  const step3Done = step2Done && !!imageFile && !!location.lat && !!location.lng;

  // Auto calculation for total price
  useEffect(() => {
    if (areaSqft && pricePerSqft) {
      const area = parseFloat(areaSqft);
      const pps = parseFloat(pricePerSqft);
      if (!isNaN(area) && !isNaN(pps)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTotalPrice((area * pps).toString());
      }
    }
  }, [areaSqft, pricePerSqft]);

  // Reset logic when category changes
  useEffect(() => {
    if (selectedCategory === 'room' || selectedCategory === 'pg') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDimensions('');
      setAreaSqft('');
      setMunicipalStatus('');
      setRevenueType('');
    }
    if (selectedCategory === 'shop') {
      setMunicipalStatus('');
      setRevenueType('');
    }
    if (selectedCategory === 'site') {
      setPrice(''); 
      setListingType('sale');
    } else {
      setListingType('rent');
      setTotalPrice(''); 
      setPricePerSqft('');
    }
    if (selectedCategory !== 'lodge') {
      setBookingTypes([]);
      setPricePerHour('');
      setPricePerDay('');
    } else {
      setPrice('');
    }
  }, [selectedCategory]);

  function processFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  }

  function handleImageChange(e) { processFile(e.target.files?.[0]); }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!selectedCategory) { setError('Please select a property category'); return; }
    if (!imageFile) { setError('Please upload an image'); return; }
    if (!location.lat || !location.lng) { setError('Please select a location on the map'); return; }
    
    if (selectedCategory === 'site' && !totalPrice) { setError('Total Price is required for plots'); return; }
    if (selectedCategory === 'lodge') {
      if (bookingTypes.length === 0) { setError('Please select at least one booking type for lodge'); return; }
      if (bookingTypes.includes('hourly') && !pricePerHour) { setError('Price per hour is required for hourly lodge'); return; }
      if (bookingTypes.includes('daily') && !pricePerDay) { setError('Price per day is required for daily lodge'); return; }
    }
    if (selectedCategory !== 'site' && selectedCategory !== 'lodge' && !price) { setError('Price is required'); return; }
    if (selectedCategory === 'site' && !areaSqft && !dimensions) { setError('Area or Dimensions is required for plots'); return; }

    setLoading(true);
    try {
      setUploadProgress('Uploading image…');
      const imageUrl = await uploadImage(imageFile);
      setUploadProgress('Creating listing…');
      
      const isLodge = selectedCategory === 'lodge';
      const payload = {
        category: selectedCategory,
        listing_type: listingType,
        title: title.trim(),
        description: description.trim() || null,
        price: selectedCategory === 'site'
          ? (parseFloat(totalPrice) || 1)
          : isLodge
            ? (bookingTypes.includes('hourly') ? parseFloat(pricePerHour) : parseFloat(pricePerDay))
            : parseFloat(price),
        booking_types: isLodge ? bookingTypes : undefined,
        price_per_hour: isLodge && bookingTypes.includes('hourly') ? parseFloat(pricePerHour) : null,
        price_per_day: isLodge && bookingTypes.includes('daily') ? parseFloat(pricePerDay) : null,
        latitude: location.lat,
        longitude: location.lng,
        image_url: imageUrl,
        dimensions: dimensions.trim() || null,
        area_sqft: areaSqft ? parseFloat(areaSqft) : null,
        price_per_sqft: pricePerSqft ? parseFloat(pricePerSqft) : null,
        total_price: totalPrice ? parseFloat(totalPrice) : null,
        municipal_status: municipalStatus || null,
        revenue_type: revenueType || null,
      };
      
      if (!user?.phone && phone) payload.phone = phone.trim();
      await api.post('/properties', payload);
      setSuccess(true);
      setUploadProgress('');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create property');
    } finally {
      setLoading(false);
      setUploadProgress('');
    }
  }

  // Section visibility checks
  const showSiteDetails = ['home', 'shop', 'site'].includes(selectedCategory);
  const showLegalDetails = ['home', 'site'].includes(selectedCategory);

  return (
    <div className="min-h-screen bg-[#f7f4f0]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* google font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;600;700&family=Cormorant+Garamond:wght@500;600&display=swap');`}</style>

      {/* top bar */}
      <header className="sticky top-0 z-10 bg-[#f7f4f0]/80 backdrop-blur-md border-b border-[#e8e2db]">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-black hover:text-[#1a1815] transition-colors text-sm font-medium"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          {/* step dots */}
          <div className="flex items-center gap-2">
            <StepDot n={1} active={!step1Done} done={step1Done} />
            <div className={`w-5 h-px transition-colors duration-300 ${step1Done ? 'bg-[#1a1815]' : 'bg-[#ddd7d0]'}`} />
            <StepDot n={2} active={step1Done && !step2Done} done={step2Done} />
            <div className={`w-5 h-px transition-colors duration-300 ${step2Done ? 'bg-[#1a1815]' : 'bg-[#ddd7d0]'}`} />
            <StepDot n={3} active={step2Done && !step3Done} done={step3Done} />
          </div>
          <div className="w-14" /> {/* spacer */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-10 pb-24">
        {/* heading */}
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-black mb-2">New listing</p>
          <h1
            className="text-[2.6rem] leading-none font-[600] text-[#1a1815]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            List your property
          </h1>
          <p className="text-black text-sm mt-3 leading-relaxed max-w-sm">
            Select a property type to get started. The form will adapt based on your choice.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── error ── */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3.5 bg-white border border-red-200 rounded-xl text-sm text-red-600">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path d="M12 8v4m0 4h.01" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* ── card: category ── */}
          <div className="mb-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-4">01 — Type</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-200 text-center
                    ${selectedCategory === cat.id 
                      ? 'border-[#1a1815] bg-[#1a1815] text-white shadow-md scale-[1.02]' 
                      : 'border-[#e8e2db] bg-white text-[#1a1815] hover:border-[#b5936b] hover:bg-[#fdf8f4]'
                    }`}
                >
                  <span className="text-2xl mb-2 block">{cat.icon}</span>
                  <span className="font-bold text-sm mb-1">{cat.label}</span>
                  <span className={`text-[10px] leading-tight ${selectedCategory === cat.id ? 'text-white/80' : 'text-[#b8b0a6]'}`}>
                    {cat.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {selectedCategory && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {selectedCategory === 'lodge' && (
                <div className="bg-white rounded-2xl border border-[#e8e2db] p-6 space-y-5 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black">02 — Booking Type</p>
                  <p className="text-xs text-black -mt-2">Select one or both pricing options</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setBookingTypes(['hourly'])}
                      className={`relative px-3 py-3 rounded-xl border text-sm font-bold transition-all duration-200 ${bookingTypes.includes('hourly') && bookingTypes.length === 1 ? 'bg-[#1a1815] text-white border-[#1a1815]' : 'bg-[#faf9f7] text-[#1a1815] border-[#e2ddd8] hover:border-[#b5936b]'}`}
                    >
                      {bookingTypes.includes('hourly') && bookingTypes.length === 1 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      )}
                      ⏰ Hourly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingTypes(['daily'])}
                      className={`relative px-3 py-3 rounded-xl border text-sm font-bold transition-all duration-200 ${bookingTypes.includes('daily') && bookingTypes.length === 1 ? 'bg-[#1a1815] text-white border-[#1a1815]' : 'bg-[#faf9f7] text-[#1a1815] border-[#e2ddd8] hover:border-[#b5936b]'}`}
                    >
                      {bookingTypes.includes('daily') && bookingTypes.length === 1 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      )}
                      📅 Daily
                    </button>
                    <button
                      type="button"
                      onClick={() => setBookingTypes(['hourly', 'daily'])}
                      className={`relative px-3 py-3 rounded-xl border text-sm font-bold transition-all duration-200 ${bookingTypes.length === 2 ? 'bg-[#1a1815] text-white border-[#1a1815]' : 'bg-[#faf9f7] text-[#1a1815] border-[#e2ddd8] hover:border-[#b5936b]'}`}
                    >
                      {bookingTypes.length === 2 && (
                        <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-400 rounded-full flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                      )}
                      🔄 Both
                    </button>
                  </div>
                  {bookingTypes.length === 2 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p className="text-xs font-semibold text-emerald-700">Flexible pricing — guests can choose hourly or daily</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── card: basics ── */}
              <div className="bg-white rounded-2xl border border-[#e8e2db] p-6 space-y-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black">{selectedCategory === 'lodge' ? '03 — Basics' : '02 — Basics'}</p>

                <Section label="Property Title">
                  <input
                    type="text" required minLength={3} maxLength={255}
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    className={inputCls}
                    placeholder="e.g. Bright 2BHK near Metro Station"
                  />
                </Section>

                <Section label="Description">
                  <textarea
                    rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                    className={`${inputCls} resize-none leading-relaxed`}
                    placeholder="Highlight key features, amenities, and nearby landmarks…"
                  />
                </Section>

                {!user?.phone && (
                  <Section label="Phone Number">
                    <input
                      type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                      className={inputCls}
                      placeholder="+91 98765 43210"
                    />
                  </Section>
                )}
              </div>

              {/* ── card: site details ── */}
              {showSiteDetails && (
                <div className="bg-white rounded-2xl border border-[#e8e2db] p-6 space-y-5 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black">{selectedCategory === 'lodge' ? '04 — Site Details' : '03 — Site Details'}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Section label="Dimensions (e.g. 30x40)">
                      <input
                        type="text" value={dimensions} onChange={(e) => setDimensions(e.target.value)}
                        className={inputCls} placeholder="30x40"
                      />
                    </Section>
                    <Section label="Area (sqft)">
                      <input
                        type="number" min={1} value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)}
                        className={inputCls} placeholder="1200"
                      />
                    </Section>
                  </div>
                </div>
              )}

              {/* ── card: pricing ── */}
              <div className="bg-white rounded-2xl border border-[#e8e2db] p-6 space-y-5 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black">{selectedCategory === 'lodge' ? '05 — Pricing' : '04 — Pricing'}</p>
                
                {['home', 'room', 'shop'].includes(selectedCategory) && (
                  <div className="mb-4">
                    <Section label="Listing Purpose">
                      <div className="flex items-center gap-6 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="listingType" value="rent" checked={listingType === 'rent'} onChange={() => setListingType('rent')} className="accent-black w-4 h-4 cursor-pointer" />
                          <span className="text-sm font-medium text-black">For Rent</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="listingType" value="sale" checked={listingType === 'sale'} onChange={() => setListingType('sale')} className="accent-black w-4 h-4 cursor-pointer" />
                          <span className="text-sm font-medium text-black">For Sale</span>
                        </label>
                      </div>
                    </Section>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {selectedCategory !== 'site' && selectedCategory !== 'lodge' && (
                    <Section label={listingType === 'sale' ? "Total Price (₹)" : "Monthly Rent (₹)"}>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b8b0a6] text-sm font-bold">₹</span>
                        <input
                          type="number" required min={1} step="0.01"
                          value={price} onChange={(e) => setPrice(e.target.value)}
                          className={`${inputCls} pl-8`}
                          placeholder="15,000"
                        />
                      </div>
                    </Section>
                  )}
                  {selectedCategory === 'lodge' && bookingTypes.includes('hourly') && (
                    <Section label="Price per hour (₹)">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b8b0a6] text-sm font-bold">₹</span>
                        <input
                          type="number" required min={1} step="0.01"
                          value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)}
                          className={`${inputCls} pl-8`}
                          placeholder="200"
                        />
                      </div>
                    </Section>
                  )}
                  {selectedCategory === 'lodge' && bookingTypes.includes('daily') && (
                    <Section label="Price per day (₹)">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b8b0a6] text-sm font-bold">₹</span>
                        <input
                          type="number" required min={1} step="0.01"
                          value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)}
                          className={`${inputCls} pl-8`}
                          placeholder="1500"
                        />
                      </div>
                    </Section>
                  )}
                  {selectedCategory === 'site' && (
                    <>
                      <Section label="Price per sqft (₹)">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b8b0a6] text-sm font-bold">₹</span>
                          <input
                            type="number" min={1} step="0.01" value={pricePerSqft} onChange={(e) => setPricePerSqft(e.target.value)}
                            className={`${inputCls} pl-8`} placeholder="2000"
                          />
                        </div>
                      </Section>
                      <Section label="Total Price (₹)">
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b8b0a6] text-sm font-bold">₹</span>
                          <input
                            type="number" required min={1} step="0.01" value={totalPrice} onChange={(e) => setTotalPrice(e.target.value)}
                            className={`${inputCls} pl-8`} placeholder="2400000"
                          />
                        </div>
                      </Section>
                    </>
                  )}
                </div>
              </div>

              {/* ── card: legal details ── */}
              {showLegalDetails && (
                <div className="bg-white rounded-2xl border border-[#e8e2db] p-6 space-y-5 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black">05 — Legal Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Section label="Municipal Status">
                      <select value={municipalStatus} onChange={(e) => setMunicipalStatus(e.target.value)} className={`${inputCls} appearance-none`}>
                        <option value="">Select Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                        <option value="not_approved">Not Approved</option>
                      </select>
                    </Section>
                    <Section label="Revenue Type">
                      <select value={revenueType} onChange={(e) => setRevenueType(e.target.value)} className={`${inputCls} appearance-none`}>
                        <option value="">Select Type</option>
                        <option value="A_khata">A Khata</option>
                        <option value="B_khata">B Khata</option>
                        <option value="gram_panchayat">Gram Panchayat</option>
                      </select>
                    </Section>
                  </div>
                </div>
              )}

              {/* ── card: photo ── */}
              <div className="bg-white rounded-2xl border border-[#e8e2db] p-6 space-y-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black">06 — Photo</p>

                <div
                  className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
                    ${dragOver ? 'border-[#b5936b] bg-[#fdf8f4]' : 'border-[#ddd7d0] hover:border-[#b5936b] hover:bg-[#fdf8f4]'}`}
                  onClick={() => document.getElementById('imageInput').click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <div className="relative group">
                      <img src={imagePreview} alt="Preview" className="w-full h-60 object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-4 py-2 rounded-full">
                          Change photo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-14 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#f0ece7] flex items-center justify-center">
                        <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-[#1a1815]">Drop photo here or click to upload</p>
                        <p className="text-xs text-[#b8b0a6] mt-1">PNG, JPG up to 5 MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </div>

              {/* ── card: location ── */}
              <div className="bg-white rounded-2xl border border-[#e8e2db] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black">07 — Location</p>
                  {location.lat && location.lng && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      ✓ Pin set
                    </span>
                  )}
                </div>
                <p className="text-xs text-black">Click anywhere on the map to drop a pin, search, or enter coordinates</p>
                <MapPicker value={location} onChange={setLocation} />
              </div>

              {/* ── success ── */}
              {success && (
                <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-bold">Property submitted successfully!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Redirecting to properties…</p>
                  </div>
                </div>
              )}

              {/* ── submit ── */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-200
                  bg-[#1a1815] text-white hover:bg-[#2e2a25] active:scale-[0.98]
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                  shadow-lg shadow-[#1a1815]/10 relative overflow-hidden"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {uploadProgress || 'Creating…'}
                  </span>
                ) : (
                  'Submit Property →'
                )}
              </button>

              <p className="text-center text-xs text-[#b8b0a6]">
                By submitting, you agree to our listing guidelines
              </p>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

export default function AddPropertyPage() {
  return (
    <ProtectedRoute allowedRoles={['user', 'admin']}>
      <AddPropertyForm />
    </ProtectedRoute>
  );
}
