import { Eye, ClipboardCheck } from "lucide-react"

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

      <div className="relative flex items-center gap-2.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-primary text-text-on-accent shadow-[0_0_0_1px_var(--accent-primary),0_4px_16px_var(--accent-glow)]">
          <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden>
            <path
              d="M4 5.5C4 4.67157 4.67157 4 5.5 4H18.5C19.3284 4 20 4.67157 20 5.5C20 6.32843 19.3284 7 18.5 7H13.5V18.5C13.5 19.3284 12.8284 20 12 20C11.1716 20 10.5 19.3284 10.5 18.5V7H5.5C4.67157 7 4 6.32843 4 5.5Z"
              fill="currentColor"
            />
            <circle cx="17.5" cy="17.5" r="3" fill="currentColor" fillOpacity="0.35" />
            <circle cx="17.5" cy="17.5" r="1.5" fill="currentColor" />
          </svg>
        </span>
        <span className="text-h3 font-bold tracking-tight text-text-primary">Twin</span>
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
