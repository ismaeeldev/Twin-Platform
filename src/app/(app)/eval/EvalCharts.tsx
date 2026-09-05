"use client"

import { useEffect, useState } from "react"
import { useMotionValue, animate } from "framer-motion"
import { BarChart3 } from "lucide-react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { WORKFLOW_TYPE_LABELS } from "@/lib/workflow-types"
import { DECISION_ACTION_LABELS } from "@/lib/decision-labels"
import { EmptyState } from "@/components/shared/EmptyState"

const CHART_COLORS = {
  accent: "var(--accent-primary)",
  approved: "var(--status-approved)",
  rejected: "var(--status-rejected)",
  escalated: "var(--status-escalated)",
  pending: "var(--status-pending)",
  gridLine: "var(--border-subtle)",
  axisText: "var(--text-tertiary)",
} as const

const DECISION_COLORS: Record<string, string> = {
  APPROVE: CHART_COLORS.approved,
  REJECT: CHART_COLORS.rejected,
  EDIT_APPROVE: CHART_COLORS.approved,
  ESCALATE: CHART_COLORS.escalated,
}

type ApprovalOverTimePoint = { date: string; approvalRate: number; totalDecisions: number }
type WorkflowTypeBreakdown = { workflowType: string; totalDecisions: number; approvalRate: number | null }
type TagDistribution = { GOOD: number; NEEDS_EDIT: number; BAD: number }
type ConfidenceVsOutcome = { action: string; count: number; avgConfidence: number | null }

/**
 * ThemeGuideline.md Section 5 principle 6 — "number counters that animate
 * up (approval rate %, stats)". The single-day summary needs its own
 * counter since it's a plain number, not a Recharts series (which animates
 * via Recharts' own transition, not this).
 */
function AnimatedPercent({ value }: { value: number }) {
  const reducedMotion = useReducedMotion()
  const motionValue = useMotionValue(0)
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(Math.round(value * 100))
      return
    }

    const controls = animate(motionValue, value, {
      duration: 1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest * 100)),
    })
    return () => controls.stop()
  }, [value, motionValue, reducedMotion])

  return <>{display}%</>
}

