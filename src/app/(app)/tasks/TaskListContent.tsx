"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ListChecks } from "lucide-react"

import { StatusBadge, statusBarClassFor, type TaskStatusValue } from "@/components/shared/StatusBadge"
import { ConfidenceChip } from "@/components/shared/ConfidenceChip"
import { EmptyState } from "@/components/shared/EmptyState"
import { WORKFLOW_TYPE_LABELS } from "@/lib/workflow-types"
import { cn } from "@/lib/utils"

type TaskListItem = {
  id: string
  workflowType: string
  inboundText: string
  status: string
  createdAt: Date
  aiDrafts: { confidenceScore: number }[]
}

function truncate(text: string, max: number) {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

function TaskListContent({
  tasks,
  isFiltered,
  hasAnyTasks,
}: {
  tasks: TaskListItem[]
  isFiltered: boolean
  hasAnyTasks: boolean
}) {
  if (tasks.length === 0) {
    const showFilterEmptyState = isFiltered && hasAnyTasks
    return showFilterEmptyState ? (
      <EmptyState
        icon={ListChecks}
        heading="No matching tasks"
        description="No tasks match the current filters. Try a different combination, or clear them to see everything."
        secondaryCta={{ label: "Clear filters", href: "/tasks" }}
      />
    ) : (
      <EmptyState
        icon={ListChecks}
        heading="No tasks yet"
        description="Create your first task and the AI will draft a response for your review."
        cta={{ label: "New Task", href: "/tasks/new" }}
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task, index) => {
        const latestDraft = task.aiDrafts[0]

        return (
          <motion.li
            key={task.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={`/tasks/${task.id}`}
              className="elevation-card flex items-stretch gap-4 overflow-hidden rounded-lg bg-bg-surface-2 outline-none transition-shadow duration-150 hover:elevation-hover focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base"
            >
              <span className={cn("w-[3px] shrink-0", statusBarClassFor(task.status as TaskStatusValue))} />
              <div className="flex flex-1 flex-wrap items-center justify-between gap-3 py-4 pr-4">
                <div className="flex min-w-0 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={task.status as TaskStatusValue} />
                    <span className="text-micro text-text-tertiary">
                      {WORKFLOW_TYPE_LABELS[task.workflowType] ?? task.workflowType}
                    </span>
                  </div>
                  <p className="truncate text-body text-text-secondary">{truncate(task.inboundText, 120)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {latestDraft ? <ConfidenceChip score={latestDraft.confidenceScore} /> : null}
                  <span className="text-micro text-text-tertiary">
                    {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                  </span>
                </div>
              </div>
            </Link>
          </motion.li>
        )
      })}
    </ul>
  )
}

export { TaskListContent }
