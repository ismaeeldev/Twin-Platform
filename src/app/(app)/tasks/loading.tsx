import { SkeletonShimmer } from "@/components/shared/SkeletonShimmer"

export default function TasksLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <SkeletonShimmer className="h-8 w-32" />
      <div className="flex gap-3">
        <SkeletonShimmer className="h-11 w-48" />
        <SkeletonShimmer className="h-11 w-48" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonShimmer key={index} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}
