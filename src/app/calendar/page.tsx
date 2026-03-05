"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Gift,
  Timer,
  Star,
  Clock,
  Globe,
  Gamepad2,
  FlaskConical,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Countdown } from "@/components/shared";
import { CURRENT_VERSION, PERMANENT_EVENTS } from "@/data/events";
import type { GameEvent } from "@/data/events";

// ── Type badge colors ───────────────────────────────────────────────────

const TYPE_STYLES: Record<
  GameEvent["type"],
  { bg: string; text: string; icon: React.ElementType }
> = {
  "In-Game": {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    icon: Gamepad2,
  },
  "Web Event": {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    icon: Globe,
  },
  "Test Run": {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    icon: FlaskConical,
  },
  Update: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    icon: Star,
  },
  Permanent: {
    bg: "bg-slate-500/20",
    text: "text-slate-400",
    icon: RefreshCw,
  },
};

// ── Border colors matching type ─────────────────────────────────────────

const TYPE_BORDER: Record<GameEvent["type"], string> = {
  "In-Game": "border-l-blue-500",
  "Web Event": "border-l-purple-500",
  "Test Run": "border-l-emerald-500",
  Update: "border-l-amber-500",
  Permanent: "border-l-slate-500",
};

// ── Helpers ─────────────────────────────────────────────────────────────

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  return `${s.toLocaleDateString("en-US", opts)} — ${e.toLocaleDateString("en-US", opts)}`;
}

function getStatus(
  start: string,
  end: string,
): "active" | "upcoming" | "ended" {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now < s) return "upcoming";
  if (now > e) return "ended";
  return "active";
}

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// ── Status Badge ────────────────────────────────────────────────────────

function StatusIndicator({ status }: { status: "active" | "upcoming" | "ended" }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-guild-success">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-guild-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-guild-success" />
        </span>
        Active
      </span>
    );
  }
  if (status === "upcoming") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-guild-gold">
        <Clock size={12} />
        Upcoming
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-guild-dim">
      Ended
    </span>
  );
}

// ── Event Card ──────────────────────────────────────────────────────────

