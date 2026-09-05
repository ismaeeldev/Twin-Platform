import { SkeletonShimmer } from "@/components/shared/SkeletonShimmer"

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonShimmer key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <SkeletonShimmer className="h-6 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonShimmer key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
