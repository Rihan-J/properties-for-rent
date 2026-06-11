import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getOptimizedImageUrl } from '@/lib/cloudinary';
import { getPropertyPricing, getLat, getLng } from '@/lib/property';
import { calculateDistance } from '@/lib/geo';

export default function PropertyCard({ property, showDelete, onDelete, isDeleting, userLat, userLng }) {
  const router = useRouter();
  const { user } = useAuth();
  const pricing = getPropertyPricing(property);
  const distance = calculateDistance(userLat, userLng, getLat(property), getLng(property));

  const handleNavigation = (e) => {
    e.preventDefault();
    router.push(`/properties/${property.id}`);
  };

  return (
    <div className={`group bg-white rounded-2xl overflow-hidden shadow-sm border border-[#e8e2db] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ease-in-out ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      <a href={`/properties/${property.id}`} onClick={handleNavigation} className="block cursor-pointer">
        {/* Image */}
        <div className="relative w-full h-56 overflow-hidden bg-[#f0ece7]">
          <img
            src={getOptimizedImageUrl(property.image_url, { width: 500 })}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {/* Price badge */}
          <div className="absolute top-4 right-4 px-3.5 py-1.5 bg-white/90 border border-[#e2ddd8] rounded-full shadow-sm" style={{ backdropFilter: 'blur(8px)' }}>
            {pricing.isFlexible ? (
              <span className="text-[#1a1815] font-bold text-xs tracking-tight">
                {'\u20B9'}{pricing.hourly?.toLocaleString('en-IN')}<span className="text-[10px] font-medium text-black">/hr</span>
                <span className="mx-1 text-[#d0c8be]">•</span>
                {'\u20B9'}{pricing.daily?.toLocaleString('en-IN')}<span className="text-[10px] font-medium text-black">/day</span>
              </span>
            ) : (
              <span className="text-[#1a1815] font-bold text-sm tracking-tight">
                {'\u20B9'}{pricing.amount.toLocaleString('en-IN')}<span className="text-xs font-medium text-black ml-0.5">{pricing.unitShort}</span>
              </span>
            )}
          </div>
          {/* Flexible pricing badge */}
          {pricing.isFlexible && (
            <div className="absolute top-4 left-4 px-2.5 py-1 bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm" style={{ backdropFilter: 'blur(8px)' }}>
              Flexible pricing
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 pb-3">
          <h3 className="font-semibold text-[#1a1815] text-base truncate group-hover:text-black transition-colors duration-300">
            {property.title}
          </h3>

          {property.category && (
            <span className="inline-block mt-1.5 text-[10px] font-bold text-[#8a6b4a] uppercase px-2 py-0.5 bg-[#fdf8f4] border border-[#f0ece7] rounded-md tracking-wider">
              {property.category.replace('_', ' ')}
            </span>
          )}

          {distance ? (
            <p className="text-sm text-gray-500 mt-1.5 font-medium">
              📍 {distance} km away
            </p>
          ) : property.distance_km !== undefined ? (
            <p className="text-sm text-black mt-1.5 font-medium">
              Distance: {Number(property.distance_km).toFixed(1)} km
            </p>
          ) : null}
        </div>
      </a>

      {/* Footer with actions */}
      <div className="px-5 pb-5">
        <div className="flex items-center justify-between pt-4 border-t border-[#f0ece7]">
          {property.status && (
            <span className="text-[10px] font-bold text-black uppercase px-2.5 py-1 bg-[#f7f4f0] border border-[#e8e2db] rounded-full tracking-wider">
              {property.status}
            </span>
          )}
          <div className="flex items-center gap-2">
            {showDelete && (
              <button
                onClick={(e) => onDelete(e, property.id)}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 active:scale-[0.95] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            )}
            <a
              href={`/properties/${property.id}`}
              onClick={handleNavigation}
              className="text-sm text-black font-semibold hover:text-[#8a6b4a] flex items-center gap-1 transition-colors duration-300 cursor-pointer"
            >
              View <span className="text-base leading-none">-&gt;</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
