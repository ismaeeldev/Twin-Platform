"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

import { NAV_ITEMS } from "@/components/shell/nav-items"
import { cn } from "@/lib/utils"

/**
 * Mobile bottom tab bar (<768px). Same nav items as the sidebar,
 * per docs/ThemeGuideline.md Section 4.5 and Section 7 (responsiveness).
 */
function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border-subtle bg-bg-surface md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-micro normal-case tracking-normal outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-inset",
              isActive ? "text-accent-primary" : "text-text-tertiary"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="mobile-active-indicator"
                className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-accent-primary"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <Icon className="size-5" strokeWidth={1.75} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export { MobileTabBar }
