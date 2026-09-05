"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { WifiOff } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useOnlineStatus } from "@/hooks/useOnlineStatus"
import { updateProfile } from "@/app/(app)/settings/actions"

function ProfileForm({ initialName, initialEmail }: { initialName: string; initialEmail: string }) {
  const router = useRouter()
  const isOnline = useOnlineStatus()
  const [name, setName] = useState(initialName)
  const [email, setEmail] = useState(initialEmail)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const result = await updateProfile({ name, email })
        if (!result.success) {
          setError(result.error)
          toast.error(result.error)
          return
        }
        // updateProfile trims/lowercases server-side (Zod), so the saved
        // value can differ from exactly what was typed — re-sync local
        // state to the canonical values rather than leaving the raw input
        // displayed, which would silently disagree with what's in the DB.
        setName(result.name)
        setEmail(result.email)
        toast.success("Profile updated.")
        router.refresh()
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
          You&apos;re offline — reconnect to save changes.
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-name">Name</Label>
        <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      {error && <p className="text-meta text-status-rejected">{error}</p>}
      <Button type="submit" disabled={isPending || !isOnline} className="w-fit">
        {isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  )
}

export { ProfileForm }
