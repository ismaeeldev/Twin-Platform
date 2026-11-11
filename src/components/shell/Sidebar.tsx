"use client"

import type { Plan } from "@prisma/client"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { signOut } from "next-auth/react"
import { toast } from "sonner"
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react"

import { NAV_ITEMS } from "@/components/shell/nav-items"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { PlanBadge } from "@/components/shared/PlanBadge"
import { Logo } from "@/components/shared/Logo"
import { cn } from "@/lib/utils"

/**
 * Desktop left sidebar (>=768px). ThemeGuideline.md Section 4.5 —
 * collapsible to an icon-rail, active item gets an accent-soft-bg pill with
 * a Framer Motion layoutId indicator that slides between items.
 * Logo: the client-supplied Twin brand logo via the shared <Logo /> component
 * (full wordmark when expanded, circles-only mark when collapsed). Footer:
 * pinned logout action (mt-auto), replacing the plain TopBar avatar
 * placeholder that carried no real action.
 */
function Sidebar({ plan }: { plan: Plan }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    try {
      await signOut({ redirect: false })
      toast.success("Signed out.")
      router.push("/login")
      router.refresh()
    } catch {
      toast.error("Something went wrong — please try again.")
      setSigningOut(false)
    }
  }

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "hidden md:flex md:flex-col md:border-r md:border-border-subtle md:bg-bg-surface md:p-4 md:transition-[width] md:duration-200",
        collapsed ? "md:w-[72px]" : "md:w-60"
      )}
    >
      <div className={cn("mb-8 flex items-center gap-2", collapsed ? "flex-col" : "justify-between")}>
        <Link href="/dashboard" className="flex items-center gap-2.5 outline-none" aria-label="Twin — Dashboard">
          {collapsed ? (
            <Logo variant="mark" height={22} className="mx-auto" />
          ) : (
            <Logo variant="full" height={30} />
          )}
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-text-tertiary outline-none transition-colors duration-150 hover:bg-bg-surface-2 hover:text-text-primary focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" strokeWidth={1.75} />
          ) : (
            <PanelLeftClose className="size-4" strokeWidth={1.75} />
          )}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          const link = (
            <Link
              key={item.href}
              href={item.href}
              aria-label={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-body text-text-secondary outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface",
                collapsed && "justify-center px-0",
                isActive ? "text-accent-primary" : "hover:bg-bg-surface-2 hover:text-text-primary"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-md bg-accent-soft-bg"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <Icon className="relative z-10 size-5 shrink-0" strokeWidth={1.75} />
              {!collapsed && <span className="relative z-10">{item.label}</span>}
            </Link>
          )

          if (!collapsed) return link

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger render={link} />
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </div>

      <div className="mt-auto border-t border-border-subtle pt-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="mb-2 flex justify-center">
                  <PlanBadge plan={plan} compact />
                </div>
              }
            />
            <TooltipContent side="right">Current plan</TooltipContent>
          </Tooltip>
        ) : (
          <div className="mb-2 px-3">
            <PlanBadge plan={plan} />
          </div>
        )}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  aria-label="Log out"
                  className="flex w-full items-center justify-center rounded-md px-3 py-2.5 text-status-rejected outline-none transition-colors duration-150 hover:bg-status-rejected-bg focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface disabled:opacity-50"
                >
                  <LogOut className="size-5" strokeWidth={1.75} />
                </button>
              }
            />
            <TooltipContent side="right">Log out</TooltipContent>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-body text-status-rejected outline-none transition-colors duration-150 hover:bg-status-rejected-bg focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface disabled:opacity-50"
          >
            <LogOut className="size-5 shrink-0" strokeWidth={1.75} />
            {signingOut ? "Signing out..." : "Log out"}
          </button>
        )}
      </div>
    </nav>
  )
}

export { Sidebar }
