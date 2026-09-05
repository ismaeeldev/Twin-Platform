import { prisma } from "@/lib/prisma"

/**
 * Shared derived-metric functions per docs/DataModel.md's "Derived metrics"
 * section. Every screen showing one of these numbers (Dashboard, Eval
 * Dashboard, Observation Log) MUST call these — never recompute ad-hoc.
 * All are scoped to a single userId (Phase 1 has no cross-user visibility).
 */

export async function getTotalTaskCount(userId: string) {
  return prisma.task.count({ where: { userId } })
}

export async function getPendingApprovalCount(userId: string) {
  return prisma.task.count({ where: { userId, status: "PENDING_APPROVAL" } })
}

/**
 * Approval rate = count(Decision where action = APPROVE) / count(Decision),
 * optionally scoped to a date range, for this user's tasks.
 */
export async function getApprovalRate(
  userId: string,
  dateRange?: { from: Date; to: Date }
) {
  const where = {
    task: { userId },
    ...(dateRange ? { createdAt: { gte: dateRange.from, lte: dateRange.to } } : {}),
  }

  // One groupBy instead of two sequential counts (total, then approved) —
  // same technique already used by getEvalTagDistribution below, cuts this
  // function's DB round-trips in half.
  const grouped = await prisma.decision.groupBy({ by: ["action"], where, _count: true })

  const totalDecisions = grouped.reduce((sum, g) => sum + g._count, 0)
  if (totalDecisions === 0) return null

  const approvedDecisions = grouped.find((g) => g.action === "APPROVE")?._count ?? 0

  return approvedDecisions / totalDecisions
}

/**
 * Edit rate = count(Decision where action = EDIT_APPROVE) / count(Decision).
 * 00_ScopeDocument.md §3.5 calls for "average edit distance/rate" on the
 * Eval Dashboard — DataModel.md's canonical 4-metric list doesn't include
 * it, so this is a deliberate, minimal addition (a plain rate, not a
 * character-level edit-distance calculation, which the raw draftText vs.
 * editedText diff would require and which isn't specified anywhere as an
 * exact formula) closing that literal scope-doc gap without touching the
 * existing contract.
 */
export async function getEditRate(userId: string) {
  const grouped = await prisma.decision.groupBy({
    by: ["action"],
    where: { task: { userId } },
    _count: true,
  })

  const totalDecisions = grouped.reduce((sum, g) => sum + g._count, 0)
  if (totalDecisions === 0) return null

  const editedDecisions = grouped.find((g) => g.action === "EDIT_APPROVE")?._count ?? 0

  return editedDecisions / totalDecisions
}

/**
 * Avg time-to-decision, in seconds, across this user's decided tasks.
 * = average of (Decision.createdAt - Task.createdAt) per task.
 */
export async function getAvgTimeToDecisionSeconds(userId: string) {
  const decisions = await prisma.decision.findMany({
    where: { task: { userId } },
    select: { createdAt: true, task: { select: { createdAt: true } } },
  })

  if (decisions.length === 0) return null

  const totalSeconds = decisions.reduce((sum, decision) => {
    const diffMs = decision.createdAt.getTime() - decision.task.createdAt.getTime()
    return sum + diffMs / 1000
  }, 0)

  return totalSeconds / decisions.length
}

/**
 * Tag distribution = count(EvalTag) grouped by tag, for this user's tasks.
 */
export async function getEvalTagDistribution(userId: string) {
  const grouped = await prisma.evalTag.groupBy({
    by: ["tag"],
    where: { task: { userId } },
    _count: true,
  })

  return {
    GOOD: grouped.find((g) => g.tag === "GOOD")?._count ?? 0,
    NEEDS_EDIT: grouped.find((g) => g.tag === "NEEDS_EDIT")?._count ?? 0,
    BAD: grouped.find((g) => g.tag === "BAD")?._count ?? 0,
  }
}

