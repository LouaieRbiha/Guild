"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ALL_CHARACTERS,
  charIconUrl,
  charGachaUrl,
} from "@/lib/characters";
import type { CharacterEntry, Tier, TierEntry } from "@/types";
import { ELEMENT_COLORS } from "@/lib/constants";
import { ELEMENT_ICONS } from "@/components/icons/genshin-icons";
import { CHARACTER_BUILDS } from "@/data/character-builds";
import {
  TIER_LIST,
  TIER_COLORS,
} from "@/data/tier-list";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ElementBadge } from "@/components/shared/element-badge";
import { RarityStars } from "@/components/shared/rarity-stars";
import { FallbackImage } from "@/components/shared/fallback-image";
import { Search, X, Swords, ArrowRightLeft, Users, Target, Shield, Gem, BarChart3 } from "lucide-react";

// ── Lookups ─────────────────────────────────────────────────────────

const TIER_MAP = new Map<string, TierEntry>();
for (const entry of TIER_LIST) {
  TIER_MAP.set(entry.name, entry);
}

const TIER_RANK: Record<Tier, number> = { SS: 0, S: 1, A: 2, B: 3, C: 4 };

function compareTiers(a: Tier | undefined, b: Tier | undefined): "better" | "worse" | "same" {
  if (!a || !b) return "same";
  const diff = TIER_RANK[a] - TIER_RANK[b];
  if (diff < 0) return "better";
  if (diff > 0) return "worse";
  return "same";
}

const COMPARE_COLORS = {
  better: "text-green-400",
  worse: "text-red-400",
  same: "text-foreground",
} as const;

// ── Character Selector ──────────────────────────────────────────────

