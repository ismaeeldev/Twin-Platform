import { SkeletonShimmer } from "@/components/shared/SkeletonShimmer"

export default function TaskDetailLoading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <SkeletonShimmer className="h-4 w-24" />
        <SkeletonShimmer className="h-8 w-48" />
      </div>
      <SkeletonShimmer className="h-32 w-full" />
      <SkeletonShimmer className="h-64 w-full" />
      <SkeletonShimmer className="h-11 w-full" />
    </div>
  )
}