function EvalCharts({
  approvalOverTime,
  byWorkflowType,
  tagDistribution,
  confidenceVsOutcome,
  editRate,
  hasAnyDecisions,
}: {
  approvalOverTime: ApprovalOverTimePoint[]
  byWorkflowType: WorkflowTypeBreakdown[]
  tagDistribution: TagDistribution
  confidenceVsOutcome: ConfidenceVsOutcome[]
  editRate: number | null
  hasAnyDecisions: boolean
}) {
  // Guard on the actual array, not just the `hasAnyDecisions` prop — they
  // come from the same source today (page.tsx derives one from the other),
  // but relying on two separate values staying in sync forever is fragile;
  // an empty `approvalOverTime` with a true `hasAnyDecisions` would
  // otherwise crash below on `approvalOverTime[0]` being undefined.
  if (!hasAnyDecisions || approvalOverTime.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        heading="No data yet"
        description="This dashboard fills in after your first approval or rejection."
      />
    )
  }

  const tagChartData = [
    { tag: "Good", value: tagDistribution.GOOD, fill: CHART_COLORS.approved },
    { tag: "Needs Edit", value: tagDistribution.NEEDS_EDIT, fill: CHART_COLORS.escalated },
    { tag: "Bad", value: tagDistribution.BAD, fill: CHART_COLORS.rejected },
  ]

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-h3 text-text-primary">Approval Rate Over Time</h3>
        <div className="h-64 w-full rounded-md border border-border-subtle bg-bg-surface-2 p-4">
          {approvalOverTime.length === 1 ? (
            <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
              <span className="text-h2" style={{ color: CHART_COLORS.accent }}>
                <AnimatedPercent value={approvalOverTime[0].approvalRate} />
              </span>
              <span className="text-micro text-text-tertiary">
                Approval rate on {approvalOverTime[0].date} ({approvalOverTime[0].totalDecisions} decision
                {approvalOverTime[0].totalDecisions === 1 ? "" : "s"}) — the trend line appears once you have
                decisions across more than one day.
              </span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={approvalOverTime}>
                <CartesianGrid stroke={CHART_COLORS.gridLine} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke={CHART_COLORS.axisText} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke={CHART_COLORS.axisText}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 1]}
                  tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
                />
                <Tooltip
                  formatter={(value) => `${Math.round(Number(value) * 100)}%`}
                  contentStyle={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}
                />
                <Area
                  type="monotone"
                  dataKey="approvalRate"
                  stroke={CHART_COLORS.accent}
                  fill={CHART_COLORS.accent}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={{ r: 3, fill: CHART_COLORS.accent, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* 00_ScopeDocument.md §3.5 — "approval rate, average edit distance/rate,
          tag distribution." A plain rate (share of decisions that were
          Edit & Approve), not a character-level diff against the original
          draft — DataModel.md's derived-metrics contract doesn't specify an
          exact edit-distance formula, so this stays a simple, cheap
          groupBy-derived rate rather than inventing an unspecified metric. */}
      <section className="flex flex-col gap-3">
        <h3 className="text-h3 text-text-primary">Edit Rate</h3>
        <div className="flex items-center gap-3 rounded-md border border-border-subtle bg-bg-surface-2 p-4">
          <span className="text-h2 text-text-primary">
            {editRate === null ? "—" : `${Math.round(editRate * 100)}%`}
          </span>
          <span className="text-meta text-text-tertiary">of decisions were Edit &amp; Approve</span>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h3 className="text-h3 text-text-primary">Quality Tag Distribution</h3>
          <div className="h-64 w-full rounded-md border border-border-subtle bg-bg-surface-2 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tagChartData}>
                <CartesianGrid stroke={CHART_COLORS.gridLine} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tag" stroke={CHART_COLORS.axisText} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={CHART_COLORS.axisText} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {tagChartData.map((entry) => (
                    <Cell key={entry.tag} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-h3 text-text-primary">Confidence vs. Outcome</h3>
          <div className="overflow-x-auto rounded-md border border-border-subtle bg-bg-surface-2">
            <table className="w-full text-body">
              <thead>
                <tr className="border-b border-border-subtle text-left text-micro text-text-tertiary">
                  <th className="px-4 py-3 font-medium">Decision</th>
                  <th className="px-4 py-3 font-medium">Count</th>
                  <th className="px-4 py-3 font-medium">Avg. Confidence</th>
                </tr>
              </thead>
              <tbody>
                {confidenceVsOutcome.map((row) => (
                  <tr key={row.action} className="border-b border-border-subtle last:border-0">
                    <td className="px-4 py-3" style={{ color: DECISION_COLORS[row.action] }}>
                      {DECISION_ACTION_LABELS[row.action] ?? row.action}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{row.count}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {row.avgConfidence === null ? "—" : `${Math.round(row.avgConfidence * 100)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-h3 text-text-primary">Approval Rate by Workflow Type</h3>
        <div className="overflow-x-auto rounded-md border border-border-subtle bg-bg-surface-2">
          <table className="w-full text-body">
            <thead>
              <tr className="border-b border-border-subtle text-left text-micro text-text-tertiary">
                <th className="px-4 py-3 font-medium">Workflow Type</th>
                <th className="px-4 py-3 font-medium">Decisions</th>
                <th className="px-4 py-3 font-medium">Approval Rate</th>
              </tr>
            </thead>
            <tbody>
              {byWorkflowType.map((row) => (
                <tr key={row.workflowType} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3 text-text-primary">
                    {WORKFLOW_TYPE_LABELS[row.workflowType] ?? row.workflowType}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{row.totalDecisions}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {row.approvalRate === null ? "—" : `${Math.round(row.approvalRate * 100)}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export { EvalCharts }
