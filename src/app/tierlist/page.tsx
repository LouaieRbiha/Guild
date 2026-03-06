"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ALL_CHARACTERS, charIconUrl } from "@/lib/characters";
import type { CharacterEntry, Tier, Role, TierEntry } from "@/types";
import { ELEMENT_ICONS } from "@/components/icons/genshin-icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, BarChart3, TrendingUp } from "lucide-react";
import type { AbyssRatesData, AbyssCharacterRate } from "@/app/api/abyss/route";
import type { StygianRatesData, StygianCharacterRate } from "@/app/api/abyss/stygian/route";
import {
  TIER_LIST,
  TIER_COLORS,
  TIER_ORDER,
} from "@/data/tier-list";

// ── Constants ─────────────────────────────────────────────────────────

type DataSource = "combined" | "abyss" | "stygian";

const ALL_ROLES: ("All" | Role)[] = ["All", "Main DPS", "Sub DPS", "Support", "Healer"];

const ROLE_COLORS: Record<Role, string> = {
  "Main DPS": "bg-red-500/20 text-red-300 border-red-500/30",
  "Sub DPS": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Support: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Healer: "bg-green-500/20 text-green-300 border-green-500/30",
};

const SOURCE_LABELS: Record<DataSource, string> = {
  combined: "Abyss + Stygian",
  abyss: "Abyss Only",
  stygian: "Stygian Only",
};

// ── Lookups ───────────────────────────────────────────────────────────

const CHAR_BY_NAME = new Map<string, CharacterEntry>();
const CHAR_BY_ID = new Map<string, CharacterEntry>();
for (const c of ALL_CHARACTERS) {
  CHAR_BY_NAME.set(c.name, c);
  CHAR_BY_ID.set(c.id, c);
}

const ROLE_BY_NAME = new Map<string, Role[]>();
for (const entry of TIER_LIST) {
  ROLE_BY_NAME.set(entry.name, entry.roles);
}

// ── Tier derivation from usage rates ─────────────────────────────────

interface RankedChar {
  id: string;
  name: string;
  score: number; // combined usage score
  abyssRate: number;
  stygianRate: number;
  roles: Role[];
  tier: Tier;
}

function deriveTier(rank: number, total: number): Tier {
  const pct = rank / total;
  if (pct <= 0.06) return "SS";
  if (pct <= 0.18) return "S";
  if (pct <= 0.40) return "A";
  if (pct <= 0.72) return "B";
  return "C";
}

function buildRankedList(
  abyssData: AbyssRatesData | null,
  stygianData: StygianRatesData | null,
  source: DataSource,
): RankedChar[] {
  const abyssMap = new Map<string, AbyssCharacterRate>();
  if (abyssData) {
    for (const c of abyssData.characters) {
      abyssMap.set(c.id, c);
    }
  }

  const stygianMap = new Map<string, StygianCharacterRate>();
  if (stygianData?.overall) {
    for (const c of stygianData.overall) {
      stygianMap.set(c.id, c);
    }
  }

  // Collect all character IDs that appear in either dataset
  const allIds = new Set<string>();
  for (const id of abyssMap.keys()) allIds.add(id);
  for (const id of stygianMap.keys()) allIds.add(id);

  const entries: RankedChar[] = [];
  for (const id of allIds) {
    const char = CHAR_BY_ID.get(id);
    if (!char) continue;

    const abyss = abyssMap.get(id);
    const stygian = stygianMap.get(id);

    const abyssRate = abyss?.pickRate ?? 0;
    const stygianRate = stygian?.pickRate ?? 0;

    let score: number;
    if (source === "abyss") {
      score = abyssRate;
    } else if (source === "stygian") {
      score = stygianRate;
    } else {
      // Combined: weight abyss 60%, stygian 40%
      const hasAbyss = abyss != null;
      const hasStygian = stygian != null;
      if (hasAbyss && hasStygian) {
        score = abyssRate * 0.6 + stygianRate * 0.4;
      } else if (hasAbyss) {
        score = abyssRate;
      } else {
        score = stygianRate;
      }
    }

    const roles = ROLE_BY_NAME.get(char.name) ?? [];

    entries.push({
      id,
      name: char.name,
      score,
      abyssRate,
      stygianRate,
      roles,
      tier: "C", // placeholder, will be set after sorting
    });
  }

  // Sort by score descending
  entries.sort((a, b) => b.score - a.score);

  // Assign tiers based on rank
  for (let i = 0; i < entries.length; i++) {
    entries[i].tier = deriveTier(i, entries.length);
  }

  return entries;
}

// ── Component ─────────────────────────────────────────────────────────

