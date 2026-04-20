'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { getGoogleMapsUrl } from '@/lib/geo';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { getPropertyPricing } from '@/lib/property';
import MapSkeleton from '@/components/map/MapSkeleton';
import PropertyDetailSkeleton from '@/components/skeletons/PropertyDetailSkeleton';
import ReviewsSection from '@/components/ReviewsSection';
import ProtectedRoute from '@/components/ProtectedRoute';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

// ─── Contact Reveal Component ───────────────────────────
function ContactReveal({ property, pricing }) {
  const [revealed, setRevealed] = useState(false);
  const [locked, setLocked] = useState(false);

  function handleReveal() {
    if (locked) return;
    setLocked(true);
    setRevealed(true);
    // Unlock after 1 second to prevent rapid clicks
    setTimeout(() => setLocked(false), 1000);
  }

  const p = property;
  const whatsappMsg = encodeURIComponent(
    `Hi, I'm interested in: ${p.title} — ₹${pricing.amount.toLocaleString('en-IN')} ${pricing.unitLong}`
  );

  if (!revealed) {
    return (
      <button
        onClick={handleReveal}
        disabled={locked}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#1a1815] text-white rounded-xl shadow-sm hover:bg-[#2e2a25] hover:shadow-md transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 font-bold tracking-wide"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Show Contact Details
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Email */}
      {p.owner_email && (
        <a
          href={`mailto:${p.owner_email}`}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-white border border-[#e2ddd8] text-[#1a1815] rounded-xl shadow-sm hover:shadow-md hover:bg-[#f7f4f0] transition-all duration-300 active:scale-[0.98] font-semibold text-sm"
        >
          <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {p.owner_email}
        </a>
      )}

      {/* Call */}
      {p.owner_phone && (
        <a
          href={`tel:${p.owner_phone}`}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-[#1a1815] text-white rounded-xl shadow-sm hover:bg-[#2e2a25] hover:shadow-md transition-all duration-300 active:scale-[0.98] font-semibold text-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call Owner
        </a>
      )}

      {/* WhatsApp */}
      {p.owner_phone && (
        <a
          href={`https://wa.me/${p.owner_phone.replace(/[^0-9]/g, '')}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 px-6 py-4 bg-[#25D366] text-white rounded-xl shadow-sm hover:bg-[#128C7E] hover:shadow-md transition-all duration-300 active:scale-[0.98] font-semibold text-sm"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp
        </a>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function PropertyDetailPage() {
  return (
    <ProtectedRoute>
      <PropertyDetailPanel />
    </ProtectedRoute>
  );
}

function PropertyDetailPanel() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data.data.property);
      } catch (err) {
        setError(err.response?.status === 404 ? 'Property not found' : 'Failed to load property');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  if (loading) return <PropertyDetailSkeleton />;

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-[#f0ece7] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#e8e2db]">
          <span className="text-3xl">😕</span>
        </div>
        <p className="text-lg font-semibold text-[#1a1815]">{error}</p>
        <p className="text-sm text-black mt-1">The property may have been removed or doesn&apos;t exist.</p>
      </div>
    );
  }

  const p = property;
  const pricing = getPropertyPricing(p);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: Image & Map */}
        <div className="space-y-8">
          
          {/* Property Image */}
          <div className="w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden shadow-sm border border-[#e8e2db] bg-[#f0ece7] transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <img
              src={getOptimizedImageUrl(p.image_url, { width: 900 })}
              alt={p.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-4">Location</p>
            <div className="w-full h-[300px] sm:h-[360px] rounded-xl overflow-hidden border border-[#e8e2db] shadow-sm">
              <MapView
                center={[p.latitude, p.longitude]}
                zoom={15}
                properties={[p]}
              />
            </div>
            <a
              href={getGoogleMapsUrl(p.latitude, p.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#f7f4f0] text-[#1a1815] rounded-xl shadow-sm hover:shadow-md hover:bg-[#f0ece7] transition-all duration-300 active:scale-[0.98] text-sm font-bold border border-[#e2ddd8]"
            >
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Open in Google Maps
            </a>
          </div>

        </div>

        {/* RIGHT COLUMN: Details & Contact */}
        <div className="space-y-8">
          
          {/* Title, Price, & Description */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-6 sm:p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-semibold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{p.title}</h1>
                {p.owner_name && (
                  <p className="text-black text-sm font-medium mt-2">Listed by {p.owner_name}</p>
                )}
                {pricing.isFlexible && (
                  <span className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold text-emerald-700 uppercase px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full tracking-wider">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Flexible Pricing
                  </span>
                )}
                {!pricing.isFlexible && p.category === 'lodge' && p.booking_type && (
                  <span className="inline-block mt-2 text-[10px] font-bold text-[#8a6b4a] uppercase px-2 py-0.5 bg-[#fdf8f4] border border-[#f0ece7] rounded-md tracking-wider">
                    {p.booking_type}
                  </span>
                )}
              </div>
              {pricing.isFlexible ? (
                <div className="shrink-0 flex flex-col gap-2">
                  {pricing.pricingLines.map((line, i) => (
                    <div key={i} className="px-5 py-3 bg-[#f7f4f0] rounded-xl border border-[#e2ddd8] flex flex-col items-center justify-center">
                      <p className="text-[#1a1815] font-bold text-xl tracking-tight">
                        ₹{line.amount.toLocaleString('en-IN')}
                      </p>
                      <p className="text-black text-[10px] font-bold uppercase tracking-wider mt-0.5">{line.unit}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-3 bg-[#f7f4f0] rounded-xl border border-[#e2ddd8] shrink-0 flex flex-col items-center justify-center">
                  <p className="text-[#1a1815] font-bold text-2xl tracking-tight">
                    ₹{pricing.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-black text-[10px] font-bold uppercase tracking-wider mt-0.5">{pricing.unitLong}</p>
                </div>
              )}
            </div>

            {(p.dimensions || p.area_sqft || p.price_per_sqft || p.total_price || p.municipal_status || p.revenue_type) && (
              <div className="mt-6">
                <p className="text-[11px] uppercase tracking-[0.12em] text-black font-bold mb-4">Property Details</p>
                <div className="grid grid-cols-2 gap-4">
                  {p.dimensions && (
                    <div className="bg-[#faf9f7] p-4 rounded-xl border border-[#e8e2db]">
                      <p className="text-[#b8b0a6] text-[10px] font-bold uppercase tracking-wider mb-1">Dimensions</p>
                      <p className="text-[#1a1815] font-semibold text-sm">{p.dimensions}</p>
                    </div>
                  )}
                  {p.area_sqft && (
                    <div className="bg-[#faf9f7] p-4 rounded-xl border border-[#e8e2db]">
                      <p className="text-[#b8b0a6] text-[10px] font-bold uppercase tracking-wider mb-1">Area</p>
                      <p className="text-[#1a1815] font-semibold text-sm">{p.area_sqft} sqft</p>
                    </div>
                  )}
                  {p.price_per_sqft && (
                    <div className="bg-[#faf9f7] p-4 rounded-xl border border-[#e8e2db]">
                      <p className="text-[#b8b0a6] text-[10px] font-bold uppercase tracking-wider mb-1">Price/sqft</p>
                      <p className="text-[#1a1815] font-semibold text-sm">₹{Number(p.price_per_sqft).toLocaleString('en-IN')}</p>
                    </div>
                  )}
                  {p.total_price && (
                    <div className="bg-[#faf9f7] p-4 rounded-xl border border-[#e8e2db]">
                      <p className="text-[#b8b0a6] text-[10px] font-bold uppercase tracking-wider mb-1">Total Price</p>
                      <p className="text-[#1a1815] font-semibold text-sm">₹{Number(p.total_price).toLocaleString('en-IN')}</p>
                    </div>
                  )}
                  {p.municipal_status && (
                    <div className="bg-[#faf9f7] p-4 rounded-xl border border-[#e8e2db]">
                      <p className="text-[#b8b0a6] text-[10px] font-bold uppercase tracking-wider mb-1">Municipal</p>
                      <p className="text-[#1a1815] font-semibold text-sm capitalize">{p.municipal_status.replace('_', ' ')}</p>
                    </div>
                  )}
                  {p.revenue_type && (
                    <div className="bg-[#faf9f7] p-4 rounded-xl border border-[#e8e2db]">
                      <p className="text-[#b8b0a6] text-[10px] font-bold uppercase tracking-wider mb-1">Revenue</p>
                      <p className="text-[#1a1815] font-semibold text-sm capitalize">{p.revenue_type.replace('_', ' ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 p-5 rounded-xl border border-[#e8e2db] bg-[#faf9f7]">
              <p className="text-[11px] uppercase tracking-[0.12em] text-black font-bold mb-3">Description</p>
              <p className="text-[#1a1815] text-sm leading-relaxed whitespace-pre-wrap">
                {p.description || "No description provided for this property. Contact the owner for more details."}
              </p>
            </div>
            
          </div>

          {/* Contact Owner */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#e8e2db] p-6 sm:p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-black mb-5">Contact Owner</p>
            <ContactReveal property={p} pricing={pricing} />
          </div>

          {/* Reviews */}
          <ReviewsSection propertyId={p.id} />

        </div>

      </div>
    </div>
  );
}
