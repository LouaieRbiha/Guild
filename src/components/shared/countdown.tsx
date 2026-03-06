"use client";

import { useCountdown } from "@/hooks/use-countdown";

interface CountdownProps {
  target: Date;
  label?: string;
  className?: string;
}

export function Countdown({ target, label, className }: CountdownProps) {
  const timeLeft = useCountdown(target);

  if (timeLeft.total <= 0) {
    return <span className={className}>Ended</span>;
  }

  return (
    <div className={className}>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <div className="font-mono font-bold">
        {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
        <span>{timeLeft.hours}h </span>
        <span>{timeLeft.minutes}m</span>
      </div>
    </div>
  );
}
