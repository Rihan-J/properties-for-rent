import SkeletonBox from './SkeletonBox';

/**
 * Matches the exact layout of PropertyCard:
 * image (h-48) + padding with title + price + meta row
 */
export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image placeholder */}
      <SkeletonBox className="w-full h-48" rounded="none" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <SkeletonBox className="h-5 w-3/4" rounded="lg" />
        {/* Distance */}
        <SkeletonBox className="h-3 w-1/3" rounded="lg" />
        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1">
          <SkeletonBox className="h-6 w-20" rounded="full" />
          <SkeletonBox className="h-4 w-24" rounded="lg" />
        </div>
      </div>
    </div>
  );
}
