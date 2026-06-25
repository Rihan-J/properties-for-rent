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
  const isLoggedOut = !authUser;
  const isLoggedIn = !!authUser;
  const isAdmin = authUser?.role === 'admin';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-white/90 backdrop-blur-md border-t border-[#e8e2db] pb-safe pt-2 px-6">
      <div className="max-w-md mx-auto flex items-center justify-between h-14">
        
        {/* Explore Tab - Always Visible */}
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${pathname === '/' ? 'text-[#1a1815]' : 'text-[#a39c94] hover:text-[#5a5550]'}`}
        >
          <svg className="w-6 h-6" fill={pathname === '/' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname === '/' ? 1.5 : 2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[10px] font-bold">Explore</span>
        </Link>

        {/* My Listings Tab - Logged In (User/Owner/Admin) */}
        {isLoggedIn && (
          <Link 
            href="/dashboard" 
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${pathname.startsWith('/dashboard') ? 'text-[#1a1815]' : 'text-[#a39c94] hover:text-[#5a5550]'}`}
          >
            <svg className="w-6 h-6" fill={pathname.startsWith('/dashboard') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname.startsWith('/dashboard') ? 1.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-bold">My Listings</span>
          </Link>
        )}

        {/* Admin Tab - Admin Only */}
        {isAdmin && (
          <Link 
            href="/admin" 
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${pathname.startsWith('/admin') ? 'text-[#1a1815]' : 'text-[#a39c94] hover:text-[#5a5550]'}`}
          >
            <svg className="w-6 h-6" fill={pathname.startsWith('/admin') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname.startsWith('/admin') ? 1.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-[10px] font-bold">Admin</span>
          </Link>
        )}

        {/* Account / Login Tab - Dynamic */}
        {isLoggedOut ? (
          <Link 
            href="/auth/login" 
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${pathname.startsWith('/auth') ? 'text-[#1a1815]' : 'text-[#a39c94] hover:text-[#5a5550]'}`}
          >
            <svg className="w-6 h-6" fill={pathname.startsWith('/auth') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname.startsWith('/auth') ? 1.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span className="text-[10px] font-bold">Login</span>
          </Link>
        ) : (
          <Link 
            href="/account" 
            className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${pathname.startsWith('/account') ? 'text-[#1a1815]' : 'text-[#a39c94] hover:text-[#5a5550]'}`}
          >
            <svg className="w-6 h-6" fill={pathname.startsWith('/account') ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={pathname.startsWith('/account') ? 1.5 : 2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-bold">Account</span>
          </Link>
        )}

      </div>
    </nav>
  );
}
