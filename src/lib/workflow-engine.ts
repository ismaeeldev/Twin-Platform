import type { DecisionAction, TaskStatus, PrismaClient } from "@prisma/client"

import { prisma } from "@/lib/prisma"

type PrismaTransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">

/**
 * The ONLY place task status transitions happen. Every Server Action/Route
 * Handler that changes a task's status MUST call this module rather than
 * writing `status` directly with Prisma (docs/CodingConventions.md Section 7).
 *
 * Valid transitions (docs/DataModel.md):
 * NEW -> AI_DRAFTING -> PENDING_APPROVAL -> (APPROVED | REJECTED | EDITED | ESCALATED) -> CLOSED
 */
const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  NEW: ["AI_DRAFTING"],
  AI_DRAFTING: ["PENDING_APPROVAL"],
  PENDING_APPROVAL: ["APPROVED", "REJECTED", "EDITED", "ESCALATED"],
  APPROVED: ["CLOSED"],
  REJECTED: ["CLOSED"],
  EDITED: ["CLOSED"],
  ESCALATED: ["CLOSED"],
  CLOSED: [],
}

/**
 * DecisionAction -> resulting TaskStatus, per docs/DataModel.md's mapping
 * rule. The action enum names the human's action; the status enum names
 * the resulting state — intentionally different vocabularies, never unify.
 */
const DECISION_ACTION_TO_STATUS: Record<DecisionAction, TaskStatus> = {
  APPROVE: "APPROVED",
  REJECT: "REJECTED",
  EDIT_APPROVE: "EDITED",
  ESCALATE: "ESCALATED",
}

export class InvalidTransitionError extends Error {
  constructor(from: TaskStatus, to: TaskStatus) {
    super(`Invalid task status transition: ${from} -> ${to}`)
    this.name = "InvalidTransitionError"
  }
}

function assertValidTransition(from: TaskStatus, to: TaskStatus) {
  if (!VALID_TRANSITIONS[from].includes(to)) {
    throw new InvalidTransitionError(from, to)
  }
}

/**
 * Transitions a task to a new status, throwing InvalidTransitionError if
 * the transition isn't allowed from the task's current status. Scoped to
 * userId so a task can't be transitioned by anyone other than its owner.
 */
export async function transitionTask(taskId: string, userId: string, to: TaskStatus) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } })
  if (!task) {
    throw new Error("Task not found")
  }

  assertValidTransition(task.status, to)

  // Same atomic compare-and-swap pattern as recordDecision below: the
  // findFirst above only tells us the status at read time, so a plain
  // update-by-id would let a second concurrent caller silently overwrite a
  // status another request already moved on from (a TOCTOU race). Scoping
  // the update's `where` to the status we validated against means only the
  // request that's still first-to-commit actually applies its write.
  const updateResult = await prisma.task.updateMany({
    where: { id: taskId, status: task.status },
    data: { status: to },
  })

  if (updateResult.count === 0) {
    throw new InvalidTransitionError(task.status, to)
  }

  // Not a new access-control decision (the findFirst/updateMany above
  // already verified + transitioned this exact row for this exact userId)
  // — but keeping the same userId scope here anyway for defense-in-depth,
  // so this function never becomes an unscoped read if reused elsewhere.
  return prisma.task.findFirstOrThrow({ where: { id: taskId, userId } })
}

/**
 * Transaction-scoped compare-and-swap transition, for callers that need the
 * status change to commit atomically alongside other writes (e.g. creating
 * the Task row itself, or writing the AiDraft) inside their own
 * `prisma.$transaction`. Still the ONLY place a `from -> to` status write is
 * expressed — callers pass their `tx` client instead of duplicating the
 * `tx.task.updateMany({ data: { status: ... } })` pattern themselves.
 *
 * Returns the number of rows updated (0 if `from` no longer matches, i.e.
 * someone else already moved the task — callers use this for their own
 * race/double-submit guards, same contract as recordDecision's updateMany).
 */
export async function transitionTaskInTransaction(
  tx: PrismaTransactionClient,
  params: { taskId: string; from: TaskStatus; to: TaskStatus }
): Promise<number> {
  const { taskId, from, to } = params
  assertValidTransition(from, to)

  const updateResult = await tx.task.updateMany({
    where: { id: taskId, status: from },
    data: { status: to },
  })

  return updateResult.count
}

/**
 * Records a Decision and transitions the parent Task to the resulting
 * status in one call, using the exact DecisionAction -> TaskStatus mapping
 * from docs/DataModel.md. This is the only path Step 8.2's Approve/Reject/
 * Edit&Approve/Escalate actions should use.
 */
export async function recordDecision(params: {
  taskId: string
  userId: string
  action: DecisionAction
  editedText?: string | null
}) {
  const { taskId, userId, action, editedText } = params
  const resultingStatus = DECISION_ACTION_TO_STATUS[action]

  const task = await prisma.task.findFirst({ where: { id: taskId, userId } })
  if (!task) {
    throw new Error("Task not found")
  }

  assertValidTransition(task.status, resultingStatus)

  // Guard against double-submit (Step 8.2): the updateMany's where clause
  // re-checks the CURRENT status inside the same query as the write, so if
  // two concurrent requests race past the findFirst check above, only the
  // first one's update actually matches a row (the second request's status
  // filter no longer matches once the first has committed) — this closes
  // the TOCTOU race a plain findFirst-then-update would leave open.
  return prisma.$transaction(async (tx) => {
    const updateResult = await tx.task.updateMany({
      where: { id: taskId, status: task.status },
      data: { status: resultingStatus },
    })

    if (updateResult.count === 0) {
      throw new InvalidTransitionError(task.status, resultingStatus)
    }

    return tx.decision.create({
      data: {
        taskId,
        action,
        editedText: action === "EDIT_APPROVE" ? (editedText ?? null) : null,
        actorUserId: userId,
      },
    })
  })
}
