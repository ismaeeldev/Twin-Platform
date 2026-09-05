"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Eye, ClipboardCheck, Workflow, Zap } from "lucide-react"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

const STAGES = [
  { icon: Eye, label: "Observation", description: "AI recommends. It never acts." },
  { icon: ClipboardCheck, label: "Approval", description: "AI drafts. A human decides." },
  { icon: Workflow, label: "Delegation", description: "AI executes within tight, pre-approved limits." },
  { icon: Zap, label: "Autonomous", description: "Fully independent — reserved for narrow, proven workflows." },
]

const CURRENT_STAGE_INDEX = 1

/**
 * ApplicationFlow.md Section 1.3 + 00_ScopeDocument.md's progressive-authority
 * model — Observation -> Approval -> Delegation -> Autonomous, with Phase 1
 * (Approval, index 1) visually highlighted as "current." This is the
 * conceptual core of the product's trust story, not just decoration.
 */
function AuthorityRoadmapSection() {
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (reducedMotion || !rootRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from("[data-roadmap-connector]", {
        scaleX: 0,
        duration: 1,
        ease: "power2.inOut",
        transformOrigin: "left center",
        scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
      })
      gsap.from("[data-roadmap-node]", {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: "expo.out",
        stagger: 0.15,
        scrollTrigger: { trigger: rootRef.current, start: "top 70%" },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section id="authority" ref={rootRef} className="bg-bg-surface px-6 py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-h1 text-text-primary">Authority, earned progressively</h2>
        <p className="mx-auto mt-4 max-w-2xl text-body-lg text-text-secondary">
          We never hand an AI more control than it has proven it deserves. Phase 1 lives here:
        </p>
      </div>

      <div className="relative mx-auto mt-16 max-w-4xl">
        {/* Connector line behind the nodes */}
        <div
          data-roadmap-connector
          aria-hidden
          className="absolute left-0 right-0 top-6 hidden h-px bg-border-strong md:block"
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 md:gap-4">
          {STAGES.map((stage, index) => {
            const Icon = stage.icon
            const isCurrent = index === CURRENT_STAGE_INDEX

            return (
              <div key={stage.label} data-roadmap-node className="relative flex flex-col items-center text-center">
                <div
                  className={cn(
                    "z-10 flex size-12 items-center justify-center rounded-full border-2",
                    isCurrent
                      ? "border-accent-primary bg-accent-primary text-text-on-accent elevation-cta-glow"
                      : "border-border-strong bg-bg-surface-2 text-text-tertiary"
                  )}
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
                {isCurrent && (
                  <span className="mt-3 rounded-full bg-accent-soft-bg px-2.5 py-0.5 text-micro text-accent-primary">
                    Current — Phase 1
                  </span>
                )}
                <h3
                  className={cn(
                    "mt-3 text-h3",
                    isCurrent ? "text-text-primary" : "text-text-secondary"
                  )}
                >
                  {stage.label}
                </h3>
                <p className="mt-2 max-w-[200px] text-meta text-text-tertiary">{stage.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { AuthorityRoadmapSection }
