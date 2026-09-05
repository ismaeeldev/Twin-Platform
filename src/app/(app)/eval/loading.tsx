import { SkeletonShimmer } from "@/components/shared/SkeletonShimmer"

export default function EvalLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-6">
      <SkeletonShimmer className="h-8 w-40" />
      <div className="flex flex-col gap-3">
        <SkeletonShimmer className="h-6 w-64" />
        <SkeletonShimmer className="h-64 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <SkeletonShimmer className="h-6 w-48" />
          <SkeletonShimmer className="h-64 w-full" />
        </div>
        <div className="flex flex-col gap-3">
          <SkeletonShimmer className="h-6 w-48" />
          <SkeletonShimmer className="h-64 w-full" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <SkeletonShimmer className="h-6 w-64" />
        <SkeletonShimmer className="h-40 w-full" />
      </div>
    </div>
  )
}
