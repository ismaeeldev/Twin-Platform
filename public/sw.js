// Minimal, safe service worker — PWA "Offline Level 0/1" per the project's
// PWA standard: this app is entirely auth-gated (no meaningful public
// content beyond the marketing/login/signup pages), so this deliberately
// does NOT attempt offline reads/writes of task or draft data. Scope is
// intentionally small: (1) cache-first for hashed, immutable Next.js static
// assets so repeat loads are fast and resilient to a flaky network, and
// (2) a network-first navigation fallback so a failed page load shows a
// real offline page instead of the browser's default error screen. Nothing
// else is cached — in particular, no API route, no HTML for pages that show
// personalized/authenticated data, so there is no cross-account or
// post-logout stale-data risk.

const CACHE_VERSION = "twin-static-v1"
const OFFLINE_URL = "/offline.html"

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.add(OFFLINE_URL))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Never intercept API or auth routes — these are always personalized or
  // mutating, and must always hit the network so the app never acts on
  // stale or cross-account data.
  if (url.pathname.startsWith("/api/")) return

  // Navigation requests (loading a page) — try the network first so users
  // always see live content when online; fall back to the offline page
  // only when the network genuinely fails, never to a stale cached page.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  // Hashed, immutable Next.js build assets — safe to cache aggressively;
  // the hash in the filename changes on every new release, so there is no
  // staleness risk and no need for a network round-trip on repeat visits.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE_VERSION).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone())
            return response
          })
        })
      )
    )
  }
})
