interface SkeletonProps {
  className?: string
}

/**
 * Reusable skeleton placeholder primitive.
 * Mirrors the `bg-gray-100 animate-pulse` block style already used across
 * the app (see TopSellingSection / CategoriesSection) so every loading
 * state shares the same look. Pass a `className` to control size, shape
 * (aspect ratio, rounded corners) and spacing.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />
}
