"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { YATTA_ASSETS, RARITY_COLORS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RarityStars } from "@/components/shared";
import { Search, X, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

interface ArtifactSet {
  id: number;
  name: string;
  maxRarity: number;
  icon: string;
  bonuses: { label: string; description: string }[];
  sortOrder: number;
}

// ── Rarity visual constants ────────────────────────────────────────────

const RARITY_BORDER: Record<number, string> = {
  5: "border-amber-500/25 hover:border-amber-400/50",
  4: "border-purple-500/20 hover:border-purple-400/40",
  3: "border-blue-500/20 hover:border-blue-400/40",
};

const RARITY_GRADIENT: Record<number, string> = {
  5: "from-amber-900/60 via-amber-950/40 to-black/80",
  4: "from-purple-900/50 via-purple-950/40 to-black/80",
  3: "from-blue-900/40 via-blue-950/30 to-black/80",
};

const RARITY_GLOW: Record<number, string> = {
  5: "0 0 24px rgba(245, 158, 11, 0.4)",
  4: "0 0 20px rgba(168, 85, 247, 0.35)",
  3: "0 0 16px rgba(59, 130, 246, 0.3)",
};

const RARITY_SHIMMER: Record<number, string> = {
  5: "from-amber-400/0 via-amber-300/10 to-amber-400/0",
  4: "from-purple-400/0 via-purple-300/8 to-purple-400/0",
  3: "from-blue-400/0 via-blue-300/6 to-blue-400/0",
};

// ── Sort options ───────────────────────────────────────────────────────

type SortOption = "newest" | "name-az" | "name-za" | "rarity";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest First",
  "name-az": "Name A-Z",
  "name-za": "Name Z-A",
  rarity: "Rarity (5\u2605 first)",
};

// ── Data parsing ───────────────────────────────────────────────────────

interface RawArtifactSet {
  id: number;
  name: string;
  levelList: number[];
  affixList: Record<string, string>;
  icon: string;
  route: string;
  sortOrder: number;
}

function parseMaxRarity(levelList: number[]): number {
  if (!levelList || levelList.length === 0) return 3;
  return Math.max(...levelList);
}

function parseArtifactSets(data: Record<string, RawArtifactSet>): ArtifactSet[] {
  return Object.values(data).map((raw) => {
    const affixEntries = Object.values(raw.affixList || {});
    const bonuses: { label: string; description: string }[] = [];

    if (affixEntries.length === 1) {
      bonuses.push({ label: "1-Piece", description: affixEntries[0] });
    } else if (affixEntries.length >= 2) {
      bonuses.push({ label: "2-Piece", description: affixEntries[0] });
      bonuses.push({ label: "4-Piece", description: affixEntries[1] });
    }

    return {
      id: raw.id,
      name: raw.name,
      maxRarity: parseMaxRarity(raw.levelList),
      icon: raw.icon,
      bonuses,
      sortOrder: raw.sortOrder,
    };
  });
}

// ── Main Page Component ────────────────────────────────────────────────

