import PropertyCardSkeleton from './PropertyCardSkeleton';

/**
 * Sidebar skeleton for the map page — stacked cards.
 */
export default function SidebarSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
