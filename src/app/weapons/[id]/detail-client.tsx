"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { WeaponDetail, MaterialGroup, MaterialItem } from "@/lib/yatta/client";
import { WeaponEntry } from "@/lib/weapons";
import { ENKA_UI } from "@/lib/characters";

const RARITY_COLORS: Record<number, { text: string; bg: string; border: string; star: string }> = {
  5: { text: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", star: "text-amber-400" },
  4: { text: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30", star: "text-purple-400" },
  3: { text: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", star: "text-blue-400" },
};

const SUBSTAT_COLORS: Record<string, string> = {
  "CRIT Rate": "text-red-400",
  "CRIT DMG": "text-orange-400",
  "ATK%": "text-yellow-300",
  "HP%": "text-green-400",
  "DEF%": "text-blue-300",
  "Energy Recharge": "text-cyan-300",
  "Elemental Mastery": "text-emerald-400",
  "Physical DMG Bonus": "text-gray-300",
};

const MAT_RARITY_BORDER: Record<number, string> = {
  1: "border-gray-600",
  2: "border-green-600",
  3: "border-blue-600",
  4: "border-purple-600",
  5: "border-amber-600",
};

// Extract numeric values from refinement descriptions for highlighting
function extractValues(desc: string): string[] {
  const matches = desc.match(/[\d.]+%?/g);
  return matches || [];
}

function highlightValues(desc: string, prevDesc?: string): React.ReactNode {
  if (!desc) return desc;

  const prevValues = prevDesc ? extractValues(prevDesc) : [];
  const currValues = extractValues(desc);

  // Replace values in text with highlighted spans
  let result: React.ReactNode[] = [];
  let remaining = desc;
  let valueIdx = 0;

  const valueRegex = /[\d.]+%?/g;
  let match;
  let lastIndex = 0;

  while ((match = valueRegex.exec(desc)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      result.push(desc.slice(lastIndex, match.index));
    }

    const val = match[0];
    const prevVal = prevValues[valueIdx];
    const changed = prevVal && prevVal !== val;

    result.push(
      <span
        key={match.index}
        className={`font-bold ${changed ? "text-green-400" : "text-white"}`}
      >
        {val}
        {changed && (
          <span className="text-green-500/70 text-xs ml-0.5">(was {prevVal})</span>
        )}
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
  const [activeTab, setActiveTab] = useState<"refinements" | "materials">("refinements");
  const colors = RARITY_COLORS[detail.rarity] || RARITY_COLORS[4];
  const rarityStars = "★".repeat(detail.rarity);
  const substatColor = SUBSTAT_COLORS[detail.substat] || "text-gray-300";

  // Format substat value
  const isPercent = ["CRIT Rate", "CRIT DMG", "ATK%", "HP%", "DEF%", "Energy Recharge", "Physical DMG Bonus"].includes(detail.substat);
  const fmtSub = (v: number) => isPercent ? `${(v * 100).toFixed(1)}%` : Math.round(v).toString();

  return (
    <div className="space-y-6 pb-12">
      {/* Back nav */}
      <Link
        href="/weapons"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        ← Back to Weapons
      </Link>

      {/* Hero section */}
      <div className="guild-card p-0 overflow-hidden">
        <div className="relative flex flex-col md:flex-row">
          {/* Weapon art */}
          <div className={`relative w-full md:w-80 h-80 md:h-auto ${colors.bg} flex-shrink-0 flex items-center justify-center`}>
            <Image
              src={`${ENKA_UI}/${detail.icon}.png`}
              alt={detail.name}
              width={280}
              height={280}
              className="object-contain drop-shadow-2xl"
              unoptimized
            />
          </div>

          {/* Info */}
          <div className="relative flex-1 p-6 space-y-5">
            {/* Title */}
            <div>
              <p className="text-sm text-gray-400 font-medium mb-1">{detail.type}</p>
              <h1 className="text-3xl font-bold text-white">{detail.name}</h1>
              <div className={`text-lg mt-1 ${colors.star}`}>{rarityStars}</div>
            </div>

            {/* Stats — stacked in one column */}
            <div className="space-y-3">
              {/* Base ATK */}
              {detail.baseAtk > 0 ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04]">
                <span className="text-gray-400 text-sm">Base ATK</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-gray-500 text-xs">Lv 1: {detail.baseAtk}</span>
                  <span className="text-gray-500">→</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-white font-bold text-xl">{detail.baseAtkMax}</span>
                    <span className="text-gray-500 text-xs">Lv 90</span>
                  </div>
                </div>
              </div>
              ) : (
              <div className="p-3 rounded-lg bg-white/[0.04]">
                <p className="text-gray-500 text-sm italic">This is a Natlan morph weapon — stats are inherited from the base form.</p>
              </div>
              )}

              {/* Substat */}
              {detail.substat !== "None" && detail.substatValue > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.04]">
                  <span className={`text-sm ${substatColor}`}>{detail.substat}</span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-gray-500 text-xs">Lv 1: {fmtSub(detail.substatValue)}</span>
                    <span className="text-gray-500">→</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`font-bold text-xl ${substatColor}`}>{fmtSub(detail.substatValueMax)}</span>
                      <span className="text-gray-500 text-xs">Lv 90</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Passive */}
            {detail.passiveName && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${colors.text}`}>◆</span>
                  <span className={`font-semibold text-base ${colors.text}`}>{detail.passiveName}</span>
                </div>
                {detail.passiveDesc && (
                  <p className="text-sm text-gray-300 leading-relaxed pl-5">
                    {detail.passiveDesc}
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="pt-3 border-t border-white/10">
              <p className="text-base text-gray-400 leading-relaxed italic">
                {detail.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-[#0D1117] rounded-lg p-1">
        {(["refinements", "materials"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? `${colors.bg} ${colors.text} ${colors.border} border`
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "refinements" && detail.refinements.length > 0 && (
        <div className="guild-card p-6 space-y-5">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <span className={colors.text}>◆</span> Refinements — {detail.passiveName}
          </h2>

          {/* Refinement selector */}
          <div className="flex gap-2">
            {detail.refinements.map((r) => (
              <button
                key={r.rank}
                onClick={() => setSelectedRef(r.rank - 1)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedRef === r.rank - 1
                    ? `${colors.bg} ${colors.text} ${colors.border} border-2`
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border-2 border-transparent"
                }`}
              >
                R{r.rank}
              </button>
            ))}
          </div>

          {/* Current refinement with highlighted values */}
          <div className={`p-5 rounded-lg ${colors.bg} ${colors.border} border`}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-bold ${colors.text}`}>Refinement {selectedRef + 1}</span>
              {selectedRef > 0 && (
                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded">
                  ↑ Upgraded values highlighted
                </span>
              )}
            </div>
            <p className="text-base text-gray-200 leading-relaxed">
              {highlightValues(
                detail.refinements[selectedRef]?.description || "",
                selectedRef > 0 ? detail.refinements[selectedRef - 1]?.description : undefined
              )}
            </p>
          </div>

          {/* All refinements comparison */}
          <details className="text-sm">
            <summary className="text-gray-400 cursor-pointer hover:text-gray-200 transition-colors font-medium">
              ▸ Compare all refinement levels
            </summary>
            <div className="mt-4 space-y-2">
              {detail.refinements.map((r, i) => (
                <div
                  key={r.rank}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedRef === i
                      ? `${colors.bg} ${colors.border}`
                      : "bg-black/20 border-white/5 hover:border-white/10"
                  }`}
                  onClick={() => setSelectedRef(i)}
                >
                  <span className={`font-bold ${colors.text} mr-3`}>R{r.rank}</span>
                  <span className="text-gray-300">
                    {highlightValues(r.description, i > 0 ? detail.refinements[i - 1]?.description : undefined)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {activeTab === "refinements" && detail.refinements.length === 0 && (
        <div className="guild-card p-6 text-center text-gray-500 text-base">
          This weapon has no passive ability.
        </div>
      )}

      {activeTab === "materials" && <WeaponMaterialsTab detail={detail} colors={colors} />}
    </div>
  );
}

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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <span className={colors.text}>⬆</span> Ascension Materials
      </h2>

      <div className="guild-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Weapon Level</span>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={range[1]}
              value={range[0]}
              onChange={(e) => {
                const v = Math.max(1, Math.min(range[1], Number(e.target.value) || 1));
                setRange([v, range[1]]);
              }}
              className="w-14 text-center text-sm font-bold bg-white/5 border border-white/10 rounded-md py-1 text-white focus:outline-none focus:border-guild-accent"
            />
            <span className="text-gray-500 text-sm">→</span>
            <input
              type="number"
              min={range[0]}
              max={90}
              value={range[1]}
              onChange={(e) => {
                const v = Math.max(range[0], Math.min(90, Number(e.target.value) || 90));
                setRange([range[0], v]);
              }}
              className="w-14 text-center text-sm font-bold bg-white/5 border border-white/10 rounded-md py-1 text-white focus:outline-none focus:border-guild-accent"
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
            <SliderPrimitive.Range className="absolute h-full rounded-full bg-guild-accent/60" />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className="block w-5 h-5 rounded-full bg-guild-accent border-2 border-white shadow-lg shadow-guild-accent/30 hover:bg-guild-accent/90 focus:outline-none focus:ring-2 focus:ring-guild-accent/50 transition-colors cursor-grab active:cursor-grabbing"
            aria-label="From level"
          />
          <SliderPrimitive.Thumb
            className="block w-5 h-5 rounded-full bg-guild-accent border-2 border-white shadow-lg shadow-guild-accent/30 hover:bg-guild-accent/90 focus:outline-none focus:ring-2 focus:ring-guild-accent/50 transition-colors cursor-grab active:cursor-grabbing"
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
                className={`absolute text-[10px] -translate-x-1/2 transition-colors cursor-pointer ${isInRange ? 'text-white/70' : 'text-white/20'} hover:text-white`}
                style={{ left: `${pct}%` }}
              >
                {lv}
              </button>
            );
          })}
        </div>
      </div>

      {range[0] === range[1] ? (
        <p className="text-gray-500 text-sm">Drag the slider to see materials needed.</p>
      ) : materials.length > 0 ? (
        <div className="guild-card p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-base font-semibold text-white">
              Lv {range[0]} → {range[1]}
            </p>
            {mora > 0 && (
              <span className="text-sm text-yellow-400 font-medium">
                💰 {mora.toLocaleString()} Mora
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 justify-start">
            {materials.map((item) => {
              const RARITY_BG: Record<number, string> = {
                1: "bg-gray-700/60", 2: "bg-green-900/40", 3: "bg-blue-900/40",
                4: "bg-purple-900/40", 5: "bg-amber-900/40",
              };
              return (
                <div key={item.id} className="group relative flex flex-col items-center" title={item.name}>
                  <div className={`relative w-[72px] h-[72px] rounded-xl border-2 ${MAT_RARITY_BORDER[item.rarity] || "border-gray-600"} ${RARITY_BG[item.rarity] || "bg-black/30"} overflow-hidden transition-transform group-hover:scale-105`}>
                    {item.icon ? (
                      <Image
                        src={`https://gi.yatta.moe/assets/UI/${item.icon}.png`}
                        alt={item.name}
                        fill
                        className="object-contain p-1.5"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">?</div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-center py-0.5">
                      <span className="text-xs font-bold text-white">{item.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 text-center leading-tight max-w-[72px] truncate">{item.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No ascension materials needed for this range.</p>
      )}
    </div>
  );
}
