"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { OnboardingIllustration } from "@/components/marketing/OnboardingIllustration"
import { completeOnboarding } from "@/app/(app)/onboarding/actions"

function OnboardingClient() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleContinue() {
    startTransition(async () => {
      try {
        await completeOnboarding()
      } catch (error) {
        // Even if marking onboarded fails, still get the user into the
        // product per ApplicationFlow.md 3.2 — the deep-link into task
        // creation matters more than the flag; they'll just see onboarding
        // again next login, which is a minor inconvenience, not a dead end.
        // But a silent failure with zero trace is a real debugging gap
        // (this can genuinely happen — see this project's repeated Neon
        // cold-start/connection issues) so at least log it.
        console.error("completeOnboarding failed, continuing anyway:", error)
      }
      router.push("/tasks/new")
      router.refresh()
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg-base px-6 text-center">
      <OnboardingIllustration />

      <h1 className="mt-8 max-w-md text-h1 text-text-primary">
        Your AI drafts. You decide.
      </h1>

      <p className="mt-4 max-w-lg text-body-lg text-text-secondary">
        Every task you submit gets a structured AI draft — a response, a confidence score,
        and any risk flags. Nothing is ever sent, saved, or acted on until you approve it.
        This is Observation + Approval mode: the AI recommends, you decide.
      </p>

      <Button size="lg" className="mt-10" onClick={handleContinue} disabled={isPending}>
        {isPending ? "Setting up..." : "Create your first task"}
      </Button>
    </main>
  )
}

export { OnboardingClient }
