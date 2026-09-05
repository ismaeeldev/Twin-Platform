"use client"

import { Toaster as SonnerToaster } from "sonner"
import { useTheme } from "next-themes"

/**
 * Global toast provider — every create/update/delete/error across the app
 * surfaces here (signup, login, task creation, decisions, profile/password
 * changes, eval tagging, etc.) so the user always gets clear, consistent
 * feedback instead of silently succeeding or failing. Styled to match the
 * project's real theme tokens (dark-first, ThemeGuideline.md Section 1),
 * not sonner's own default palette, and follows the active dark/light theme.
 */
function Toaster() {
  const { resolvedTheme } = useTheme()

  return (
    <SonnerToaster
      theme={resolvedTheme === "light" ? "light" : "dark"}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        style: {
          background: "var(--bg-surface-2)",
          border: "1px solid var(--border-subtle)",
          color: "var(--text-primary)",
        },
      }}
    />
  )
}

export { Toaster }
