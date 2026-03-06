"use client";

import { useState, useMemo, useCallback } from "react";
import { Calculator, Info, Zap, Swords, Shield, Flame, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────

type ReactionType =
  | "none"
  | "vaporize_1.5"
  | "vaporize_2.0"
  | "melt_1.5"
  | "melt_2.0"
  | "aggravate"
  | "spread";

interface CalcInputs {
  baseAtk: number;
  skillMultiplier: number;
  critRate: number;
  critDmg: number;
  dmgBonus: number;
  charLevel: number;
  enemyLevel: number;
  enemyRes: number;
  defReduction: number;
  reaction: ReactionType;
  em: number;
}

interface CalcResults {
  nonCrit: number;
  crit: number;
  average: number;
  nonCritReaction: number;
  critReaction: number;
  averageReaction: number;
  reactionMultiplier: number;
}

// ── Reaction Data ────────────────────────────────────────────────────────

const REACTION_OPTIONS: { value: ReactionType; label: string; group?: string }[] = [
  { value: "none", label: "None (1x)" },
  { value: "vaporize_2.0", label: "Vaporize (2x) - Pyro on Hydro", group: "Amplifying" },
  { value: "vaporize_1.5", label: "Vaporize (1.5x) - Hydro on Pyro", group: "Amplifying" },
  { value: "melt_2.0", label: "Melt (2x) - Pyro on Cryo", group: "Amplifying" },
  { value: "melt_1.5", label: "Melt (1.5x) - Cryo on Pyro", group: "Amplifying" },
  { value: "aggravate", label: "Aggravate - Electro on Quicken", group: "Catalyze" },
  { value: "spread", label: "Spread - Dendro on Quicken", group: "Catalyze" },
];

// ── Damage Formulas ──────────────────────────────────────────────────────

function getDefMultiplier(charLevel: number, enemyLevel: number, defReduction: number): number {
  const charPart = charLevel + 100;
  const enemyPart = (enemyLevel + 100) * (1 - defReduction / 100);
  return charPart / (charPart + enemyPart);
}

function getResMultiplier(res: number): number {
  const r = res / 100;
  if (r < 0) return 1 - r / 2;
  if (r < 0.75) return 1 - r;
  return 1 / (4 * r + 1);
}

function getAmplifyingBonus(em: number): number {
  return (2.78 * em) / (em + 1400);
}

function getCatalyzeBaseBonus(em: number): number {
  return (5 * em) / (em + 1200);
}

// Level multiplier table (approximate for key levels)
function getLevelMultiplier(level: number): number {
  // Approximate values from the game data
  const table: Record<number, number> = {
    1: 17.17, 10: 35.89, 20: 71.40, 30: 113.20, 40: 162.99,
    50: 223.59, 60: 307.45, 70: 409.20, 80: 532.39, 90: 1446.85,
  };

  // Find the closest level
  const levels = Object.keys(table).map(Number).sort((a, b) => a - b);
  let lower = levels[0];
  let upper = levels[levels.length - 1];

  for (const l of levels) {
    if (l <= level) lower = l;
    if (l >= level && l <= upper) { upper = l; break; }
  }

  if (lower === upper) return table[lower];

  // Linear interpolation
  const t = (level - lower) / (upper - lower);
  return table[lower] + t * (table[upper] - table[lower]);
}

function calculateDamage(inputs: CalcInputs): CalcResults {
  const {
    baseAtk, skillMultiplier, critRate, critDmg,
    dmgBonus, charLevel, enemyLevel, enemyRes, defReduction,
    reaction, em,
  } = inputs;

  const defMul = getDefMultiplier(charLevel, enemyLevel, defReduction);
  const resMul = getResMultiplier(enemyRes);

  // Base damage before crit
  const baseDmg = baseAtk * (skillMultiplier / 100) * (1 + dmgBonus / 100) * defMul * resMul;

  const nonCrit = baseDmg;
  const crit = baseDmg * (1 + critDmg / 100);
  const clampedCritRate = Math.min(Math.max(critRate / 100, 0), 1);
  const average = nonCrit * (1 - clampedCritRate) + crit * clampedCritRate;

  // Reaction calculations
  let reactionMultiplier = 1;
  let flatDmgBonus = 0;

  if (reaction === "vaporize_1.5" || reaction === "melt_1.5") {
    reactionMultiplier = 1.5 * (1 + getAmplifyingBonus(em));
  } else if (reaction === "vaporize_2.0" || reaction === "melt_2.0") {
    reactionMultiplier = 2.0 * (1 + getAmplifyingBonus(em));
  } else if (reaction === "aggravate") {
    const levelMul = getLevelMultiplier(charLevel);
    flatDmgBonus = 1.15 * levelMul * (1 + getCatalyzeBaseBonus(em));
  } else if (reaction === "spread") {
    const levelMul = getLevelMultiplier(charLevel);
    flatDmgBonus = 1.25 * levelMul * (1 + getCatalyzeBaseBonus(em));
  }

  // For catalyze reactions, the flat bonus is added to the base before other multipliers
  let nonCritReaction: number;
  let critReaction: number;
  let averageReaction: number;

  if (reaction === "aggravate" || reaction === "spread") {
    const catalyzeDmg = (baseAtk * (skillMultiplier / 100) + flatDmgBonus) *
      (1 + dmgBonus / 100) * defMul * resMul;
    nonCritReaction = catalyzeDmg;
    critReaction = catalyzeDmg * (1 + critDmg / 100);
    averageReaction = nonCritReaction * (1 - clampedCritRate) + critReaction * clampedCritRate;
  } else {
    nonCritReaction = nonCrit * reactionMultiplier;
    critReaction = crit * reactionMultiplier;
    averageReaction = average * reactionMultiplier;
  }

  return {
    nonCrit,
    crit,
    average,
    nonCritReaction,
    critReaction,
    averageReaction,
    reactionMultiplier,
  };
}

// ── Input Field Component ────────────────────────────────────────────────

function CalcField({
  label,
  value,
  onChange,
  suffix,
  tooltip,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  tooltip?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-foreground/90">{label}</label>
        {tooltip && (
          <div className="group relative">
            <Info className="h-3.5 w-3.5 text-guild-dim cursor-help" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-guild-elevated border border-white/10 text-xs text-foreground/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          min={min}
          max={max}
          step={step ?? 1}
          className={cn(
            "h-10 w-full rounded-lg border border-white/10 bg-guild-elevated px-3 text-sm text-foreground",
            "outline-none transition-all",
            "focus:border-guild-accent focus:ring-1 focus:ring-guild-accent/50",
            "placeholder:text-guild-dim",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            suffix && "pr-10"
          )}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-guild-dim pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Result Card Component ────────────────────────────────────────────────

function ResultCard({
  label,
  value,
  color,
  icon,
  sub,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  sub?: string;
}) {
  return (
    <div className="rounded-xl bg-guild-card border border-white/5 p-5 space-y-2">
      <div className="flex items-center gap-2 text-sm text-guild-muted">
        {icon}
        {label}
      </div>
      <p className={cn("text-2xl md:text-3xl font-bold font-mono tracking-tight", color)}>
        {Math.round(value).toLocaleString()}
      </p>
      {sub && <p className="text-xs text-guild-dim">{sub}</p>}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<CalcInputs>({
    baseAtk: 2000,
    skillMultiplier: 300,
    critRate: 50,
    critDmg: 100,
    dmgBonus: 46.6,
    charLevel: 90,
    enemyLevel: 90,
    enemyRes: 10,
    defReduction: 0,
    reaction: "none",
    em: 0,
  });

  const update = useCallback(
    <K extends keyof CalcInputs>(key: K, value: CalcInputs[K]) => {
      setInputs((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const results = useMemo(() => calculateDamage(inputs), [inputs]);

  const hasReaction = inputs.reaction !== "none";
  const isCatalyze = inputs.reaction === "aggravate" || inputs.reaction === "spread";

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-xl bg-guild-accent/20">
            <Calculator className="h-6 w-6 text-guild-accent" />
          </div>
          Damage Calculator
        </h1>
        <p className="text-guild-muted text-sm max-w-xl leading-relaxed">
          Calculate expected damage using the full Genshin Impact damage formula
          including DEF, RES, reactions, and crit averaging.
        </p>
      </div>

      {/* ── Input Section ───────────────────────────────────────────────── */}
      <div className="rounded-xl bg-guild-card border border-white/5 p-6 space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Swords className="h-5 w-5 text-guild-accent" />
          Character Stats
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <CalcField
            label="Base ATK"
            value={inputs.baseAtk}
            onChange={(v) => update("baseAtk", v)}
            tooltip="Total ATK including weapon and artifact flat ATK"
            min={0}
          />
          <CalcField
            label="Talent / Skill Multiplier"
            value={inputs.skillMultiplier}
            onChange={(v) => update("skillMultiplier", v)}
            suffix="%"
            tooltip="The skill's damage multiplier from talent description"
            min={0}
          />
          <CalcField
            label="CRIT Rate"
            value={inputs.critRate}
            onChange={(v) => update("critRate", v)}
            suffix="%"
            tooltip="Clamped between 0% and 100% for calculations"
            min={0}
            max={100}
          />
          <CalcField
            label="CRIT DMG"
            value={inputs.critDmg}
            onChange={(v) => update("critDmg", v)}
            suffix="%"
            tooltip="Base 50% + weapon/artifact/ascension bonuses"
            min={0}
          />
          <CalcField
            label="Elemental / DMG Bonus"
            value={inputs.dmgBonus}
            onChange={(v) => update("dmgBonus", v)}
            suffix="%"
            tooltip="Sum of all DMG bonus sources (goblet, set bonus, etc.)"
            min={0}
          />
          <CalcField
            label="Elemental Mastery"
            value={inputs.em}
            onChange={(v) => update("em", v)}
            tooltip="Affects amplifying and catalyze reaction bonus"
            min={0}
          />
        </div>

        {/* Enemy Section */}
        <div className="border-t border-white/5 pt-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-400" />
            Enemy & Environment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <CalcField
              label="Character Level"
              value={inputs.charLevel}
              onChange={(v) => update("charLevel", v)}
              min={1}
              max={90}
            />
            <CalcField
              label="Enemy Level"
              value={inputs.enemyLevel}
              onChange={(v) => update("enemyLevel", v)}
              min={1}
              max={200}
            />
            <CalcField
              label="Enemy RES"
              value={inputs.enemyRes}
              onChange={(v) => update("enemyRes", v)}
              suffix="%"
              tooltip="Enemy elemental resistance (can be negative with shred)"
              min={-200}
              max={500}
            />
            <CalcField
              label="DEF Reduction"
              value={inputs.defReduction}
              onChange={(v) => update("defReduction", v)}
              suffix="%"
              tooltip="DEF shred from abilities like Raiden C2, Lisa A4, etc."
              min={0}
              max={100}
            />
          </div>
        </div>

        {/* Reaction Section */}
        <div className="border-t border-white/5 pt-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Elemental Reaction
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/90">Reaction Type</label>
              <select
                value={inputs.reaction}
                onChange={(e) => update("reaction", e.target.value as ReactionType)}
                className={cn(
                  "h-10 w-full rounded-lg border border-white/10 bg-guild-elevated px-3 text-sm text-foreground",
                  "outline-none transition-all cursor-pointer",
                  "focus:border-guild-accent focus:ring-1 focus:ring-guild-accent/50"
                )}
              >
                {REACTION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {hasReaction && (
              <div className="flex items-end">
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm",
                  isCatalyze
                    ? "bg-green-500/10 border border-green-500/20 text-green-400"
                    : "bg-orange-500/10 border border-orange-500/20 text-orange-400"
                )}>
                  {isCatalyze ? (
                    <Leaf className="h-4 w-4" />
                  ) : (
                    <Flame className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {isCatalyze
                      ? `Flat DMG bonus from EM: ${Math.round(
                          (inputs.reaction === "aggravate" ? 1.15 : 1.25) *
                            getLevelMultiplier(inputs.charLevel) *
                            (1 + getCatalyzeBaseBonus(inputs.em))
                        ).toLocaleString()}`
                      : `Reaction multiplier: ${results.reactionMultiplier.toFixed(3)}x`
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Results Section ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Calculated Damage</h2>

        {/* Base damage results */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ResultCard
            label="Non-Crit Hit"
            value={results.nonCrit}
            color="text-foreground"
            icon={<Swords className="h-4 w-4" />}
            sub="Without critical hit"
          />
          <ResultCard
            label="Crit Hit"
            value={results.crit}
            color="text-green-400"
            icon={<Zap className="h-4 w-4 text-green-400" />}
            sub={`${inputs.critDmg}% CRIT DMG applied`}
          />
          <ResultCard
            label="Average DMG"
            value={results.average}
            color="text-yellow-400"
            icon={<Calculator className="h-4 w-4 text-yellow-400" />}
            sub={`Weighted by ${Math.min(Math.max(inputs.critRate, 0), 100)}% CRIT Rate`}
          />
        </div>

        {/* Reaction damage results */}
        {hasReaction && (
          <>
            <h2 className="text-lg font-semibold flex items-center gap-2 pt-2">
              {isCatalyze ? (
                <Leaf className="h-5 w-5 text-green-400" />
              ) : (
                <Flame className="h-5 w-5 text-orange-400" />
              )}
              With Reaction
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard
                label="Non-Crit (Reaction)"
                value={results.nonCritReaction}
                color="text-foreground"
                icon={<Swords className="h-4 w-4" />}
                sub="Reaction hit without crit"
              />
              <ResultCard
                label="Crit (Reaction)"
                value={results.critReaction}
                color="text-green-400"
                icon={<Zap className="h-4 w-4 text-green-400" />}
                sub="Reaction hit with crit"
              />
              <ResultCard
                label="Average (Reaction)"
                value={results.averageReaction}
                color="text-yellow-400"
                icon={<Calculator className="h-4 w-4 text-yellow-400" />}
                sub="Crit-rate weighted with reaction"
              />
            </div>
          </>
        )}
      </div>

      {/* ── Formula Reference ───────────────────────────────────────────── */}
      <div className="rounded-xl bg-guild-card border border-white/5 p-6 space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Info className="h-5 w-5 text-guild-accent" />
          Formula Reference
        </h2>
        <div className="space-y-3 text-sm text-guild-muted">
          <div className="p-3 rounded-lg bg-white/3 font-mono text-xs leading-relaxed overflow-x-auto">
            <p>DMG = ATK x (Skill% / 100) x (1 + CritDMG%) x (1 + DMG Bonus%)</p>
            <p className="mt-1">{'     '}x DEF_Multiplier x RES_Multiplier x Reaction</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <p className="text-foreground/70 font-medium">DEF Multiplier</p>
              <p className="font-mono text-guild-dim">
                (CharLv + 100) / ((CharLv + 100) + (EnemyLv + 100) x (1 - DEF_Reduction%))
              </p>
              <p className="font-mono text-guild-accent">
                Current: {getDefMultiplier(inputs.charLevel, inputs.enemyLevel, inputs.defReduction).toFixed(4)}
              </p>
            </div>
            <div className="space-y-1.5">
              <p className="text-foreground/70 font-medium">RES Multiplier</p>
              <p className="font-mono text-guild-dim">
                {'RES < 0: 1 - RES/2 | 0 <= RES < 75%: 1 - RES | RES >= 75%: 1/(4*RES+1)'}
              </p>
              <p className="font-mono text-guild-accent">
                Current: {getResMultiplier(inputs.enemyRes).toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
