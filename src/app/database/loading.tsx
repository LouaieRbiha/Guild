import { Skeleton } from "@/components/ui/skeleton";

export default function DatabaseLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-32" />
      </div>
      {/* Filter bar skeleton */}
      <Skeleton className="h-40 rounded-xl" />
      {/* Character grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 18 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/5] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
