import { cn } from "@/lib/utils"

/**
 * ThemeGuideline.md Section 5 principle 5 / Section 10.2 — shared loading primitive.
 * Every data-driven screen composes this into content-shaped placeholders
 * instead of a generic spinner. Surface-token-based shimmer sweep, 1.2-1.6s loop.
 */
function SkeletonShimmer({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton-shimmer"
      className={cn(
        "relative overflow-hidden rounded-md bg-bg-surface-2",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_1.4s_ease-in-out_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-bg-surface-3 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { SkeletonShimmer }
