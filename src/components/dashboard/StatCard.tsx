"use client"

import { useEffect, useState } from "react"
import { useMotionValue, animate } from "framer-motion"
import { Info } from "lucide-react"
import type { ReactNode } from "react"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export type StatFormat = "integer" | "percent" | "minutes"

function formatDisplay(latest: number, format: StatFormat): string {
  switch (format) {
    case "percent":
      return Math.round(latest * 100).toString()
    case "minutes":
      return Math.round(latest / 60).toString()
    case "integer":
    default:
      return Math.round(latest).toString()
  }
}

/**
 * ThemeGuideline.md Section 4.2 (cards) + Section 5 principle 6 (animated
 * counters). `value: null` means the metric couldn't be computed (e.g. zero
 * decisions yet for approval rate) — shown as an em dash, not "0" or "NaN".
 *
 * `icon` must be a rendered element (<Icon />), not the component reference
 * itself — Server Components can only pass serializable data or React
 * elements across the RSC boundary into a "use client" component; a raw
 * component reference or a closure function (the old `formatValue` prop)
 * both fail at runtime with "Functions cannot be passed directly to Client
 * Components." Confirmed the hard way in Step 5.2's Bug/Gap investigation —
 * `format` (a plain string) replaces the old function prop for this reason.
 */
function StatCard({
  label,
  value,
  suffix = "",
  icon,
  format = "integer",
  description,
}: {
  label: string
  value: number | null
  suffix?: string
  icon: ReactNode
  format?: StatFormat
  description?: string
}) {
  const reducedMotion = useReducedMotion()
  const motionValue = useMotionValue(0)
  const [displayValue, setDisplayValue] = useState("0")

  useEffect(() => {
    if (value === null) return

    // ThemeGuideline.md Section 5 principle 4 — count-up is an imperative
    // Framer Motion `animate()` call, which the global `MotionConfig
    // reducedMotion="user"` (root layout) does NOT cover — that prop only
    // affects declarative motion.* components. Snap straight to the final
    // value instead of animating when the user has reduced motion set.
    if (reducedMotion) {
      setDisplayValue(formatDisplay(value, format))
      return
    }

    const controls = animate(motionValue, value, {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        setDisplayValue(formatDisplay(latest, format))
      },
    })

    return () => controls.stop()
  }, [value, motionValue, format, reducedMotion])

  return (
    <div className="elevation-card flex flex-col gap-3 rounded-lg bg-bg-surface p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-meta text-text-secondary">{label}</span>
          {description && (
            <Tooltip>
              <TooltipTrigger
                className="relative flex text-text-tertiary outline-none transition-colors before:absolute before:-inset-3.5 before:content-[''] hover:text-text-secondary focus-visible:text-text-secondary"
                aria-label={`What does "${label}" mean?`}
              >
                <Info className="size-3.5" strokeWidth={1.75} />
              </TooltipTrigger>
              <TooltipContent>{description}</TooltipContent>
            </Tooltip>
          )}
        </div>
        <span className="text-text-tertiary">{icon}</span>
      </div>
      <p className="text-h1 text-text-primary">
        {value === null ? "—" : displayValue}
        {value !== null && suffix}
      </p>
    </div>
  )
}

export { StatCard }
