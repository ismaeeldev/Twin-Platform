"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"

const formSchema = z.object({
  email: z.string().trim().min(1, "Email is required.").email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
})

type FormValues = z.infer<typeof formSchema>

function LoginForm() {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: FormValues) {
    setSubmitError(null)

    try {
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (!result || result.error) {
        const message = "Incorrect email or password."
        setSubmitError(message)
        toast.error(message)
        return
      }

      toast.success("Signed in successfully.")
      router.push("/dashboard")
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
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="text-meta text-status-rejected">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Your password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="password-error" className="text-meta text-status-rejected">
            {errors.password.message}
          </p>
        )}
      </div>

      {/*
        role="alert" so a screen reader announces a failed sign-in attempt.
        Without it the only signal that the submit failed is a visual line of
        red text plus a sonner toast, neither of which moves focus — a
        keyboard/screen-reader user pressed "Sign in" and got silence.
      */}
      <p role="alert" className="text-meta text-status-rejected empty:hidden">
        {submitError}
      </p>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}

export { LoginForm }
