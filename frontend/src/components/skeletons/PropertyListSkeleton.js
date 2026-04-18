import PropertyCardSkeleton from './PropertyCardSkeleton';

/**
 * Grid of PropertyCardSkeletons matching the properties page layout.
 * @param {number} count - Number of skeleton cards to show
 */
export default function PropertyListSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
