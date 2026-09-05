import { requireUser } from "@/lib/auth"
import {
  getApprovalRateOverTime,
  getApprovalRateByWorkflowType,
  getEvalTagDistribution,
  getConfidenceVsOutcome,
  getEditRate,
} from "@/lib/metrics"
import { EvalCharts } from "@/app/(app)/eval/EvalCharts"

/**
 * ApplicationFlow.md Section 9 — approval-rate-over-time, quality-tag
 * distribution, per-workflow-type breakdown, confidence-vs-outcome
 * correlation. All numbers computed from real Task/Decision/EvalTag
 * records via lib/metrics.ts (Step 5.2's shared module) — no second,
 * slightly-different calculation lives here.
 */
export default async function EvalPage() {
  const user = await requireUser()

  const [approvalOverTime, byWorkflowType, tagDistribution, confidenceVsOutcome, editRate] = await Promise.all([
    getApprovalRateOverTime(user.id),
    getApprovalRateByWorkflowType(user.id),
    getEvalTagDistribution(user.id),
    getConfidenceVsOutcome(user.id),
    getEditRate(user.id),
  ])

  const hasAnyDecisions = approvalOverTime.length > 0

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <h2 className="text-h2 text-text-primary">Eval Dashboard</h2>
      <EvalCharts
        approvalOverTime={approvalOverTime}
        byWorkflowType={byWorkflowType}
        tagDistribution={tagDistribution}
        confidenceVsOutcome={confidenceVsOutcome}
        editRate={editRate}
        hasAnyDecisions={hasAnyDecisions}
      />
    </div>
  )
}
