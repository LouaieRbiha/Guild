"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, X, RotateCcw, ChevronDown } from "lucide-react";
import { DISPLAYABLE_WEAPONS, WEAPON_TYPES, type WeaponEntry } from "@/lib/weapons";
import { RARITY_COLORS, SUBSTAT_COLORS, weaponIconUrl } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RarityStars } from "@/components/shared";

const RARITY_BORDER = {
  5: "border-amber-500/25 hover:border-amber-400/50",
  4: "border-purple-500/20 hover:border-purple-400/40",
  3: "border-blue-500/20 hover:border-blue-400/40",
} as const;

const RARITY_GRADIENT = {
  5: "from-amber-900/60 via-amber-950/40 to-black/80",
  4: "from-purple-900/50 via-purple-950/40 to-black/80",
  3: "from-blue-900/40 via-blue-950/30 to-black/80",
} as const;

const RARITY_GLOW: Record<number, string> = {
  5: "0 0 24px rgba(245, 158, 11, 0.4)",
  4: "0 0 20px rgba(168, 85, 247, 0.35)",
  3: "0 0 16px rgba(59, 130, 246, 0.3)",
};

const RARITY_SHIMMER = {
  5: "from-amber-400/0 via-amber-300/10 to-amber-400/0",
  4: "from-purple-400/0 via-purple-300/8 to-purple-400/0",
  3: "from-blue-400/0 via-blue-300/6 to-blue-400/0",
} as const;

type SortOption = "newest" | "name-az" | "name-za" | "rarity" | "type";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest First",
  "name-az": "Name A-Z",
  "name-za": "Name Z-A",
  rarity: "Rarity (5\u2605 first)",
  type: "Type",
};

const TYPE_ORDER: Record<string, number> = {
  Sword: 0, Claymore: 1, Polearm: 2, Bow: 3, Catalyst: 4,
};

