"use server"

import { z } from "zod"

import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { recordDecision, InvalidTransitionError } from "@/lib/workflow-engine"

const decisionSchema = z.object({
  taskId: z.string().min(1),
  action: z.enum(["APPROVE", "REJECT", "EDIT_APPROVE", "ESCALATE"]),
  editedText: z.string().optional(),
})

export type MakeDecisionResult = { success: true } | { success: false; error: string }

/**
 * ApplicationFlow.md 7.4/7.5 — Approve/Reject/Edit&Approve/Escalate.
 * Double-submit guard: recordDecision()'s atomic updateMany (Step 6.2)
 * rejects a second call once the task has already left PENDING_APPROVAL.
 */
export async function makeDecision(input: unknown): Promise<MakeDecisionResult> {
  const parsed = decisionSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Invalid decision." }
  }

  try {
    const user = await requireUser()

    await recordDecision({
      taskId: parsed.data.taskId,
      userId: user.id,
      action: parsed.data.action,
      editedText: parsed.data.editedText,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      return { success: false, error: "This task has already been decided." }
    }
    return { success: false, error: "Something went wrong — please try again." }
  }
}

const evalTagSchema = z.object({
  taskId: z.string().min(1),
  tag: z.enum(["GOOD", "NEEDS_EDIT", "BAD"]),
})

export type SaveEvalTagResult = { success: true } | { success: false; error: string }

/**
 * ApplicationFlow.md 7.6 — post-decision quality tag, feeds the Eval
 * Dashboard (Step 10).
 */
export async function saveEvalTag(input: unknown): Promise<SaveEvalTagResult> {
  const parsed = evalTagSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: "Invalid tag." }
  }

  try {
    const user = await requireUser()

    const task = await prisma.task.findFirst({ where: { id: parsed.data.taskId, userId: user.id } })
    if (!task) {
      return { success: false, error: "Task not found." }
    }

    await prisma.evalTag.create({
      data: { taskId: parsed.data.taskId, tag: parsed.data.tag },
    })

    return { success: true }
  } catch {
    return { success: false, error: "Something went wrong — please try again." }
  }
}
