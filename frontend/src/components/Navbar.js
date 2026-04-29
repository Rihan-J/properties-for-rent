'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useSyncExternalStore } from 'react';

export default function Navbar() {
  const { user, logout, isOwner, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const authUser = hydrated ? user : null;
  const authIsOwner = hydrated && isOwner;
  const authIsAdmin = hydrated && isAdmin;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Properties for Rentz" className="w-9 h-9 rounded-lg object-contain" />
            <span className="text-xl font-bold text-[#1a1815]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Properties for Rentz</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 lg:gap-10">
            <Link href="/" className="text-black hover:text-[#1a1815] transition-colors duration-300 text-sm font-medium">
              Map
            </Link>
            <Link href="/properties" className="text-black hover:text-[#1a1815] transition-colors duration-300 text-sm font-medium">
              Properties
            </Link>
            {authIsOwner && (
              <Link href="/dashboard/add-property" className="text-black hover:text-[#1a1815] transition-colors duration-300 text-sm font-medium">
                Add Property
              </Link>
            )}
            {authIsAdmin && (
              <Link href="/admin" className="text-black hover:text-[#1a1815] transition-colors duration-300 text-sm font-medium">
                Admin
              </Link>
            )}

            {authUser ? (
              <div className="flex items-center gap-5 pl-8 lg:pl-10 border-l border-[#e2ddd8]">
                <span className="text-sm font-medium text-[#1a1815]">
                  {authUser.name}
                  <span className="ml-2 px-2.5 py-1 bg-[#f0ece7] text-black border border-[#e2ddd8] rounded-full text-[10px] font-bold uppercase tracking-wider">{authUser.role}</span>
                </span>
                <Link
                  href="/account"
                  className="px-4 py-2 text-sm font-bold text-black border border-[#e2ddd8] rounded-xl hover:bg-white hover:border-[#b5936b] transition-all duration-300 active:scale-[0.98]"
                >
                  Account
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-bold text-black border border-[#e2ddd8] rounded-xl hover:bg-white hover:text-red-600 hover:border-red-200 transition-all duration-300 active:scale-[0.98]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4 pl-8 lg:pl-10 border-l border-[#e2ddd8]">
                <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-black hover:text-[#1a1815] transition-colors duration-300">
                  Login
                </Link>
                <Link href="/auth/register" className="px-5 py-2 text-sm font-bold text-white bg-[#1a1815] rounded-xl hover:bg-[#2e2a25] shadow-sm transition-all duration-300 hover:shadow-md active:scale-[0.98]">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-black"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden absolute top-16 right-4 w-56 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#e8e2db] p-3 flex flex-col gap-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <Link href="/" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-[#1a1815] hover:bg-[#f7f4f0] rounded-xl text-center text-[15px] font-semibold transition-colors">Map</Link>
            <Link href="/properties" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-[#1a1815] hover:bg-[#f7f4f0] rounded-xl text-center text-[15px] font-semibold transition-colors">Properties</Link>
            {authIsOwner && (
              <Link href="/dashboard/add-property" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-[#1a1815] hover:bg-[#f7f4f0] rounded-xl text-center text-[15px] font-semibold transition-colors">Add Property</Link>
            )}
            {authIsAdmin && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-[#1a1815] hover:bg-[#f7f4f0] rounded-xl text-center text-[15px] font-semibold transition-colors">Admin</Link>
            )}
            {authUser ? (
              <>
                <div className="h-px bg-[#e8e2db] my-1 mx-2" />
                <Link href="/account" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-[#1a1815] hover:bg-[#f7f4f0] rounded-xl text-center text-[15px] font-semibold transition-colors">Account</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="mt-1 px-4 py-3 text-white bg-[#1a1815] hover:bg-[#2e2a25] rounded-xl text-[15px] font-bold text-center transition-colors">Logout</button>
              </>
            ) : (
              <>
                <div className="h-px bg-[#e8e2db] my-1 mx-2" />
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-[#1a1815] hover:bg-[#f7f4f0] rounded-xl text-center text-[15px] font-semibold transition-colors">Login</Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="mt-1 px-4 py-3 text-white bg-[#1a1815] hover:bg-[#2e2a25] rounded-xl text-[15px] font-bold text-center transition-colors">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