function CharacterSelector({
  selected,
  onSelect,
  otherSelected,
  side,
}: {
  selected: CharacterEntry | null;
  onSelect: (c: CharacterEntry | null) => void;
  otherSelected: CharacterEntry | null;
  side: "left" | "right";
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return ALL_CHARACTERS;
    const q = query.toLowerCase();
    return ALL_CHARACTERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.element.toLowerCase().includes(q) ||
        c.weapon.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const elementColors = selected ? ELEMENT_COLORS[selected.element] : null;

  return (
    <div className="flex-1 min-w-0" ref={containerRef}>
      <div
        className={cn(
          "guild-card rounded-xl overflow-hidden border transition-colors",
          elementColors ? elementColors.border : "border-guild-border/20",
        )}
      >
        {/* Gacha art background header */}
        <div className="relative h-48 sm:h-56 overflow-hidden bg-guild-elevated/50">
          {selected && (
            <Image
              src={charGachaUrl(selected.id)}
              alt={selected.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-top opacity-15"
              quality={80}
            />
          )}

          {/* Top accent bar */}
          {elementColors && (
            <div
              className={cn(
                "absolute top-0 left-0 right-0 h-1",
                elementColors.bg,
              )}
            />
          )}

          {/* Content overlay */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 gap-3">
            {selected ? (
              <>
                <div className="relative">
                  <FallbackImage
                    src={charIconUrl(selected.id)}
                    alt={selected.name}
                    width={72}
                    height={72}
                    className="rounded-full border-2 border-white/10"
                  />
                  <button
                    onClick={() => {
                      onSelect(null);
                      setQuery("");
                    }}
                    className="absolute -top-1 -right-1 bg-red-500/80 hover:bg-red-500 rounded-full p-0.5 transition-colors"
                    aria-label="Clear selection"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="text-lg font-bold">{selected.name}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <ElementBadge element={selected.element} />
                    <Badge variant="outline" className="text-guild-muted border-guild-border/30">
                      {selected.weapon}
                    </Badge>
                  </div>
                  <RarityStars rarity={selected.rarity} size="sm" className="justify-center" />
                </div>
              </>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-guild-elevated/80 flex items-center justify-center mx-auto border border-dashed border-guild-border/30">
                  <Search className="h-6 w-6 text-guild-dim" />
                </div>
                <p className="text-sm text-guild-muted">
                  Select {side === "left" ? "first" : "second"} character
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search input */}
        <div className="p-3 border-t border-guild-border/10">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-guild-dim" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search character..."
              className="pl-8 h-8 text-sm"
            />
          </div>

          {/* Dropdown */}
          {open && (
            <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-guild-border/20 bg-guild-card">
              {filtered.length === 0 ? (
                <p className="p-3 text-xs text-guild-dim text-center">No characters found</p>
              ) : (
                filtered.map((c) => {
                  const isOther = otherSelected?.id === c.id;
                  const isCurrent = selected?.id === c.id;
                  const EI = ELEMENT_ICONS[c.element];
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        if (!isOther) {
                          onSelect(c);
                          setQuery("");
                          setOpen(false);
                        }
                      }}
                      disabled={isOther}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
                        "hover:bg-guild-elevated/80",
                        isOther && "opacity-30 cursor-not-allowed",
                        isCurrent && "bg-guild-elevated",
                      )}
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-guild-elevated/50 shrink-0">
                        <Image
                          src={charIconUrl(c.id)}
                          alt={c.name}
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                        {EI && (
                          <div className="absolute bottom-0 right-0 bg-black/70 rounded-full p-px">
                            <EI size={9} />
                          </div>
                        )}
                      </div>
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="ml-auto text-[10px] text-guild-dim shrink-0">
                        {c.rarity === 5 ? "★★★★★" : "★★★★"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Comparison Section ──────────────────────────────────────────────

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-guild-accent" />
      <h3 className="text-sm font-semibold uppercase tracking-wider text-guild-muted">{title}</h3>
    </div>
  );
}

function CompareRow({
  label,
  left,
  right,
  highlight,
  even,
}: {
  label: string;
  left: React.ReactNode;
  right: React.ReactNode;
  highlight?: { left: "better" | "worse" | "same"; right: "better" | "worse" | "same" };
  even: boolean;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[1fr,auto,1fr] gap-2 sm:gap-4 py-2.5 px-3 rounded-lg items-start",
        even && "bg-guild-elevated/30",
      )}
    >
      <div className={cn("text-sm", highlight ? COMPARE_COLORS[highlight.left] : "")}>
        {left}
      </div>
      <div className="text-xs text-guild-dim font-medium self-center whitespace-nowrap min-w-[60px] sm:min-w-[80px] text-center">
        {label}
      </div>
      <div className={cn("text-sm text-right", highlight ? COMPARE_COLORS[highlight.right] : "")}>
        {right}
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  const colors = TIER_COLORS[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2.5 py-0.5 rounded-md font-bold text-sm",
        colors.bg,
        colors.text,
        colors.border,
        "border",
      )}
    >
      {tier}
    </span>
  );
}

function TeamComp({ team }: { team: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {team.map((name, i) => {
        const char = ALL_CHARACTERS.find((c) => c.name === name);
        if (!char) {
          return (
            <span key={i} className="text-xs text-guild-dim bg-guild-elevated/50 rounded px-1.5 py-0.5">
              {name}
            </span>
          );
        }
        const elemColors = ELEMENT_COLORS[char.element];
        return (
          <span
            key={i}
            className={cn(
              "inline-flex items-center gap-1 text-xs rounded px-1.5 py-0.5 border",
              elemColors?.bg,
              elemColors?.text,
              elemColors?.border,
            )}
          >
            {name}
          </span>
        );
      })}
    </div>
  );
}

// ── Comparison Panel ────────────────────────────────────────────────

function ComparisonPanel({
  charA,
  charB,
}: {
  charA: CharacterEntry;
  charB: CharacterEntry;
}) {
  const buildA = CHARACTER_BUILDS[charA.name];
  const buildB = CHARACTER_BUILDS[charB.name];
  const tierA = TIER_MAP.get(charA.name);
  const tierB = TIER_MAP.get(charB.name);

  const tierCompareLeft = compareTiers(tierA?.tier, tierB?.tier);
  const tierCompareRight = compareTiers(tierB?.tier, tierA?.tier);

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="guild-card rounded-xl p-4 sm:p-6">
        <SectionHeader icon={Target} title="Basic Info" />
        <div className="space-y-0.5">
          <CompareRow
            label="Element"
            left={<ElementBadge element={charA.element} />}
            right={<span className="flex justify-end"><ElementBadge element={charB.element} /></span>}
            even={false}
          />
          <CompareRow
            label="Weapon"
            left={charA.weapon}
            right={charB.weapon}
            even={true}
          />
          <CompareRow
            label="Rarity"
            left={<RarityStars rarity={charA.rarity} size="sm" />}
            right={<RarityStars rarity={charB.rarity} size="sm" className="justify-end" />}
            even={false}
          />
          <CompareRow
            label="Release"
            left={<span className="text-guild-muted">{charA.release}</span>}
            right={<span className="text-guild-muted">{charB.release}</span>}
            even={true}
          />
        </div>
      </div>

      {/* Tier Ranking */}
      <div className="guild-card rounded-xl p-4 sm:p-6">
        <SectionHeader icon={BarChart3} title="Tier Ranking" />
        <div className="space-y-0.5">
          <CompareRow
            label="Tier"
            left={tierA ? <TierBadge tier={tierA.tier} /> : <span className="text-guild-dim">N/A</span>}
            right={
              <span className="flex justify-end">
                {tierB ? <TierBadge tier={tierB.tier} /> : <span className="text-guild-dim">N/A</span>}
              </span>
            }
            highlight={{ left: tierCompareLeft, right: tierCompareRight }}
            even={false}
          />
          <CompareRow
            label="Roles"
            left={
              tierA ? (
                <div className="flex flex-wrap gap-1">
                  {tierA.roles.map((r) => (
                    <Badge key={r} variant="outline" className="text-xs text-guild-muted border-guild-border/30">
                      {r}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-guild-dim">N/A</span>
              )
            }
            right={
              tierB ? (
                <div className="flex flex-wrap gap-1 justify-end">
                  {tierB.roles.map((r) => (
                    <Badge key={r} variant="outline" className="text-xs text-guild-muted border-guild-border/30">
                      {r}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-guild-dim">N/A</span>
              )
            }
            even={true}
          />
          {(tierA?.notes || tierB?.notes) && (
            <CompareRow
              label="Notes"
              left={<span className="text-guild-dim text-xs italic">{tierA?.notes ?? "--"}</span>}
              right={<span className="text-guild-dim text-xs italic">{tierB?.notes ?? "--"}</span>}
              even={false}
            />
          )}
        </div>
      </div>

      {/* Recommended Build */}
      {(buildA || buildB) && (
        <div className="guild-card rounded-xl p-4 sm:p-6">
          <SectionHeader icon={Shield} title="Recommended Build" />
          <div className="space-y-0.5">
            <CompareRow
              label="Artifact Sets"
              left={
                buildA ? (
                  <div className="space-y-0.5">
                    {buildA.artifactSets.map((s) => (
                      <p key={s} className="text-xs">{s}</p>
                    ))}
                  </div>
                ) : (
                  <span className="text-guild-dim text-xs">No build data</span>
                )
              }
              right={
                buildB ? (
                  <div className="space-y-0.5">
                    {buildB.artifactSets.map((s) => (
                      <p key={s} className="text-xs">{s}</p>
                    ))}
                  </div>
                ) : (
                  <span className="text-guild-dim text-xs">No build data</span>
                )
              }
              even={false}
            />
            <CompareRow
              label="Sands"
              left={buildA ? <span className="text-xs">{buildA.mainStats.sands}</span> : <span className="text-guild-dim text-xs">--</span>}
              right={buildB ? <span className="text-xs">{buildB.mainStats.sands}</span> : <span className="text-guild-dim text-xs">--</span>}
              even={true}
            />
            <CompareRow
              label="Goblet"
              left={buildA ? <span className="text-xs">{buildA.mainStats.goblet}</span> : <span className="text-guild-dim text-xs">--</span>}
              right={buildB ? <span className="text-xs">{buildB.mainStats.goblet}</span> : <span className="text-guild-dim text-xs">--</span>}
              even={false}
            />
            <CompareRow
              label="Circlet"
              left={buildA ? <span className="text-xs">{buildA.mainStats.circlet}</span> : <span className="text-guild-dim text-xs">--</span>}
              right={buildB ? <span className="text-xs">{buildB.mainStats.circlet}</span> : <span className="text-guild-dim text-xs">--</span>}
              even={true}
            />
          </div>
        </div>
      )}

      {/* Substat Priority */}
      {(buildA || buildB) && (
        <div className="guild-card rounded-xl p-4 sm:p-6">
          <SectionHeader icon={Gem} title="Substat Priority" />
          <div className="grid grid-cols-[1fr,auto,1fr] gap-2 sm:gap-4">
            <div className="space-y-1.5">
              {buildA ? (
                buildA.substats.map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-guild-dim font-mono w-4 shrink-0">{i + 1}.</span>
                    <span className="text-xs">{s}</span>
                  </div>
                ))
              ) : (
                <span className="text-guild-dim text-xs">No build data</span>
              )}
            </div>
            <div className="flex items-center">
              <div className="w-px h-full bg-guild-border/20" />
            </div>
            <div className="space-y-1.5">
              {buildB ? (
                buildB.substats.map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs">{s}</span>
                    <span className="text-[10px] text-guild-dim font-mono w-4 shrink-0 text-right">{i + 1}.</span>
                  </div>
                ))
              ) : (
                <span className="text-guild-dim text-xs text-right">No build data</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Comps */}
      {(buildA || buildB) && (
        <div className="guild-card rounded-xl p-4 sm:p-6">
          <SectionHeader icon={Users} title="Team Comps" />
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-guild-muted mb-2">{charA.name}</p>
              {buildA ? (
                buildA.teams.map((team, i) => (
                  <div key={i} className={cn("p-2.5 rounded-lg", i % 2 === 0 ? "bg-guild-elevated/30" : "")}>
                    <p className="text-[10px] text-guild-dim mb-1.5 font-medium">Team {i + 1}</p>
                    <TeamComp team={team} />
                  </div>
                ))
              ) : (
                <span className="text-guild-dim text-xs">No team data</span>
              )}
            </div>
            <div className="hidden sm:flex items-center">
              <div className="w-px h-full bg-guild-border/20" />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-guild-muted mb-2">{charB.name}</p>
              {buildB ? (
                buildB.teams.map((team, i) => (
                  <div key={i} className={cn("p-2.5 rounded-lg", i % 2 === 0 ? "bg-guild-elevated/30" : "")}>
                    <p className="text-[10px] text-guild-dim mb-1.5 font-medium">Team {i + 1}</p>
                    <TeamComp team={team} />
                  </div>
                ))
              ) : (
                <span className="text-guild-dim text-xs">No team data</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No build data message */}
      {!buildA && !buildB && (
        <div className="guild-card rounded-xl p-8 text-center">
          <p className="text-sm text-guild-muted">
            No build data available for either character.
          </p>
          <p className="text-xs text-guild-dim mt-1">
            Build recommendations are only available for a curated set of characters.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function ComparePage() {
  const [charA, setCharA] = useState<CharacterEntry | null>(null);
  const [charB, setCharB] = useState<CharacterEntry | null>(null);

  const handleSwap = () => {
    setCharA(charB);
    setCharB(charA);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Character Comparison</h1>
        <p className="text-sm text-guild-muted mt-1 flex items-center gap-1.5">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Compare builds, tiers, and team comps side by side
        </p>
      </div>

      {/* Character Selectors */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch">
        <CharacterSelector
          selected={charA}
          onSelect={setCharA}
          otherSelected={charB}
          side="left"
        />

        {/* Swap button */}
        <div className="flex items-center justify-center sm:self-center shrink-0">
          <button
            onClick={handleSwap}
            disabled={!charA && !charB}
            className={cn(
              "p-2.5 rounded-full border transition-all",
              charA || charB
                ? "border-guild-accent/30 bg-guild-accent/10 hover:bg-guild-accent/20 text-guild-accent cursor-pointer"
                : "border-guild-border/20 bg-guild-elevated/30 text-guild-dim cursor-not-allowed",
            )}
            aria-label="Swap characters"
          >
            <ArrowRightLeft className="h-4 w-4 sm:rotate-0 rotate-90" />
          </button>
        </div>

        <CharacterSelector
          selected={charB}
          onSelect={setCharB}
          otherSelected={charA}
          side="right"
        />
      </div>

      {/* Comparison Content */}
      {charA && charB ? (
        <ComparisonPanel charA={charA} charB={charB} />
      ) : (
        <div className="guild-card rounded-xl p-12 text-center space-y-3">
          <Swords className="h-10 w-10 text-guild-dim mx-auto" />
          <p className="text-guild-muted">
            Select two characters above to compare their builds, tier rankings, and team compositions.
          </p>
        </div>
      )}
    </div>
  );
}
