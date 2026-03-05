import { Skeleton } from "@/components/ui/skeleton";

export default function AbyssLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-5 w-48" />
      </div>

      {/* Tabs */}
      <Skeleton className="h-10 w-full md:w-96 rounded-lg" />

      {/* Disorder Banner */}
      <Skeleton className="h-20 rounded-xl" />

      {/* Chambers */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>

      {/* Teams */}
      <div className="space-y-4">
        <Skeleton className="h-7 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
