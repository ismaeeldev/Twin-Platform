"use client"

import { usePathname } from "next/navigation"

import { NAV_ITEMS } from "@/components/shell/nav-items"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

function pageTitleFor(pathname: string) {
  const match = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )
  return match?.label ?? "Twin Platform"
}

/**
 * The account-menu placeholder (a plain circle icon with no real action)
 * was removed per explicit feedback — the sidebar footer's Log out button
 * is the real account action, and duplicating an inert avatar here added
 * visual clutter without functionality.
 */
function TopBar() {
  const pathname = usePathname()

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-subtle bg-bg-surface px-4 md:px-6">
      <h1 className="text-h3 text-text-primary">{pageTitleFor(pathname)}</h1>
      <ThemeToggle />
    </header>
  )
}

export { TopBar }
