import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Date helpers ────────────────────────────────────────────────────────

/**
 * Format a date string as "Jan 5" (or "Jan 5, 2025" when `includeYear` is true).
 * Handles both ISO and space-separated date strings (e.g. "2025-01-05 00:00:00").
 */
export function formatDateShort(dateStr: string, includeYear = false): string {
  const normalised = dateStr.includes("T") ? dateStr : dateStr.replace(" ", "T");
  const d = new Date(normalised);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (includeYear) opts.year = "numeric";
  return d.toLocaleDateString("en-US", opts);
}

/**
 * Format a date range as "Jan 5 — Feb 12".
 */
export function formatDateRange(start: string, end: string, includeYear = false): string {
  return `${formatDateShort(start, includeYear)} — ${formatDateShort(end, includeYear)}`;
}

/**
 * Days until a date string. Returns 0 if the date is in the past.
 */
export function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
