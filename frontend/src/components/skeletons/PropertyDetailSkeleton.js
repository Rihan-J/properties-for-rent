import SkeletonBox from './SkeletonBox';

/**
 * Matches PropertyDetailPage layout exactly:
 * image (h-[450px]) + title/price row + 3 action buttons + map
 */
export default function PropertyDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Hero image */}
      <SkeletonBox className="w-full h-[350px] sm:h-[450px]" rounded="2xl" />

      {/* Title + Price row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-2 flex-1">
          <SkeletonBox className="h-8 w-3/4" rounded="lg" />
          <SkeletonBox className="h-4 w-1/3" rounded="lg" />
        </div>
        <SkeletonBox className="h-16 w-32" rounded="xl" />
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SkeletonBox className="h-12" rounded="xl" />
        <SkeletonBox className="h-12" rounded="xl" />
        <SkeletonBox className="h-12" rounded="xl" />
      </div>

      {/* Map */}
      <SkeletonBox className="w-full h-[300px]" rounded="2xl" />
    </div>
  );
}
