/**
 * Human-readable labels for DecisionAction enum values (prisma/schema.prisma).
 * Shared across any UI that just needs the display label (Eval Dashboard's
 * confidence-vs-outcome table, Task Detail's history timeline) —
 * ObservationFeed.tsx keeps its own richer per-action config (icon + text
 * color class) since that's a genuinely different shape, not a duplicate of
 * this plain label map.
 */
export const DECISION_ACTION_LABELS: Record<string, string> = {
  APPROVE: "Approved",
  REJECT: "Rejected",
  EDIT_APPROVE: "Edited & Approved",
  ESCALATE: "Escalated",
}
