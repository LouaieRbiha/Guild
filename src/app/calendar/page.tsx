"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Gift,
  Timer,
  Clock,
  Globe,
  Gamepad2,
  FlaskConical,
  RefreshCw,
  Star,
  BookOpen,
  Flame,
  CheckCircle2,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/shared";
import { CURRENT_VERSION, PERMANENT_EVENTS } from "@/data/events";
import { TALENT_BOOK_SCHEDULE } from "@/data/farming-schedule";
import type { GameEvent } from "@/data/events";

// ── Constants ───────────────────────────────────────────────────────────

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const TYPE_CONFIG: Record<
  GameEvent["type"],
  { border: string; bg: string; text: string; icon: React.FC<{ size?: number; className?: string }> }
> = {
  "In-Game": {
    border: "border-l-indigo-500",
    bg: "bg-indigo-500/15",
    text: "text-indigo-400",
    icon: Gamepad2,
  },
  "Web Event": {
    border: "border-l-purple-500",
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    icon: Globe,
  },
  "Test Run": {
    border: "border-l-blue-500",
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    icon: FlaskConical,
  },
  Update: {
    border: "border-l-amber-500",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    icon: Star,
  },
  Permanent: {
    border: "border-l-slate-500",
    bg: "bg-slate-500/15",
    text: "text-slate-400",
    icon: RefreshCw,
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateRange(start: string, end: string): string {
  return `${formatDateShort(start)} — ${formatDateShort(end)}`;
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function daysBetween(startStr: string, endStr: string): number {
  const diff = new Date(endStr).getTime() - new Date(startStr).getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function categorizeEvent(
  event: GameEvent,
  now: number,
): "active" | "upcoming" | "ended" {
  const start = new Date(event.start).getTime();
  const end = new Date(event.end).getTime();
  if (now < start) return "upcoming";
  if (now > end) return "ended";
  return "active";
}

function extractPrimogems(rewards: string[] | undefined): number {
  if (!rewards) return 0;
  let total = 0;
  for (const reward of rewards) {
    const match = reward.match(/primogems?\s*x\s*(\d+)/i);
    if (match) {
      total += parseInt(match[1], 10);
    }
  }
  return total;
}

function getTodaysTalentBooks(dayName: string): string[] {
  if (dayName === "Sunday") {
    return Object.keys(TALENT_BOOK_SCHEDULE);
  }
  const books: string[] = [];
  for (const [book, days] of Object.entries(TALENT_BOOK_SCHEDULE)) {
    if (days.includes(dayName)) {
      books.push(book);
    }
  }
  return books;
}

// ── Version Header ──────────────────────────────────────────────────────

function VersionHeader() {
  const now = Date.now();
  const startMs = new Date(CURRENT_VERSION.start).getTime();
  const endMs = new Date(CURRENT_VERSION.end).getTime();
  const total = endMs - startMs;
  const elapsed = Math.max(0, Math.min(now - startMs, total));
  const percent = total > 0 ? Math.round((elapsed / total) * 100) : 0;
  const remaining = daysUntil(CURRENT_VERSION.end);
  const totalDays = daysBetween(CURRENT_VERSION.start, CURRENT_VERSION.end);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-guild-card via-[#1e2040] to-guild-card border border-white/5 p-6 sm:p-8">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-guild-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="relative space-y-6">
        {/* Title row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-guild-accent/10 border border-guild-accent/20 flex items-center justify-center">
              <CalendarDays size={24} className="text-guild-accent" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Event Calendar
              </h1>
              <p className="text-guild-muted text-sm mt-0.5">
                {CURRENT_VERSION.name}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="text-guild-accent border-guild-accent/30 text-sm px-3 py-1"
            >
              v{CURRENT_VERSION.version}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/5 text-guild-muted border-0 text-sm px-3 py-1"
            >
              {CURRENT_VERSION.region}
            </Badge>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-guild-muted">Version Progress</span>
            <span className="font-mono font-semibold text-white">
              {percent}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-guild-accent via-indigo-400 to-guild-accent-2 transition-all duration-700 relative"
              style={{ width: `${percent}%` }}
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-guild-muted">
            <span>{formatDateShort(CURRENT_VERSION.start)}</span>
            <span className="font-medium text-white/70">
              {remaining} day{remaining !== 1 ? "s" : ""} remaining of{" "}
              {totalDays}
            </span>
            <span>{formatDateShort(CURRENT_VERSION.end)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Daily Checklist ─────────────────────────────────────────────────────

function DailyChecklist() {
  const today = new Date();
  const dayName = DAY_NAMES[today.getDay()];
  const talentBooks = getTodaysTalentBooks(dayName);
  const isSunday = dayName === "Sunday";

  return (
    <div className="rounded-2xl bg-guild-card border border-white/5 p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-guild-accent/10 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-guild-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold">Today&apos;s Checklist</h2>
            <p className="text-xs text-guild-muted">{dayName}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-white/80">
            {today.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Daily Commissions */}
        <div className="flex items-start gap-3 rounded-xl bg-white/3 border border-white/5 p-4 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles size={16} className="text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Daily Commissions</p>
            <p className="text-xs text-guild-muted mt-0.5">
              4 commissions = 60 Primogems
            </p>
          </div>
        </div>

        {/* Resin Cap */}
        <div className="flex items-start gap-3 rounded-xl bg-white/3 border border-white/5 p-4 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <Zap size={16} className="text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Spend Resin</p>
            <p className="text-xs text-guild-muted mt-0.5">
              160/160 cap, 1 per 8 min
            </p>
          </div>
        </div>

        {/* Talent Books */}
        <div className="flex items-start gap-3 rounded-xl bg-white/3 border border-white/5 p-4 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
            <BookOpen size={16} className="text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Talent Books</p>
            {isSunday ? (
              <p className="text-xs text-guild-success mt-0.5">
                All books available today
              </p>
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {talentBooks.map((book) => (
                  <span
                    key={book}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-medium"
                  >
                    {book}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Primogem Calculator ─────────────────────────────────────────────────

function PrimogemCalculator() {
  const remaining = daysUntil(CURRENT_VERSION.end);
  const dailyPrimos = remaining * 60;

  const eventPrimos = useMemo(() => {
    let total = 0;
    const now = Date.now();
    for (const event of CURRENT_VERSION.events) {
      const endMs = new Date(event.end).getTime();
      // Only count events that have not ended yet
      if (endMs > now) {
        total += extractPrimogems(event.rewards);
      }
    }
    return total;
  }, []);

  const totalPrimos = dailyPrimos + eventPrimos;
  const estimatedWishes = Math.floor(totalPrimos / 160);

  return (
    <div className="rounded-2xl bg-guild-card border border-white/5 p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-guild-gold/10 flex items-center justify-center">
          <Flame size={20} className="text-guild-gold" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Primogem Estimate</h2>
          <p className="text-xs text-guild-muted">
            Remaining this patch (f2p)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Daily Commissions */}
        <div className="rounded-xl bg-white/3 border border-white/5 p-4 text-center">
          <p className="text-2xl font-bold font-mono text-guild-accent">
            {dailyPrimos.toLocaleString()}
          </p>
          <p className="text-xs text-guild-muted mt-1">
            Dailies ({remaining}d x 60)
          </p>
        </div>

        {/* Event Rewards */}
        <div className="rounded-xl bg-white/3 border border-white/5 p-4 text-center">
          <p className="text-2xl font-bold font-mono text-purple-400">
            {eventPrimos.toLocaleString()}
          </p>
          <p className="text-xs text-guild-muted mt-1">Event Rewards</p>
        </div>

        {/* Total */}
        <div className="rounded-xl bg-linear-to-br from-guild-accent/10 to-purple-500/10 border border-guild-accent/20 p-4 text-center">
          <p className="text-2xl font-bold font-mono text-guild-gold">
            {totalPrimos.toLocaleString()}
          </p>
          <p className="text-xs text-guild-muted mt-1">
            Total (~{estimatedWishes} wishes)
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Event Card ──────────────────────────────────────────────────────────

interface EventCardProps {
  event: GameEvent;
  status: "active" | "upcoming" | "ended";
}

function EventCard({ event, status }: EventCardProps) {
  const config = TYPE_CONFIG[event.type];
  const TypeIcon = config.icon;
  const primoCount = extractPrimogems(event.rewards);

  return (
    <div
      className={cn(
        "rounded-xl border border-white/5 border-l-4 p-5 space-y-3",
        "transition-all duration-200 hover:border-white/10",
        config.border,
        status === "ended"
          ? "bg-guild-card/60 opacity-60"
          : "bg-guild-card hover:bg-[#2a2d4a]",
      )}
    >
      {/* Header: type badge + primo badge + countdown/status */}
      <div className="flex items-center justify-between gap-3">
        <Badge
          variant="secondary"
          className={cn(config.bg, config.text, "border-0 gap-1")}
        >
          <TypeIcon size={12} />
          {event.type}
        </Badge>

        <div className="flex items-center gap-2">
          {primoCount > 0 && status !== "ended" && (
            <span className="flex items-center gap-1 text-xs font-bold text-guild-gold bg-guild-gold/10 rounded-full px-2 py-0.5">
              <Sparkles size={10} />
              {primoCount}
            </span>
          )}

          {status === "active" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-guild-success">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-guild-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-guild-success" />
              </span>
              Live
            </span>
          )}

          {status === "upcoming" && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-guild-gold">
              <Clock size={12} />
              In {daysUntil(event.start)} day
              {daysUntil(event.start) !== 1 ? "s" : ""}
            </span>
          )}

          {status === "ended" && (
            <span className="text-xs font-medium text-guild-dim">Ended</span>
          )}
        </div>
      </div>

      {/* Event name */}
      <h3 className="text-base font-bold leading-snug line-clamp-1">{event.name}</h3>

      {/* Date range */}
      <div className="flex items-center gap-2 text-sm text-guild-muted">
        <CalendarDays size={14} className="shrink-0" />
        <span>{formatDateRange(event.start, event.end)}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-guild-muted leading-relaxed line-clamp-2">
        {event.description}
      </p>

      {/* Rewards as small badges */}
      {event.rewards && event.rewards.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 overflow-hidden">
          <Gift size={14} className="text-guild-gold shrink-0" />
          {event.rewards.map((reward) => (
            <span
              key={reward}
              className="text-[11px] px-2 py-0.5 rounded-md bg-guild-gold/10 text-guild-gold font-medium truncate max-w-[150px]"
            >
              {reward}
            </span>
          ))}
        </div>
      )}

      {/* Active event countdown */}
      {status === "active" && (
        <div className="flex items-center gap-2 pt-1 text-sm">
          <Timer size={14} className="text-guild-accent shrink-0" />
          <span className="text-guild-muted">Ends in</span>
          <Countdown
            target={new Date(event.end)}
            className="text-guild-accent font-semibold"
          />
        </div>
      )}

    </div>
  );
}

// ── Event Section ───────────────────────────────────────────────────────

interface EventSectionProps {
  title: string;
  events: Array<{ event: GameEvent; status: "active" | "upcoming" | "ended" }>;
  dotColor: string;
  defaultExpanded?: boolean;
}

function EventSection({
  title,
  events,
  dotColor,
  defaultExpanded = true,
}: EventSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (events.length === 0) return <></>;

  return (
    <section className="space-y-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full group min-w-0"
      >
        <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", dotColor)} />
        <h2 className="text-lg font-bold truncate">{title}</h2>
        <span className="text-sm text-guild-muted shrink-0">({events.length})</span>
        <div className="ml-auto text-guild-muted group-hover:text-white transition-colors shrink-0">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {events.map(({ event, status }) => (
            <EventCard key={event.name} event={event} status={status} />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Compact Permanent Card ──────────────────────────────────────────────

function PermanentCard({ event }: { event: GameEvent }) {
  return (
    <div className="bg-guild-card rounded-xl border border-white/5 border-l-4 border-l-slate-500 p-4 space-y-2 transition-all duration-200 hover:border-white/10 hover:bg-[#2a2d4a]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold line-clamp-1">{event.name}</h3>
        <Badge
          variant="secondary"
          className="bg-slate-500/20 text-slate-400 border-0 text-[10px]"
        >
          Permanent
        </Badge>
      </div>
      <p className="text-xs text-guild-muted leading-relaxed">
        {event.description}
      </p>
      {event.rewards && event.rewards.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
          <Gift size={12} className="text-guild-gold shrink-0" />
          {event.rewards.map((reward) => (
            <span
              key={reward}
              className="text-[11px] px-1.5 py-0.5 rounded bg-guild-gold/10 text-guild-gold font-medium truncate max-w-[150px]"
            >
              {reward}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const [now] = useState(() => Date.now());

  const { activeEvents, upcomingEvents, endedEvents } = useMemo(() => {
    const active: Array<{
      event: GameEvent;
      status: "active" | "upcoming" | "ended";
    }> = [];
    const upcoming: Array<{
      event: GameEvent;
      status: "active" | "upcoming" | "ended";
    }> = [];
    const ended: Array<{
      event: GameEvent;
      status: "active" | "upcoming" | "ended";
    }> = [];

    for (const event of CURRENT_VERSION.events) {
      const status = categorizeEvent(event, now);
      const entry = { event, status };

      if (status === "active") {
        active.push(entry);
      } else if (status === "upcoming") {
        upcoming.push(entry);
      } else {
        ended.push(entry);
      }
    }

    // Sort active by soonest ending first
    active.sort(
      (a, b) =>
        new Date(a.event.end).getTime() - new Date(b.event.end).getTime(),
    );

    // Sort upcoming by soonest starting first
    upcoming.sort(
      (a, b) =>
        new Date(a.event.start).getTime() - new Date(b.event.start).getTime(),
    );

    // Sort ended by most recently ended first
    ended.sort(
      (a, b) =>
        new Date(b.event.end).getTime() - new Date(a.event.end).getTime(),
    );

    return {
      activeEvents: active,
      upcomingEvents: upcoming,
      endedEvents: ended,
    };
  }, [now]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Version Header with progress bar */}
      <VersionHeader />

      {/* Daily Checklist + Primogem Calculator side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyChecklist />
        <PrimogemCalculator />
      </div>

      {/* Happening Now */}
      <EventSection
        title="Happening Now"
        events={activeEvents}
        dotColor="bg-guild-success"
      />

      {/* Coming Soon */}
      <EventSection
        title="Coming Soon"
        events={upcomingEvents}
        dotColor="bg-guild-gold"
      />

      {/* Completed */}
      <EventSection
        title="Completed"
        events={endedEvents}
        dotColor="bg-guild-dim"
        defaultExpanded={false}
      />

      {/* Permanent Activities */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
          <h2 className="text-lg font-bold">Permanent Activities</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PERMANENT_EVENTS.map((event) => (
            <PermanentCard key={event.name} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
