import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * The single source of truth for the Twin brand logo, derived from the
 * client-supplied bild.png. The original artwork is dark-on-transparent, so
 * a lightened twin of each file (`*-light.png`) is used on the default dark
 * theme and the original on the `.light` theme — no badge/sticker needed.
 *
 * `full` = mark + "Twin" wordmark (723×173), `mark` = the two-circle symbol
 * only (273×173), used where horizontal space is tight (collapsed sidebar).
 */
const SOURCES = {
  full: { base: "/logo", width: 723, height: 173 },
  mark: { base: "/logo-mark", width: 273, height: 173 },
} as const

function Logo({
  variant = "full",
  height = 28,
  className,
}: {
  variant?: keyof typeof SOURCES
  height?: number
  className?: string
}) {
  const { base, width, height: h } = SOURCES[variant]
  const style = { height, width: "auto" } as const
  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      {/* Dark theme (default): light artwork. Hidden when `.light` is on <html>. */}
      <Image src={`${base}-light.png`} alt="Twin" width={width} height={h} priority style={style} className="[.light_&]:hidden" />
      {/* Light theme: original dark artwork. */}
      <Image src={`${base}.png`} alt="" aria-hidden width={width} height={h} priority style={style} className="hidden [.light_&]:block" />
    </span>
  )
}

export { Logo }
