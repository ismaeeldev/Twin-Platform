"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { saveEvalTag } from "@/app/(app)/tasks/[id]/decision-actions"

const TAG_OPTIONS = [
  { value: "GOOD", label: "Good" },
  { value: "NEEDS_EDIT", label: "Needs Edit" },
  { value: "BAD", label: "Bad" },
] as const

/**
 * ApplicationFlow.md 7.6 — post-decision quality tag prompt, shown
 * immediately after any decision action, feeds the Eval Dashboard (Step 10).
 *
 * The underlying decision (Approve/Reject/etc.) has ALREADY been recorded
 * by the time this dialog renders — tagging is a nice-to-have, not a
 * blocker. If the user dismisses this dialog (Escape, backdrop click, the
 * close button) without picking a tag, the page must still refresh to show
 * the decision took effect; otherwise the page is stuck showing a stale
 * ActionBar with no visible confirmation anything happened.
 * handleOpenChange is wired to Dialog's onOpenChange so EVERY way of
 * closing it (picking a tag, or dismissing it) triggers that refresh.
 */
function QualityTagDialog({ taskId, open }: { taskId: string; open: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(open)
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(nextOpen: boolean) {
    setDialogOpen(nextOpen)
    if (!nextOpen) {
      router.refresh()
    }
  }

  function handleTag(tag: (typeof TAG_OPTIONS)[number]["value"]) {
    setError(null)
    startTransition(async () => {
      try {
        const result = await saveEvalTag({ taskId, tag })
        if (!result.success) {
          setError(result.error)
          toast.error(result.error)
          return
        }
        toast.success("Quality tag saved.")
        handleOpenChange(false)
      } catch {
        const message = "Something went wrong — please try again."
        setError(message)
        toast.error(message)
      }
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogTitle>How was this draft?</DialogTitle>
        <DialogDescription>
          Your feedback helps track AI draft quality over time on the Eval Dashboard.
        </DialogDescription>
        <div className="mt-6 flex gap-3">
          {TAG_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="secondary"
              disabled={isPending}
              onClick={() => handleTag(option.value)}
              className="flex-1"
            >
              {option.label}
            </Button>
          ))}
        </div>
        {error && <p className="mt-3 text-meta text-status-rejected">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}

export { QualityTagDialog }
