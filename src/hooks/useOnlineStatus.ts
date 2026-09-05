"use client"

import { useEffect, useState } from "react"

/**
 * ThemeGuideline.md Section 10.5 — Offline / No-Internet State.
 *
 * Always starts `true` on both the server AND the client's first render —
 * reading `navigator.onLine` synchronously in a lazy useState initializer
 * (the original approach here) caused a real, confirmed hydration mismatch
 * (React error #418) whenever the client's real online state was `false`
 * on first paint, since the server has no `navigator` at all and always
 * renders as if online. `useEffect` corrects the value immediately after
 * mount instead, which costs at most one extra paint before the offline
 * banner appears — an acceptable tradeoff against a hydration error on
 * every genuinely-offline page load.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    function handleOnline() {
      setIsOnline(true)
    }
    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return isOnline
}
