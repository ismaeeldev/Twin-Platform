import type { MetadataRoute } from "next"

/**
 * Web App Manifest — Next.js serves this at /manifest.webmanifest with the
 * correct `application/manifest+json` content type automatically. Colors
 * match globals.css's dark theme tokens (`--bg-base` / `--accent-primary`)
 * so the installed splash/toolbar matches the app's actual first paint —
 * this app doesn't support a light-theme initial load, so a single static
 * pair here (rather than per-scheme manifest colors, which browsers don't
 * widely support yet) is correct.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "AI Digital Twin Platform",
    short_name: "Twin",
    description: "Your AI operates under approval — never without it.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#08090c",
    theme_color: "#08090c",
    lang: "en",
    dir: "ltr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