/**
 * Approval rate over time, bucketed by day (UTC), for the Eval Dashboard's
 * line/area chart. Only days with at least one decision are returned — the
 * chart component decides how to render gaps, this stays a pure data query.
 */
export async function getApprovalRateOverTime(userId: string) {
  const decisions = await prisma.decision.findMany({
    where: { task: { userId } },
    select: { createdAt: true, action: true },
    orderBy: { createdAt: "asc" },
  })

  const byDay = new Map<string, { total: number; approved: number }>()

  for (const decision of decisions) {
    const dayKey = decision.createdAt.toISOString().slice(0, 10)
    const bucket = byDay.get(dayKey) ?? { total: 0, approved: 0 }
    bucket.total += 1
    if (decision.action === "APPROVE") bucket.approved += 1
    byDay.set(dayKey, bucket)
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { total, approved }]) => ({
      date,
      approvalRate: approved / total,
      totalDecisions: total,
    }))
}

/**
 * Approval rate + decision count broken down by WorkflowType, for the Eval
 * Dashboard's per-workflow-type table. Reuses getApprovalRate's definition
 * (approved / total decisions) rather than a second calculation.
 */
export async function getApprovalRateByWorkflowType(userId: string) {
  const workflowTypes = ["SUPPORT_REPLY", "SALES_EMAIL", "CONTRACT_REVIEW"] as const

  const results = await Promise.all(
    workflowTypes.map(async (workflowType) => {
      // Same groupBy-instead-of-two-counts technique as getApprovalRate —
      // each of the 3 parallel branches now does 1 query instead of 2.
      const grouped = await prisma.decision.groupBy({
        by: ["action"],
        where: { task: { userId, workflowType } },
        _count: true,
      })

      const totalDecisions = grouped.reduce((sum, g) => sum + g._count, 0)
      const approvedDecisions = grouped.find((g) => g.action === "APPROVE")?._count ?? 0

      return {
        workflowType,
        totalDecisions,
        approvalRate: totalDecisions === 0 ? null : approvedDecisions / totalDecisions,
      }
    })
  )

  return results
}

/**
 * Average confidence score of the latest AiDraft per task, grouped by the
 * task's actual human decision outcome — a descriptive correlation table
 * per docs/ApplicationFlow.md 9.3 ("descriptive only, no ML").
 */
export async function getConfidenceVsOutcome(userId: string) {
  const decisions = await prisma.decision.findMany({
    where: { task: { userId } },
    select: {
      action: true,
      task: {
        select: {
          aiDrafts: { orderBy: { createdAt: "desc" }, take: 1, select: { confidenceScore: true } },
        },
      },
    },
  })

  const byAction = new Map<string, { count: number; confidenceSum: number }>()

  for (const decision of decisions) {
    const confidenceScore = decision.task.aiDrafts[0]?.confidenceScore
    if (confidenceScore === undefined) continue

    const bucket = byAction.get(decision.action) ?? { count: 0, confidenceSum: 0 }
    bucket.count += 1
    bucket.confidenceSum += confidenceScore
    byAction.set(decision.action, bucket)
  }

  const actions = ["APPROVE", "REJECT", "EDIT_APPROVE", "ESCALATE"] as const

  return actions.map((action) => {
    const bucket = byAction.get(action)
    return {
      action,
      count: bucket?.count ?? 0,
      avgConfidence: bucket ? bucket.confidenceSum / bucket.count : null,
    }
  })
}

/**
 * All dashboard-relevant metrics in one call, so the page component doesn't
 * need to know about the individual functions above.
 */
export async function getDashboardStats(userId: string) {
  const [totalTasks, pendingApproval, approvalRate, avgTimeToDecisionSeconds] =
    await Promise.all([
      getTotalTaskCount(userId),
      getPendingApprovalCount(userId),
      getApprovalRate(userId),
      getAvgTimeToDecisionSeconds(userId),
    ])

  return { totalTasks, pendingApproval, approvalRate, avgTimeToDecisionSeconds }
}
