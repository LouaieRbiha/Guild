import { cn } from "@/lib/utils";

interface StatBarProps {
  value: number;
  max: number;
  label: string;
  displayValue?: string;
  color?: string;
  className?: string;
}

export function StatBar({ value, max, label, displayValue, color, className }: StatBarProps) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{displayValue ?? value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color || "bg-primary")}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
