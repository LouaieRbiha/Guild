import { Skeleton } from "@/components/ui/skeleton";

export default function TierListLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Filter card */}
      <Skeleton className="h-32 rounded-xl" />

      {/* Tier rows */}
      <div className="space-y-3">
        {["SS", "S", "A", "B", "C"].map((tier) => (
          <div key={tier} className="flex rounded-xl overflow-hidden border border-guild-border/30">
            {/* Tier label */}
            <Skeleton className="w-16 sm:w-20 h-24 rounded-none" />
            {/* Character slots */}
            <div className="flex-1 flex flex-wrap gap-2 p-3">
              {Array.from({
                length: tier === "SS" ? 4 : tier === "S" ? 6 : tier === "A" ? 10 : tier === "B" ? 12 : 8,
              }).map((_, i) => (
                <Skeleton key={i} className="w-[72px] sm:w-[80px] h-[100px] rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
