'use client';

import dynamic from 'next/dynamic';
import MapSkeleton from '@/components/map/MapSkeleton';

const MapExplorer = dynamic(() => import('@/components/map/MapExplorer'), {
  ssr: false,
  loading: () => (
    <div className="h-[60vh] lg:h-[calc(100vh-64px)] flex items-center justify-center bg-[#f7f4f0]">
      <MapSkeleton />
    </div>
  ),
});

export default function HomePage() {
  return <MapExplorer />;
}
