import { formatDistanceToNow } from "date-fns"
import { FileText, Sparkles, Gavel, Tag } from "lucide-react"

import { DECISION_ACTION_LABELS } from "@/lib/decision-labels"
import { cn } from "@/lib/utils"

type TimelineEvent = {
  id: string
  label: string
  detail?: string
  timestamp: Date
  icon: typeof FileText
  colorClass: string
  beforeAfter?: { before: string; after: string }
}

type TaskHistoryTimelineProps = {
  createdAt: Date
  draftCreatedAt?: Date
  decision?: { action: string; actorName: string | null; createdAt: Date; editedText: string | null }
  originalDraftText?: string
  evalTag?: { tag: string; createdAt: Date }
}

/**
 * ApplicationFlow.md 7.7 — created -> drafted -> decision -> tagged,
 * relative timestamps, vertical timeline with a connecting line per
 * ThemeGuideline.md (border-subtle line, semantic-colored dots).
 *
 * 00_ScopeDocument.md Section 3.3 requires every audit-log entry capture
 * "before/after content" — for an EDIT_APPROVE decision this means the
 * original AI draft (before) and the human's edited final text (after),
 * both shown together so the edit is actually auditable, not just recorded
 * as an opaque "Edited & Approved" label with the substance thrown away.
 */
function TaskHistoryTimeline({ createdAt, draftCreatedAt, decision, originalDraftText, evalTag }: TaskHistoryTimelineProps) {
  const events: TimelineEvent[] = [
    { id: "created", label: "Created", timestamp: createdAt, icon: FileText, colorClass: "bg-status-pending" },
  ]

  if (draftCreatedAt) {
    events.push({ id: "drafted", label: "AI Drafted", timestamp: draftCreatedAt, icon: Sparkles, colorClass: "bg-accent-primary" })
  }

  if (decision) {
    events.push({
      id: "decision",
      label: DECISION_ACTION_LABELS[decision.action] ?? decision.action,
      detail: decision.actorName ? `by ${decision.actorName}` : undefined,
      timestamp: decision.createdAt,
      icon: Gavel,
      colorClass:
        decision.action === "REJECT"
          ? "bg-status-rejected"
          : decision.action === "ESCALATE"
            ? "bg-status-escalated"
            : "bg-status-approved",
      beforeAfter:
        decision.action === "EDIT_APPROVE" && decision.editedText && originalDraftText
          ? { before: originalDraftText, after: decision.editedText }
          : undefined,
    })
  }

  if (evalTag) {
    events.push({ id: "tagged", label: `Tagged: ${evalTag.tag}`, timestamp: evalTag.createdAt, icon: Tag, colorClass: "bg-text-tertiary" })
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-h3 text-text-primary">History</h3>
      <div className="relative flex flex-col gap-6 pl-6">
        <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border-subtle" />
        {events.map((event) => {
          const Icon = event.icon
          return (
            <div key={event.id} className="relative flex items-start gap-3">
              <span className={cn("absolute -left-6 mt-1 size-3.5 rounded-full ring-4 ring-bg-base", event.colorClass)} />
              <Icon className="size-4 shrink-0 text-text-tertiary" strokeWidth={1.75} />
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-body text-text-primary">
                    {event.label}
                    {event.detail && <span className="text-text-secondary"> {event.detail}</span>}
                  </p>
                  <span className="shrink-0 text-meta text-text-tertiary">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </span>
                </div>
                {event.beforeAfter && (
                  <div className="grid grid-cols-1 gap-3 rounded-md bg-bg-surface-2 p-3 md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-micro text-text-tertiary">Before (AI draft)</span>
                      <p className="whitespace-pre-wrap text-meta text-text-secondary">{event.beforeAfter.before}</p>
                    </div>
                    <div className="flex flex-col gap-1 border-t border-border-subtle pt-3 md:border-t-0 md:border-l md:pl-3 md:pt-0">
                      <span className="text-micro text-text-tertiary">After (edited)</span>
                      <p className="whitespace-pre-wrap text-meta text-text-primary">{event.beforeAfter.after}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { TaskHistoryTimeline }
