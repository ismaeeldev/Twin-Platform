"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Sparkles, CheckCircle2, XCircle, PenLine, AlertTriangle, ScrollText } from "lucide-react"

import { ConfidenceChip } from "@/components/shared/ConfidenceChip"
import { EmptyState } from "@/components/shared/EmptyState"
import { WORKFLOW_TYPE_LABELS } from "@/lib/workflow-types"
import { cn } from "@/lib/utils"

type DraftEvent = {
  kind: "draft"
  id: string
  createdAt: Date
  taskId: string
  workflowType: string
  inboundText: string
  confidenceScore: number
  riskFlagCount: number
}

type DecisionEvent = {
  kind: "decision"
  id: string
  createdAt: Date
  taskId: string
  workflowType: string
  inboundText: string
  action: string
  actorName: string
}

type FeedEvent = DraftEvent | DecisionEvent

const DECISION_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; textClass: string }> = {
  APPROVE: { label: "approved", icon: CheckCircle2, textClass: "text-status-approved" },
  REJECT: { label: "rejected", icon: XCircle, textClass: "text-status-rejected" },
  EDIT_APPROVE: { label: "edited & approved", icon: PenLine, textClass: "text-status-approved" },
  ESCALATE: { label: "escalated", icon: AlertTriangle, textClass: "text-status-escalated" },
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

function ObservationFeed({
  events,
  isFiltered,
  hasAnyActivity,
}: {
  events: FeedEvent[]
  isFiltered: boolean
  hasAnyActivity: boolean
}) {
  if (events.length === 0) {
    const showFilterEmptyState = isFiltered && hasAnyActivity
    return showFilterEmptyState ? (
      <EmptyState
        icon={ScrollText}
        heading="No matching activity"
        description="No activity matches the current filters. Try a different combination, or clear them to see everything."
        secondaryCta={{ label: "Clear filters", href: "/observation" }}
      />
    ) : (
      <EmptyState
        icon={ScrollText}
        heading="No activity yet"
        description="This log fills in once your first task gets an AI draft or a decision."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {events.map((event, index) => (
        <motion.li
          key={`${event.kind}-${event.id}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={`/tasks/${event.taskId}`}
            className="elevation-card flex items-center gap-4 rounded-lg bg-bg-surface-2 p-4 outline-none transition-shadow duration-150 hover:elevation-hover focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
          >
            <EventIcon event={event} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <EventHeadline event={event} />
                <span className="text-micro text-text-tertiary">
                  {WORKFLOW_TYPE_LABELS[event.workflowType] ?? event.workflowType}
                </span>
              </div>
              <p className="truncate text-body text-text-secondary">{truncate(event.inboundText, 120)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {event.kind === "draft" ? <ConfidenceChip score={event.confidenceScore} /> : null}
              <span className="text-micro text-text-tertiary">
                {formatDistanceToNow(event.createdAt, { addSuffix: true })}
              </span>
            </div>
          </Link>
        </motion.li>
      ))}
    </ul>
  )
}

function EventIcon({ event }: { event: FeedEvent }) {
  if (event.kind === "draft") {
    return (
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft-bg text-accent-primary">
        <Sparkles className="size-4" strokeWidth={1.75} />
      </span>
    )
  }

  const config = DECISION_CONFIG[event.action]
  const Icon = config?.icon ?? CheckCircle2

  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-surface-3", config?.textClass)}>
      <Icon className="size-4" strokeWidth={1.75} />
    </span>
  )
}

function EventHeadline({ event }: { event: FeedEvent }) {
  if (event.kind === "draft") {
    return <span className="text-body font-medium text-text-primary">AI draft generated</span>
  }

  const config = DECISION_CONFIG[event.action]

  return (
    <span className="text-body font-medium text-text-primary">
      {event.actorName} <span className={config?.textClass}>{config?.label ?? event.action.toLowerCase()}</span> a draft
    </span>
  )
}

export { ObservationFeed }
export type { FeedEvent }
