import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

const TEST_EMAIL = "test@example.com"
const TEST_PASSWORD = "TestPassword123!"

async function main() {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10)

  const user = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: { passwordHash, hasOnboarded: true },
    create: {
      email: TEST_EMAIL,
      passwordHash,
      name: "Test User",
      hasOnboarded: true,
    },
  })

  // Clear this user's existing tasks (and cascaded children) so re-running
  // the seed script is idempotent instead of piling up duplicate rows.
  await prisma.evalTag.deleteMany({ where: { task: { userId: user.id } } })
  await prisma.decision.deleteMany({ where: { task: { userId: user.id } } })
  await prisma.aiDraft.deleteMany({ where: { task: { userId: user.id } } })
  await prisma.task.deleteMany({ where: { userId: user.id } })

  // 7 tasks spanning all 3 workflow types and every TaskStatus/DecisionAction
  // combination Step 8.2's testing checklist needs a real example of
  // (Approve/Reject/Edit&Approve/Escalate), with AiDraft confidence scores
  // covering all three bands from docs/AIPromptsAndGuardrails.md Section 4:
  //   0.00-0.49 -> rejected-band, 0.50-0.74 -> escalated-band, 0.75-1.00 -> approved-band
  const taskSeeds = [
    {
      workflowType: "SUPPORT_REPLY" as const,
      inboundText:
        "Hi, my order #4821 arrived damaged. Can I get a replacement or refund? This is really frustrating.",
      contextNotes: "Repeat customer, order value $89.",
      status: "PENDING_APPROVAL" as const,
      draft: {
        draftText:
          "Hi there, I'm really sorry to hear your order arrived damaged — that's not the experience we want you to have. I've flagged your case for a replacement or refund review, and someone from our team will confirm the next step shortly.",
        confidenceScore: 0.42,
        riskFlags: ["requires refund/compensation approval"],
        reasoning:
          "Customer requested a refund/replacement; per policy this must be routed to a human rather than confirmed automatically.",
      },
    },
    {
      workflowType: "SALES_EMAIL" as const,
      inboundText:
        "We're interested in your platform for our 200-person team. Can you do 40% off the listed price if we sign an annual contract?",
      contextNotes: null,
      status: "PENDING_APPROVAL" as const,
      draft: {
        draftText:
          "Thanks for your interest in an annual plan for your team! I'd love to set up a call to talk through your needs — pricing for larger teams is something we can discuss with you directly.",
        confidenceScore: 0.35,
        riskFlags: [
          "pricing discussion — needs approval",
          "[POLICY] discount ≥15% mentioned — requires approval",
        ],
        reasoning:
          "Inbound message requests a 40% discount, well above the configured pricing floor; guardrail flag added and no discount was confirmed in the draft.",
      },
    },
    {
      workflowType: "CONTRACT_REVIEW" as const,
      inboundText:
        "Attached is the vendor's proposed MSA. Section 8 includes an auto-renewal clause and an uncapped liability clause. Please review.",
      contextNotes: "Vendor: Acme Logistics Inc.",
      status: "PENDING_APPROVAL" as const,
      draft: {
        draftText:
          "Reviewed the proposed MSA. Section 8's auto-renewal clause and unlimited liability language are both worth flagging before signing — these are common negotiation points and should be reviewed by legal before proceeding.",
        confidenceScore: 0.61,
        riskFlags: ["auto-renewal clause", "unlimited liability clause"],
        reasoning:
          "Contract review workflow — summarizing risk only, no agreement or rejection of terms per policy.",
      },
    },
    {
      workflowType: "SUPPORT_REPLY" as const,
      inboundText: "How do I export my data as a CSV file?",
      contextNotes: null,
      status: "APPROVED" as const,
      draft: {
        draftText:
          "You can export your data as a CSV from Settings > Data Export. If you don't see that option yet, let us know and we'll help directly.",
        confidenceScore: 0.91,
        riskFlags: [],
        reasoning: "Simple factual support question, no commitments or exceptions involved.",
      },
      decisionAction: "APPROVE" as const,
      evalTag: "GOOD" as const,
    },
    {
      workflowType: "SALES_EMAIL" as const,
      inboundText: "Do you integrate with Salesforce?",
      contextNotes: null,
      status: "REJECTED" as const,
      draft: {
        draftText: "We guarantee full Salesforce integration will ship next month, no matter what.",
        confidenceScore: 0.58,
        riskFlags: [
          "[POLICY] commitment language detected: 'we guarantee'",
          "[POLICY] commitment language detected: 'no matter what'",
        ],
        reasoning: "Model over-committed to an unconfirmed roadmap item; guardrail correctly flagged it.",
      },
      decisionAction: "REJECT" as const,
      evalTag: "BAD" as const,
    },
    {
      workflowType: "CONTRACT_REVIEW" as const,
      inboundText: "Quick one — does our standard NDA template need any updates for a new EU vendor?",
      contextNotes: null,
      status: "EDITED" as const,
      draft: {
        draftText: "Your standard NDA should be fine as-is for an EU vendor.",
        confidenceScore: 0.68,
        riskFlags: [],
        reasoning: "Low-risk contract question; draft answer was directionally right but understated GDPR nuance.",
      },
      decisionAction: "EDIT_APPROVE" as const,
      editedText:
        "Your standard NDA template is close, but we should add a GDPR-compliant data processing clause since this vendor is in the EU before sending it over.",
      evalTag: "NEEDS_EDIT" as const,
    },
    {
      workflowType: "SALES_EMAIL" as const,
      inboundText:
        "We'd like to buy 500 seats but we need a custom SLA with 99.99% uptime guarantees and unlimited liability on your end for outages. Can you draft something?",
      contextNotes: "Enterprise prospect, high deal value — flagged as sensitive by account exec.",
      status: "ESCALATED" as const,
      draft: {
        draftText:
          "Thanks for the detailed requirements. Custom SLA terms like this need review from our legal and infrastructure teams before we can commit to specific numbers — I'll make sure this gets prioritized.",
        confidenceScore: 0.29,
        riskFlags: [
          "[POLICY] flagged term: 'unlimited liability'",
          "custom SLA — requires legal + infra review",
        ],
        reasoning:
          "Request combines a large deal size with an uncapped liability ask — well outside normal drafting authority, escalated to a human for senior review rather than drafted further.",
      },
      decisionAction: "ESCALATE" as const,
      evalTag: "GOOD" as const,
    },
  ]

  for (const seed of taskSeeds) {
    const task = await prisma.task.create({
      data: {
        userId: user.id,
        workflowType: seed.workflowType,
        inboundText: seed.inboundText,
        contextNotes: seed.contextNotes,
        status: seed.status,
      },
    })

    await prisma.aiDraft.create({
      data: {
        taskId: task.id,
        draftText: seed.draft.draftText,
        confidenceScore: seed.draft.confidenceScore,
        riskFlags: seed.draft.riskFlags,
        reasoning: seed.draft.reasoning,
        rawJson: seed.draft,
      },
    })

    if ("decisionAction" in seed && seed.decisionAction) {
      await prisma.decision.create({
        data: {
          taskId: task.id,
          action: seed.decisionAction,
          editedText: "editedText" in seed ? seed.editedText : null,
          actorUserId: user.id,
        },
      })
    }

    if ("evalTag" in seed && seed.evalTag) {
      await prisma.evalTag.create({
        data: {
          taskId: task.id,
          tag: seed.evalTag,
        },
      })
    }
  }

  console.log("\nSeed complete.")
  console.log("Test login:")
  console.log(`  email:    ${TEST_EMAIL}`)
  console.log(`  password: ${TEST_PASSWORD}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
