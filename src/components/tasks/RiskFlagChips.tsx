import { Badge } from "@/components/ui/badge"

const POLICY_PREFIX = "[POLICY] "

/**
 * DataModel.md riskFlags note — guardrail-added flags are prefixed
 * `[POLICY] `, AI-self-reported flags have no prefix. Visually distinguish
 * them per Step 8.1's Master Prompt: destructive badge for guardrail
 * flags, outline badge for AI's own.
 */
function RiskFlagChips({ flags }: { flags: string[] }) {
  if (flags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {flags.map((flag, index) => {
        const isPolicyFlag = flag.startsWith(POLICY_PREFIX)
        const label = isPolicyFlag ? flag.slice(POLICY_PREFIX.length) : flag

        return (
          <Badge key={`${flag}-${index}`} variant={isPolicyFlag ? "destructive" : "outline"}>
            {isPolicyFlag && "Policy: "}
            {label}
          </Badge>
        )
      })}
    </div>
  )
}

export { RiskFlagChips }
