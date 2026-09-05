"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * ThemeGuideline.md Section 4.4 — "Small/Meta scale, --text-secondary,
 * 8px margin-bottom" (not the shadcn CLI default's generic `text-sm` with
 * no explicit color, which happened to be close in size but never matched
 * the spec's weight/line-height/color exactly). The "8px margin-bottom" is
 * already satisfied by every consuming form's own `gap-2` flex container
 * around Label+Input — adding a margin here too would double that spacing,
 * so intentionally NOT added on the component itself.
 */
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-meta text-text-secondary select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
