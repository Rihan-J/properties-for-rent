'use client';

import { useState, useEffect } from 'react';

export default function RadiusFilter({ value = "", onChange, disabled = false }) {
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 8000);
    const hideListener = () => setShowToast(false);
    window.addEventListener('hide-toasts', hideListener);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hide-toasts', hideListener);
    };
  }, []);

  return (
    <div className="relative flex items-center bg-white rounded-full shadow-sm border border-[#e8e2db] px-2 sm:px-4 py-2 hover:border-[#b5936b] transition-colors h-11 sm:h-12 w-[110px] sm:w-[160px] cursor-pointer flex-shrink-0">
      {showToast && (
        <div 
          className="absolute w-max bg-[#1a1815] text-white text-[11px] font-bold py-2 px-3 rounded-xl shadow-xl animate-bounce pointer-events-none z-50"
          style={{ left: '0px', top: '110%' }}
        >
          <div className="absolute -top-1 left-6 w-3 h-3 bg-[#1a1815] rotate-45 rounded-sm"></div>
          🎯 Click to adjust search range
        </div>
      )}
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="hidden sm:block w-4 h-4 text-[#8a6b4a] shrink-0 mr-2 pointer-events-none">
        <circle cx="12" cy="12" r="10" strokeWidth={2} />
        <circle cx="12" cy="12" r="4" strokeWidth={2} />
      </svg>
      <select
        name="range"
        value={value || ""}
        onChange={(e) => {
          setShowToast(false);
          onChange(Number(e.target.value));
        }}
        disabled={disabled}
        required
        className={`w-full bg-transparent focus:outline-none text-xs sm:text-sm font-semibold cursor-pointer appearance-none sm:pr-6 ${
          value ? 'text-[#1a1815]' : 'text-gray-400'
        }`}
      >
        <option value="" disabled hidden>Select Range</option>
        <option value="2" className="text-[#1a1815]">2 km</option>
        <option value="5" className="text-[#1a1815]">5 km</option>
        <option value="10" className="text-[#1a1815]">10 km</option>
        <option value="20" className="text-[#1a1815]">20 km</option>
        <option value="50" className="text-[#1a1815]">50 km</option>
        <option value="100" className="text-[#1a1815]">100 km</option>
      </select>
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
