"use client"

import { motion } from "framer-motion"

/**
 * ThemeGuideline.md Section 6 — abstract/geometric motif, no stock art,
 * no cartoon mascots. A minimal orbiting-nodes composition echoing the
 * "AI drafts, a human approves" relationship: an outer ring (human review)
 * and an inner pulsing core (the AI draft), connected by a single node
 * that travels the boundary between them.
 */
function OnboardingIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="mx-auto size-40"
      aria-hidden
    >
      <motion.circle
        cx="100"
        cy="100"
        r="72"
        fill="none"
        stroke="var(--border-strong)"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        animate={{ rotate: 360 }}
        transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 100px" }}
      />
      <motion.circle
        cx="100"
        cy="100"
        r="28"
        fill="var(--accent-soft-bg)"
        stroke="var(--accent-primary)"
        strokeWidth="1.5"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "100px 100px" }}
      />
      <motion.circle
        cx="100"
        cy="28"
        r="6"
        fill="var(--accent-primary)"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 100px" }}
      />
    </svg>
  )
}

export { OnboardingIllustration }
