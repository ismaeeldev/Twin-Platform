"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SkeletonShimmer } from "@/components/shared/SkeletonShimmer"
import { generateDraftForTask } from "@/app/(app)/tasks/[id]/actions"

type DraftingState = "drafting" | "slow" | "error" | "done"

/**
 * Client-side driver for AI drafting on /tasks/[id] (Step 7.1). Triggers
 * generateDraftForTask() on mount — the user is already looking at this
 * page's skeleton by the time drafting starts, per ApplicationFlow.md 5.3's
 * "redirect first" sequencing. ThemeGuideline Section 10.4: escalates to a
 * "still working" message past ~4s (debounced so it never flashes on a
 * fast response). Section 10.6: shows a retry-capable error state on
 * final failure instead of a stuck skeleton.
 */
function DraftingStatus({ taskId }: { taskId: string }) {
  const router = useRouter()
  const [state, setState] = useState<DraftingState>("drafting")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  async function runDrafting() {
    setState("drafting")
    setErrorMessage(null)

    slowTimerRef.current = setTimeout(() => {
      setState((current) => (current === "drafting" ? "slow" : current))
    }, 4000)

    try {
      const result = await generateDraftForTask(taskId)

      if (slowTimerRef.current) clearTimeout(slowTimerRef.current)

      if (!result.success) {
        setState("error")
        setErrorMessage(result.error)
        return
      }

      setState("done")
      router.refresh()
    } catch {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current)
      setState("error")
      setErrorMessage("Something went wrong — please try again.")
    }
  }

  useEffect(() => {
    runDrafting()
    return () => {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  if (state === "error") {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-lg bg-status-rejected-bg p-6 text-center"
      >
        <p className="text-body text-status-rejected">{errorMessage ?? "AI drafting failed."}</p>
        <Button variant="destructive-outline" onClick={runDrafting}>
          <RefreshCw className="size-4" strokeWidth={1.75} />
          Retry
        </Button>
      </div>
    )
  }

  return (
    /*
      aria-busy + a polite live region: AI drafting is the longest wait in the
      product (seconds, occasionally longer), and visually it's communicated
      entirely by shimmer skeletons — which are decorative and announce
      nothing. A screen-reader user previously landed on this page and got no
      indication anything was in progress at all. The status text below is
      visually hidden while drafting (the skeletons already carry that message
      for sighted users) and becomes visible when it escalates to "slow",
      which is exactly the existing behaviour.
    */
    <div className="flex flex-col gap-4" aria-busy="true">
      <p role="status" aria-live="polite" className={state === "slow" ? "text-meta text-text-tertiary" : "sr-only"}>
        {state === "slow"
          ? "Still working — this can take a few seconds for complex requests."
          : "Generating AI draft…"}
      </p>
      <SkeletonShimmer className="h-8 w-1/3" />
      <SkeletonShimmer className="h-40 w-full" />
      <SkeletonShimmer className="h-24 w-full" />
    </div>
  )
}

export { DraftingStatus }
