"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Shield, AlertTriangle, Swords, Trophy, Info, ChevronRight, Flame, Zap, BarChart3, Users, TrendingUp } from "lucide-react";
import type { AbyssRatesData, AbyssCharacterRate } from "@/app/api/abyss/route";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ElementBadge } from "@/components/shared";
import { ALL_CHARACTERS, charIconUrl } from "@/lib/characters";
import { ELEMENT_COLORS } from "@/lib/constants";
import {
  ABYSS_FLOORS,
  ABYSS_VERSION,
  ABYSS_CYCLE,
  RECOMMENDED_TEAMS,
  STYGIAN_STAGES,
  STYGIAN_VERSION,
  STYGIAN_CYCLE,
  type AbyssFloor,
  type AbyssBoss,
  type AbyssEnemy,
  type TeamComp,
  type StygianStage,
} from "@/data/abyss";

// ── Helpers ──────────────────────────────────────────────────────────────

function findCharacterId(name: string): string | null {
  const char = ALL_CHARACTERS.find((c) => c.name === name);
  return char?.id ?? null;
}

const ELEMENT_BAR_COLORS: Record<string, string> = {
  Pyro: "bg-red-500",
  Hydro: "bg-blue-500",
  Electro: "bg-purple-500",
  Cryo: "bg-cyan-400",
  Anemo: "bg-teal-400",
  Geo: "bg-yellow-500",
  Dendro: "bg-green-500",
};

