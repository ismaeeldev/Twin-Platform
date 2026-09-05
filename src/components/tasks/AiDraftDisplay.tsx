"use client"

import { useState } from "react"
import { ChevronDown, AlertTriangle } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { ConfidenceMeter } from "@/components/tasks/ConfidenceMeter"
import { TypewriterText } from "@/components/tasks/TypewriterText"
import { RiskFlagChips } from "@/components/tasks/RiskFlagChips"
import { cn } from "@/lib/utils"

type AiDraft = {
  draftText: string
  confidenceScore: number
  riskFlags: string[]
  reasoning: string
  rawJson: unknown
}

/**
 * ThemeGuideline.md Section 4.7 — the product's visual signature component.
 * ApplicationFlow.md 7.2/7.3 — drafted response, confidence meter, risk
 * flags, collapsible reasoning/JSON panel, and a prominent guardrail
 * warning banner (above the fold) when any [POLICY] flags exist.
 */
function AiDraftDisplay({ draft }: { draft: AiDraft }) {
  const [jsonOpen, setJsonOpen] = useState(false)
  const policyFlags = draft.riskFlags.filter((f) => f.startsWith("[POLICY] "))
  const hasSevereFlag = policyFlags.some((f) => f.toLowerCase().includes("liability") || f.toLowerCase().includes("commitment"))

  return (
    <div className="flex flex-col gap-4">
      {policyFlags.length > 0 && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-lg p-4",
            hasSevereFlag ? "bg-status-rejected-bg" : "bg-status-escalated-bg"
          )}
        >
          <AlertTriangle
            className={cn("size-5 shrink-0", hasSevereFlag ? "text-status-rejected" : "text-status-escalated")}
            strokeWidth={1.75}
          />
          <div>
            <p className={cn("text-body font-medium", hasSevereFlag ? "text-status-rejected" : "text-status-escalated")}>
              Policy flags detected — review before approving
            </p>
            <p className="mt-1 text-meta text-text-secondary">
              This draft triggered {policyFlags.length} guardrail {policyFlags.length === 1 ? "check" : "checks"}. See flags below.
            </p>
          </div>
        </div>
      )}

      <Card className="border-border-subtle bg-bg-surface">
        <CardHeader>
          <CardTitle className="text-h3 text-text-primary">AI Draft</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex-1">
              <TypewriterText text={draft.draftText} className="text-body text-text-primary" />
            </div>
            <div className="shrink-0 self-center sm:self-start">
              <ConfidenceMeter score={draft.confidenceScore} />
            </div>
          </div>

          <RiskFlagChips flags={draft.riskFlags} />

          <Collapsible open={jsonOpen} onOpenChange={setJsonOpen}>
            <CollapsibleTrigger className="-my-3.5 flex min-h-11 items-center gap-1.5 py-3.5 text-meta text-text-tertiary outline-none hover:text-text-secondary focus-visible:text-text-secondary">
              <ChevronDown className={cn("size-3.5 transition-transform duration-200", jsonOpen && "rotate-180")} strokeWidth={1.75} />
              Reasoning &amp; raw response
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-3 flex flex-col gap-3 rounded-md bg-bg-surface-2 p-4">
                <p className="text-meta text-text-secondary">{draft.reasoning}</p>
                <pre className="overflow-auto font-mono text-meta text-text-tertiary">
                  {JSON.stringify(draft.rawJson, null, 2)}
                </pre>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </div>
  )
}

export { AiDraftDisplay }
