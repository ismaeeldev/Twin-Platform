"use client"

import { Download, Share, SquarePlus } from "lucide-react"

import { useInstallPrompt } from "@/hooks/useInstallPrompt"
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

/**
 * PWA install affordance — PWA standard Section 10: never show a button
 * that can't do anything. Chromium-based browsers get the real
 * `beforeinstallprompt` flow; Safari/iOS (which never fires that event and
 * has no programmatic install API) get manual Share -> Add to Home Screen
 * instructions instead; anywhere else (already installed, or a browser that
 * hasn't signaled support) renders nothing at all.
 */
function InstallAppButton({ variant = "default", size = "sm" }: { variant?: "default" | "secondary" | "ghost"; size?: "sm" | "default" | "lg" }) {
  const { status, promptInstall } = useInstallPrompt()

  if (status === "installed" || status === "unavailable") return null

  if (status === "promptable") {
    return (
      <button
        type="button"
        onClick={promptInstall}
        className={cn(buttonVariants({ variant, size }), "gap-2")}
      >
        <Download className="size-4" strokeWidth={1.75} />
        Install App
      </button>
    )
  }

  // status === "manual-ios"
  return (
    <Dialog>
      <DialogTrigger
        className={cn(buttonVariants({ variant, size }), "gap-2")}
      >
        <Download className="size-4" strokeWidth={1.75} />
        Install App
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Install on iPhone or iPad</DialogTitle>
        <DialogDescription>
          Safari doesn&apos;t support one-tap install, but adding Twin to your Home Screen only takes a few seconds:
        </DialogDescription>
        <ol className="mt-4 flex flex-col gap-3 text-body text-text-secondary">
          <li className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent-soft-bg text-accent-primary">
              <Share className="size-4" strokeWidth={1.75} />
            </span>
            <span className="pt-1">
              Tap the <strong className="text-text-primary">Share</strong> button in Safari&apos;s toolbar.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent-soft-bg text-accent-primary">
              <SquarePlus className="size-4" strokeWidth={1.75} />
            </span>
            <span className="pt-1">
              Scroll down and tap <strong className="text-text-primary">Add to Home Screen</strong>.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent-soft-bg text-accent-primary text-meta font-semibold">
              3
            </span>
            <span className="pt-1">
              Tap <strong className="text-text-primary">Add</strong> to confirm.
            </span>
          </li>
        </ol>
      </DialogContent>
    </Dialog>
  )
}

export { InstallAppButton }
