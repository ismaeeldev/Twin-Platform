"use client"

import { useEffect, useState } from "react"

function getInitialReducedMotion() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * ThemeGuideline.md Section 5 principle 4 — every custom animation must
 * respect prefers-reduced-motion. GSAP has no built-in equivalent to Framer
 * Motion's reducedMotion prop, so components using GSAP directly must check
 * this and skip/short-circuit their scroll-trigger timelines when true.
 *
 * The initial state is read synchronously via a lazy useState initializer
 * (not an effect) so consumers' own useLayoutEffect sees the CORRECT value
 * on the very first run — an effect-based initial read would still be
 * `false` by the time a sibling useLayoutEffect fires (React flushes all
 * useLayoutEffects before any useEffects), which would run the GSAP
 * animation once regardless of the user's real OS preference.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(getInitialReducedMotion)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")

    function handleChange(event: MediaQueryListEvent) {
      setReduced(event.matches)
    }

    query.addEventListener("change", handleChange)
    return () => query.removeEventListener("change", handleChange)
  }, [])

  return reduced
}
