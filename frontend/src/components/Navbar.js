'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-white/80 backdrop-blur-md border-b border-[#e8e2db]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-14">
          {/* Logo Only */}
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img src="/app-logo.jpeg" alt="Properties for Rentz" className="w-8 h-8 rounded-lg object-contain border border-[#e2ddd8]" />
            <span className="text-xl font-bold text-[#1a1815] tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Properties for Rentz
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
