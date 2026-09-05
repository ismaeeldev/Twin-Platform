import Link from "next/link"

import { AuthBrandPanel } from "@/components/marketing/AuthBrandPanel"
import { SignupForm } from "@/app/(auth)/signup/SignupForm"

export default function SignupPage() {
  return (
    <main className="flex min-h-screen bg-bg-base">
      <AuthBrandPanel />
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-h1 text-text-primary">Create your account</h1>
            <p className="text-body text-text-secondary">Start drafting with AI, decide on every response yourself.</p>
          </div>

          <SignupForm />

          <p className="mt-6 text-center text-meta text-text-secondary">
            Already have an account?{" "}
            <Link href="/login" className="text-accent-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
