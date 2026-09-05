"use client"

import { cn } from "@/lib/utils"

type StrengthLevel = 0 | 1 | 2 | 3 | 4

/**
 * Simple, deterministic strength heuristic — length + character-class
 * variety. Not a security control (that's bcrypt + the 8-char minimum
 * enforced server-side in signup/actions.ts) — purely a UX signal to help
 * users pick something reasonable, same spirit as most sign-up forms.
 */
function scorePassword(password: string): StrengthLevel {
  if (password.length === 0) return 0
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4) as StrengthLevel
}

const LEVEL_CONFIG: Record<StrengthLevel, { label: string; colorClass: string }> = {
  0: { label: "", colorClass: "bg-border-subtle" },
  1: { label: "Weak", colorClass: "bg-status-rejected" },
  2: { label: "Fair", colorClass: "bg-status-escalated" },
  3: { label: "Good", colorClass: "bg-status-pending" },
  4: { label: "Strong", colorClass: "bg-status-approved" },
}

function PasswordStrength({ password }: { password: string }) {
  const score = scorePassword(password)
  const config = LEVEL_CONFIG[score]

  if (password.length === 0) return null

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {([1, 2, 3, 4] as const).map((step) => (
          <span
            key={step}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-200",
              step <= score ? config.colorClass : "bg-border-subtle"
            )}
          />
        ))}
      </div>
      <span className="w-10 shrink-0 text-micro text-text-tertiary">{config.label}</span>
    </div>
  )
}

export { PasswordStrength }
