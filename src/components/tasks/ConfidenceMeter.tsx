"use client"

import { motion } from "framer-motion"

import { colorForConfidence, CONFIDENCE_COLOR_VAR } from "@/lib/confidence"

/**
 * ThemeGuideline Section 4.7 — animated radial/arc meter, not a freehand
 * gradient interpolation between the three colors. Color band mapping
 * comes from the shared lib/confidence.ts (AIPromptsAndGuardrails.md
 * Section 4) so it never drifts from other places showing a confidence
 * score (e.g. the task list's confidence chip).
 */
function ConfidenceMeter({ score }: { score: number }) {
  const percent = Math.round(score * 100)
  const color = CONFIDENCE_COLOR_VAR[colorForConfidence(score)]
  const radius = 36
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex size-24 items-center justify-center">
        <svg viewBox="0 0 96 96" className="absolute inset-0 -rotate-90">
          <circle cx="48" cy="48" r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth="8" />
          <motion.circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - score) }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <span className="text-h2" style={{ color }}>
          {percent}%
        </span>
      </div>
      <span className="text-micro text-text-tertiary">Confidence</span>
    </div>
  )
}

export { ConfidenceMeter }
