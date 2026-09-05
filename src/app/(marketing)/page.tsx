import { MarketingNavbar } from "@/components/marketing/MarketingNavbar"
import { HeroSection } from "@/components/marketing/HeroSection"
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection"
import { AuthorityRoadmapSection } from "@/components/marketing/AuthorityRoadmapSection"
import { CtaFooter } from "@/components/marketing/CtaFooter"

/**
 * Public landing page ("/") — docs/ApplicationFlow.md Section 1.
 * Lives entirely in the (marketing) route group, outside the authenticated
 * (app) shell built in Step 1.2 — MarketingNavbar here is a lightweight,
 * marketing-only header, not the authenticated Sidebar/TopBar.
 */
export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <MarketingNavbar />
      <HeroSection />
      <div className="relative overflow-hidden">
        {/* Subtle side-edge glow, matching the radial-accent motif already
            used in HeroSection (above) and AuthBrandPanel (the login/signup
            side panel) — a light touch so this plain-background section
            doesn't read as flat next to those, without introducing a new
            visual language. Scoped to HowItWorksSection specifically (not
            AuthorityRoadmapSection right after it, which has its own opaque
            background and would hide anything behind it). */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-12 -z-10 size-[560px] rounded-full"
          style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 bottom-12 -z-10 size-[560px] rounded-full"
          style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }}
        />

        <HowItWorksSection />
      </div>
      <AuthorityRoadmapSection />
      <CtaFooter />
    </main>
  )
}
