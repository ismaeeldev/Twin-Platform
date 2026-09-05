import Link from "next/link"

import { AuthBrandPanel } from "@/components/marketing/AuthBrandPanel"
import { LoginForm } from "@/app/(auth)/login/LoginForm"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-bg-base">
      <AuthBrandPanel />
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-h1 text-text-primary">Welcome back</h1>
            <p className="text-body text-text-secondary">Sign in to review what your AI has drafted.</p>
          </div>

          <LoginForm />

          <p className="mt-6 text-center text-meta text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-accent-primary hover:underline">
              Create one
            </Link>
          </p>
          {/* Phase 1 stretch goal per docs/ApplicationFlow.md Section 2.2 — static message is acceptable */}
          <p className="mt-2 text-center text-meta text-text-tertiary">
            Forgot your password? Contact support.
          </p>
        </div>
      </div>
    </main>
  )
}
