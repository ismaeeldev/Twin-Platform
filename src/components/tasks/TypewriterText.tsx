"use client"

import { useEffect, useState } from "react"

import { useReducedMotion } from "@/hooks/useReducedMotion"

/**
 * ThemeGuideline.md Section 4.7 — "typewriter/stream-in reveal animation
 * when first generated." Reduced-motion users see the full text instantly.
 */
function TypewriterText({ text, className }: { text: string; className?: string }) {
  const reducedMotion = useReducedMotion()
  const [visibleChars, setVisibleChars] = useState(reducedMotion ? text.length : 0)

  useEffect(() => {
    if (reducedMotion) {
      setVisibleChars(text.length)
      return
    }

    setVisibleChars(0)
    let current = 0
    // ~15ms/char keeps even a long draft under ~3s, matching
    // ThemeGuideline Section 5 principle 3 (page-level motion stays fast).
    const interval = setInterval(() => {
      current += 3
      setVisibleChars(Math.min(current, text.length))
      if (current >= text.length) clearInterval(interval)
    }, 15)

    return () => clearInterval(interval)
  }, [text, reducedMotion])

  return <p className={className}>{text.slice(0, visibleChars)}</p>
}

export { TypewriterText }
