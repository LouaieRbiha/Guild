"use client";

import { cn } from "@/lib/utils";

const banners = [
  { phase: "5.4 Phase 2", chars: ["Neuvillette", "Zhongli"], daysLeft: 12, active: true },
  { phase: "5.4 Phase 1", chars: ["Sigewinne", "Clorinde"], daysLeft: 0, active: false },
  { phase: "5.3 Phase 2", chars: ["Furina", "Wriothesley"], daysLeft: 0, active: false },
];

const events = [
  { name: "Spiral Abyss Reset", date: "Mar 5", type: "reset" },
  { name: "Adventurer's Booster Bundle", date: "Mar 5 – Mar 18", type: "event" },
  { name: "Version 5.5 Maintenance", date: "Mar 26", type: "maintenance" },
  { name: "Version 5.5 Phase 1", date: "Mar 26", type: "banner" },
];

const typeBadge: Record<string, string> = {
  reset: "bg-red-500/20 text-red-400",
  event: "bg-blue-500/20 text-blue-400",
  banner: "bg-guild-gold/20 text-guild-gold",
  maintenance: "bg-orange-500/20 text-orange-400",
};

export default function TimelinePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Timeline</h1>
      <div className="guild-card p-5 space-y-4">
        <h2 className="text-sm font-medium text-guild-muted">Banner History</h2>
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.phase} className={cn("flex items-center justify-between p-3 rounded-lg border", b.active ? "bg-guild-accent/10 border-guild-accent/30" : "bg-guild-elevated border-white/5")}>
              <div>
                <p className="font-medium text-sm">{b.phase}</p>
                <p className="text-xs text-guild-muted">{b.chars.join(" · ")}</p>
              </div>
              {b.active && <span className="text-xs px-2 py-0.5 rounded bg-guild-accent/20 text-guild-accent font-medium">{b.daysLeft}d left</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="guild-card p-5 space-y-4">
        <h2 className="text-sm font-medium text-guild-muted">Upcoming Events</h2>
        <div className="space-y-2">
          {events.map((e) => (
            <div key={e.name} className="flex items-center gap-3 p-3 rounded-lg bg-guild-elevated">
              <span className={cn("text-[10px] px-2 py-0.5 rounded uppercase font-medium", typeBadge[e.type])}>{e.type}</span>
              <span className="text-sm font-medium flex-1">{e.name}</span>
              <span className="text-sm text-guild-muted font-mono">{e.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
