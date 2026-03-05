import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6 pb-12">
      {/* Player header skeleton */}
      <Skeleton className="h-32 rounded-xl" />
      {/* Character selector skeleton */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-16 h-16 rounded-full shrink-0" />
        ))}
      </div>
      {/* Build card skeleton */}
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}
