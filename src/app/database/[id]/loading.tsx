import { Skeleton } from "@/components/ui/skeleton";

export default function CharacterDetailLoading() {
  return (
    <div className="space-y-6 pb-12">
      <Skeleton className="h-5 w-36" />
      {/* Hero skeleton */}
      <Skeleton className="h-80 rounded-xl" />
      {/* Tabs skeleton */}
      <Skeleton className="h-12 rounded-lg" />
      {/* Content skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
