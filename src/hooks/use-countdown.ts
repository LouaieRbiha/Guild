"use client";

import { useState, useEffect } from "react";

export interface TimeLeft {
  /** Total milliseconds remaining (0 when expired) */
  total: number;
  days: number;
  hours: number;
  minutes: number;
}

/**
 * Computes the remaining time until `target` and re-calculates every
 * `intervalMs` milliseconds (default: 60 000 = 1 minute).
 *
 * Returns a `TimeLeft` object. When the target is in the past every
 * field is 0.
 */
export function useCountdown(target: Date, intervalMs = 60_000): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(target));

  useEffect(() => {
    // Immediately sync in case target changed between renders
    setTimeLeft(getTimeLeft(target));

    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(target));
    }, intervalMs);

    return () => clearInterval(id);
  }, [target, intervalMs]);

  return timeLeft;
}

/** Pure helper -- exported so the Countdown component can share it. */
export function getTimeLeft(target: Date): TimeLeft {
  const total = target.getTime() - Date.now();
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0 };
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
  };
}
