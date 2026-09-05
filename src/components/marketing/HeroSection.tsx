"use client"

import { useLayoutEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"

import { buttonVariants } from "@/components/ui/button-variants"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

/**
 * ApplicationFlow.md Section 1.1 + ThemeGuideline.md Section 5 — the
 * highest-animation-budget moment on the site. GSAP entrance choreography
 * on load; falls back to an instant, fully-visible state for reduced motion.
 *
 * This component is a Client Component but still server-rendered first —
 * the SSR'd HTML paints every element at full opacity BEFORE any JS runs.
 * The original version relied on GSAP's `.from({opacity: 0, ...})` to
 * establish the hidden starting state, but that only happens once
 * `useLayoutEffect` fires post-hydration — so there was a real, visible gap
 * where the SSR-painted button was fully visible, then GSAP suddenly
 * snapped it to invisible before animating it back in. That is the exact
 * "button shows for a moment then disappears" bug reported. Fixed by
 * hiding the animated elements with a plain CSS class (`invisible-until-js`
 * below, in globals.css) from the very first paint — including the SSR
 * HTML itself — and only removing it once GSAP's timeline exists to
 * animate from that same hidden state, so there is never a frame where
 * content is visible before the intended entrance animation.
 */
function HeroSection() {
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  const ANIMATED_SELECTOR =
    "[data-hero-eyebrow], [data-hero-title], [data-hero-subtitle], [data-hero-cta], [data-hero-glow]"

  useLayoutEffect(() => {
    if (!rootRef.current) return

    // `invisible-until-js` hides these elements via a CSS CLASS rule
    // (visibility: hidden in globals.css), not an inline style — GSAP's
    // `clearProps` only removes inline styles GSAP itself previously set,
    // so `gsap.set(el, {clearProps: "visibility"})` is a silent no-op
    // against a class-based rule and never actually reveals anything. This
    // was a real, confirmed bug: verified via Playwright's reduced-motion
    // emulation that the hero content (headline + both CTA buttons) stayed
    // permanently invisible for a reduced-motion visitor, since this
    // branch never ran GSAP's own `.from()` (which normally clears the
    // class as a side effect of setting a competing inline `opacity`) NOR
    // removed the class itself. Fixed by removing the class directly via
    // `classList.remove`, which works regardless of whether GSAP runs.
    const animatedEls = rootRef.current.querySelectorAll(ANIMATED_SELECTOR)

    if (reducedMotion) {
      animatedEls.forEach((el) => el.classList.remove("invisible-until-js"))
      return
    }

    const ctx = gsap.context(() => {
      // Remove the CSS pre-hide class in the SAME synchronous tick as
      // GSAP's .from() calls below — .from() immediately re-establishes
      // the identical hidden state via inline style before the browser
      // paints, so there is no flash between "CSS hidden" and "GSAP hidden."
      animatedEls.forEach((el) => el.classList.remove("invisible-until-js"))

      const ctaEls = gsap.utils.toArray<Element>("[data-hero-cta]")

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } })
      tl.from("[data-hero-eyebrow]", { opacity: 0, y: 12, duration: 0.5 })
        .from("[data-hero-title]", { opacity: 0, y: 24, duration: 0.7 }, "-=0.3")
        .from("[data-hero-subtitle]", { opacity: 0, y: 16, duration: 0.6 }, "-=0.4")
      // `.from()` on these 2 specific CTA links reproducibly left them stuck
      // at their starting opacity/position — verified via direct GSAP
      // tween-state inspection: the parent timeline and every sibling tween
      // completed normally, but a `.from()` targeting these elements never
      // advanced past its start value even though GSAP reported the
      // timeline as fully complete, with or without `stagger` involved. An
      // identical timeline in a bare, non-Next HTML page did not reproduce
      // it, so something about how `.from()` reads these particular
      // elements' "current" style as its implicit end value is the trigger.
      // `gsap.fromTo()` with an EXPLICIT end value sidesteps that read
      // entirely and reliably animates them in testing.
      ctaEls.forEach((el, i) => {
        tl.fromTo(
          el,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.5 },
          i === 0 ? "-=0.3" : `-=${0.3 - i * 0.08}`
        )
      })
      tl.from(
        "[data-hero-glow]",
        { opacity: 0, scale: 0.8, duration: 1.2, ease: "power2.out" },
        "-=1"
      )
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg-base px-6 text-center"
    >
      {/* Subtle radial accent glow — not a generic purple gradient wash, a single
          contained focal point behind the headline, per ThemeGuideline Section 8 */}
      <div
        data-hero-glow
        aria-hidden
        className="invisible-until-js pointer-events-none absolute left-1/2 top-1/3 -z-10 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)",
        }}
      />

      {/* Side-edge glows matching AuthBrandPanel (login/signup) and the
          HowItWorksSection touches below — static (not part of the GSAP
          entrance timeline above) since they're a background texture, not a
          content element the entrance choreography needs to reveal. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 z-0 size-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-1/4 z-0 size-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }}
      />

      <p
        data-hero-eyebrow
        className="invisible-until-js text-micro text-accent-primary"
      >
        Observation + Approval Mode
      </p>

      <h1
        data-hero-title
        className="invisible-until-js mt-4 max-w-3xl text-display text-text-primary"
      >
        AI Digital Twin Platform
      </h1>

      <p
        data-hero-subtitle
        className="invisible-until-js mt-6 max-w-xl text-body-lg text-text-secondary"
      >
        Your AI operates under approval — never without it.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          data-hero-cta
          href="/signup"
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "invisible-until-js")}
        >
          Get Started
        </Link>
        <Link
          data-hero-cta
          href="/login"
          className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "invisible-until-js")}
        >
          Sign In
        </Link>
      </div>
    </section>
  )
}

export { HeroSection }