export default function WeaponsPage() {
  const [type, setType] = useState<string>("All");
  const [rarity, setRarity] = useState<number>(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [sortBy, setSortBy] = useState<SortOption>("rarity");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  // Suggestions use searchInput for immediate matching
  const suggestions = searchInput.length >= 1
    ? DISPLAYABLE_WEAPONS.filter((w) => w.name.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 8)
    : [];

  // Filtering uses debouncedSearch
  const filtered = DISPLAYABLE_WEAPONS.filter((w) => {
    if (type !== "All" && w.type !== type) return false;
    if (rarity && w.rarity !== rarity) return false;
    if (debouncedSearch && !w.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    return true;
  });

  // Sorting
  const sorted = (() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "newest":
        return arr.reverse();
      case "name-az":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "name-za":
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      case "rarity":
        return arr.sort((a, b) => {
          if (b.rarity !== a.rarity) return b.rarity - a.rarity;
          return Number(b.id) - Number(a.id);
        });
      case "type":
        return arr.sort((a, b) => (TYPE_ORDER[a.type] ?? 99) - (TYPE_ORDER[b.type] ?? 99));
      default:
        return arr;
    }
  })();

  const hasActiveFilters = type !== "All" || rarity !== 0 || debouncedSearch.length > 0;

  function resetFilters() {
    setType("All");
    setRarity(0);
    setSearchInput("");
    setDebouncedSearch("");
    setSortBy("newest");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Weapon Database</h1>
        <span className="text-base text-guild-muted">
          {filtered.length} / {DISPLAYABLE_WEAPONS.length} weapons
        </span>
      </div>

      {/* Sticky Filter Bar */}
      <Card className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-guild-border p-4 gap-3">
        {/* Search with autocomplete */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            ref={searchRef}
            type="text"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); setSelectedIdx(-1); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => {
              if (!showSuggestions || suggestions.length === 0) return;
              if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
              else if (e.key === "Enter" && selectedIdx >= 0) { e.preventDefault(); router.push(`/weapons/${suggestions[selectedIdx].id}`); setShowSuggestions(false); }
              else if (e.key === "Escape") { setShowSuggestions(false); }
            }}
            placeholder="Search weapons..."
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
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg bg-guild-elevated border border-guild-border shadow-2xl shadow-black/60 overflow-hidden">
              {suggestions.map((w, i) => (
                <Link
                  key={w.id}
                  href={`/weapons/${w.id}`}
                  onClick={() => setShowSuggestions(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 transition-colors",
                    i === selectedIdx ? "bg-guild-accent/20" : "hover:bg-white/5"
                  )}
                >
                  <Image
                    src={weaponIconUrl(w.id)}
                    alt={w.name}
                    width={32}
                    height={32}
                    className="rounded"
                    sizes="32px"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{w.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-guild-muted">{w.type}</span>
                      <span className="text-xs text-guild-muted">&middot;</span>
                      <span className={cn("text-xs", RARITY_COLORS[w.rarity]?.text)}>{w.rarity}&#9733;</span>
                      {w.substat !== "None" && (
                        <>
                          <span className="text-xs text-guild-muted">&middot;</span>
                          <span className={cn("text-xs", SUBSTAT_COLORS[w.substat])}>{w.substat}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Weapon Type Filter */}
        <div className="flex flex-wrap gap-2">
          {WEAPON_TYPES.map((w) => (
            <Badge
              key={w}
              onClick={() => setType(w)}
              className={cn(
                "cursor-pointer transition-all select-none",
                type === w
                  ? "bg-guild-accent/20 text-guild-accent border-guild-border/30"
                  : "bg-guild-elevated text-guild-muted border-transparent hover:bg-guild-elevated/80"
              )}
            >
              {w}
            </Badge>
          ))}
        </div>

        {/* Rarity + Sort */}
        <div className="flex gap-2 items-center flex-wrap">
          {[0, 5, 4, 3].map((r) => (
            <Badge
              key={r}
              onClick={() => setRarity(r)}
              className={cn(
                "cursor-pointer transition-all select-none",
                rarity === r
                  ? r === 5 ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : r === 4 ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : r === 3 ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-guild-accent/15 text-guild-accent border-guild-border/30"
                  : "bg-guild-elevated text-guild-muted border-transparent hover:bg-guild-elevated/80"
              )}
            >
              {r === 0 ? "All" : `${r}\u2605`}
            </Badge>
          ))}
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
            {type !== "All" && (
              <Badge
                variant="outline"
                onClick={() => setType("All")}
                className="cursor-pointer gap-1 bg-guild-accent/20 text-guild-accent border-guild-border/30"
              >
                {type}
                <X className="h-3 w-3 ml-0.5" />
              </Badge>
            )}
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

      {/* Weapon Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sorted.map((w) => (
            <WeaponCard key={w.id} weapon={w} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-5xl opacity-30">&#x1F50D;</div>
          <p className="text-lg text-muted-foreground">No weapons match your filters.</p>
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

function WeaponCard({ weapon }: { weapon: WeaponEntry }) {
  const [imgErr, setImgErr] = useState(false);
  const glow = RARITY_GLOW[weapon.rarity];
  const gradient = RARITY_GRADIENT[weapon.rarity] || RARITY_GRADIENT[3];
  const shimmer = RARITY_SHIMMER[weapon.rarity] || RARITY_SHIMMER[3];

  return (
    <Link href={`/weapons/${weapon.id}`}>
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer group p-0 transition-shadow duration-300",
          RARITY_BORDER[weapon.rarity]
        )}
        style={{ "--rarity-glow": glow } as React.CSSProperties}
      >
        <div className="relative aspect-3/5 group-hover:[box-shadow:var(--rarity-glow)]">
          {/* Rarity gradient background */}
          <div className={cn("absolute inset-0 bg-linear-to-t", gradient)} />

          {/* Subtle shimmer sweep on hover */}
          <div
            className={cn(
              "absolute inset-0 bg-linear-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500",
              shimmer
            )}
          />

          {/* Weapon type label - top left */}
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
              {weapon.type}
            </span>
          </div>

          {/* Rarity stars - top right */}
          <div className="absolute top-2 right-2 z-10">
            <RarityStars rarity={weapon.rarity} size="xs" />
          </div>

          {/* Weapon icon - centered, large, with hover animation */}
          <div className="absolute inset-0 flex items-center justify-center p-6">
            {!imgErr && weapon.icon ? (
              <Image
                src={weaponIconUrl(weapon.id)}
                alt={weapon.name}
                fill
                quality={95}
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                className="object-contain p-5 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold opacity-40">
                {weapon.type[0]}
              </div>
            )}
          </div>

          {/* Bottom info overlay - always visible, fades out on hover */}
          <div className="absolute inset-x-0 bottom-0 p-2.5 bg-linear-to-t from-black/90 via-black/50 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
            <p className="text-sm font-semibold text-white truncate drop-shadow-lg">
              {weapon.name}
            </p>
            {weapon.substat !== "None" && (
              <span className={cn("text-xs font-medium drop-shadow", SUBSTAT_COLORS[weapon.substat])}>
                {weapon.substat}
              </span>
            )}
          </div>

          {/* Hover stats panel - fades in at bottom */}
          <div className="absolute inset-x-0 bottom-0 bg-black/75 backdrop-blur-sm px-3 py-2.5 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <p className="text-sm font-bold text-white truncate">{weapon.name}</p>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs text-gray-300">{weapon.type}</span>
            </div>
            <RarityStars rarity={weapon.rarity} size="xs" />
            <WeaponStatRow label="Substat" value={weapon.substat} color={SUBSTAT_COLORS[weapon.substat]} />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function WeaponStatRow({ label, value, color }: { label: string; value: string; color?: string }) {
  if (value === "None") return null;
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={cn("text-sm font-semibold", color || "text-white")}>{value}</span>
    </div>
  );
}
