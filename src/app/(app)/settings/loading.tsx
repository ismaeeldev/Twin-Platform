import { SkeletonShimmer } from "@/components/shared/SkeletonShimmer"

export default function SettingsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-6">
      <SkeletonShimmer className="h-8 w-32" />
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex flex-col gap-4 rounded-lg bg-bg-surface p-6">
          <SkeletonShimmer className="h-6 w-40" />
          <SkeletonShimmer className="h-11 w-full" />
          <SkeletonShimmer className="h-11 w-full" />
          <SkeletonShimmer className="h-11 w-32" />
        </div>
      ))}
    </div>
  )
}
