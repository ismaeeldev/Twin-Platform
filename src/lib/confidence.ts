/**
 * AIPromptsAndGuardrails.md Section 4 — exact 3-band confidence->color
 * mapping, shared across ConfidenceMeter (Step 8.1) and any other UI
 * showing a confidence score (task list/observation log chips) so the
 * bands never drift between call sites.
 */
export function colorForConfidence(score: number): "rejected" | "escalated" | "approved" {
  if (score < 0.5) return "rejected"
  if (score < 0.75) return "escalated"
  return "approved"
}

export const CONFIDENCE_COLOR_VAR: Record<ReturnType<typeof colorForConfidence>, string> = {
  rejected: "var(--status-rejected)",
  escalated: "var(--status-escalated)",
  approved: "var(--status-approved)",
}
