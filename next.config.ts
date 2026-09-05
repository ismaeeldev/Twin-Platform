import type { NextConfig } from "next";

/**
 * Baseline security headers — zero behavior risk, pure hardening. Does NOT
 * include a Content-Security-Policy: this app doesn't inline scripts and
 * its CSP would need real testing against Next.js's dev-mode inline
 * bootstrap scripts, Framer Motion, and GSAP before shipping one, so it's
 * deliberately left as a documented follow-up rather than added
 * speculatively (see ProjectState.md's backlog note).
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
