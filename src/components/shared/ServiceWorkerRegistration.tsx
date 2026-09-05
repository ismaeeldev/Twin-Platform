"use client"

import { useEffect } from "react"

/**
 * Registers /sw.js — production only, and fails silently on any error so a
 * broken or unsupported service worker can never break the actual web app
 * (PWA standard Section 7's "service worker failure principle": the app
 * MUST remain usable if the service worker fails to install, is disabled,
 * or its storage is cleared). Registered from a tiny client component
 * rather than a top-level script so it participates in React's normal
 * effect lifecycle instead of running as an inline script tag.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Intentionally silent — see file-level comment.
    })
  }, [])

  return null
}
