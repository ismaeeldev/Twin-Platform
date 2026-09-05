import { SkeletonShimmer } from "@/components/shared/SkeletonShimmer"

export default function TaskCreateLoading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <SkeletonShimmer className="h-8 w-40" />
      <div className="flex flex-col gap-2">
        <SkeletonShimmer className="h-4 w-24" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SkeletonShimmer className="h-24 w-full" />
          <SkeletonShimmer className="h-24 w-full" />
          <SkeletonShimmer className="h-24 w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <SkeletonShimmer className="h-4 w-32" />
        <SkeletonShimmer className="h-40 w-full" />
      </div>
      <SkeletonShimmer className="h-11 w-32" />
    </div>
  )
}
