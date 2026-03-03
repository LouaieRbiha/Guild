"use client";

import { useState } from "react";
import { Dices, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const sets = ["Emblem of Severed Fate", "Marechaussee Hunter", "Golden Troupe", "Viridescent Venerer", "Crimson Witch of Flames"];
const mains: Record<string, string[]> = {
  Flower: ["HP"], Plume: ["ATK"],
  Sands: ["HP%", "ATK%", "DEF%", "Energy Recharge", "Elemental Mastery"],
  Goblet: ["HP%", "ATK%", "DEF%", "Pyro DMG%", "Hydro DMG%", "Electro DMG%", "Cryo DMG%", "Anemo DMG%", "Geo DMG%", "Dendro DMG%"],
  Circlet: ["HP%", "ATK%", "DEF%", "CRIT Rate", "CRIT DMG", "Healing Bonus"],
};
const subs = ["HP", "ATK", "DEF", "HP%", "ATK%", "DEF%", "Energy Recharge", "Elemental Mastery", "CRIT Rate", "CRIT DMG"];

interface Art { set: string; slot: string; rarity: number; mainStat: string; substats: { name: string; value: string }[] }

function roll(set: string): Art {
  const slots = Object.keys(mains);
  const slot = slots[Math.floor(Math.random() * slots.length)];
  const ms = mains[slot];
  const main = ms[Math.floor(Math.random() * ms.length)];
  const pool = subs.filter((s) => s !== main && !main.startsWith(s));
  const n = Math.random() > 0.66 ? 4 : 3;
  const picked: { name: string; value: string }[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const s = pool.splice(idx, 1)[0];
    if (!s) break;
    const v = s.includes("%") || ["CRIT Rate", "CRIT DMG", "Energy Recharge"].includes(s)
      ? `${(Math.random() * 6 + 2.7).toFixed(1)}%` : `${Math.floor(Math.random() * 200 + 16)}`;
    picked.push({ name: s, value: v });
  }
  return { set, slot, rarity: Math.random() > 0.15 ? 5 : 4, mainStat: main, substats: picked };
}

const quips = [
  "Another day, another trash artifact. Welcome to Genshin.",
  "DEF% sends its regards.",
  "You could farm for a year and not see a good goblet.",
  "Copium levels: critical.",
  "The domain heard you wanted CRIT and chose violence.",
];

export default function SimulatorPage() {
  const [set, setSet] = useState(sets[0]);
  const [arts, setArts] = useState<Art[]>([]);
  const [resin, setResin] = useState(0);

  const doRoll = () => { setArts((p) => [roll(set), ...p]); setResin((p) => p + 20); };
  const reset = () => { setArts([]); setResin(0); };

  const good = arts.filter((a) => a.substats.some((s) => s.name === "CRIT Rate" || s.name === "CRIT DMG")).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Artifact Simulator</h1>

      <div className="guild-card p-5 flex flex-wrap items-center gap-4">
        <div>
          <label className="text-xs text-guild-muted block mb-1">Domain</label>
          <select value={set} onChange={(e) => setSet(e.target.value)} className="h-9 px-3 rounded-md bg-guild-elevated border border-white/5 text-sm">
            {sets.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={doRoll} className="h-9 px-5 rounded-md bg-guild-accent hover:bg-guild-accent/80 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer">
          <Dices className="h-4 w-4" /> Roll (20 Resin)
        </button>
        <button onClick={reset} className="h-9 px-4 rounded-md bg-guild-elevated hover:bg-white/10 text-sm flex items-center gap-2 transition-colors cursor-pointer">
          <RotateCcw className="h-4 w-4" /> Reset
        </button>
        <div className="ml-auto flex gap-6 text-sm">
          <span className="text-guild-muted">Resin: <span className="font-mono text-guild-gold">{resin}</span></span>
          <span className="text-guild-muted">Rolled: <span className="font-mono">{arts.length}</span></span>
          <span className="text-guild-muted">Good: <span className="font-mono text-guild-success">{good} ({arts.length ? ((good / arts.length) * 100).toFixed(1) : 0}%)</span></span>
        </div>
      </div>

      {arts.length > 0 && arts.length % 5 === 0 && (
        <div className="guild-card p-4" style={{ borderColor: "rgba(249,115,22,0.2)" }}>
          <p className="text-sm italic text-orange-400">💬 &quot;{quips[Math.floor(Math.random() * quips.length)]}&quot;</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {arts.slice(0, 20).map((a, i) => (
          <div key={i} className={cn("guild-card p-3 space-y-2", a.rarity === 5 ? "border-guild-gold/20" : "border-guild-accent-2/20")} style={{ borderWidth: 1 }}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-guild-muted">{a.slot}</span>
              <span className={cn("text-xs", a.rarity === 5 ? "text-guild-gold" : "text-guild-accent-2")}>{"★".repeat(a.rarity)}</span>
            </div>
            <div className="text-xs font-medium text-guild-gold">{a.mainStat}</div>
            <div className="space-y-0.5">
              {a.substats.map((s) => (
                <div key={s.name} className="text-[10px] text-guild-muted flex justify-between">
                  <span>{s.name}</span><span className="font-mono">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="text-[9px] text-guild-dim truncate">{a.set}</div>
          </div>
        ))}
      </div>

      {arts.length > 20 && <p className="text-sm text-guild-muted text-center">Showing last 20 of {arts.length}</p>}
    </div>
  );
}
