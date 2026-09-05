"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { WifiOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { WorkflowTypeSelector } from "@/components/tasks/WorkflowTypeSelector"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { createTask } from "@/app/(app)/tasks/new/actions"

const formSchema = z.object({
  workflowType: z.enum(["SUPPORT_REPLY", "SALES_EMAIL", "CONTRACT_REVIEW"], {
    message: "Select a workflow type.",
  }),
  inboundText: z.string().min(20, "Paste at least 20 characters of the inbound message."),
  contextNotes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

function TaskCreateForm() {
  const router = useRouter()
  const isOnline = useOnlineStatus()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { inboundText: "", contextNotes: "" },
  })

  async function onSubmit(values: FormValues) {
    setSubmitError(null)

    try {
      const result = await createTask(values)
      if (!result.success) {
        setSubmitError(result.error)
        toast.error(result.error)
        return
      }
      toast.success("Task created — the AI is drafting a response.")
      router.push(`/tasks/${result.taskId}`)
    } catch {
      const message = isOnline
        ? "Something went wrong — please try again."
        : "You're offline — reconnect to submit."
      setSubmitError(message)
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-md bg-status-rejected-bg px-4 py-3 text-meta text-status-rejected">
          <WifiOff className="size-4 shrink-0" strokeWidth={1.75} />
          You&apos;re offline — reconnect to submit.
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>Workflow type</Label>
        <Controller
          name="workflowType"
          control={control}
          render={({ field }) => (
            <WorkflowTypeSelector value={field.value} onValueChange={field.onChange} />
          )}
        />
        {errors.workflowType && (
          <p className="text-meta text-status-rejected">{errors.workflowType.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="inboundText">Inbound message</Label>
        <Textarea
          id="inboundText"
          placeholder="Paste the customer email, support ticket, or contract text..."
          className="min-h-40"
          {...register("inboundText")}
        />
        {errors.inboundText && (
          <p className="text-meta text-status-rejected">{errors.inboundText.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contextNotes">Context notes (optional)</Label>
        <Textarea
          id="contextNotes"
          placeholder="Anything else the AI should know — customer history, deal size, etc."
          {...register("contextNotes")}
        />
      </div>

      {submitError && <p className="text-meta text-status-rejected">{submitError}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting || !isOnline} className="self-start">
        {isSubmitting ? "Creating task..." : "Create task"}
      </Button>
    </form>
  )
}

export { TaskCreateForm }
