import { notFound } from "next/navigation"

import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DraftingStatus } from "@/app/(app)/tasks/[id]/DraftingStatus"
import { AiDraftDisplay } from "@/components/tasks/AiDraftDisplay"
import { ActionBar } from "@/components/tasks/ActionBar"
import { TaskHistoryTimeline } from "@/components/tasks/TaskHistoryTimeline"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WORKFLOW_TYPE_LABELS } from "@/lib/workflow-types"

/**
 * ApplicationFlow.md Section 7 — the core Task Detail screen. Scoped to the
 * current user (Step 8.1) — a task belonging to another user 404s rather
 * than revealing it exists via a 403.
 */
export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireUser()

  const task = await prisma.task.findFirst({
    where: { id, userId: user.id },
    include: {
      aiDrafts: { orderBy: { createdAt: "desc" }, take: 1 },
      decisions: { orderBy: { createdAt: "desc" }, take: 1, include: { actorUser: true } },
      evalTags: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  if (!task) notFound()

  if (task.status === "AI_DRAFTING") {
    // Same mx-auto max-w-3xl container as the decided-task view below (and
    // the route's own loading.tsx) — using a different width here would
    // cause a visible layout shift the instant the AI finishes drafting and
    // this branch swaps for the one below, or between the route skeleton
    // and this transient state.
    return (
      <div className="mx-auto max-w-3xl p-6">
        <DraftingStatus taskId={task.id} />
      </div>
    )
  }

  const draft = task.aiDrafts[0]
  const decision = task.decisions[0]
  const evalTag = task.evalTags[0]

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <span className="text-meta text-text-tertiary">
          {WORKFLOW_TYPE_LABELS[task.workflowType] ?? task.workflowType}
        </span>
        <h2 className="text-h2 text-text-primary">Task Detail</h2>
      </div>

      <Card className="border-border-subtle bg-bg-surface">
        <CardHeader>
          <CardTitle className="text-h3 text-text-primary">Inbound Message</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-body text-text-secondary">{task.inboundText}</p>
          {task.contextNotes && (
            <p className="mt-4 border-t border-border-subtle pt-4 text-meta text-text-tertiary">
              Context: {task.contextNotes}
            </p>
          )}
        </CardContent>
      </Card>

      {draft && <AiDraftDisplay draft={draft} />}

      {task.status === "PENDING_APPROVAL" && draft && (
        <ActionBar taskId={task.id} draftText={draft.draftText} />
      )}

      <TaskHistoryTimeline
        createdAt={task.createdAt}
        draftCreatedAt={draft?.createdAt}
        decision={
          decision
            ? {
                action: decision.action,
                actorName: decision.actorUser.name,
                createdAt: decision.createdAt,
                editedText: decision.editedText,
              }
            : undefined
        }
        originalDraftText={draft?.draftText}
        evalTag={evalTag ? { tag: evalTag.tag, createdAt: evalTag.createdAt } : undefined}
      />
    </div>
  )
}
