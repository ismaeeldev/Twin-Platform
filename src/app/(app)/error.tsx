"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Segment-level error boundary for every route under (app). Without this,
 * a Server Component data-fetch failure on any authenticated page (a Neon
 * connection drop mid-query — this project's most common real failure
 * mode) would fall through to the root error.tsx, losing the Sidebar/TopBar
 * shell entirely. This keeps the shell intact and shows a local, on-brand
 * retry state instead, per ThemeGuideline.md Section 10.6.
 */
export default function AppSegmentError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-status-rejected-bg text-status-rejected">
        <AlertTriangle className="size-5" strokeWidth={1.75} />
      </span>
      <h2 className="text-h2 text-text-primary">Couldn&apos;t load this page</h2>
      <p className="max-w-sm text-body text-text-secondary">
        This is usually a temporary connection issue. Try again in a moment.
      </p>
      <Button onClick={reset}>
        <RefreshCw className="size-4" strokeWidth={1.75} />
        Retry
      </Button>
    </div>
  )
}