function EventCard({ event }: { event: GameEvent }) {
  const status = getStatus(event.start, event.end);
  const style = TYPE_STYLES[event.type];
  const borderColor = TYPE_BORDER[event.type];
  const TypeIcon = style.icon;

  return (
    <div
      className={`relative bg-[#252841] rounded-xl border border-white/5 border-l-4 ${borderColor} p-5 space-y-3 transition-all duration-200 hover:border-white/10 hover:bg-[#2a2d4a]`}
    >
      {/* Header row: type badge + status */}
      <div className="flex items-center justify-between gap-3">
        <Badge
          variant="secondary"
          className={`${style.bg} ${style.text} border-0 gap-1`}
        >
          <TypeIcon size={12} />
          {event.type}
        </Badge>
        <StatusIndicator status={status} />
      </div>

      {/* Event name */}
      <h3 className="text-base font-bold leading-snug">{event.name}</h3>

      {/* Date range */}
      <div className="flex items-center gap-2 text-sm text-guild-muted">
        <CalendarDays size={14} className="shrink-0" />
        <span>{formatDateRange(event.start, event.end)}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-guild-muted leading-relaxed">
        {event.description}
      </p>

      {/* Rewards */}
      {event.rewards && event.rewards.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Gift size={14} className="text-guild-gold shrink-0" />
          {event.rewards.map((reward) => (
            <span
              key={reward}
              className="text-xs px-2 py-1 rounded-md bg-guild-gold/10 text-guild-gold font-medium"
            >
              {reward}
            </span>
          ))}
        </div>
      )}

      {/* Countdown or "Starts in" */}
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

      {status === "upcoming" && (
        <div className="flex items-center gap-2 pt-1 text-sm">
          <Clock size={14} className="text-guild-gold shrink-0" />
          <span className="text-guild-gold font-medium">
            Starts in {daysUntil(event.start)} day
            {daysUntil(event.start) !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Compact Permanent Card ──────────────────────────────────────────────

function PermanentCard({ event }: { event: GameEvent }) {
  return (
    <div className="bg-[#252841] rounded-xl border border-white/5 border-l-4 border-l-slate-500 p-4 space-y-2 transition-all duration-200 hover:border-white/10 hover:bg-[#2a2d4a]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold">{event.name}</h3>
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
        <div className="flex flex-wrap items-center gap-1.5">
          <Gift size={12} className="text-guild-gold shrink-0" />
          {event.rewards.map((reward) => (
            <span
              key={reward}
              className="text-[11px] px-1.5 py-0.5 rounded bg-guild-gold/10 text-guild-gold font-medium"
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
  const { currentEvents, upcomingEvents } = useMemo(() => {
    const current: GameEvent[] = [];
    const upcoming: GameEvent[] = [];

    for (const event of CURRENT_VERSION.events) {
      const s = new Date(event.start).getTime();
      const e = new Date(event.end).getTime();
      if (now >= s && now <= e) {
        current.push(event);
      } else if (now < s) {
        upcoming.push(event);
      }
    }

    // Sort current events by end date (soonest ending first)
    current.sort(
      (a, b) => new Date(a.end).getTime() - new Date(b.end).getTime(),
    );

    // Sort upcoming events by start date
    upcoming.sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );

    return { currentEvents: current, upcomingEvents: upcoming };
  }, [now]);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-guild-accent/10 flex items-center justify-center">
            <CalendarDays size={22} className="text-guild-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Event Calendar</h1>
            <p className="text-sm text-guild-muted">
              Version {CURRENT_VERSION.version} &mdash;{" "}
              {CURRENT_VERSION.name}
            </p>
          </div>
        </div>

        {/* Version progress bar */}
        <VersionProgress
          start={CURRENT_VERSION.start}
          end={CURRENT_VERSION.end}
        />
      </div>

      {/* ── Current Events ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-guild-success" />
          <h2 className="text-lg font-bold">
            Current Events
          </h2>
          <span className="text-sm text-guild-muted">
            ({currentEvents.length})
          </span>
        </div>

        {/* Timeline layout */}
        <div className="relative space-y-4 pl-6">
          {/* Connecting line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-guild-accent/40 via-guild-accent/20 to-transparent" />

          {currentEvents.length > 0 ? (
            currentEvents.map((event) => (
              <div key={event.name} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-6 top-6 w-3.5 h-3.5 rounded-full border-2 border-guild-accent bg-guild-bg" />
                <EventCard event={event} />
              </div>
            ))
          ) : (
            <p className="text-guild-muted text-sm py-4">
              No active events right now.
            </p>
          )}
        </div>
      </section>

      {/* ── Upcoming Events ─────────────────────────────────────────── */}
      {upcomingEvents.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-guild-gold" />
            <h2 className="text-lg font-bold">
              Upcoming Events
            </h2>
            <span className="text-sm text-guild-muted">
              ({upcomingEvents.length})
            </span>
          </div>

          <div className="relative space-y-4 pl-6">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-guild-gold/40 via-guild-gold/20 to-transparent" />

            {upcomingEvents.map((event) => (
              <div key={event.name} className="relative">
                <div className="absolute -left-6 top-6 w-3.5 h-3.5 rounded-full border-2 border-guild-gold bg-guild-bg" />
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Permanent Activities ─────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-500" />
          <h2 className="text-lg font-bold">
            Permanent Activities
          </h2>
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

// ── Version Progress Bar ────────────────────────────────────────────────

function VersionProgress({ start, end }: { start: string; end: string }) {
  const [now] = useState(() => Date.now());
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const total = e - s;
  const elapsed = Math.max(0, Math.min(now - s, total));
  const pct = total > 0 ? (elapsed / total) * 100 : 0;
  const daysLeft = Math.max(
    0,
    Math.ceil((e - now) / (1000 * 60 * 60 * 24)),
  );

  return (
    <div className="space-y-1.5 pt-2">
      <div className="flex items-center justify-between text-xs text-guild-muted">
        <span>Version progress</span>
        <span>
          {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-guild-accent to-guild-accent-2 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
