import { Eye, ClipboardCheck } from "lucide-react"

import { Logo } from "@/components/shared/Logo"

/**
 * Distinctive left-side panel for /login and /signup, replacing the
 * previous generic centered-card-on-empty-background layout (explicit
 * feedback: "signup and login is soo basic design"). Reuses the same
 * geometric logo mark as the Sidebar and the accent radial glow motif from
 * the landing Hero — so auth pages feel like part of the same product, not
 * a stock template dropped in front of it. Hidden below `lg` — the form
 * alone is the priority on narrow screens.
 */
function AuthBrandPanel() {
  return (
    <div className="relative hidden w-full max-w-md flex-col justify-between overflow-hidden bg-bg-surface p-10 lg:flex">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 size-[420px] rounded-full"
        style={{ background: "radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)" }}
      />

      <div className="relative flex items-center">
        <Logo variant="full" height={40} />
      </div>

      <div className="relative flex flex-col gap-8">
        <h2 className="max-w-xs text-h1 text-text-primary">Your AI drafts. You decide.</h2>
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-soft-bg text-accent-primary">
              <Eye className="size-4" strokeWidth={1.75} />
            </span>
            <p className="text-body text-text-secondary">
              Every inbound message gets a structured, policy-constrained draft — reasoning and confidence included.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-soft-bg text-accent-primary">
              <ClipboardCheck className="size-4" strokeWidth={1.75} />
            </span>
            <p className="text-body text-text-secondary">
              Nothing sends automatically. You approve, edit, reject, or escalate — every time.
            </p>
          </div>
        </div>
      </div>

      <p className="relative text-micro text-text-tertiary">Observation + Approval Mode — Phase 1</p>
    </div>
  )
}

export { AuthBrandPanel }
