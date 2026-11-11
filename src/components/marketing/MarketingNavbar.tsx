import Link from "next/link"

import { auth } from "@/lib/auth"
import { buttonVariants } from "@/components/ui/button-variants"
import { Logo } from "@/components/shared/Logo"
import { cn } from "@/lib/utils"

/**
 * Landing page top navbar — Server Component so the logged-in-vs-not check
 * (`auth()`, which returns null rather than throwing when unauthenticated,
 * unlike `requireUser()`) happens with zero client JS. Reuses the same logo
 * mark as the authenticated Sidebar so the brand feels consistent across
 * both the marketing site and the app shell.
 */
async function MarketingNavbar() {
  const session = await auth()

  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-bg-base/80 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
      >
        <Link href="/" className="flex items-center gap-2.5 outline-none" aria-label="Twin — Home">
          <Logo variant="full" height={34} />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="#how-it-works" className="text-body text-text-secondary transition-colors duration-150 hover:text-text-primary">
            How it works
          </Link>
          <Link href="#authority" className="text-body text-text-secondary transition-colors duration-150 hover:text-text-primary">
            Authority
          </Link>
          <Link href="/pricing" className="text-body text-text-secondary transition-colors duration-150 hover:text-text-primary">
            Pricing
          </Link>
        </div>

        {session?.user ? (
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
            Dashboard
          </Link>
        ) : (
          <Link href="/signup" className={cn(buttonVariants({ variant: "default", size: "sm" }))}>
            Get Started
          </Link>
        )}
      </nav>
    </header>
  )
}

export { MarketingNavbar }
