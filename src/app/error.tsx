"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Root error.tsx — a required file for `error.js` conventions; must be a
 * Client Component. Without this (or a per-segment one), any unhandled
 * exception during a Server Component render — a Neon connection drop
 * mid-query, for example, which this project has hit repeatedly — would
 * otherwise crash the whole page to Next.js's raw, unbranded default error
 * screen instead of a recoverable, on-brand retry state.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-base px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-status-rejected-bg text-status-rejected">
        <AlertTriangle className="size-5" strokeWidth={1.75} />
      </span>
      <h1 className="text-h2 text-text-primary">Something went wrong</h1>
      <p className="max-w-sm text-body text-text-secondary">
        This might be a temporary connection issue. Try again in a moment.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  )
}
