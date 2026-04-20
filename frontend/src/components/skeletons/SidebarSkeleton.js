import PropertyCardSkeleton from './PropertyCardSkeleton';

/**
 * Sidebar skeleton for the map page — stacked cards.
 */
export default function SidebarSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-5">
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
