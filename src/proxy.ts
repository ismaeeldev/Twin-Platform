import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"

const PUBLIC_PATHS = ["/", "/signup", "/login"]

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.includes(pathname)

  if (!req.auth && !isPublic) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  // Protect everything except Next.js internals, static assets, the
  // NextAuth API routes themselves (which must stay reachable to sign in),
  // and the PWA assets (manifest, service worker, offline fallback, icons)
  // — these must be fetchable by the browser/OS installer and by the
  // service worker's own fetch handler even when signed out, otherwise
  // installability checks fail and a logged-out visitor can never get a
  // working offline fallback page.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|offline.html|icons/).*)",
  ],
}
