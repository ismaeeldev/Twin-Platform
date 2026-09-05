import { cn } from "@/lib/utils"

export type TaskStatusValue =
  | "NEW"
  | "AI_DRAFTING"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "EDITED"
  | "ESCALATED"
  | "CLOSED"

/**
 * ThemeGuideline.md Section 4.3 — pill badge, fully rounded, colored per
 * semantic token with a small leading dot. TaskStatus has 8 values but only
 * 4 semantic color tokens exist (approved/rejected/escalated/pending) — the
 * remaining statuses map onto whichever of the 4 best represents their
 * meaning (see STATUS_CONFIG below). CLOSED has no defined trigger yet
 * (see docs/ProjectState.md Section 5 open question) so it uses a neutral
 * "border-strong" treatment rather than inventing a 5th semantic color.
 */
const STATUS_CONFIG: Record<
  TaskStatusValue,
  { label: string; textClass: string; bgClass: string; dotClass: string }
> = {
  NEW: { label: "New", textClass: "text-status-pending", bgClass: "bg-status-pending-bg", dotClass: "bg-status-pending" },
  AI_DRAFTING: { label: "AI Drafting", textClass: "text-status-pending", bgClass: "bg-status-pending-bg", dotClass: "bg-status-pending" },
  PENDING_APPROVAL: { label: "Pending Approval", textClass: "text-status-pending", bgClass: "bg-status-pending-bg", dotClass: "bg-status-pending" },
  APPROVED: { label: "Approved", textClass: "text-status-approved", bgClass: "bg-status-approved-bg", dotClass: "bg-status-approved" },
  REJECTED: { label: "Rejected", textClass: "text-status-rejected", bgClass: "bg-status-rejected-bg", dotClass: "bg-status-rejected" },
  EDITED: { label: "Edited", textClass: "text-status-approved", bgClass: "bg-status-approved-bg", dotClass: "bg-status-approved" },
  ESCALATED: { label: "Escalated", textClass: "text-status-escalated", bgClass: "bg-status-escalated-bg", dotClass: "bg-status-escalated" },
  CLOSED: { label: "Closed", textClass: "text-text-tertiary", bgClass: "bg-bg-surface-3", dotClass: "bg-text-tertiary" },
}

/**
 * Left-edge status-color bar for task cards (ThemeGuideline.md Section 4.2)
 * — reuses the same per-status color as StatusBadge's dot so a task's badge
 * and its card's edge bar never disagree on color (previously duplicated
 * independently in TaskListContent.tsx and RecentTasksFeed.tsx).
 */
function statusBarClassFor(status: TaskStatusValue): string {
  return STATUS_CONFIG[status].dotClass
}

function StatusBadge({ status, className }: { status: TaskStatusValue; className?: string }) {
  const config = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro normal-case tracking-normal",
        config.bgClass,
        config.textClass,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  )
}

export { StatusBadge, statusBarClassFor }
