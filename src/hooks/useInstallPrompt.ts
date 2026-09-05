"use client"

import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandalone() {
  if (typeof window === "undefined") return false
  // iOS Safari doesn't support the standard matchMedia check — it exposes
  // `navigator.standalone` instead when launched from the Home Screen icon.
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIosSafari() {
  if (typeof window === "undefined") return false
  const ua = window.navigator.userAgent
  const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && "ontouchend" in document)
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return isIos && isSafari
}

/**
 * PWA install affordance state, per the PWA standard's Section 10
 * (installation should never assume `beforeinstallprompt` exists — Safari
 * and iOS never fire it, and there is no programmatic install API there).
 *
 * Returns exactly one of three states so a consuming component can decide
 * what to render without re-deriving this logic itself:
 * - "installed": already running standalone — never show any install UI.
 * - "promptable": a real browser install prompt is available (Chromium-based).
 * - "manual-ios": Safari/iOS — no programmatic prompt exists; the only path
 *   is the user's own Share -> Add to Home Screen menu, so the caller should
 *   show instructions instead of a button that would do nothing.
 * - "unavailable": neither applies (unsupported browser, or a desktop
 *   browser that hasn't fired the event yet).
 */
export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  // `isIosSafari()` reads `window`/`navigator`, which don't exist during SSR
  // — calling it directly in the render body (rather than gating it behind
  // this same effect-driven pattern already used for `installed`) meant the
  // server always rendered as if it returned false, but React's FIRST
  // CLIENT render call it live and could get `true` on a real iOS Safari
  // visitor, mismatching the server HTML and throwing hydration error #418.
  // Starting at `false` on both server and first client render, then
  // correcting via useEffect exactly like `installed` does, keeps every
  // render before mount identical between server and client.
  const [isIos, setIsIos] = useState(false)

  useEffect(() => {
    setInstalled(isStandalone())
    setIsIos(isIosSafari())

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    function handleAppInstalled() {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  async function promptInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    // The prompt can only be used once — always clear it after, win or lose,
    // so a stale reference is never re-triggered.
    setDeferredPrompt(null)
    if (outcome === "accepted") setInstalled(true)
  }

  const status = installed
    ? "installed"
    : deferredPrompt
      ? "promptable"
      : isIos
        ? "manual-ios"
        : "unavailable"

  return { status, promptInstall } as const
}
