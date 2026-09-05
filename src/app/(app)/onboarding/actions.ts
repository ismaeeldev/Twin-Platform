"use server"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"

/**
 * Marks the current user as onboarded. Called when they click through the
 * onboarding welcome step (docs/ApplicationFlow.md Section 3).
 */
export async function completeOnboarding() {
  const user = await requireUser()

  await prisma.user.update({
    where: { id: user.id },
    data: { hasOnboarded: true },
  })
}
