"use client"

import { MessageSquareText, Mail, FileSearch } from "lucide-react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export const WORKFLOW_TYPES = [
  { value: "SUPPORT_REPLY", label: "Support Reply", description: "Customer support tickets", icon: MessageSquareText },
  { value: "SALES_EMAIL", label: "Sales Email", description: "Inbound sales inquiries", icon: Mail },
  { value: "CONTRACT_REVIEW", label: "Contract Review", description: "Flag risky clauses", icon: FileSearch },
] as const

/**
 * ApplicationFlow.md Section 5.1 — "styled radio cards, not a plain
 * dropdown" per Step 6.1's Master Prompt.
 */
function WorkflowTypeSelector({
  value,
  onValueChange,
}: {
  value: string | undefined
  onValueChange: (value: string) => void
}) {
  return (
    <RadioGroup
      value={value}
      onValueChange={(v) => onValueChange(v as string)}
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      {WORKFLOW_TYPES.map((type) => {
        const Icon = type.icon
        const isSelected = value === type.value

        return (
          <Label
            key={type.value}
            htmlFor={type.value}
            className={cn(
              "elevation-card flex cursor-pointer flex-col gap-2 rounded-lg bg-bg-surface p-4 transition-colors duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-bg-surface",
              isSelected ? "border-accent-primary" : "hover:border-border-strong"
            )}
          >
            <div className="flex items-center justify-between">
              <Icon
                className={cn("size-5", isSelected ? "text-accent-primary" : "text-text-tertiary")}
                strokeWidth={1.75}
              />
              <RadioGroupItem value={type.value} id={type.value} />
            </div>
            <span className="text-body font-medium text-text-primary">{type.label}</span>
            <span className="text-meta text-text-tertiary">{type.description}</span>
          </Label>
        )
      })}
    </RadioGroup>
  )
}

export { WorkflowTypeSelector }
