import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import type { WorkflowType } from "@prisma/client"

import { buildDraftPrompt } from "@/lib/ai/prompts"
import { checkGuardrails } from "@/lib/ai/guardrails"

export type DraftResult = {
  draftText: string
  confidenceScore: number
  riskFlags: string[]
  reasoning: string
  rawJson: unknown
}

export type GenerateDraftInput = {
  workflowType: WorkflowType
  inboundText: string
  contextNotes: string | null
}

export type GenerateDraftOutcome =
  | { success: true; draft: DraftResult }
  | { success: false; error: string }

const MODEL = "claude-sonnet-5"
const TIMEOUT_MS = 30_000

// EXACT structured-output tool schema from docs/AIPromptsAndGuardrails.md
// Section 2 — do not modify the shape without updating that doc first.
const SUBMIT_DRAFT_TOOL: Anthropic.Tool = {
  name: "submit_draft",
  description: "Submit the structured draft response",
  input_schema: {
    type: "object",
    properties: {
      draftText: { type: "string", description: "The drafted response text" },
      confidenceScore: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "How confident the model is that this draft is appropriate to send as-is",
      },
      riskFlags: {
        type: "array",
        items: { type: "string" },
        description: "Plain-text risk flags the model itself identified",
      },
      reasoning: { type: "string", description: "Short explanation of why this draft was written this way" },
    },
    required: ["draftText", "confidenceScore", "riskFlags", "reasoning"],
  },
}

// The Anthropic API does NOT enforce a tool's JSON-schema `minimum`/
// `maximum`/`required` constraints server-side — those are hints to the
// model, not a validation gate. `toolUseBlock.input` is untrusted output
// that must be validated the same as any other external API response
// before it's persisted (a misbehaving or adversarial model response could
// return a confidenceScore outside [0,1], which would silently corrupt
// colorForConfidence's 3-band mapping and the UI's displayed percentage).
const submitDraftInputSchema = z.object({
  draftText: z.string().min(1),
  confidenceScore: z.number().min(0).max(1),
  riskFlags: z.array(z.string()),
  reasoning: z.string(),
})

type SubmitDraftInput = z.infer<typeof submitDraftInputSchema>

function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set")
  }
  return new Anthropic({ apiKey, timeout: TIMEOUT_MS })
}

async function callAnthropicOnce(input: GenerateDraftInput): Promise<DraftResult> {
  const client = getClient()
  const prompt = buildDraftPrompt(input)

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    tools: [SUBMIT_DRAFT_TOOL],
    tool_choice: { type: "tool", name: "submit_draft" },
  })

  const toolUseBlock = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  )

  if (!toolUseBlock) {
    throw new Error("Model did not return a submit_draft tool call")
  }

  const parsed = submitDraftInputSchema.parse(toolUseBlock.input)

  // Guardrail check runs automatically right after generation (Step 7.2),
  // before the caller ever sees the result — [POLICY]-prefixed flags are
  // appended alongside the model's own self-reported ones.
  const policyFlags = checkGuardrails(parsed.draftText)

  return {
    draftText: parsed.draftText,
    confidenceScore: parsed.confidenceScore,
    riskFlags: [...parsed.riskFlags, ...policyFlags],
    reasoning: parsed.reasoning,
    // DataModel.md: "full raw structured response from the model, for the
    // collapsible debug panel" — that means the submit_draft tool call's
    // own structured output, not the entire wrapping Anthropic API envelope
    // (which also carries usage/token counts, response id, model version
    // string — internal API metadata with no debugging value for a draft's
    // content/reasoning, and no reason to expose to the end user viewing
    // this panel in AiDraftDisplay.tsx).
    rawJson: toolUseBlock.input,
  }
}

/**
 * Generates a structured AI draft via the Anthropic API. 30s timeout + one
 * retry on failure per docs/CodingConventions.md Section 4; on final
 * failure returns a typed error result rather than throwing unhandled, so
 * callers (Step 6.1's createTask, and any future re-draft/retry action)
 * can surface docs/ThemeGuideline.md Section 10.6's error state instead of
 * crashing.
 */
export async function generateDraft(input: GenerateDraftInput): Promise<GenerateDraftOutcome> {
  try {
    const draft = await callAnthropicOnce(input)
    return { success: true, draft }
  } catch {
    try {
      const draft = await callAnthropicOnce(input)
      return { success: true, draft }
    } catch (retryError) {
      const message = retryError instanceof Error ? retryError.message : "Unknown error"
      return { success: false, error: `AI drafting failed after retry: ${message}` }
    }
  }
}
