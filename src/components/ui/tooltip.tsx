"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

/**
 * Manually built against @base-ui/react/tooltip (the shadcn CLI has been
 * unreliable in this project for other primitives — see Dialog/Select).
 * Same data-[starting-style]/data-[ending-style] transition convention as
 * Dialog. One shared Provider at the root keeps repeated-hover timing
 * consistent (Base UI's own recommended pattern) — see TooltipProvider
 * usage in shell/TopBar.tsx or wherever tooltips are grouped.
 */
const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

function TooltipContent({
  className,
  sideOffset = 8,
  side,
  children,
  ...props
}: TooltipPrimitive.Popup.Props & Pick<TooltipPrimitive.Positioner.Props, "sideOffset" | "side">) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner sideOffset={sideOffset} side={side}>
        <TooltipPrimitive.Popup
          className={cn(
            "z-50 max-w-64 rounded-md border border-border-subtle bg-bg-surface-3 px-3 py-2 text-meta text-text-secondary shadow-lg transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
