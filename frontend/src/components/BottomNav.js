'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSyncExternalStore } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const authUser = hydrated ? user : null;
  const isOwnerOrAdmin = authUser && (authUser.role === 'owner' || authUser.role === 'admin');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-md border-t border-[#e8e2db] pb-safe pt-2 px-6">
      <div className="max-w-md mx-auto flex items-center justify-between h-14">
        
        {/* Explore Tab */}
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${pathname === '/' ? 'text-[#1a1815]' : 'text-[#a39c94] hover:text-[#5a5550]'}`}
        >
          <svg className="w-6 h-6" fill={pathname === '/' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname === '/' ? 1.5 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] font-bold">Explore</span>
        </Link>

        {/* Dashboard / Listings Tab */}
        {isOwnerOrAdmin && (
          <Link 
            href="/dashboard" 
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${pathname.startsWith('/dashboard') ? 'text-[#1a1815]' : 'text-[#a39c94] hover:text-[#5a5550]'}`}
          >
            <svg className="w-6 h-6" fill={pathname.startsWith('/dashboard') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname.startsWith('/dashboard') ? 1.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-bold">Listings</span>
          </Link>
        )}

        {/* Account / Profile Tab */}
        <Link 
          href={authUser ? "/account" : "/auth/login"} 
          className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${pathname.startsWith('/account') || pathname.startsWith('/auth') ? 'text-[#1a1815]' : 'text-[#a39c94] hover:text-[#5a5550]'}`}
        >
          <svg className="w-6 h-6" fill={pathname.startsWith('/account') || pathname.startsWith('/auth') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname.startsWith('/account') || pathname.startsWith('/auth') ? 1.5 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold">{authUser ? 'Account' : 'Login'}</span>
        </Link>

      </div>
    </nav>
  );
}
