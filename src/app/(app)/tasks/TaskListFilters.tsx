"use client"

import { useTransition } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { WORKFLOW_TYPE_LABELS } from "@/lib/workflow-types"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "AI_DRAFTING", label: "AI Drafting" },
  { value: "PENDING_APPROVAL", label: "Pending Approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EDITED", label: "Edited" },
  { value: "ESCALATED", label: "Escalated" },
  { value: "CLOSED", label: "Closed" },
] as const

const WORKFLOW_TYPE_OPTIONS = Object.entries(WORKFLOW_TYPE_LABELS).map(([value, label]) => ({ value, label }))

function TaskListFilters({
  currentStatus,
  currentWorkflowType,
}: {
  currentStatus?: string
  currentWorkflowType?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Wrapping the navigation in startTransition keeps the CURRENT list (and
  // these filter controls) visibly mounted while the new filtered data
  // streams in, instead of Next.js suspending this whole route segment to
  // its loading.tsx fallback — a bare router.push() here would otherwise
  // make the filter dropdowns themselves flicker/unmount on every change,
  // which is exactly the kind of jarring "page fluctuates" feeling to avoid.
  function updateParam(key: "status" | "workflowType", value: string | undefined) {
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
          value={currentStatus ?? "ALL"}
          onValueChange={(value) => updateParam("status", value === "ALL" ? undefined : String(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
    </div>
  )
}

export { TaskListFilters }
