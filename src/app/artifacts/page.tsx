"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { YATTA_RELIQUARY } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RarityStars } from "@/components/shared";
import { Search, X, RotateCcw, ChevronDown, LayoutGrid, Castle } from "lucide-react";

// ── Domain Data ────────────────────────────────────────────────────────

interface ArtifactDomainInfo {
  name: string;
  location: string;
  sets: string[]; // set names that drop from this domain
}

const ARTIFACT_DOMAIN_MAP: ArtifactDomainInfo[] = [
  { name: "Momiji-Dyed Court", location: "Inazuma", sets: ["Emblem of Severed Fate", "Shimenawa's Reminiscence"] },
  { name: "Spire of Solitary Enlightenment", location: "Sumeru", sets: ["Deepwood Memories", "Gilded Dreams"] },
  { name: "Denouement of Sin", location: "Fontaine", sets: ["Golden Troupe", "Marechaussee Hunter"] },
  { name: "Sanctum of Rainbow Spirits", location: "Natlan", sets: ["Obsidian Codex", "Scroll of the Hero of Cinder City"] },
  { name: "Domain of Guyun", location: "Liyue", sets: ["Archaic Petra", "Retracing Bolide"] },
  { name: "Valley of Remembrance", location: "Mondstadt", sets: ["Viridescent Venerer", "Maiden Beloved"] },
  { name: "Ridge Watch", location: "Liyue", sets: ["Husk of Opulent Dreams", "Ocean-Hued Clam"] },
  { name: "Slumbering Court", location: "Inazuma", sets: ["Vermillion Hereafter", "Echoes of an Offering"] },
  { name: "Peak of Vindagnyr", location: "Mondstadt", sets: ["Blizzard Strayer", "Heart of Depth"] },
  { name: "Midsummer Courtyard", location: "Mondstadt", sets: ["Thundering Fury", "Thundersoother"] },
  { name: "Hidden Palace of Zhou Formula", location: "Liyue", sets: ["Crimson Witch of Flames", "Lavawalker"] },
  { name: "Clear Pool and Mountain Cavern", location: "Liyue", sets: ["Noblesse Oblige", "Bloodstained Chivalry"] },
];

const LOCATION_COLORS: Record<string, string> = {
  Mondstadt: "text-cyan-400",
  Liyue: "text-amber-400",
  Inazuma: "text-purple-400",
  Sumeru: "text-green-400",
  Fontaine: "text-blue-400",
  Natlan: "text-red-400",
};

// ── Types ──────────────────────────────────────────────────────────────

