"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { FileText, Sparkles, CheckCircle2 } from "lucide-react"

import { useReducedMotion } from "@/hooks/useReducedMotion"

const STEPS = [
  {
    icon: FileText,
    title: "Submit",
    description: "Paste an inbound message — a support ticket, a sales inquiry, a contract to review.",
  },
  {
    icon: Sparkles,
    title: "AI Drafts",
    description:
      "A policy-constrained model produces a structured draft with a confidence score and risk flags — never a guess dressed up as certainty.",
  },
  {
    icon: CheckCircle2,
    title: "You Approve",
    description: "Nothing goes out until a human reviews it. Approve, edit, reject, or escalate — you decide.",
  },
]

/**
 * ApplicationFlow.md Section 1.2 — 3-step visual: Submit → AI Drafts → You Approve.
 */
function HowItWorksSection() {
  const rootRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (reducedMotion || !rootRef.current) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      gsap.from("[data-step-card]", {
        opacity: 0,
        y: 40,
        duration: 0.6,
        ease: "expo.out",
        stagger: 0.15,
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 75%",
        },
      })
    }, rootRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section id="how-it-works" ref={rootRef} className="mx-auto max-w-5xl px-6 py-24 md:py-32">
      <h2 className="text-center text-h1 text-text-primary">How it works</h2>
      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          return (
            <div
              key={step.title}
              data-step-card
              className="elevation-card flex flex-col gap-4 rounded-lg bg-bg-surface p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md bg-accent-soft-bg text-accent-primary">
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
                <span className="text-micro text-text-tertiary">Step {index + 1}</span>
              </div>
              <h3 className="text-h3 text-text-primary">{step.title}</h3>
              <p className="text-body text-text-secondary">{step.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export { HowItWorksSection }