export default function ArtifactsPage() {
  const [sets, setSets] = useState<ArtifactSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rarity, setRarity] = useState<number>(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Fetch data
  useEffect(() => {
    async function fetchSets() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("https://gi.yatta.moe/api/v2/en/reliquary");
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        const json = await res.json();
        const parsed = parseArtifactSets(json.data.items);
        setSets(parsed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load artifact data.");
      } finally {
        setLoading(false);
      }
    }
    fetchSets();
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close sort menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Filtering
  const filtered = sets.filter((s) => {
    if (rarity && s.maxRarity !== rarity) return false;
    if (debouncedSearch && !s.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    return true;
  });

  // Sorting
  const sorted = (() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "newest":
        return arr.sort((a, b) => b.sortOrder - a.sortOrder);
      case "name-az":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "name-za":
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      case "rarity":
        return arr.sort((a, b) => b.maxRarity - a.maxRarity || b.sortOrder - a.sortOrder);
      default:
        return arr;
    }
  })();

  const hasActiveFilters = rarity !== 0 || debouncedSearch.length > 0;

  function resetFilters() {
    setRarity(0);
    setSearchInput("");
    setDebouncedSearch("");
    setSortBy("newest");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Artifact Sets</h1>
        <span className="text-base text-guild-muted">
          {loading ? "..." : `${filtered.length} / ${sets.length} sets`}
        </span>
      </div>

      {/* Sticky Filter Bar */}
      <Card className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search artifact sets..."
            className="pl-10"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setDebouncedSearch(""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Rarity Filter + Sort */}
        <div className="flex gap-2 items-center flex-wrap">
          {[0, 5, 4, 3].map((r) => {
            let activeStyle = "bg-white/10 text-white border-white/20";
            if (r === 5) activeStyle = "bg-amber-500/20 text-amber-400 border-amber-500/30";
            else if (r === 4) activeStyle = "bg-purple-500/20 text-purple-400 border-purple-500/30";
            else if (r === 3) activeStyle = "bg-blue-500/20 text-blue-400 border-blue-500/30";

            return (
              <Badge
                key={r}
                variant="outline"
                onClick={() => setRarity(r)}
                className={cn(
                  "cursor-pointer transition-all select-none",
                  rarity === r
                    ? activeStyle
                    : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
                )}
              >
                {r === 0 ? "All" : `${r}\u2605`}
              </Badge>
            );
          })}
          <div className="flex-1" />

          {/* Sort dropdown */}
          <div className="relative" ref={sortRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="text-xs gap-1.5"
            >
              {SORT_LABELS[sortBy]}
              <ChevronDown className="h-3 w-3" />
            </Button>
            {showSortMenu && (
              <div className="absolute z-50 right-0 top-full mt-1 w-44 rounded-lg bg-guild-elevated border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => { setSortBy(opt); setShowSortMenu(false); }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs transition-colors",
                      sortBy === opt
                        ? "bg-guild-accent/20 text-guild-accent"
                        : "text-guild-muted hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {SORT_LABELS[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active filter indicators */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {rarity !== 0 && (
              <Badge
                variant="outline"
                onClick={() => setRarity(0)}
                className={cn(
                  "cursor-pointer gap-1",
                  rarity === 5
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : rarity === 4
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                )}
              >
                {rarity}&#9733;
                <X className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
            {debouncedSearch && (
              <Badge
                variant="outline"
                onClick={() => { setSearchInput(""); setDebouncedSearch(""); }}
                className="cursor-pointer gap-1"
              >
                &quot;{debouncedSearch}&quot;
                <X className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="xs"
              onClick={resetFilters}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all
            </Button>
          </div>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-guild-elevated rounded-xl aspect-4/3" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-lg text-red-400">Something went wrong</p>
          <p className="text-sm text-muted-foreground/60">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="gap-2 mt-2">
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Artifact Grid */}
      {!loading && !error && sorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((set) => (
            <ArtifactSetCard
              key={set.id}
              set={set}
              expanded={expandedId === set.id}
              onToggle={() => setExpandedId(expandedId === set.id ? null : set.id)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && sorted.length === 0 && sets.length > 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-5xl opacity-30">&#x1F50D;</div>
          <p className="text-lg text-muted-foreground">No artifact sets match your filters.</p>
          <p className="text-sm text-muted-foreground/60">Try adjusting your search or removing some filters.</p>
          <Button variant="outline" onClick={resetFilters} className="gap-2 mt-2">
            <RotateCcw className="h-4 w-4" />
            Reset all filters
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Artifact Set Card ──────────────────────────────────────────────────

interface ArtifactSetCardProps {
  set: ArtifactSet;
  expanded: boolean;
  onToggle: () => void;
}

function ArtifactSetCard({ set, expanded, onToggle }: ArtifactSetCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const glow = RARITY_GLOW[set.maxRarity] || RARITY_GLOW[3];
  const gradient = RARITY_GRADIENT[set.maxRarity] || RARITY_GRADIENT[3];
  const shimmer = RARITY_SHIMMER[set.maxRarity] || RARITY_SHIMMER[3];
  const border = RARITY_BORDER[set.maxRarity] || RARITY_BORDER[3];
  const twoPcBonus = set.bonuses.find((b) => b.label === "2-Piece" || b.label === "1-Piece");
  const fourPcBonus = set.bonuses.find((b) => b.label === "4-Piece");

  return (
    <div className="flex flex-col">
      <Card
        onClick={onToggle}
        className={cn(
          "relative overflow-hidden cursor-pointer group p-0 transition-shadow duration-300",
          border,
          expanded && "rounded-b-none"
        )}
        style={{ "--rarity-glow": glow } as React.CSSProperties}
      >
        <div className="relative aspect-4/3 group-hover:[box-shadow:var(--rarity-glow)] transition-shadow duration-300">
          {/* Rarity gradient background */}
          <div className={cn("absolute inset-0 bg-linear-to-t", gradient)} />

          {/* Shimmer sweep on hover */}
          <div
            className={cn(
              "absolute inset-0 bg-linear-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              shimmer
            )}
          />

          {/* Rarity badge - top right */}
          <div className="absolute top-2 right-2 z-10">
            <RarityStars rarity={set.maxRarity} size="xs" />
          </div>

          {/* Expand/collapse indicator - top left */}
          <div className="absolute top-2 left-2 z-10">
            <span className="text-white/40 group-hover:text-white/70 transition-colors">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </div>

          {/* Artifact icon - centered */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            {!imgErr ? (
              <Image
                src={`${YATTA_ASSETS}/${set.icon}.png`}
                alt={set.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain p-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold opacity-40">
                {set.name[0]}
              </div>
            )}
          </div>

          {/* Bottom info overlay - visible by default */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/90 via-black/60 to-transparent">
            <p className="text-sm font-semibold text-white truncate drop-shadow-lg">
              {set.name}
            </p>
            <RarityStars rarity={set.maxRarity} size="xs" className="mt-0.5" />
            {twoPcBonus && (
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 leading-snug">
                {twoPcBonus.label}: {twoPcBonus.description}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Expanded detail panel */}
      {expanded && (
        <ExpandedDetail set={set} twoPcBonus={twoPcBonus} fourPcBonus={fourPcBonus} />
      )}
    </div>
  );
}

// ── Expanded Detail Panel ──────────────────────────────────────────────

interface ExpandedDetailProps {
  set: ArtifactSet;
  twoPcBonus: { label: string; description: string } | undefined;
  fourPcBonus: { label: string; description: string } | undefined;
}

const RARITY_PANEL_BORDER: Record<number, string> = {
  5: "border-amber-500/25",
  4: "border-purple-500/20",
  3: "border-blue-500/20",
};

function ExpandedDetail({ set, twoPcBonus, fourPcBonus }: ExpandedDetailProps) {
  const colors = RARITY_COLORS[set.maxRarity] || RARITY_COLORS[4];
  const panelBorder = RARITY_PANEL_BORDER[set.maxRarity] || RARITY_PANEL_BORDER[3];

  return (
    <div
      className={cn(
        "border border-t-0 rounded-b-xl p-4 space-y-3 bg-guild-card/90 backdrop-blur-sm",
        panelBorder
      )}
    >
      {/* Set bonuses */}
      {twoPcBonus && (
        <div className="space-y-1">
          <span className={cn("text-xs font-bold uppercase tracking-wide", colors.text)}>
            {twoPcBonus.label} Bonus
          </span>
          <p className="text-sm text-gray-300 leading-relaxed">
            {twoPcBonus.description}
          </p>
        </div>
      )}

      {fourPcBonus && (
        <div className="space-y-1">
          <span className={cn("text-xs font-bold uppercase tracking-wide", colors.text)}>
            {fourPcBonus.label} Bonus
          </span>
          <p className="text-sm text-gray-300 leading-relaxed">
            {fourPcBonus.description}
          </p>
        </div>
      )}

      {/* Piece names */}
      <div className="pt-2 border-t border-white/5">
        <span className="text-xs text-guild-muted uppercase tracking-wide font-medium">Pieces</span>
        <div className="grid grid-cols-5 gap-1.5 mt-2">
          {ARTIFACT_PIECES.map((piece) => (
            <div
              key={piece.slot}
              className="flex flex-col items-center gap-1 text-center"
            >
              <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-guild-muted">{piece.abbr}</span>
              </div>
              <span className="text-[10px] text-guild-muted leading-tight">{piece.slot}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ARTIFACT_PIECES = [
  { slot: "Flower", abbr: "FL" },
  { slot: "Plume", abbr: "PL" },
  { slot: "Sands", abbr: "SA" },
  { slot: "Goblet", abbr: "GO" },
  { slot: "Circlet", abbr: "CI" },
] as const;
