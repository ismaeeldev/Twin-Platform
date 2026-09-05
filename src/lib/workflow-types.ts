/**
 * Human-readable labels for WorkflowType enum values (prisma/schema.prisma).
 * Shared across any UI that just needs the display label (task list rows,
 * observation log, recent-tasks feed) — WorkflowTypeSelector.tsx keeps its
 * own richer WORKFLOW_TYPES (icon + description) since that's specific to
 * the task-creation form, not a duplicate of this.
 */
export const WORKFLOW_TYPE_LABELS: Record<string, string> = {
  SUPPORT_REPLY: "Support Reply",
  SALES_EMAIL: "Sales Email",
  CONTRACT_REVIEW: "Contract Review",
}
