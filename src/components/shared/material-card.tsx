import Image from "next/image";
import { cn } from "@/lib/utils";
import { MAT_RARITY_BORDER, MAT_RARITY_BG, YATTA_ASSETS } from "@/lib/constants";

interface MaterialCardProps {
  item: {
    id: string;
    name: string;
    icon: string;
    rarity: number;
    count: number;
  };
  className?: string;
}

export function MaterialCard({ item, className }: MaterialCardProps) {
  return (
    <div className={cn("group relative flex flex-col items-center", className)} title={item.name}>
      <div className={cn(
        "relative w-24 h-24 rounded-xl border-2 overflow-hidden transition-transform group-hover:scale-105",
        MAT_RARITY_BORDER[item.rarity] || "border-gray-600",
        MAT_RARITY_BG[item.rarity] || "bg-black/30"
      )}>
        {item.icon ? (
          <Image
            src={`${YATTA_ASSETS}/${item.icon}.png`}
            alt={item.name}
            width={96}
            height={96}
            className="object-contain p-1"
            sizes="96px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">?</div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-center py-0.5">
          <span className="text-sm font-bold text-white">{item.count.toLocaleString()}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-1 text-center leading-tight max-w-24 truncate">
        {item.name}
      </p>
    </div>
  );
}
