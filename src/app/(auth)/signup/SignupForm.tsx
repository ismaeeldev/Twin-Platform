"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { PasswordStrength } from "@/components/ui/password-strength"
import { signup } from "@/app/(auth)/signup/actions"

/**
 * Client-side mirror of signup/actions.ts's Zod schema — real-time
 * validation as the user types/blurs, instead of only finding out a field
 * was wrong after a full round-trip to the server. The server schema
 * remains the actual source of truth/enforcement (never trust client
 * validation alone) — this is purely a faster feedback loop for the user.
 */
const formSchema = z
  .object({
    name: z.string().trim().max(100, "Name is too long.").optional().or(z.literal("")),
    email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password is too long."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })

type FormValues = z.infer<typeof formSchema>

function SignupForm() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  })

  const password = watch("password")

  async function onSubmit(values: FormValues) {
    setSubmitError(null)

    const formData = new FormData()
    formData.set("name", values.name ?? "")
    formData.set("email", values.email)
    formData.set("password", values.password)

    try {
      const result = await signup(formData)
      if (!result.success) {
        // Surface a server-side "email already registered" error on the
        // email field itself, not just a generic banner — the user should
        // see exactly which field is the problem, right where they'd look
        // to fix it.
        if (result.error.toLowerCase().includes("email")) {
          setError("email", { message: result.error })
        } else {
          setSubmitError(result.error)
        }
        toast.error(result.error)
        return
      }
      toast.success("Account created — welcome aboard!")
      // docs/ApplicationFlow.md Section 2.1 — signup redirects to Onboarding.
      router.push("/onboarding")
      router.refresh()
    } catch {
      const message = "Something went wrong — please try again."
      setSubmitError(message)
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name (optional)</Label>
        <Input id="name" autoComplete="name" placeholder="Jane Doe" {...register("name")} />
        {errors.name && <p className="text-meta text-status-rejected">{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && <p className="text-meta text-status-rejected">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        <PasswordStrength password={password ?? ""} />
        {errors.password && <p className="text-meta text-status-rejected">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-meta text-status-rejected">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/*
        role="alert" so a screen reader announces a failed signup attempt —
        see the matching comment in LoginForm.tsx. `empty:hidden` keeps the
        node permanently mounted (which is what makes the announcement fire)
        without it occupying layout space while there's no error.
      */}
      <p role="alert" className="text-meta text-status-rejected empty:hidden">
        {submitError}
      </p>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  )
}

export { SignupForm }
