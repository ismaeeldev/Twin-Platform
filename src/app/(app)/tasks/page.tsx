import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TaskListFilters } from "@/app/(app)/tasks/TaskListFilters"
import { TaskListContent } from "@/app/(app)/tasks/TaskListContent"

type SearchParams = {
  status?: string
  workflowType?: string
}

const VALID_STATUSES = [
  "NEW",
  "AI_DRAFTING",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
  "EDITED",
  "ESCALATED",
  "CLOSED",
] as const

const VALID_WORKFLOW_TYPES = ["SUPPORT_REPLY", "SALES_EMAIL", "CONTRACT_REVIEW"] as const

/**
 * ApplicationFlow.md Section 6 — filterable/sortable task list. Filters are
 * driven by URL search params (shareable, no client-side state needed for
 * the filtering logic itself) — TaskListFilters is the client component
 * that updates the URL, this server component reads it and queries.
 */
export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const user = await requireUser()
  const params = await searchParams

  const status = VALID_STATUSES.find((s) => s === params.status)
  const workflowType = VALID_WORKFLOW_TYPES.find((w) => w === params.workflowType)

  // These two queries are fully independent (neither depends on the
  // other's result) — running them in Promise.all instead of sequentially
  // halves the DB-wait portion of this page's load, matching the same
  // pattern already used in dashboard/page.tsx and observation/page.tsx.
  const [hasAnyTasks, tasks] = await Promise.all([
    prisma.task.count({ where: { userId: user.id } }),
    prisma.task.findMany({
      where: {
        userId: user.id,
        ...(status ? { status } : {}),
        ...(workflowType ? { workflowType } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { aiDrafts: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ])

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <h2 className="text-h2 text-text-primary">Tasks</h2>
      <TaskListFilters currentStatus={status} currentWorkflowType={workflowType} />
      <TaskListContent tasks={tasks} isFiltered={Boolean(status || workflowType)} hasAnyTasks={hasAnyTasks > 0} />
    </div>
  )
}
