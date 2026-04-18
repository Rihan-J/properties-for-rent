/**
 * Base shimmer skeleton block.
 * Usage: <SkeletonBox className="h-48 w-full" rounded="2xl" />
 */
export default function SkeletonBox({ className = '', rounded = 'xl' }) {
  return (
    <div
      className={`animate-shimmer rounded-${rounded} ${className}`}
    />
  );
}
