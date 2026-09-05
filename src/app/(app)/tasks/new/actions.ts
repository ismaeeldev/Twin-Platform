"use server"

import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"
import { transitionTaskInTransaction } from "@/lib/workflow-engine"

const createTaskSchema = z.object({
  workflowType: z.enum(["SUPPORT_REPLY", "SALES_EMAIL", "CONTRACT_REVIEW"], {
    message: "Select a workflow type.",
  }),
  // .trim() before .min() so a whitespace-only paste (e.g. 20 spaces) can't
  // pass the length check, and so contextNotes below normalizes to "" for
  // the `contextNotes || null` check just below rather than storing
  // meaningless whitespace the task detail page would then render as an
  // empty-looking "Context: " line.
  inboundText: z.string().trim().min(20, "Paste at least 20 characters of the inbound message."),
  contextNotes: z.string().trim().optional(),
})

export type CreateTaskResult =
  | { success: true; taskId: string }
  | { success: false; error: string }

export async function createTask(input: unknown): Promise<CreateTaskResult> {
  const parsed = createTaskSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }

  const { workflowType, inboundText, contextNotes } = parsed.data

  let user
  try {
    user = await requireUser()
  } catch {
    return { success: false, error: "You must be signed in to create a task." }
  }

  // ApplicationFlow.md 5.3 wants the task to genuinely exist at NEW first,
  // then transition to AI_DRAFTING — not skip straight to AI_DRAFTING — so
  // Step 8.3's task history timeline has a real "Created" moment distinct
  // from "drafting started." But doing these as two separate awaited calls
  // left a real gap: a crash/connection drop between them (this project has
  // hit Neon connection blips repeatedly) could leave a task permanently
  // stuck at NEW with no recovery path, since the Step 7.1 retry UI only
  // handles AI_DRAFTING failures. Wrapping both in one $transaction keeps
  // the spec's two-state sequence while guaranteeing they commit together
  // or not at all.
  const task = await prisma.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        userId: user.id,
        workflowType,
        inboundText,
        contextNotes: contextNotes || null,
        status: "NEW",
      },
    })

    // Routed through workflow-engine.ts (docs/CodingConventions.md Section 7 —
    // no parallel status-transition path) even though this is a fresh row
    // with no concurrent writer yet; keeps this the only place in the
    // codebase that ever writes Task.status.
    await transitionTaskInTransaction(tx, { taskId: created.id, from: "NEW", to: "AI_DRAFTING" })

    return tx.task.findUniqueOrThrow({ where: { id: created.id } })
  })

  // ApplicationFlow.md 5.3 — redirect happens NOW, immediately, before
  // drafting starts. The /tasks/[id] page (Step 7.1) triggers actual AI
  // generation via generateDraftForTask() once the user is already looking
  // at the skeleton there — Server Actions can't return a response early
  // while continuing work in the background, so drafting cannot happen
  // "during" this same request if the redirect is also supposed to be instant.
  return { success: true, taskId: task.id }
}
