'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function SupportInfoCard() {
  const [support, setSupport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSupport() {
      try {
        const res = await api.get('/support');
        setSupport(res.data.data);
      } catch {
        // Silently fail — support card is non-critical
      } finally {
        setLoading(false);
      }
    }
    fetchSupport();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#e8e2db] p-6 animate-pulse">
        <div className="h-5 bg-[#f0ece7] rounded-lg w-40 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-[#f0ece7] rounded w-48" />
          <div className="h-4 bg-[#f0ece7] rounded w-36" />
          <div className="h-8 bg-[#f0ece7] rounded-lg w-full mt-4" />
        </div>
      </div>
    );
  }

  if (!support) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#e8e2db] shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-[#fdf8f4] border border-[#f0ece7] rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-[#b5936b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3
          className="text-lg font-semibold text-[#1a1815]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Contact Support
        </h3>
      </div>

      <div className="space-y-3">
        {support.email && (
          <a
            href={`mailto:${support.email}`}
            className="flex items-center gap-3 text-sm text-[#3d3a36] hover:text-[#b5936b] transition-colors group"
          >
            <span className="w-8 h-8 bg-[#faf9f7] border border-[#e8e2db] rounded-lg flex items-center justify-center group-hover:border-[#b5936b]/40 transition-colors shrink-0">
              <svg className="w-4 h-4 text-[#8a6b4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            <span>{support.email}</span>
          </a>
        )}

        {support.phone && (
          <a
            href={`tel:${support.phone}`}
            className="flex items-center gap-3 text-sm text-[#3d3a36] hover:text-[#b5936b] transition-colors group"
          >
            <span className="w-8 h-8 bg-[#faf9f7] border border-[#e8e2db] rounded-lg flex items-center justify-center group-hover:border-[#b5936b]/40 transition-colors shrink-0">
              <svg className="w-4 h-4 text-[#8a6b4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            <span>{support.phone}</span>
          </a>
        )}
      </div>

      {/* Social Links */}
      <div className="flex gap-2 mt-5 pt-5 border-t border-[#f0ece7]">
        {support.whatsapp && (
          <a
            href={`https://wa.me/${support.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/20 rounded-xl text-sm font-bold hover:bg-[#25D366]/20 transition-all duration-200 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
        )}

        {support.instagram && (
          <a
            href={`https://instagram.com/${support.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E4405F]/10 text-[#E4405F] border border-[#E4405F]/20 rounded-xl text-sm font-bold hover:bg-[#E4405F]/20 transition-all duration-200 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Instagram
          </a>
        )}
      </div>
    </div>
  );
}
