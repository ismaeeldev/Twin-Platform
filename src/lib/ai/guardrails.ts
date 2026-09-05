/**
 * EXACT literal policy values from docs/AIPromptsAndGuardrails.md Section 3.
 * A config object (not hardcoded inline) so Settings (ApplicationFlow.md
 * Section 10.2) can read the same values.
 */
export const GUARDRAIL_POLICY = {
  pricingFloorPercentDiscount: 15,
  commitmentPhrases: [
    "we guarantee",
    "we promise",
    "legally binding",
    "100% guaranteed",
    "no matter what",
    "unconditional refund",
    "lifetime warranty",
  ],
  flaggedKeywords: [
    "free forever",
    "unlimited liability",
    "indemnify",
    "auto-renew",
    "exclusivity",
  ],
}

const DISCOUNT_PATTERN = /(\d{1,3})\s?%/g

/**
 * Pure, deterministic (non-LLM) policy checker — same input always produces
 * the same flags, unit-testable without calling the Anthropic API. Returns
 * NEW flags to append to riskFlags; does not mutate the input array.
 * Guardrail-detected flags always get the `[POLICY] ` prefix so the UI
 * (Step 8.1) can visually distinguish them from the model's own
 * self-reported flags, which have no prefix.
 */
export function checkGuardrails(draftText: string): string[] {
  const flags: string[] = []
  const lowerText = draftText.toLowerCase()

  for (const phrase of GUARDRAIL_POLICY.commitmentPhrases) {
    if (lowerText.includes(phrase.toLowerCase())) {
      flags.push(`[POLICY] commitment language detected: '${phrase}'`)
    }
  }

  for (const match of draftText.matchAll(DISCOUNT_PATTERN)) {
    const percent = Number(match[1])
    if (percent >= GUARDRAIL_POLICY.pricingFloorPercentDiscount) {
      flags.push(
        `[POLICY] discount ≥${GUARDRAIL_POLICY.pricingFloorPercentDiscount}% mentioned — requires approval`
      )
      break // one flag is enough even if multiple qualifying percentages appear
    }
  }

  for (const keyword of GUARDRAIL_POLICY.flaggedKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      flags.push(`[POLICY] flagged term: '${keyword}'`)
    }
  }

  return flags
}
