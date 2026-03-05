"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { ArrowLeft, Swords, TrendingUp, Sparkles, BookOpen } from "lucide-react";
import { WeaponDetail, MaterialItem } from "@/lib/yatta/client";
import { WeaponEntry } from "@/lib/weapons";
import { RARITY_COLORS, SUBSTAT_COLORS, weaponIconUrl } from "@/lib/constants";
import { RarityStars, MaterialCard } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Rarity-based gradients for hero background
const RARITY_HERO_BG: Record<number, string> = {
  5: "from-amber-950/80 via-amber-900/30 to-transparent",
  4: "from-purple-950/80 via-purple-900/30 to-transparent",
  3: "from-blue-950/80 via-blue-900/30 to-transparent",
};

const RARITY_GLOW: Record<number, string> = {
  5: "drop-shadow-[0_0_40px_rgba(245,158,11,0.3)]",
  4: "drop-shadow-[0_0_40px_rgba(168,85,247,0.25)]",
  3: "drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]",
};

// Extract numeric values from refinement descriptions for highlighting
function extractValues(desc: string): string[] {
  const matches = desc.match(/[\d.]+%?/g);
  return matches || [];
}

function highlightValues(desc: string, prevDesc?: string): React.ReactNode {
  if (!desc) return desc;

  const prevValues = prevDesc ? extractValues(prevDesc) : [];
  const result: React.ReactNode[] = [];
  let valueIdx = 0;

  const valueRegex = /[\d.]+%?/g;
  let match;
  let lastIndex = 0;

  while ((match = valueRegex.exec(desc)) !== null) {
    if (match.index > lastIndex) {
      result.push(desc.slice(lastIndex, match.index));
    }

    const val = match[0];
    const prevVal = prevValues[valueIdx];
    const changed = prevVal && prevVal !== val;

    result.push(
      <span
        key={match.index}
        className={cn("font-bold", changed ? "text-green-400" : "text-white")}
      >
        {val}
      </span>
    );

    lastIndex = match.index + match[0].length;
    valueIdx++;
  }

  if (lastIndex < desc.length) {
    result.push(desc.slice(lastIndex));
  }

  return result;
}

interface Props {
  detail: WeaponDetail;
  entry: WeaponEntry;
}

