"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { WORKFLOW_TYPE_LABELS } from "@/lib/workflow-types"
import { cn } from "@/lib/utils"

const WORKFLOW_TYPE_OPTIONS = Object.entries(WORKFLOW_TYPE_LABELS).map(([value, label]) => ({ value, label }))

const DECISION_TYPE_OPTIONS = [
  { value: "APPROVE", label: "Approved" },
  { value: "REJECT", label: "Rejected" },
  { value: "EDIT_APPROVE", label: "Edited & Approved" },
  { value: "ESCALATE", label: "Escalated" },
]

function ObservationFilters({
  currentWorkflowType,
  currentDecisionType,
  currentFrom,
  currentTo,
}: {
  currentWorkflowType?: string
  currentDecisionType?: string
  currentFrom?: string
  currentTo?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // See TaskListFilters.tsx for why this is wrapped in startTransition: it
  // keeps the current feed + these filter controls visibly mounted while
  // the new filtered data streams in, instead of Next.js suspending this
  // route segment to its loading.tsx fallback on every filter change.
  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3 transition-opacity duration-150", isPending && "opacity-60")}>
      <div className="w-48">
        <Select
          value={currentWorkflowType ?? "ALL"}
          onValueChange={(value) => updateParam("workflowType", value === "ALL" ? undefined : String(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="All workflow types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All workflow types</SelectItem>
            {WORKFLOW_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-48">
        <Select
          value={currentDecisionType ?? "ALL"}
          onValueChange={(value) => updateParam("decisionType", value === "ALL" ? undefined : String(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="All decision types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All decision types</SelectItem>
            {DECISION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-micro text-text-tertiary">
          From
          <input
            type="date"
            value={currentFrom ?? ""}
            onChange={(e) => updateParam("from", e.target.value || undefined)}
            className="h-11 min-w-0 rounded-md border border-border-subtle bg-bg-surface-2 px-3 text-body text-text-primary outline-none focus-visible:border-accent-primary"
          />
        </label>
        <label className="flex items-center gap-1.5 text-micro text-text-tertiary">
          To
          <input
            type="date"
            value={currentTo ?? ""}
            onChange={(e) => updateParam("to", e.target.value || undefined)}
            className="h-11 min-w-0 rounded-md border border-border-subtle bg-bg-surface-2 px-3 text-body text-text-primary outline-none focus-visible:border-accent-primary"
          />
        </label>
      </div>
    </div>
  )
}

export { ObservationFilters }
