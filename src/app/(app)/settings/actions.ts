"use server"

import { z } from "zod"
import bcrypt from "bcryptjs"
import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/auth"

const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty.").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
})

export type ActionResult = { success: true } | { success: false; error: string }

export type UpdateProfileResult =
  | { success: true; name: string; email: string }
  | { success: false; error: string }

export async function updateProfile(input: unknown): Promise<UpdateProfileResult> {
  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }

  let user
  try {
    user = await requireUser()
  } catch {
    return { success: false, error: "You must be signed in to update your profile." }
  }

  const { name, email } = parsed.data

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.id !== user.id) {
      return { success: false, error: "That email is already in use." }
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data: { name, email } })
    return { success: true, name: updated.name ?? "", email: updated.email }
  } catch (error) {
    // The findUnique check above isn't atomic with this update — two
    // concurrent profile updates to the same new email can both pass it.
    // The DB's unique constraint on User.email is the real guard; surface
    // its P2002 as the same friendly message instead of a generic failure.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { success: false, error: "That email is already in use." }
    }
    return { success: false, error: "Something went wrong — please try again." }
  }
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  })

export async function changePassword(input: unknown): Promise<ActionResult> {
  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }

  let user
  try {
    user = await requireUser()
  } catch {
    return { success: false, error: "You must be signed in to change your password." }
  }

  const { currentPassword, newPassword } = parsed.data

  try {
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValid) {
      return { success: false, error: "Current password is incorrect." }
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
    return { success: true }
  } catch {
    return { success: false, error: "Something went wrong — please try again." }
  }
}
