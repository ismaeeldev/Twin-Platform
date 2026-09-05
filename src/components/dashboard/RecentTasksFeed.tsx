import Link from "next/link"
import { FileText } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { StatusBadge, statusBarClassFor, type TaskStatusValue } from "@/components/shared/StatusBadge"
import { EmptyState } from "@/components/shared/EmptyState"
import { WORKFLOW_TYPE_LABELS } from "@/lib/workflow-types"
import { cn } from "@/lib/utils"

type RecentTask = {
  id: string
  workflowType: string
  status: TaskStatusValue
  inboundText: string
  createdAt: Date
}

/**
 * ApplicationFlow.md Section 4.2 — last 5-10 tasks with status badges,
 * click-through to Task Detail. ThemeGuideline Section 10.1 — a brand-new
 * account with zero tasks gets distinct empty-state copy, not a blank feed.
 */
function RecentTasksFeed({ tasks }: { tasks: RecentTask[] }) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        heading="No tasks yet"
        description="Submit your first inbound message and the AI will draft a response for your review."
        cta={{ label: "Create your first task", href: "/tasks/new" }}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <Link
          key={task.id}
          href={`/tasks/${task.id}`}
          className="elevation-card flex items-stretch gap-4 overflow-hidden rounded-lg bg-bg-surface outline-none transition-shadow duration-150 hover:elevation-hover focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
        >
          <span className={cn("w-[3px] shrink-0", statusBarClassFor(task.status))} />
          <div className="flex flex-1 flex-col gap-2 py-4 pr-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} />
                <span className="text-meta text-text-tertiary">
                  {WORKFLOW_TYPE_LABELS[task.workflowType] ?? task.workflowType}
                </span>
              </div>
              <p className="line-clamp-1 text-body text-text-secondary">{task.inboundText}</p>
            </div>
            <span className="shrink-0 text-meta text-text-tertiary">
              {formatDistanceToNow(task.createdAt, { addSuffix: true })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}

export { RecentTasksFeed }