type ViewMode = "domains" | "all";

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
  const [viewMode, setViewMode] = useState<ViewMode>("domains");
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
        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-guild-border overflow-hidden">
            <button
              onClick={() => setViewMode("domains")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "domains"
                  ? "bg-guild-accent/20 text-guild-accent"
                  : "text-guild-muted hover:text-white hover:bg-white/5"
              )}
            >
              <Castle className="h-3.5 w-3.5" />
              Domains
            </button>
            <button
              onClick={() => setViewMode("all")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-l border-guild-border",
                viewMode === "all"
                  ? "bg-guild-accent/20 text-guild-accent"
                  : "text-guild-muted hover:text-white hover:bg-white/5"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              All Sets
            </button>
          </div>
          <span className="text-base text-guild-muted">
            {loading ? "..." : `${filtered.length} / ${sets.length} sets`}
          </span>
        </div>
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
            let activeStyle = "bg-guild-accent/15 text-guild-accent border-guild-accent/30";
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
                    : "bg-guild-elevated text-guild-muted border-guild-border/50 hover:border-guild-border"
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
              <div className="absolute z-50 right-0 top-full mt-1 w-44 rounded-lg bg-guild-elevated border border-guild-border shadow-2xl shadow-black/60 overflow-hidden">
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
      {!loading && !error && sorted.length > 0 && viewMode === "all" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((set) => (
            <ArtifactSetCard key={set.id} set={set} />
          ))}
        </div>
      )}

      {/* Domain View */}
      {!loading && !error && sets.length > 0 && viewMode === "domains" && (
        <DomainCardsSection sets={sets} searchFilter={debouncedSearch} rarityFilter={rarity} />
      )}

      {/* Empty State */}
      {!loading && !error && sorted.length === 0 && sets.length > 0 && viewMode === "all" && (
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

// ── Helpers ────────────────────────────────────────────────────────────

function getPieceIcons(setIcon: string): string[] {
  const base = setIcon.replace(/_\d+$/, '_');
  return [1, 2, 3, 4, 5].map((n) => `${YATTA_RELIQUARY}/${base}${n}.png`);
}

// ── Domain Cards Section ───────────────────────────────────────────────

interface DomainCardsSectionProps {
  sets: ArtifactSet[];
  searchFilter: string;
  rarityFilter: number;
}

function DomainCardsSection({ sets, searchFilter, rarityFilter }: DomainCardsSectionProps) {
  // Build a lookup from set name to set data
  const setsByName = new Map<string, ArtifactSet>();
  for (const s of sets) {
    setsByName.set(s.name, s);
  }

  // Filter domains based on search and rarity filters
  const filteredDomains = ARTIFACT_DOMAIN_MAP.filter((domain) => {
    const domainSets = domain.sets.map((name) => setsByName.get(name)).filter(Boolean) as ArtifactSet[];
    if (domainSets.length === 0) return false;

    // If rarity filter is active, at least one set must match
    if (rarityFilter && !domainSets.some((s) => s.maxRarity === rarityFilter)) return false;

    // If search filter is active, domain name, location, or at least one set name must match
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchesDomain = domain.name.toLowerCase().includes(q) || domain.location.toLowerCase().includes(q);
      const matchesSet = domainSets.some((s) => s.name.toLowerCase().includes(q));
      if (!matchesDomain && !matchesSet) return false;
    }

    return true;
  });

  // Also find sets that are NOT in any domain
  const domainSetNames = new Set(ARTIFACT_DOMAIN_MAP.flatMap((d) => d.sets));
  const undomainedSets = sets.filter((s) => {
    if (domainSetNames.has(s.name)) return false;
    if (rarityFilter && s.maxRarity !== rarityFilter) return false;
    if (searchFilter && !s.name.toLowerCase().includes(searchFilter.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Domain cards */}
      {filteredDomains.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-guild-muted flex items-center gap-2">
            <Castle className="h-4 w-4" />
            Artifact Domains
            <span className="text-sm font-normal">({filteredDomains.length})</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDomains.map((domain) => (
              <DomainCard key={domain.name} domain={domain} setsByName={setsByName} />
            ))}
          </div>
        </div>
      )}

      {/* Un-domained sets (overworld / event sets) */}
      {undomainedSets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-guild-muted flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Other Sets
            <span className="text-sm font-normal">({undomainedSets.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {undomainedSets.map((set) => (
              <ArtifactSetCard key={set.id} set={set} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state for domain view */}
      {filteredDomains.length === 0 && undomainedSets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-5xl opacity-30">&#x1F3EF;</div>
          <p className="text-lg text-muted-foreground">No domains or sets match your filters.</p>
          <p className="text-sm text-muted-foreground/60">Try adjusting your search or removing some filters.</p>
        </div>
      )}
    </div>
  );
}

// ── Domain Card ────────────────────────────────────────────────────────

interface DomainCardProps {
  domain: ArtifactDomainInfo;
  setsByName: Map<string, ArtifactSet>;
}

function DomainCard({ domain, setsByName }: DomainCardProps) {
  const domainSets = domain.sets.map((name) => setsByName.get(name)).filter(Boolean) as ArtifactSet[];
  const locationColor = LOCATION_COLORS[domain.location] || "text-muted-foreground";

  return (
    <Card className="overflow-hidden border-white/8 hover:border-white/15 transition-all duration-300 p-0 group">
      {/* Domain header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm">{domain.name}</h3>
            <p className={cn("text-xs mt-0.5", locationColor)}>{domain.location}</p>
          </div>
          <div className="flex -space-x-3">
            {domainSets.map((set) => (
              <div
                key={set.id}
                className="relative w-10 h-10 rounded-full bg-guild-elevated border-2 border-background overflow-hidden"
              >
                <Image
                  src={`${YATTA_RELIQUARY}/${set.icon}.png`}
                  alt={set.name}
                  fill
                  sizes="40px"
                  className="object-contain p-0.5"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sets in this domain */}
      <div className="divide-y divide-white/5">
        {domainSets.map((set) => {
          const gradient = RARITY_GRADIENT[set.maxRarity] || RARITY_GRADIENT[3];
          const twoPc = set.bonuses.find((b) => b.label === "2-Piece" || b.label === "1-Piece");
          const fourPc = set.bonuses.find((b) => b.label === "4-Piece");

          return (
            <Link key={set.id} href={`/artifacts/${set.id}`} className="block">
              <div className="flex gap-3 p-3 hover:bg-white/[0.03] transition-colors">
                {/* Set icon */}
                <div className={cn("relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br", gradient)}>
                  <Image
                    src={`${YATTA_RELIQUARY}/${set.icon}.png`}
                    alt={set.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                  />
                </div>

                {/* Set details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">{set.name}</p>
                    <RarityStars rarity={set.maxRarity} size="xs" />
                  </div>

                  {/* Piece thumbnails row */}
                  <div className="flex items-center gap-1 mt-1">
                    {getPieceIcons(set.icon).map((url, i) => (
                      <div key={i} className="relative w-5 h-5 rounded bg-white/10 shrink-0">
                        <Image
                          src={url}
                          alt={`Piece ${i + 1}`}
                          fill
                          sizes="20px"
                          className="object-contain p-0.5"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Set bonuses */}
                  {twoPc && (
                    <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 leading-snug">
                      <span className="text-gray-300 font-medium">{twoPc.label}:</span> {twoPc.description}
                    </p>
                  )}
                  {fourPc && (
                    <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 leading-snug">
                      <span className="text-gray-400 font-medium">{fourPc.label}:</span> {fourPc.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

// ── Artifact Set Card ──────────────────────────────────────────────────

interface ArtifactSetCardProps {
  set: ArtifactSet;
}

function ArtifactSetCard({ set }: ArtifactSetCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const glow = RARITY_GLOW[set.maxRarity] || RARITY_GLOW[3];
  const gradient = RARITY_GRADIENT[set.maxRarity] || RARITY_GRADIENT[3];
  const shimmer = RARITY_SHIMMER[set.maxRarity] || RARITY_SHIMMER[3];
  const border = RARITY_BORDER[set.maxRarity] || RARITY_BORDER[3];
  const twoPcBonus = set.bonuses.find((b) => b.label === "2-Piece" || b.label === "1-Piece");
  const fourPcBonus = set.bonuses.find((b) => b.label === "4-Piece");

  return (
    <Link href={`/artifacts/${set.id}`}>
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer group p-0 transition-shadow duration-300",
          border,
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

          {/* Artifact icon - centered */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            {!imgErr ? (
              <Image
                src={`${YATTA_RELIQUARY}/${set.icon}.png`}
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

          {/* Bottom info overlay */}
          <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-black/90 via-black/60 to-transparent">
            <p className="text-sm font-semibold text-white truncate drop-shadow-lg">
              {set.name}
            </p>
            <RarityStars rarity={set.maxRarity} size="xs" className="mt-0.5" />
            {/* Piece thumbnails */}
            <div className="flex items-center gap-1 mt-1.5">
              {getPieceIcons(set.icon).map((url, i) => (
                <div key={i} className="relative w-6 h-6 rounded bg-white/10">
                  <Image
                    src={url}
                    alt={`Piece ${i + 1}`}
                    fill
                    sizes="24px"
                    className="object-contain p-0.5"
                  />
                </div>
              ))}
            </div>
            {twoPcBonus && (
              <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 leading-snug">
                <span className="text-gray-300 font-medium">{twoPcBonus.label}:</span> {twoPcBonus.description}
              </p>
            )}
            {fourPcBonus && (
              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 leading-snug">
                <span className="text-gray-400 font-medium">{fourPcBonus.label}:</span> {fourPcBonus.description}
              </p>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