export default function TierListPage() {
  const [roleFilter, setRoleFilter] = useState<"All" | Role>("All");
  const [source, setSource] = useState<DataSource>("combined");

  const swrFetcher = (url: string) => fetch(url).then((r) => r.json()).then((d) => {
    if (d.error) throw new Error(d.error);
    return d;
  });

  const { data: abyssData, isLoading: abyssLoading } = useSWR<AbyssRatesData>(
    "/api/abyss", swrFetcher, { refreshInterval: 5 * 60 * 1000 }
  );
  const { data: stygianData, isLoading: stygianLoading } = useSWR<StygianRatesData>(
    "/api/abyss/stygian", swrFetcher, { refreshInterval: 5 * 60 * 1000 }
  );
  const loading = abyssLoading || stygianLoading;

  const ranked = useMemo(
    () => buildRankedList(abyssData ?? null, stygianData ?? null, source),
    [abyssData, stygianData, source],
  );

  // Filter by role
  const filtered = useMemo(() => {
    if (roleFilter === "All") return ranked;
    return ranked.filter((entry) => entry.roles.includes(roleFilter));
  }, [ranked, roleFilter]);

  // Group by tier
  const grouped = useMemo(() => {
    const map = new Map<Tier, RankedChar[]>();
    for (const tier of TIER_ORDER) {
      map.set(tier, []);
    }
    for (const entry of filtered) {
      map.get(entry.tier)?.push(entry);
    }
    return map;
  }, [filtered]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3">
        <Loader2 className="h-6 w-6 text-guild-accent animate-spin" />
        <p className="text-sm text-guild-muted">Loading usage rate data...</p>
      </div>
    );
  }

  const hasData = abyssData != null || stygianData != null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold">Tier List</h1>
          <p className="text-sm text-guild-muted mt-1 flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            {hasData ? (
              <>Based on live usage rates &middot; {filtered.length} characters</>
            ) : (
              <>{filtered.length} characters</>
            )}
          </p>
        </div>
        {abyssData?.sampleSize && (
          <span className="text-xs text-guild-dim">
            {abyssData.sampleSize.toLocaleString()} players sampled
          </span>
        )}
      </div>

      {/* Data source + Role Filter */}
      <Card className="p-4 gap-3">
        {hasData && (
          <div>
            <p className="text-sm font-medium text-guild-muted mb-2">Data source</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SOURCE_LABELS) as DataSource[]).map((src) => {
                const disabled = (src === "abyss" && !abyssData) || (src === "stygian" && !stygianData);
                return (
                  <Badge
                    key={src}
                    onClick={() => !disabled && setSource(src)}
                    className={cn(
                      "cursor-pointer transition-all select-none",
                      disabled && "opacity-40 cursor-not-allowed",
                      source === src
                        ? "bg-guild-accent/15 text-guild-accent border-guild-accent/30"
                        : "bg-guild-elevated text-guild-muted border-transparent hover:bg-guild-elevated/80",
                    )}
                  >
                    {SOURCE_LABELS[src]}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-guild-muted mb-2">Filter by role</p>
          <div className="flex flex-wrap gap-2">
            {ALL_ROLES.map((role) => (
              <Badge
                key={role}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "cursor-pointer transition-all select-none",
                  roleFilter === role
                    ? role === "All"
                      ? "bg-guild-accent/15 text-guild-accent border-guild-border/30"
                      : ROLE_COLORS[role]
                    : "bg-guild-elevated text-guild-muted border-transparent hover:bg-guild-elevated/80"
                )}
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Tier Rows */}
      <div className="space-y-3">
        {TIER_ORDER.map((tier) => {
          const entries = grouped.get(tier) || [];
          if (entries.length === 0) return null;
          const colors = TIER_COLORS[tier];

          return (
            <div
              key={tier}
              className={cn(
                "flex rounded-xl border overflow-hidden",
                colors.border
              )}
            >
              {/* Tier Label */}
              <div
                className={cn(
                  "flex items-center justify-center shrink-0 w-16 sm:w-20",
                  colors.bg
                )}
              >
                <span
                  className={cn(
                    "text-2xl sm:text-3xl font-black",
                    colors.text
                  )}
                >
                  {tier}
                </span>
              </div>

              {/* Characters */}
              <div className="flex-1 flex flex-wrap gap-2 p-3 bg-guild-card/50">
                {entries.map((entry) => {
                  const char = CHAR_BY_NAME.get(entry.name);
                  if (!char) return null;
                  const EI = ELEMENT_ICONS[char.element];

                  return (
                    <Link
                      key={entry.name}
                      href={`/database/${char.id}`}
                      className="group"
                    >
                      <div
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg p-2 w-[72px] sm:w-[80px] transition-colors",
                          "bg-guild-elevated/50 hover:bg-guild-elevated border border-transparent hover:border-guild-border"
                        )}
                        title={`${entry.name} — Pick rate: ${entry.score.toFixed(1)}%`}
                      >
                        {/* Icon */}
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-guild-elevated/50">
                          <Image
                            src={charIconUrl(char.id)}
                            alt={char.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                            quality={100}
                          />
                          {EI && (
                            <div className="absolute bottom-0 right-0 bg-black/70 rounded-full p-0.5">
                              <EI size={12} />
                            </div>
                          )}
                        </div>

                        {/* Name */}
                        <p className="text-[10px] sm:text-xs font-medium text-center text-foreground/90 leading-tight line-clamp-2 w-full">
                          {char.name}
                        </p>

                        {/* Usage rate */}
                        <div className="flex items-center gap-0.5">
                          <TrendingUp className="h-2.5 w-2.5 text-guild-dim" />
                          <span className="text-[9px] sm:text-[10px] text-guild-dim font-mono">
                            {entry.score.toFixed(1)}%
                          </span>
                        </div>

                        {/* Role badges */}
                        {entry.roles.length > 0 && (
                          <div className="flex flex-wrap justify-center gap-0.5">
                            {entry.roles.map((role) => (
                              <span
                                key={role}
                                className={cn(
                                  "text-[8px] sm:text-[9px] px-1 py-px rounded-sm font-medium leading-tight",
                                  ROLE_COLORS[role]
                                )}
                              >
                                {role === "Main DPS"
                                  ? "DPS"
                                  : role === "Sub DPS"
                                    ? "Sub"
                                    : role === "Support"
                                      ? "Sup"
                                      : "Heal"}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-lg text-muted-foreground">
            No characters match this filter.
          </p>
          <Badge
            onClick={() => setRoleFilter("All")}
            className="cursor-pointer bg-guild-accent/15 text-guild-accent border-guild-border/30"
          >
            Show All
          </Badge>
        </div>
      )}
    </div>
  );
}
