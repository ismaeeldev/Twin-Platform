import { colorForConfidence } from "@/lib/confidence"
import { cn } from "@/lib/utils"

const BAND_CLASSES = {
  rejected: "bg-status-rejected-bg text-status-rejected",
  escalated: "bg-status-escalated-bg text-status-escalated",
  approved: "bg-status-approved-bg text-status-approved",
} as const

/**
 * Compact confidence display for list rows (Task List, Observation Log) —
 * the full animated ConfidenceMeter is reserved for the Task Detail screen.
 * Same 3-band color mapping (lib/confidence.ts).
 */
function ConfidenceChip({ score }: { score: number }) {
  const band = colorForConfidence(score)

  return (
    <span className={cn("rounded-full px-2 py-0.5 text-micro normal-case tracking-normal", BAND_CLASSES[band])}>
      {Math.round(score * 100)}%
    </span>
  )
}

export { ConfidenceChip }
