"use server"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"
import { generateDraft } from "@/lib/ai/draft-generator"
import { transitionTaskInTransaction } from "@/lib/workflow-engine"

export type GenerateDraftForTaskResult = { success: true } | { success: false; error: string }

/**
 * Runs AI drafting for a task already sitting at AI_DRAFTING with no
 * AiDraft yet. Called from the client after redirecting to /tasks/[id] —
 * per ApplicationFlow.md 5.3, the redirect happens IMMEDIATELY on task
 * creation, with drafting happening while the user is already looking at
 * the skeleton on this page, not before the redirect (Server Actions can't
 * return a response early while still working in the background, so the
 * "redirect first, draft after" sequence has to be driven from here).
 *
 * Guarded against double-invocation (React StrictMode double-firing
 * useEffect in dev, a flaky client retry, remounting mid-request): an
 * unguarded findFirst-then-create would let two concurrent calls both pass
 * the AI_DRAFTING check and both write a duplicate AiDraft row. This can't
 * fully prevent a second real Anthropic API call (there's no cheap way to
 * lock "in-flight generation" without new schema), but it does guarantee
 * only one AiDraft is ever persisted per task: the transaction below uses
 * an atomic `updateMany({where: {status: "AI_DRAFTING"}})` as a
 * compare-and-swap — only the caller whose update actually matches a row
 * proceeds to write the AiDraft; the loser discards its (already-paid-for)
 * API response.
 */
export async function generateDraftForTask(taskId: string): Promise<GenerateDraftForTaskResult> {
  const user = await requireUser()

  const task = await prisma.task.findFirst({ where: { id: taskId, userId: user.id } })
  if (!task) {
    return { success: false, error: "Task not found." }
  }

  if (task.status !== "AI_DRAFTING") {
    // Already drafted (or in some other state) — nothing to do. Not an
    // error: this is the expected outcome for the loser of the race below,
    // or if the client calls this again after success.
    return { success: true }
  }

  // Cheap early-exit for the common case: if a draft already exists, a
  // concurrent call already finished. This alone isn't race-proof (see the
  // real guard below, which is), but it avoids paying for a second
  // Anthropic API call in the common "called twice, first one already
  // finished" case.
  const existingDraft = await prisma.aiDraft.findFirst({ where: { taskId } })
  if (existingDraft) {
    return { success: true }
  }

  const outcome = await generateDraft({
    workflowType: task.workflowType,
    inboundText: task.inboundText,
    contextNotes: task.contextNotes,
  })

  if (!outcome.success) {
    return { success: false, error: outcome.error }
  }

  // Atomically create the AiDraft AND transition the task in one
  // transaction, guarded by an updateMany that only matches if the task is
  // STILL at AI_DRAFTING — if a concurrent call already won this race and
  // moved it to PENDING_APPROVAL, this one's updateMany matches zero rows
  // and we discard this (redundant, already-paid-for) API response instead
  // of writing a second AiDraft.
  await prisma.$transaction(async (tx) => {
    // Routed through workflow-engine.ts (docs/CodingConventions.md Section 7
    // — no parallel status-transition path) instead of a bare
    // tx.task.updateMany({ data: { status: ... } }) here.
    const updatedCount = await transitionTaskInTransaction(tx, {
      taskId,
      from: "AI_DRAFTING",
      to: "PENDING_APPROVAL",
    })

    if (updatedCount === 0) {
      // Lost the race — another call already completed drafting for this
      // task. Discard this (already-paid-for) API response.
      return
    }

    await tx.aiDraft.create({
      data: {
        taskId: task.id,
        draftText: outcome.draft.draftText,
        confidenceScore: outcome.draft.confidenceScore,
        riskFlags: outcome.draft.riskFlags,
        reasoning: outcome.draft.reasoning,
        rawJson: outcome.draft.rawJson as object,
      },
    })
  })

  // Whether this call won or lost the race, the task now has exactly one
  // AiDraft and is at PENDING_APPROVAL — both are success from the caller's
  // point of view.
  return { success: true }
}
