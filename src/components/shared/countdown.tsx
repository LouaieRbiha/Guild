"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  target: Date;
  label?: string;
  className?: string;
}

export function Countdown({ target, label, className }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(target));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, 60000); // update every minute
    return () => clearInterval(interval);
  }, [target]);

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

function getTimeLeft(target: Date) {
  const total = target.getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
  };
}
