"use client"

import { useState, useTransition } from "react"
import { WifiOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/ui/password-strength"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { changePassword } from "@/app/(app)/settings/actions"

function PasswordForm() {
  const isOnline = useOnlineStatus()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      const message = "New password must be at least 8 characters."
      setError(message)
      toast.error(message)
      return
    }
    if (newPassword !== confirmPassword) {
      const message = "New passwords don't match."
      setError(message)
      toast.error(message)
      return
    }

    startTransition(async () => {
      try {
        const result = await changePassword({ currentPassword, newPassword, confirmPassword })
        if (!result.success) {
          setError(result.error)
          toast.error(result.error)
          return
        }
        toast.success("Password changed.")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } catch {
        const message = "Something went wrong — please try again."
        setError(message)
        toast.error(message)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-md bg-status-rejected-bg px-4 py-3 text-meta text-status-rejected">
          <WifiOff className="size-4 shrink-0" strokeWidth={1.75} />
          You&apos;re offline — reconnect to change your password.
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="current-password">Current password</Label>
        <PasswordInput
          id="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="new-password">New password</Label>
        <PasswordInput
          id="new-password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
        />
        <PasswordStrength password={newPassword} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <PasswordInput
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
        />
      </div>
      {error && <p className="text-meta text-status-rejected">{error}</p>}
      <Button type="submit" disabled={isPending || !isOnline} className="w-fit">
        {isPending ? "Saving..." : "Change password"}
      </Button>
    </form>
  )
}

export { PasswordForm }
