"use client"

import { useState, useTransition } from "react"
import { motion } from "framer-motion"
import { Check, X, Edit3, Flag, WifiOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { QualityTagDialog } from "@/components/tasks/QualityTagDialog"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { makeDecision } from "@/app/(app)/tasks/[id]/decision-actions"

type DecisionAction = "APPROVE" | "REJECT" | "EDIT_APPROVE" | "ESCALATE"

const DECISION_SUCCESS_MESSAGE: Record<DecisionAction, string> = {
  APPROVE: "Task approved.",
  REJECT: "Task rejected.",
  EDIT_APPROVE: "Edited draft approved.",
  ESCALATE: "Task escalated for senior review.",
}

/**
 * ApplicationFlow.md 7.4/7.5 — Approve/Edit&Approve/Reject/Escalate action
 * bar. ThemeGuideline Section 5.1 — each action gets a distinct motion
 * signature, not a generic fade. Optimistic UI: buttons disable immediately
 * on click; the Server Action's own atomic compare-and-swap (Step 6.2) is
 * the real double-submit guard.
 */
function ActionBar({ taskId, draftText }: { taskId: string; draftText: string }) {
  const isOnline = useOnlineStatus()
  const [isPending, startTransition] = useTransition()
  const [activeAction, setActiveAction] = useState<DecisionAction | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedText, setEditedText] = useState(draftText)
  const [error, setError] = useState<string | null>(null)
  const [showTagPrompt, setShowTagPrompt] = useState(false)
  // Tracks whether a decision has ALREADY succeeded on this render of the
  // bar. Without this, the four action buttons stayed fully enabled after a
  // successful decision (only gated by `isPending`, which resolves back to
  // false as soon as the request completes) — a user could click a second
  // action (e.g. Reject right after Approve) while the QualityTagDialog was
  // still open or before it appeared. The server's atomic compare-and-swap
  // correctly rejects that second call, but the user would see a confusing
  // error toast contradicting the success toast they just got, plus the
  // shake/bounce animation replaying for an action that didn't actually
  // happen. Once a decision succeeds, every button here is permanently
  // disabled for the rest of this component's lifetime.
  const [decided, setDecided] = useState(false)

  function submitDecision(action: DecisionAction, text?: string) {
    setActiveAction(action)
    setError(null)

    startTransition(async () => {
      try {
        const result = await makeDecision({ taskId, action, editedText: text })
        if (!result.success) {
          setError(result.error)
          toast.error(result.error)
          setActiveAction(null)
          return
        }
        toast.success(DECISION_SUCCESS_MESSAGE[action])
        setDecided(true)
        // Do NOT router.refresh() here. This ActionBar is only rendered by
        // tasks/[id]/page.tsx while task.status === "PENDING_APPROVAL".
        // Refreshing at this point re-runs that Server Component with the
        // now-decided status, which unmounts this ActionBar — and with it
        // the QualityTagDialog it owns. Verified with Playwright against a
        // production build: the "How was this draft?" prompt appeared and
        // then vanished on its own ~2s later, before a real user could
        // read it, let alone answer. The eval quality tag was therefore
        // effectively impossible to submit through normal use, silently
        // starving the Eval Dashboard of its tag-distribution data.
        //
        // The decision is already recorded server-side, and the success
        // toast confirms it, so nothing is lost by deferring: QualityTagDialog
        // calls router.refresh() itself on EVERY close path (tag picked,
        // Escape, backdrop click, close button) via its handleOpenChange,
        // so the status badge and History timeline still update as soon as
        // the user is done with the prompt.
        setShowTagPrompt(true)
      } catch {
        const message = "Something went wrong — please try again."
        setError(message)
        toast.error(message)
        setActiveAction(null)
      }
    })
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-3">
        {!isOnline && <OfflineBanner />}
        <Textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="min-h-32"
        />
        <div className="flex gap-3">
          <Button
            onClick={() => submitDecision("EDIT_APPROVE", editedText)}
            disabled={isPending || !isOnline || decided}
          >
            Confirm &amp; Approve
          </Button>
          <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isPending || decided}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {!isOnline && <OfflineBanner />}
      <div className="flex flex-wrap gap-3">
        <motion.div
          animate={activeAction === "APPROVE" ? { y: [-0, -6, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Button onClick={() => submitDecision("APPROVE")} disabled={isPending || !isOnline || decided}>
            <Check className="size-4" strokeWidth={1.75} />
            Approve
          </Button>
        </motion.div>

        <Button
          variant="secondary"
          onClick={() => setIsEditing(true)}
          disabled={isPending || !isOnline || decided}
        >
          <Edit3 className="size-4" strokeWidth={1.75} />
          Edit &amp; Approve
        </Button>

        <motion.div animate={activeAction === "ESCALATE" ? { rotate: [0, -3, 0] } : {}} transition={{ duration: 0.4 }}>
          <Button
            variant="secondary"
            className="border-status-escalated text-status-escalated hover:bg-status-escalated-bg"
            onClick={() => submitDecision("ESCALATE")}
            disabled={isPending || !isOnline || decided}
          >
            <Flag className="size-4" strokeWidth={1.75} />
            Escalate
          </Button>
        </motion.div>

        <motion.div
          animate={activeAction === "REJECT" ? { x: [0, -4, 4, -4, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="destructive"
            onClick={() => submitDecision("REJECT")}
            disabled={isPending || !isOnline || decided}
          >
            <X className="size-4" strokeWidth={1.75} />
            Reject
          </Button>
        </motion.div>
      </div>

      {error && <p className="text-meta text-status-rejected">{error}</p>}

      {showTagPrompt && (
        <QualityTagDialog
          taskId={taskId}
          open={showTagPrompt}
        />
      )}
    </div>
  )
}

function OfflineBanner() {
  return (
    <div className="flex items-center gap-2 rounded-md bg-status-rejected-bg px-4 py-3 text-meta text-status-rejected">
      <WifiOff className="size-4 shrink-0" strokeWidth={1.75} />
      You&apos;re offline — reconnect to approve, reject, or escalate this task.
    </div>
  )
}

export { ActionBar }
