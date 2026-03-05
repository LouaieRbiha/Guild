import { cn } from "@/lib/utils";
import { RARITY_COLORS } from "@/lib/constants";

interface RarityStarsProps {
  rarity: number;
  size?: "xs" | "sm" | "md";
  className?: string;
}

export function RarityStars({ rarity, size = "sm", className }: RarityStarsProps) {
  const colors = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS];
  const sizeClass = { xs: "text-[8px]", sm: "text-xs", md: "text-sm" }[size];
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: rarity }).map((_, i) => (
        <span key={i} className={cn(sizeClass, colors?.star || "text-gray-400")}>★</span>
      ))}
    </div>
  );
}
