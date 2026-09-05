"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

/**
 * ThemeGuideline.md Section 4.6 — bg-surface-2, radius-xl, backdrop blur,
 * spring-ish entrance (scale 0.96->1 + opacity + slight y-translate,
 * 250-350ms). Base UI drives its own open/close mount timing via
 * data-[starting-style]/data-[ending-style] attributes, so the transition
 * is expressed in CSS rather than wrapped in AnimatePresence (Base UI's
 * Popup/Backdrop render/children API doesn't expose an open boolean the
 * way a simpler primitive would — using its own transition attributes is
 * the documented, supported path here).
 */
function DialogContent({ className, children, ...props }: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-[var(--overlay-backdrop)] backdrop-blur-sm transition-opacity duration-250 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
      <DialogPrimitive.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border-subtle bg-bg-surface-2 p-6 transition-all duration-300",
          "data-[starting-style]:scale-96 data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0",
          "data-[ending-style]:scale-96 data-[ending-style]:translate-y-2 data-[ending-style]:opacity-0",
          className
        )}
        {...props}
      >
        {children}
        <DialogClose className="absolute right-4 top-4 text-text-tertiary hover:text-text-primary">
          <X className="size-4" strokeWidth={1.75} />
        </DialogClose>
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return <DialogPrimitive.Title className={cn("text-h3 text-text-primary", className)} {...props} />
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return <DialogPrimitive.Description className={cn("mt-2 text-body text-text-secondary", className)} {...props} />
}

export { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose }
