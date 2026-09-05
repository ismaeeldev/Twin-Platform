import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"

/**
 * CodingConventions.md Section on shared components: "Empty states —
 * components/shared/EmptyState.tsx (props for icon/copy/CTA). Do not write
 * empty-state markup inline per page — parameterize the one component."
 *
 * Before this existed, RecentTasksFeed (Dashboard) had the correct
 * icon-circle/heading/description/CTA treatment per ThemeGuideline.md
 * Section 10.1, but TaskListContent (Tasks), ObservationFeed (Observation
 * Log), and EvalCharts (Eval Dashboard) each hand-rolled their own
 * DIFFERENT, plainer empty state (a dashed box with just a sentence, no
 * icon, no heading, and — for Observation/Eval — no CTA at all) — three of
 * four screens didn't actually meet the spec's "minimal line-art/geometric
 * motif... heading... CTA where one makes sense" requirement. This
 * component is the single source of truth going forward so every empty
 * state looks and reads the same way across the app.
 *
 * `cta` renders as a real button (primary action, e.g. "Create your first
 * task"). `secondaryCta` renders as a plain text link (a lower-emphasis
 * action, e.g. "Clear filters") — the two are visually distinct so a
 * "no data at all" state and a "no results for this filter" state never
 * look identical even when both happen to show a clickable link.
 */
function EmptyState({
  icon: Icon,
  heading,
  description,
  cta,
  secondaryCta,
}: {
  icon: LucideIcon
  heading: string
  description: string
  cta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
}) {
  return (
    <div className="elevation-card flex flex-col items-center gap-3 rounded-lg bg-bg-surface px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-accent-soft-bg text-accent-primary">
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <h3 className="text-h3 text-text-primary">{heading}</h3>
      <p className="max-w-sm text-body text-text-secondary">{description}</p>
      {cta && (
        <Link href={cta.href} className={buttonVariants({ variant: "default" })}>
          {cta.label}
        </Link>
      )}
      {secondaryCta && (
        <Link
          href={secondaryCta.href}
          className="text-body text-accent-primary underline-offset-4 hover:underline"
        >
          {secondaryCta.label}
        </Link>
      )}
    </div>
  )
}

export { EmptyState }
