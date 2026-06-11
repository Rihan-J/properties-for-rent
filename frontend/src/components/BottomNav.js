'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSyncExternalStore } from 'react';

export default function BottomNav() {
  const pathname = usePathname();
  const { isOwner, isAdmin } = useAuth();
  
  // Prevent hydration mismatch
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  if (!hydrated) return null;

  const tabs = [
    { name: 'Explore', href: '/', icon: '🗺️', show: true },
    { name: 'My Listings', href: '/dashboard', icon: '🏢', show: isOwner },
    { name: 'Admin', href: '/admin', icon: '🛡️', show: isAdmin },
    { name: 'Account', href: '/account', icon: '👤', show: true },
  ];

  const visibleTabs = tabs.filter(tab => tab.show);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-[#e8e2db] pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-[68px] px-2 max-w-md mx-auto">
        {visibleTabs.map((tab) => {
          // Precise path matching:
          // / matches exactly
          // /dashboard matches /dashboard and /dashboard/add-property
          // /admin matches /admin and /admin/*
          // /account matches /account
          const isActive = tab.href === '/' 
            ? pathname === '/' || pathname === '/properties' 
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.name}
              href={tab.href}
              className="flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform duration-200"
            >
              <span className={`text-2xl transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-sm' : 'opacity-70 grayscale-[30%]'}`}>
                {tab.icon}
              </span>
              <span className={`text-[10px] font-bold tracking-wide transition-colors duration-300 ${isActive ? 'text-[#1a1815]' : 'text-[#8a8580]'}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
