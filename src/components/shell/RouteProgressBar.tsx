"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"

/**
 * ThemeGuideline.md Section 10.3 — thin top-of-viewport progress bar shown
 * within ~100ms of a nav click, so route transitions never feel unacknowledged
 * even before the destination's own loading.tsx/data arrives.
 *
 * loading.tsx handles the destination page's own content-shaped skeleton;
 * this component is the persistent, layout-level "something is happening" signal
 * that survives across the whole shell (sidebar/topbar stay mounted per Next.js's
 * loading.tsx behavior, so a per-route loading.tsx alone can't cover the shell chrome).
 */
function RouteProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const previousKey = useRef(`${pathname}?${searchParams.toString()}`)

  useEffect(() => {
    const currentKey = `${pathname}?${searchParams.toString()}`
    if (previousKey.current !== currentKey) {
      previousKey.current = currentKey
      setIsNavigating(false)
    }
  }, [pathname, searchParams])

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement)?.closest("a")
      if (!anchor) return
      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("http") || href.startsWith("#")) return
      const targetKey = href
      const currentKey = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`
      if (targetKey !== currentKey) setIsNavigating(true)
    }

    // Safety net: browser back/forward, a cancelled navigation, or any path
    // that doesn't fire our pathname-change effect (e.g. the user navigates
    // away and back before the destination commits) must not leave the bar
    // stuck visible forever.
    function handlePopState() {
      setIsNavigating(false)
    }

    document.addEventListener("click", handleClick)
    window.addEventListener("popstate", handlePopState)
    return () => {
      document.removeEventListener("click", handleClick)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [pathname, searchParams])

  // Absolute fallback: never show the bar for more than 8s even if something
  // above misses a case — a stuck progress bar is worse than a missing one.
  useEffect(() => {
    if (!isNavigating) return
    const timeout = setTimeout(() => setIsNavigating(false), 8000)
    return () => clearTimeout(timeout)
  }, [isNavigating])

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.8, opacity: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "left" }}
          className="fixed inset-x-0 top-0 z-50 h-0.5 bg-accent-primary"
        />
      )}
    </AnimatePresence>
  )
}

export { RouteProgressBar }