export function WeaponDetailClient({ detail, entry }: Props) {
  const [selectedRef, setSelectedRef] = useState(0);
  const colors = RARITY_COLORS[detail.rarity] || RARITY_COLORS[4];
  const substatColor = SUBSTAT_COLORS[detail.substat] || "text-gray-300";

  // Format substat value
  const isPercent = ["CRIT Rate", "CRIT DMG", "ATK%", "HP%", "DEF%", "Energy Recharge", "Physical DMG Bonus"].includes(detail.substat);
  const fmtSub = (v: number) => isPercent ? `${(v * 100).toFixed(1)}%` : Math.round(v).toString();

  return (
    <div className="space-y-6 pb-12">
      {/* Back nav */}
      <Link
        href="/weapons"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Weapons
      </Link>

      {/* Hero section - full-width with large weapon art */}
      <div className="relative rounded-xl overflow-hidden border border-white/5">
        {/* Background gradient based on rarity */}
        <div className={cn("absolute inset-0 bg-linear-to-r", RARITY_HERO_BG[detail.rarity] || RARITY_HERO_BG[4])} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.03),transparent_70%)]" />

        <div className="relative flex flex-col lg:flex-row items-center gap-6 p-6 lg:p-8">
          {/* Weapon art - large and prominent */}
          <div className="relative shrink-0 w-64 h-64 lg:w-80 lg:h-80">
            <div className={cn("absolute inset-0 flex items-center justify-center", RARITY_GLOW[detail.rarity])}>
              <Image
                src={weaponIconUrl(detail.id)}
                alt={detail.name}
                width={320}
                height={320}
                quality={95}
                className="object-contain"
                sizes="320px"
                priority
              />
            </div>
          </div>

          {/* Info section */}
          <div className="flex-1 space-y-5 text-center lg:text-left">
            {/* Type + name */}
            <div>
              <Badge variant="outline" className={cn("mb-2 text-xs", colors.text, colors.border, colors.bg)}>
                {detail.type}
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">{detail.name}</h1>
              <div className="mt-1.5 flex items-center justify-center lg:justify-start">
                <RarityStars rarity={detail.rarity} size="md" />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
              {/* Base ATK */}
              {detail.baseAtk > 0 ? (
                <Card className={cn("bg-black/30 backdrop-blur-sm border-white/5 border-l-2", colors.border)}>
                  <CardContent className="p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Swords className={cn("h-4 w-4", colors.text)} />
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Base ATK</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{detail.baseAtkMax}</span>
                      <span className="text-xs text-gray-500">at Lv 90</span>
                    </div>
                    <span className="text-[11px] text-gray-500">Lv 1: {detail.baseAtk}</span>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-black/30 backdrop-blur-sm border-white/5 col-span-full">
                  <CardContent className="p-3.5">
                    <p className="text-gray-500 text-sm italic">Natlan morph weapon — stats inherited from the base form.</p>
                  </CardContent>
                </Card>
              )}

              {/* Substat */}
              {detail.substat !== "None" && detail.substatValue > 0 && (
                <Card className={cn("bg-black/30 backdrop-blur-sm border-white/5 border-l-2", colors.border)}>
                  <CardContent className="p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <TrendingUp className={cn("h-4 w-4", substatColor)} />
                      <span className={cn("text-xs uppercase tracking-wide", substatColor)}>{detail.substat}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className={cn("text-2xl font-bold", substatColor)}>{fmtSub(detail.substatValueMax)}</span>
                      <span className="text-xs text-gray-500">at Lv 90</span>
                    </div>
                    <span className="text-[11px] text-gray-500">Lv 1: {fmtSub(detail.substatValue)}</span>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Passive ability preview */}
            {detail.passiveName && (
              <div className="space-y-2 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2 justify-center lg:justify-start">
                  <Sparkles className={cn("h-4 w-4", colors.text)} />
                  <span className={cn("font-semibold text-base", colors.text)}>{detail.passiveName}</span>
                </div>
                {detail.passiveDesc && (
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {highlightValues(detail.passiveDesc)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <Tabs defaultValue="refinements" className="w-full">
        <TabsList className="w-full bg-guild-card border border-white/5">
          {detail.refinements.length > 0 && (
            <TabsTrigger value="refinements" className="flex-1 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Refinements
            </TabsTrigger>
          )}
          <TabsTrigger value="materials" className="flex-1 gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="lore" className="flex-1 gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Lore
          </TabsTrigger>
        </TabsList>

        {/* Refinements Tab */}
        <TabsContent value="refinements">
          {detail.refinements.length > 0 ? (
            <div className="guild-card p-6 space-y-5">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles className={cn("h-5 w-5", colors.text)} />
                {detail.passiveName}
              </h2>

              {/* Refinement selector */}
              <div className="flex gap-2">
                {detail.refinements.map((r) => (
                  <button
                    key={r.rank}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-semibold transition-all border",
                      selectedRef === r.rank - 1
                        ? cn(colors.bg, colors.text, colors.border)
                        : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-transparent"
                    )}
                    onClick={() => setSelectedRef(r.rank - 1)}
                  >
                    R{r.rank}
                  </button>
                ))}
              </div>

              {/* Current refinement description */}
              <div className={cn("p-5 rounded-lg border", colors.bg, colors.border)}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn("text-sm font-bold", colors.text)}>Refinement {selectedRef + 1}</span>
                  {selectedRef > 0 && (
                    <Badge variant="outline" className="text-green-400 bg-green-500/10 border-green-500/20 text-xs">
                      Upgraded values shown in green
                    </Badge>
                  )}
                </div>
                <p className="text-base text-gray-200 leading-relaxed">
                  {highlightValues(
                    detail.refinements[selectedRef]?.description || "",
                    selectedRef > 0 ? detail.refinements[selectedRef - 1]?.description : undefined
                  )}
                </p>
              </div>

              {/* All refinements comparison - always visible */}
              <div className="space-y-1.5">
                <p className="text-sm text-gray-400 font-medium mb-3">All Refinement Levels</p>
                {detail.refinements.map((r, i) => (
                  <button
                    key={r.rank}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border transition-all",
                      selectedRef === i
                        ? cn(colors.bg, colors.border)
                        : "bg-black/20 border-white/5 hover:border-white/10"
                    )}
                    onClick={() => setSelectedRef(i)}
                  >
                    <span className={cn("font-bold mr-3 text-sm", selectedRef === i ? colors.text : "text-gray-500")}>
                      R{r.rank}
                    </span>
                    <span className="text-sm text-gray-300 leading-relaxed">
                      {highlightValues(r.description, i > 0 ? detail.refinements[i - 1]?.description : undefined)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="guild-card p-8 text-center">
              <Sparkles className="h-8 w-8 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-base">This weapon has no passive ability.</p>
            </div>
          )}
        </TabsContent>

        {/* Materials Tab */}
        <TabsContent value="materials">
          <WeaponMaterialsTab detail={detail} colors={colors} />
        </TabsContent>

        {/* Lore Tab */}
        <TabsContent value="lore">
          <div className="guild-card p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <BookOpen className={cn("h-5 w-5", colors.text)} />
              Weapon Story
            </h2>

            {/* Info grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <InfoItem label="Weapon Type" value={detail.type} />
              <InfoItem label="Rarity" value={`${detail.rarity}-Star`} />
              {detail.baseAtk > 0 && (
                <InfoItem label="Base ATK" value={`${detail.baseAtk} → ${detail.baseAtkMax}`} />
              )}
              {detail.substat !== "None" && (
                <InfoItem label="Substat" value={detail.substat} />
              )}
              {detail.passiveName && (
                <InfoItem label="Passive" value={detail.passiveName} />
              )}
              <InfoItem label="Weapon ID" value={String(entry.id)} />
            </div>

            {/* Lore description */}
            {detail.description && (
              <blockquote className={cn("border-l-2 pl-4 py-2", colors.border)}>
                <p className="text-base text-gray-300 leading-relaxed italic whitespace-pre-line">
                  {detail.description}
                </p>
              </blockquote>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/20 rounded-lg p-3 border border-white/5">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-white">{value}</p>
    </div>
  );
}

// ── Materials Tab ────────────────────────────────────────────────────

const WEAPON_ASCENSION_LEVELS = [20, 40, 50, 60, 70, 80, 90];

function weaponLevelToPhaseIdx(lv: number): number {
  let idx = 0;
  for (const bp of WEAPON_ASCENSION_LEVELS) {
    if (lv <= bp) break;
    idx++;
  }
  return idx;
}

function WeaponMaterialsTab({ detail, colors }: { detail: WeaponDetail; colors: { text: string; bg: string; border: string; star: string } }) {
  const [range, setRange] = useState<[number, number]>([1, 90]);

  const fromPhase = weaponLevelToPhaseIdx(range[0]);
  const toPhase = weaponLevelToPhaseIdx(range[1]);

  const materials: MaterialItem[] = (() => {
    const merged: Record<string, MaterialItem> = {};
    for (let i = fromPhase; i < toPhase; i++) {
      if (!detail.ascensionMaterials[i]) continue;
      for (const item of detail.ascensionMaterials[i].items) {
        if (merged[item.id]) {
          merged[item.id] = { ...merged[item.id], count: merged[item.id].count + item.count };
        } else {
          merged[item.id] = { ...item };
        }
      }
    }
    return Object.values(merged).sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));
  })();

  const MORA = [10000, 20000, 30000, 45000, 55000, 65000];
  const mora = MORA.slice(fromPhase, toPhase).reduce((a, b) => a + b, 0);

  return (
    <div className="guild-card p-6 space-y-5">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <TrendingUp className={cn("h-5 w-5", colors.text)} />
        Ascension Materials
      </h2>

      {/* Level range selector */}
      <div className="bg-black/20 rounded-lg p-5 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 font-medium">Level Range</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={range[1]}
              value={range[0]}
              onChange={(e) => {
                const v = Math.max(1, Math.min(range[1], Number(e.target.value) || 1));
                setRange([v, range[1]]);
              }}
              className="w-14 text-center text-sm font-bold bg-white/5 border border-white/10 rounded-md py-1.5 text-white focus:outline-none focus:border-guild-accent"
            />
            <span className="text-gray-500 text-sm font-medium">→</span>
            <input
              type="number"
              min={range[0]}
              max={90}
              value={range[1]}
              onChange={(e) => {
                const v = Math.max(range[0], Math.min(90, Number(e.target.value) || 90));
                setRange([range[0], v]);
              }}
              className="w-14 text-center text-sm font-bold bg-white/5 border border-white/10 rounded-md py-1.5 text-white focus:outline-none focus:border-guild-accent"
            />
          </div>
        </div>

        <SliderPrimitive.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={range}
          onValueChange={(v) => setRange(v as [number, number])}
          min={1}
          max={90}
          step={1}
          minStepsBetweenThumbs={1}
        >
          <SliderPrimitive.Track className="relative h-1.5 grow rounded-full bg-white/10">
            <SliderPrimitive.Range className={cn("absolute h-full rounded-full", colors.bg.replace("/20", "/60"))} />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className={cn(
              "block w-5 h-5 rounded-full border-2 border-white shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors cursor-grab active:cursor-grabbing",
              colors.bg.replace("/20", "")
            )}
            aria-label="From level"
          />
          <SliderPrimitive.Thumb
            className={cn(
              "block w-5 h-5 rounded-full border-2 border-white shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20 transition-colors cursor-grab active:cursor-grabbing",
              colors.bg.replace("/20", "")
            )}
            aria-label="To level"
          />
        </SliderPrimitive.Root>

        <div className="relative h-4 -mt-2">
          {[1, ...WEAPON_ASCENSION_LEVELS].map((lv) => {
            const pct = ((lv - 1) / 89) * 100;
            const isInRange = lv >= range[0] && lv <= range[1];
            return (
              <button
                key={lv}
                onClick={() => {
                  const distFrom = Math.abs(lv - range[0]);
                  const distTo = Math.abs(lv - range[1]);
                  if (distFrom <= distTo && lv < range[1]) setRange([lv, range[1]]);
                  else if (lv > range[0]) setRange([range[0], lv]);
                }}
                className={cn(
                  "absolute text-[10px] -translate-x-1/2 transition-colors cursor-pointer hover:text-white",
                  isInRange ? "text-white/70" : "text-white/20"
                )}
                style={{ left: `${pct}%` }}
              >
                {lv}
              </button>
            );
          })}
        </div>
      </div>

      {/* Materials display */}
      {range[0] === range[1] ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">Drag the slider to see materials needed.</p>
        </div>
      ) : materials.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-white flex items-center gap-2">
              Lv {range[0]} → {range[1]}
            </p>
            {mora > 0 && (
              <Badge variant="outline" className="text-yellow-400 bg-yellow-500/10 border-yellow-500/20 font-medium">
                {mora.toLocaleString()} Mora
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-4 justify-start">
            {materials.map((item) => (
              <MaterialCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No ascension materials needed for this range.</p>
        </div>
      )}
    </div>
  );
}
