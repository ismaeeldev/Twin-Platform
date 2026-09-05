"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button-variants"

/**
 * ThemeGuideline.md Section 4.1 — Buttons.
 * default = Primary, secondary = Secondary, ghost = Ghost, destructive = Destructive.
 * 44px min height on default/lg sizes (touch target), 200ms transitions, accent focus ring.
 *
 * Style variants live in button-variants.ts (a server-safe module) so Server
 * Components can style a <Link> as a button via buttonVariants() without
 * pulling in this file's "use client" boundary (needed here for framer-motion).
 */

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      render={<motion.button whileTap={{ scale: 0.98 }} transition={{ duration: 0.1 }} />}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
