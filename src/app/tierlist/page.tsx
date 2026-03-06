"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import useSWR from "swr";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ALL_CHARACTERS, charIconUrl } from "@/lib/characters";
import type { CharacterEntry, Tier, Role } from "@/types";
import { ELEMENT_ICONS } from "@/components/icons/genshin-icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, BarChart3, TrendingUp, RotateCcw } from "lucide-react";
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

const CUSTOM_TIERLIST_KEY = "guild-custom-tierlist";

interface CustomTierData {
  tiers: Record<string, Tier>;     // charId -> custom tier
  order: Record<string, string[]>; // tier -> ordered charId[]
}

const PLACEHOLDER_COLORS: Record<Tier, { border: string; bg: string }> = {
  SS: { border: "border-red-400", bg: "bg-red-500/10" },
  S: { border: "border-orange-400", bg: "bg-orange-500/10" },
  A: { border: "border-purple-400", bg: "bg-purple-500/10" },
  B: { border: "border-blue-400", bg: "bg-blue-500/10" },
  C: { border: "border-gray-400", bg: "bg-gray-500/10" },
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

  // ── Drag-and-drop state ─────────────────────────────────────────────
  const [customData, setCustomData] = useState<CustomTierData>({ tiers: {}, order: {} });
  const [draggedCharId, setDraggedCharId] = useState<string | null>(null);
  const [dragOverTier, setDragOverTier] = useState<Tier | null>(null);
  const [dropIndex, setDropIndex] = useState<number>(-1);
  const dragCardRef = useRef<HTMLDivElement | null>(null);

  // Load custom data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_TIERLIST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old format (plain Record<string, Tier>) to new format
        if (parsed && !parsed.tiers && !parsed.order) {
          setCustomData({ tiers: parsed, order: {} });
        } else {
          setCustomData(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist to localStorage when custom data changes
  useEffect(() => {
    const hasTiers = Object.keys(customData.tiers).length > 0;
    const hasOrder = Object.keys(customData.order).length > 0;
    if (hasTiers || hasOrder) {
      localStorage.setItem(CUSTOM_TIERLIST_KEY, JSON.stringify(customData));
    } else {
      localStorage.removeItem(CUSTOM_TIERLIST_KEY);
    }
  }, [customData]);

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

  // Original tier map (for detecting moved characters)
  const originalTierMap = useMemo(() => {
    const map = new Map<string, Tier>();
    for (const entry of filtered) {
      map.set(entry.id, entry.tier);
    }
    return map;
  }, [filtered]);

  // Apply custom overrides on top of data-derived tiers
  const withOverrides = useMemo(() => {
    if (Object.keys(customData.tiers).length === 0) return filtered;
    return filtered.map((entry) => {
      const override = customData.tiers[entry.id];
      if (override) {
        return { ...entry, tier: override };
      }
      return entry;
    });
  }, [filtered, customData.tiers]);

  // Group by tier (using overridden tiers) and apply custom ordering
  const grouped = useMemo(() => {
    const map = new Map<Tier, RankedChar[]>();
    for (const tier of TIER_ORDER) {
      map.set(tier, []);
    }
    for (const entry of withOverrides) {
      map.get(entry.tier)?.push(entry);
    }
    // Apply custom ordering per tier
    for (const tier of TIER_ORDER) {
      const order = customData.order[tier];
      if (order && order.length > 0) {
        const tierEntries = map.get(tier) || [];
        const entryMap = new Map(tierEntries.map((e) => [e.id, e]));
        const ordered: RankedChar[] = [];
        // First add entries in custom order
        for (const id of order) {
          const entry = entryMap.get(id);
          if (entry) {
            ordered.push(entry);
            entryMap.delete(id);
          }
        }
        // Then append any remaining entries not in the custom order
        for (const entry of entryMap.values()) {
          ordered.push(entry);
        }
        map.set(tier, ordered);
      }
    }
    return map;
  }, [withOverrides, customData.order]);

  // ── Drag handlers ───────────────────────────────────────────────────

  const handleDragStart = useCallback((e: React.DragEvent, charId: string) => {
    e.dataTransfer.setData("text/plain", charId);
    e.dataTransfer.effectAllowed = "move";
    // Use the card element as drag image instead of browser default (which shows URL)
    const cardEl = (e.currentTarget as HTMLElement).querySelector("[data-char-inner]") as HTMLElement | null;
    if (cardEl) {
      e.dataTransfer.setDragImage(cardEl, cardEl.offsetWidth / 2, cardEl.offsetHeight / 2);
    }
    setDraggedCharId(charId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedCharId(null);
    setDragOverTier(null);
    setDropIndex(-1);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, tier: Tier) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverTier(tier);

    // Calculate insertion index based on cursor position relative to cards
    const container = e.currentTarget as HTMLElement;
    const cards = Array.from(container.querySelectorAll("[data-char-card]"));
    let insertIdx = cards.length;

    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect();
      const midX = rect.left + rect.width / 2;
      if (e.clientX < midX) {
        insertIdx = i;
        break;
      }
    }

    setDropIndex(insertIdx);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const related = e.relatedTarget as HTMLElement | null;
    if (!related || !(e.currentTarget as HTMLElement).contains(related)) {
      setDragOverTier(null);
      setDropIndex(-1);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetTier: Tier) => {
    e.preventDefault();
    const charId = e.dataTransfer.getData("text/plain");
    if (!charId) return;

    const originalTier = originalTierMap.get(charId);
    // Find which tier the character is currently in (with overrides applied)
    const currentTier = customData.tiers[charId] || originalTier;

    setCustomData((prev) => {
      const nextTiers = { ...prev.tiers };
      const nextOrder = { ...prev.order };

      // Remove from source tier's order array
      if (currentTier && nextOrder[currentTier]) {
        nextOrder[currentTier] = nextOrder[currentTier].filter((id) => id !== charId);
        if (nextOrder[currentTier].length === 0) delete nextOrder[currentTier];
      }

      // Set or remove tier override
      if (originalTier === targetTier) {
        delete nextTiers[charId];
      } else {
        nextTiers[charId] = targetTier;
      }

      // Build the target tier's order array from current grouped state
      const targetEntries = grouped.get(targetTier) || [];
      let currentOrder = nextOrder[targetTier]
        ? [...nextOrder[targetTier]]
        : targetEntries.map((e) => e.id);

      // Remove charId if already present (came from same tier)
      currentOrder = currentOrder.filter((id) => id !== charId);

      // Calculate insert position — account for the placeholder index
      // dropIndex is relative to renderItems which excludes the dragged card from this tier
      const clampedIdx = Math.min(dropIndex, currentOrder.length);
      currentOrder.splice(clampedIdx >= 0 ? clampedIdx : currentOrder.length, 0, charId);

      nextOrder[targetTier] = currentOrder;

      return { tiers: nextTiers, order: nextOrder };
    });

    setDraggedCharId(null);
    setDragOverTier(null);
    setDropIndex(-1);
  }, [originalTierMap, customData.tiers, grouped, dropIndex]);

  const resetOverrides = useCallback(() => {
    setCustomData({ tiers: {}, order: {} });
  }, []);

  const hasCustomizations = Object.keys(customData.tiers).length > 0 || Object.keys(customData.order).length > 0;

  // ── Render ──────────────────────────────────────────────────────────

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

      {/* Custom tier changes banner */}
      {hasCustomizations && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-guild-accent/30 bg-guild-accent/5 px-4 py-2.5">
          <span className="text-sm text-guild-accent font-medium">
            You have custom tier changes
          </span>
          <button
            onClick={resetOverrides}
            className="flex items-center gap-1.5 rounded-md bg-guild-accent/15 px-3 py-1.5 text-xs font-medium text-guild-accent transition-colors hover:bg-guild-accent/25"
          >
            <RotateCcw className="h-3 w-3" />
            Reset to Default
          </button>
        </div>
      )}

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
          const colors = TIER_COLORS[tier];
          const phColors = PLACEHOLDER_COLORS[tier];
          const isDropTarget = dragOverTier === tier && draggedCharId != null;

          // Don't hide empty tiers when dragging (user might want to drop there)
          if (entries.length === 0 && !draggedCharId) return null;

          // Build the list of rendered items for this tier
          // When dragging within or into this tier, keep the dragged card visible (opacity-50)
          const renderItems = entries.map((entry) => ({ type: "card" as const, entry }));

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

              {/* Characters (drop zone) */}
              <div
                className={cn(
                  "flex-1 flex flex-wrap gap-2 p-3 bg-guild-card/50 min-h-[96px] transition-colors",
                  isDropTarget && "bg-guild-card/80"
                )}
                onDragOver={(e) => handleDragOver(e, tier)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, tier)}
              >
                {renderItems.map((item, idx) => {
                  const { entry } = item;
                  const char = CHAR_BY_NAME.get(entry.name);
                  if (!char) return null;
                  const EI = ELEMENT_ICONS[char.element];
                  const isMoved = customData.tiers[entry.id] != null;
                  const isDragged = draggedCharId === entry.id;

                  return (
                    <React.Fragment key={entry.id}>
                      {/* Drop placeholder before this card */}
                      {isDropTarget && dropIndex === idx && (
                        <div
                          className={cn(
                            "flex flex-col items-center justify-center rounded-lg w-[72px] sm:w-[80px] h-[120px] sm:h-[136px]",
                            "border-2 border-dashed transition-all duration-150",
                            phColors.border,
                            phColors.bg,
                            "animate-in fade-in zoom-in-95"
                          )}
                          aria-hidden
                        />
                      )}
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, entry.id)}
                        onDragEnd={handleDragEnd}
                        data-char-card
                        className={cn(
                          "group",
                          isDragged && "opacity-50"
                        )}
                      >
                        <Link
                          href={`/database/${char.id}`}
                          draggable="false"
                        >
                          <div
                            data-char-inner
                            className={cn(
                              "relative flex flex-col items-center gap-1 rounded-lg p-2 w-[72px] sm:w-[80px] transition-colors",
                              "bg-guild-elevated/50 hover:bg-guild-elevated border hover:border-guild-border",
                              isMoved
                                ? "border-guild-accent/40"
                                : "border-transparent"
                            )}
                            title={`${entry.name} — Pick rate: ${entry.score.toFixed(1)}%`}
                          >
                            {/* Moved indicator dot */}
                            {isMoved && (
                              <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-guild-accent" />
                            )}

                            {/* Icon */}
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-guild-elevated/50">
                              <Image
                                src={charIconUrl(char.id)}
                                alt={char.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                                quality={100}
                                draggable="false"
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
                      </div>
                    </React.Fragment>
                  );
                })}
                {/* Drop placeholder at end of list */}
                {isDropTarget && dropIndex >= renderItems.length && (
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg w-[72px] sm:w-[80px] h-[120px] sm:h-[136px]",
                      "border-2 border-dashed transition-all duration-150",
                      phColors.border,
                      phColors.bg,
                      "animate-in fade-in zoom-in-95"
                    )}
                    aria-hidden
                  />
                )}
                {/* Empty tier message when dragging */}
                {entries.length === 0 && draggedCharId && !isDropTarget && (
                  <div className="flex items-center justify-center w-full text-xs text-guild-dim">
                    Drop here
                  </div>
                )}
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
