"use client";

import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const leaks = [
  { type: "character", name: "Unknown Character A", rarity: 5, description: "Claymore DPS from Natlan", severity: "mild" },
  { type: "character", name: "Unknown Character B", rarity: 4, description: "Support catalyst user", severity: "mild" },
  { type: "weapon", name: "Leaked Signature Weapon", rarity: 5, description: "New claymore with CRIT DMG substat", severity: "moderate" },
  { type: "story", name: "Act V Archon Quest", rarity: 0, description: "Major story details about Natlan finale", severity: "heavy" },
  { type: "map", name: "New Subregion", rarity: 0, description: "Underground area beneath current map", severity: "moderate" },
];

const sevBorder: Record<string, string> = { mild: "border-green-500/30", moderate: "border-yellow-500/30", heavy: "border-red-500/30" };

export default function LeaksPage() {
  const [enabled, setEnabled] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const toggle = (n: string) => setRevealed((p) => { const s = new Set(p); if (s.has(n)) { s.delete(n); } else { s.add(n); } return s; });

  if (!enabled) {
    return (
      <div className="max-w-md mx-auto mt-32 text-center space-y-6">
        <Lock className="h-16 w-16 text-guild-muted mx-auto" />
        <h1 className="text-2xl font-bold">Leaks &amp; Spoilers</h1>
        <p className="text-guild-muted">This section contains leaked content from beta tests and datamines. Nothing here is final.</p>
        <div className="guild-card p-4 flex items-start gap-3 text-left" style={{ borderColor: "rgba(234,179,8,0.2)" }}>
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-400">By enabling this section, you acknowledge you may see unreleased content.</p>
        </div>
        <button onClick={() => setEnabled(true)} className="h-10 px-6 rounded-md bg-guild-accent hover:bg-guild-accent/80 font-medium transition-colors cursor-pointer">
          I understand, show me the leaks
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" /> Leaks &amp; Spoilers
        </h1>
        <button onClick={() => setEnabled(false)} className="h-8 px-3 rounded-md bg-guild-elevated text-sm text-guild-muted hover:text-foreground transition-colors cursor-pointer">
          Hide Section
        </button>
      </div>
      <p className="text-sm text-yellow-400/70">⚠️ Content from beta/datamines. Not final. Click to reveal.</p>
      <div className="space-y-3">
        {leaks.map((l) => {
          const show = revealed.has(l.name);
          return (
            <div key={l.name} className={cn("guild-card p-4 cursor-pointer transition-all", sevBorder[l.severity])} onClick={() => toggle(l.name)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-guild-elevated uppercase text-guild-muted">{l.type}</span>
                  <span className={cn("font-medium", !show && "blur-sm select-none")}>{l.name}</span>
                  {l.rarity > 0 && <span className={cn("text-xs", !show && "blur-sm", l.rarity === 5 ? "text-guild-gold" : "text-guild-accent-2")}>{"★".repeat(l.rarity)}</span>}
                </div>
                {show ? <EyeOff className="h-4 w-4 text-guild-muted" /> : <Eye className="h-4 w-4 text-guild-muted" />}
              </div>
              <p className={cn("text-sm text-guild-muted mt-2", !show && "blur-sm select-none")}>{l.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
