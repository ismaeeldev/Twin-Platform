import { redirect } from "next/navigation"
import Link from "next/link"
import { ListChecks, Clock3, CheckCircle2, Timer, Plus } from "lucide-react"

import { requireUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getDashboardStats } from "@/lib/metrics"
import { StatCard } from "@/components/dashboard/StatCard"
import { RecentTasksFeed } from "@/components/dashboard/RecentTasksFeed"
import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

const ICON_CLASS = "size-4"

/**
 * ApplicationFlow.md Section 4 — Dashboard. Redirects a never-onboarded
 * user to /onboarding first (covers both a fresh signup that reaches here
 * some other way, and a returning user who never finished onboarding).
 */
export default async function DashboardPage() {
  const user = await requireUser()

  if (!user.hasOnboarded) {
    redirect("/onboarding")
  }

  const [stats, recentTasks] = await Promise.all([
    getDashboardStats(user.id),
    prisma.task.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, workflowType: true, status: true, inboundText: true, createdAt: true },
    }),
  ])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-h2 text-text-primary">Overview</h2>
        {/* Desktop: top-right button. Mobile: fixed FAB below, per ApplicationFlow 4.3 */}
        <Link
          href="/tasks/new"
          className={cn(buttonVariants({ variant: "default" }), "hidden md:inline-flex")}
        >
          New Task
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={stats.totalTasks}
          icon={<ListChecks className={ICON_CLASS} strokeWidth={1.75} />}
          description="Every task you've created, across all statuses and workflow types."
        />
        <StatCard
          label="Pending approval"
          value={stats.pendingApproval}
          icon={<Clock3 className={ICON_CLASS} strokeWidth={1.75} />}
          description="Tasks with an AI draft ready and waiting on your decision right now."
        />
        <StatCard
          label="Approval rate"
          value={stats.approvalRate}
          suffix="%"
          format="percent"
          icon={<CheckCircle2 className={ICON_CLASS} strokeWidth={1.75} />}
          description="Of all the decisions you've made, the share that were a plain Approve (not Edit, Reject, or Escalate)."
        />
        <StatCard
          label="Avg. time-to-decision"
          value={stats.avgTimeToDecisionSeconds}
          suffix=" min"
          format="minutes"
          icon={<Timer className={ICON_CLASS} strokeWidth={1.75} />}
          description="On average, how long a task sits waiting for your review before you decide on it."
        />
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-h3 text-text-primary">Recent tasks</h3>
        <RecentTasksFeed tasks={recentTasks} />
      </div>

      {/* Mobile FAB — positioned to clear the bottom tab bar (h-16-ish + safe area) */}
      <Link
        href="/tasks/new"
        aria-label="New task"
        className="fixed bottom-20 right-4 z-30 flex size-14 items-center justify-center rounded-full bg-accent-primary text-text-on-accent shadow-lg elevation-cta-glow md:hidden"
      >
        <Plus className="size-6" strokeWidth={1.75} />
      </Link>
    </div>
  )
}
