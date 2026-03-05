import { Skeleton } from "@/components/ui/skeleton";

export default function WeaponDetailLoading() {
  return (
    <div className="space-y-6 pb-12">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-80 rounded-xl" />
      <Skeleton className="h-12 rounded-lg" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}
