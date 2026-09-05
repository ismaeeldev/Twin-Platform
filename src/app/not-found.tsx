import Link from "next/link"
import { FileQuestion } from "lucide-react"

import { buttonVariants } from "@/components/ui/button-variants"

/**
 * Root not-found.tsx — without this, Next.js falls back to its own generic
 * unbranded 404 page for every unmatched route AND every explicit
 * `notFound()` call (e.g. tasks/[id]/page.tsx's cross-user-access guard).
 * A production app should never show a stock framework error page.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-base px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-accent-soft-bg text-accent-primary">
        <FileQuestion className="size-5" strokeWidth={1.75} />
      </span>
      <h1 className="text-h2 text-text-primary">Page not found</h1>
      <p className="max-w-sm text-body text-text-secondary">
        The page you&apos;re looking for doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Link href="/dashboard" className={buttonVariants({ variant: "default" })}>
        Back to Dashboard
      </Link>
    </main>
  )
}
