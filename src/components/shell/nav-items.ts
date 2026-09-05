import { LayoutDashboard, ListChecks, ScrollText, BarChart3, Settings } from "lucide-react"

/**
 * Single source of truth for nav items — used by both the desktop sidebar
 * and the mobile bottom tab bar so they never drift out of sync.
 * Per docs/ApplicationFlow.md Section 0 (Global Shell).
 */
export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/observation", label: "Observation", icon: ScrollText },
  { href: "/eval", label: "Eval", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const
