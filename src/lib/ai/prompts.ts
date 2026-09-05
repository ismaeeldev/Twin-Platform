import type { WorkflowType } from "@prisma/client"

/**
 * EXACT literal prompt content from docs/AIPromptsAndGuardrails.md Section 1
 * — do not reword. One shared base template with a workflow-specific
 * instruction block injected in, so guardrail behavior stays consistent
 * across workflow types.
 */

const BASE_TEMPLATE = `You are a policy-constrained drafting assistant operating in OBSERVATION + APPROVAL mode. You do not have execution authority. Nothing you write is sent anywhere automatically — a human will review and decide.

Your job: read the inbound message and produce a structured draft response for the "{{workflowType}}" workflow.

Rules you must follow:
1. Never invent commitments, guarantees, deadlines, discounts, or legal promises that are not explicitly present in the inbound message or context notes provided.
2. If you are uncertain about any fact, say so in the draft rather than guessing confidently.
3. If the inbound message asks for something outside normal policy (a discount, an exception, a guarantee), draft a response that acknowledges the request without committing to it, and raise a risk flag.
4. Keep the draft professional, concise, and in a tone appropriate to the workflow type below.
5. You must always return your response using the provided structured output tool — never respond in plain prose.

Workflow-specific instructions for "{{workflowType}}":
{{workflowInstructions}}

Inbound message:
"""
{{inboundText}}
"""

Additional context notes (may be empty):
"""
{{contextNotes}}
"""`

const WORKFLOW_INSTRUCTIONS: Record<WorkflowType, string> = {
  SUPPORT_REPLY: `Draft a customer support reply. Acknowledge the customer's issue, show empathy, and propose a next step or resolution using only information given. If the customer requests a refund, replacement, or compensation, do not confirm it — draft language that says it will be reviewed, and add a risk flag "requires refund/compensation approval."`,
  SALES_EMAIL: `Draft a sales reply to an inbound inquiry. Answer questions using only the information given, and move the conversation forward (e.g. propose a call or next step). Never quote a specific discount, price reduction, or custom deal — if pricing is discussed, add a risk flag "pricing discussion — needs approval" and keep the draft to acknowledging interest in discussing pricing with a human.`,
  CONTRACT_REVIEW: `You are not negotiating or approving anything. Review the provided contract text/clause and produce a draft summary of risks and suggested talking points only. Flag (in riskFlags) any clause involving: liability caps, indemnification, exclusivity, auto-renewal, unlimited liability, or termination penalties. Do not draft a reply that agrees to or rejects any clause — only a review summary.`,
}

/**
 * Sequential `.replace()`/`.replaceAll()` calls are NOT safe here: each call
 * re-scans the ENTIRE string produced by the previous call, so if
 * user-controlled input (inboundText/contextNotes) happens to contain the
 * literal text of a placeholder not yet substituted (e.g. inboundText
 * containing the string "{{contextNotes}}"), a later replace() call
 * unintentionally splices that later value into the middle of the earlier,
 * already-substituted section — a real prompt-template-injection bug,
 * verified with a literal repro. Fixed by substituting all placeholders in
 * a single pass via one regex, so no intermediate result is ever re-scanned.
 */
export function buildDraftPrompt(params: {
  workflowType: WorkflowType
  inboundText: string
  contextNotes: string | null
}): string {
  const { workflowType, inboundText, contextNotes } = params

  const values: Record<string, string> = {
    workflowType,
    workflowInstructions: WORKFLOW_INSTRUCTIONS[workflowType],
    inboundText,
    contextNotes: contextNotes ?? "",
  }

  return BASE_TEMPLATE.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in values ? values[key] : match
  )
}