const ARCHETYPE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Vaporize: { text: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30" },
  "Overloaded/Vape": { text: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" },
  "Hydro Hypercarry": { text: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30" },
  "Pyro Hypercarry": { text: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30" },
  Spread: { text: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30" },
  Freeze: { text: "text-cyan-300", bg: "bg-cyan-500/20", border: "border-cyan-500/30" },
  "Anemo DPS": { text: "text-teal-300", bg: "bg-teal-500/20", border: "border-teal-500/30" },
  "Electro Hypercarry": { text: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30" },
  "Geo Resonance": { text: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" },
  "Burgeon/Burning": { text: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30" },
  Aggravate: { text: "text-violet-400", bg: "bg-violet-500/20", border: "border-violet-500/30" },
};

// ── Enemy Row ────────────────────────────────────────────────────────────

function EnemyRow({ enemy }: { enemy: AbyssEnemy }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/3 hover:bg-white/6 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn(
          "w-2 h-2 rounded-full shrink-0",
          enemy.element ? (ELEMENT_BAR_COLORS[enemy.element] ?? "bg-gray-500") : "bg-gray-600"
        )} />
        <span className="text-sm text-foreground truncate">{enemy.name}</span>
        {enemy.element && <ElementBadge element={enemy.element} showIcon className="text-[10px] shrink-0" />}
      </div>
      {enemy.hp && (
        <span className="text-xs text-guild-muted ml-2 shrink-0 font-mono">{enemy.hp} HP</span>
      )}
    </div>
  );
}

// ── Chamber Card ─────────────────────────────────────────────────────────

function ChamberCard({ chamber }: { chamber: { chamber: number; firstHalf: AbyssEnemy[]; secondHalf: AbyssEnemy[]; tips?: string } }) {
  return (
    <Card className="bg-guild-card border-guild-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Swords className="h-4 w-4 text-guild-accent" />
          Chamber {chamber.chamber}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Half */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-medium text-blue-400 uppercase tracking-wider">First Half</span>
            </div>
            <div className="space-y-1">
              {chamber.firstHalf.map((enemy, i) => (
                <EnemyRow key={i} enemy={enemy} />
              ))}
            </div>
          </div>

          {/* Second Half */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-medium text-red-400 uppercase tracking-wider">Second Half</span>
            </div>
            <div className="space-y-1">
              {chamber.secondHalf.map((enemy, i) => (
                <EnemyRow key={i} enemy={enemy} />
              ))}
            </div>
          </div>
        </div>

        {chamber.tips && (
          <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-300/90">{chamber.tips}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Boss Mechanics ───────────────────────────────────────────────────────

function BossCard({ boss }: { boss: AbyssBoss }) {
  const maxResistance = Math.max(...boss.resistances.map((r) => r.value));
  const [imgError, setImgError] = useState(false);

  return (
    <Card className="bg-guild-card border-guild-border overflow-hidden">
      {/* Boss Image Banner */}
      {boss.image && !imgError && (
        <div className="relative aspect-[2/1] w-full bg-black/20">
          <Image
            src={boss.image}
            alt={boss.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-guild-card via-guild-card/40 to-transparent" />
        </div>
      )}

      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-guild-accent" />
            <span>{boss.name}</span>
          </div>
          <Badge variant="outline" className="text-guild-muted font-mono">{boss.hp} HP</Badge>
        </CardTitle>
        {boss.description && (
          <p className="text-sm text-guild-muted leading-relaxed mt-1">{boss.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Resistance Chart */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-guild-muted">Elemental Resistances</h4>
          <div className="space-y-2">
            {boss.resistances.map((res) => {
              const barColor = ELEMENT_BAR_COLORS[res.element] ?? "bg-gray-500";
              const isHigh = res.value >= 50;
              const widthPercent = Math.max((res.value / maxResistance) * 100, 8);
              const elemColors = ELEMENT_COLORS[res.element];

              return (
                <div key={res.element} className="flex items-center gap-3">
                  <span className={cn("text-xs w-16 text-right shrink-0", elemColors?.text ?? "text-gray-400")}>
                    {res.element}
                  </span>
                  <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isHigh ? "bg-red-500/80" : barColor
                      )}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-mono w-10 shrink-0",
                    isHigh ? "text-red-400 font-bold" : "text-guild-muted"
                  )}>
                    {res.value}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-guild-muted">Weaknesses</h4>
          <div className="flex flex-wrap gap-2">
            {boss.weaknesses.map((w) => (
              <Badge key={w} variant="outline" className="text-green-400 bg-green-500/10 border-green-500/20">
                {w}
              </Badge>
            ))}
          </div>
        </div>

        {/* Strategy Tips */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-guild-muted">Strategy Tips</h4>
          <ul className="space-y-1.5">
            {boss.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <Info className="h-3.5 w-3.5 text-guild-accent mt-0.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Floor Tab Content ────────────────────────────────────────────────────

function FloorContent({ floor }: { floor: AbyssFloor }) {
  return (
    <div className="space-y-6">
      {/* Ley Line Disorder */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-guild-accent/10 border border-guild-accent/20">
        <div className="p-2 rounded-lg bg-guild-accent/20 shrink-0">
          <Shield className="h-4 w-4 text-guild-accent" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-guild-accent mb-1">Ley Line Disorder</h3>
          <p className="text-sm text-foreground/80">{floor.disorder}</p>
        </div>
      </div>

      {/* Recommended Elements */}
      {(() => {
        const elements = new Set<string>();
        for (const ch of floor.chambers) {
          for (const e of [...ch.firstHalf, ...ch.secondHalf]) {
            if (e.element) elements.add(e.element);
          }
        }
        const counters: Record<string, string[]> = {
          Pyro: ["Hydro"],
          Hydro: ["Electro", "Cryo", "Dendro"],
          Electro: ["Pyro", "Cryo"],
          Cryo: ["Pyro"],
          Dendro: ["Pyro"],
          Geo: ["Geo", "Claymore" as string],
        };
        const recommended = new Set<string>();
        for (const el of elements) {
          for (const counter of (counters[el] || [])) {
            recommended.add(counter);
          }
        }
        if (recommended.size === 0) return null;
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-guild-muted font-medium">Bring:</span>
            {[...recommended].map((el) => (
              <Badge key={el} variant="outline" className={cn(
                "text-[10px]",
                ELEMENT_COLORS[el]?.text ?? "text-gray-400",
                ELEMENT_COLORS[el]?.bg ?? "bg-gray-500/10",
              )}>
                {el}
              </Badge>
            ))}
          </div>
        );
      })()}

      {/* Chambers */}
      <div className="space-y-4">
        {floor.chambers.map((ch) => (
          <ChamberCard key={ch.chamber} chamber={ch} />
        ))}
      </div>

      {/* Boss Mechanics (Floor 12) */}
      {floor.bosses && floor.bosses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-guild-gold" />
            Boss Mechanics
          </h3>
          {floor.bosses.map((boss) => (
            <BossCard key={boss.name} boss={boss} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Team Card ────────────────────────────────────────────────────────────

function TeamCard({ team }: { team: TeamComp }) {
  const archetypeColors = ARCHETYPE_COLORS[team.archetype];
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <Card className="bg-guild-card border-guild-border hover:border-guild-accent/30 transition-all">
      <CardContent className="p-4 space-y-3">
        {/* Team Name + Archetype */}
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold truncate">{team.name}</h4>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] shrink-0",
              archetypeColors
                ? `${archetypeColors.text} ${archetypeColors.bg} ${archetypeColors.border}`
                : "text-guild-muted"
            )}
          >
            {team.archetype}
          </Badge>
        </div>

        {/* Character Icons */}
        <div className="flex items-center gap-2">
          {team.characters.map((charName) => {
            const charId = findCharacterId(charName);
            const hasError = charId ? imgErrors[charId] : true;

            return (
              <div
                key={charName}
                className="relative w-12 h-12 rounded-full bg-white/5 border border-white/10 overflow-hidden shrink-0"
              >
                {charId && !hasError ? (
                  <Image
                    src={charIconUrl(charId)}
                    alt={charName}
                    fill
                    sizes="48px"
                    className="object-cover"
                    onError={() => setImgErrors((prev) => ({ ...prev, [charId]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-guild-muted font-medium">
                    {charName.charAt(0)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Usage + Clear Rate */}
        <div className="space-y-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-guild-muted">Usage Rate</span>
              <span className="font-mono text-foreground">{team.usage}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-guild-accent rounded-full transition-all duration-500"
                style={{ width: `${team.usage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-guild-muted">Clear Rate</span>
            <span className={cn(
              "font-mono font-semibold",
              team.clearRate >= 97 ? "text-green-400" : team.clearRate >= 93 ? "text-yellow-400" : "text-red-400"
            )}>
              {team.clearRate}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Stygian Stage Card ──────────────────────────────────────────────────

const MODIFIER_COLORS = {
  buff: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: "text-green-400" },
  debuff: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: "text-red-400" },
  mechanic: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "text-yellow-400" },
} as const;

function StygianStageCard({ stage }: { stage: StygianStage }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="bg-guild-card border-guild-border hover:border-red-500/20 transition-all">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20 text-red-400 text-sm font-bold">
              {stage.stage}
            </div>
            <span>{stage.name}</span>
          </div>
          <ChevronRight className={cn("h-5 w-5 text-guild-muted transition-transform", expanded && "rotate-90")} />
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-5 pt-0">
          {/* Modifiers */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-guild-muted flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Active Modifiers
            </h4>
            <div className="space-y-2">
              {stage.modifiers.map((mod) => {
                const colors = MODIFIER_COLORS[mod.type];
                return (
                  <div key={mod.name} className={cn("p-3 rounded-lg border", colors.bg, colors.border)}>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={cn("text-[10px] uppercase", colors.text, colors.border)}>
                        {mod.type}
                      </Badge>
                      <span className={cn("text-sm font-semibold", colors.text)}>{mod.name}</span>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed">{mod.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Enemies */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-guild-muted">Enemies</h4>
            <div className="space-y-1">
              {stage.enemies.map((enemy, i) => (
                <EnemyRow key={i} enemy={enemy} />
              ))}
            </div>
          </div>

          {/* Boss Mechanics */}
          {stage.boss && <BossCard boss={stage.boss} />}

          {/* Tips */}
          {stage.tips && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-300/90">{stage.tips}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── Usage Rates (Live from AZA.GG) ──────────────────────────────────────

function UsageRatesSection() {
  const [data, setData] = useState<AbyssRatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rateType, setRateType] = useState<"pickRate" | "ownRate" | "useByOwnRate">("pickRate");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/abyss")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
        <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
        <p className="text-sm text-red-300">Failed to load usage data from AZA.GG</p>
      </div>
    );
  }

  const sorted = [...data.characters].sort((a, b) => b[rateType] - a[rateType]);
  const top = sorted.filter((c) => c[rateType] > 0).slice(0, 50);

  const rateLabels: Record<string, string> = {
    pickRate: "Pick Rate",
    ownRate: "Ownership",
    useByOwnRate: "Use/Own",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-guild-accent" />
          Character Usage Rates
        </h2>
        <div className="flex items-center gap-2 text-xs text-guild-muted">
          <Users className="h-3.5 w-3.5" />
          {data.sampleSize.toLocaleString()} players sampled
        </div>
      </div>

      {/* Rate type toggle */}
      <div className="flex gap-1.5">
        {(["pickRate", "ownRate", "useByOwnRate"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setRateType(type)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
              rateType === type
                ? "bg-guild-accent/20 text-guild-accent border border-guild-accent/30"
                : "bg-white/5 text-guild-dim hover:text-white hover:bg-white/10 border border-transparent"
            )}
          >
            {rateLabels[type]}
          </button>
        ))}
      </div>

      {/* Rate list */}
      <div className="space-y-1">
        {top.map((char, i) => {
          const charEntry = ALL_CHARACTERS.find((c) => c.id === char.id);
          const rate = char[rateType];
          const maxRate = top[0]?.[rateType] || 1;
          const barWidth = Math.max((rate / maxRate) * 100, 2);
          const hasImgError = char.id ? imgErrors[char.id] : true;

          return (
            <div
              key={char.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/3 transition-colors group"
            >
              {/* Rank */}
              <span className={cn(
                "text-xs font-mono w-6 text-right shrink-0",
                i === 0 ? "text-guild-gold font-bold" : i < 3 ? "text-guild-accent" : "text-guild-dim"
              )}>
                {i + 1}
              </span>

              {/* Icon */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-guild-elevated shrink-0 border border-white/5">
                {charEntry && !hasImgError ? (
                  <Image
                    src={charIconUrl(charEntry.id)}
                    alt={char.name}
                    width={32}
                    height={32}
                    className="object-cover"
                    onError={() => setImgErrors((prev) => ({ ...prev, [char.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-guild-muted">
                    {char.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Name */}
              <span className="text-sm font-medium w-32 truncate shrink-0">
                {char.name}
              </span>

              {/* Bar */}
              <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    i === 0 ? "bg-guild-gold/70" : i < 3 ? "bg-guild-accent/60" : "bg-guild-accent/30"
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Rate */}
              <span className={cn(
                "text-sm font-mono w-14 text-right shrink-0",
                i === 0 ? "text-guild-gold font-bold" : "text-foreground"
              )}>
                {rate}%
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-guild-dim text-right">
        Data from AZA.GG · Updated {new Date(data.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────

export default function AbyssPage() {
  const sortedTeams = [...RECOMMENDED_TEAMS].sort((a, b) => b.usage - a.usage);
  const [mode, setMode] = useState<"abyss" | "stygian">("abyss");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Endgame Guide</h1>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setMode("abyss")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all border",
              mode === "abyss"
                ? "bg-guild-accent/20 text-guild-accent border-guild-accent/30"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-transparent"
            )}
          >
            <Shield className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            Spiral Abyss
          </button>
          <button
            onClick={() => setMode("stygian")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all border",
              mode === "stygian"
                ? "bg-red-500/20 text-red-400 border-red-500/30"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-transparent"
            )}
          >
            <Flame className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            Stygian Onslaught
          </button>
        </div>
      </div>

      {mode === "abyss" ? (
        <>
          {/* Abyss version info */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-guild-accent/20 text-guild-accent border border-guild-accent/30">
              {ABYSS_VERSION}
            </Badge>
            <span className="text-guild-muted text-sm">{ABYSS_CYCLE}</span>
          </div>

          {/* Floor Tabs */}
          <Tabs defaultValue="12">
            <TabsList className="w-full md:w-auto">
              {ABYSS_FLOORS.map((f) => (
                <TabsTrigger key={f.floor} value={String(f.floor)} className="flex-1 md:flex-initial">
                  Floor {f.floor}
                </TabsTrigger>
              ))}
            </TabsList>

            {ABYSS_FLOORS.map((f) => (
              <TabsContent key={f.floor} value={String(f.floor)} className="mt-6">
                <FloorContent floor={f} />
              </TabsContent>
            ))}
          </Tabs>

          {/* Recommended Teams */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-guild-gold" />
              Top Teams
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTeams.map((team) => (
                <TeamCard key={team.name} team={team} />
              ))}
            </div>
          </div>

          {/* Live Usage Rates */}
          <UsageRatesSection />
        </>
      ) : (
        <>
          {/* Stygian version info */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
              v{STYGIAN_VERSION}
            </Badge>
            <span className="text-guild-muted text-sm">{STYGIAN_CYCLE}</span>
          </div>

          <p className="text-sm text-guild-muted leading-relaxed max-w-2xl">
            Stygian Onslaught is a roguelike endgame mode with unique modifiers per stage.
            Plan your team around the active buffs and debuffs for maximum efficiency.
          </p>

          {/* Stygian Stages */}
          <div className="space-y-4">
            {STYGIAN_STAGES.map((stage) => (
              <StygianStageCard key={stage.stage} stage={stage} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
