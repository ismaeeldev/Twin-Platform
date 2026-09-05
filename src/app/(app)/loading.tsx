import { SkeletonShimmer } from "@/components/shared/SkeletonShimmer"

export default function AppLoading() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <SkeletonShimmer className="h-8 w-1/3" />
      <SkeletonShimmer className="h-32 w-full" />
      <SkeletonShimmer className="h-32 w-full" />
    </div>
  )
}
