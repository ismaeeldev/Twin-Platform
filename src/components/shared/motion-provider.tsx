"use client"

import { MotionConfig } from "framer-motion"
import type { ReactNode } from "react"

/**
 * ThemeGuideline.md Section 5 principle 4 — every custom animation must
 * respect prefers-reduced-motion. The global CSS override in globals.css
 * only affects CSS transitions/animations (like SkeletonShimmer's shimmer
 * keyframe) — it does NOT touch Framer Motion, which animates via inline
 * transforms/WAAPI, not CSS. reducedMotion="user" makes every motion.*
 * component in the tree read the OS setting and auto-disable
 * transform/layout animations (opacity crossfades still play).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
