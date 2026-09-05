import { redirect } from "next/navigation"

import { requireUser } from "@/lib/auth"
import { OnboardingClient } from "@/app/(app)/onboarding/OnboardingClient"

/**
 * ApplicationFlow.md Section 3 — shown once, on first login only.
 * A returning (already-onboarded) user hitting this URL directly is
 * redirected straight to the dashboard rather than seeing it again.
 */
export default async function OnboardingPage() {
  const user = await requireUser()

  if (user.hasOnboarded) {
    redirect("/dashboard")
  }

  return <OnboardingClient />
}
