"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search, X, RotateCcw, ChevronDown } from "lucide-react";
import { DISPLAYABLE_WEAPONS, WEAPON_TYPES, type WeaponEntry } from "@/lib/weapons";
import { RARITY_COLORS, SUBSTAT_COLORS, weaponIconUrl } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RarityStars } from "@/components/shared";

const RARITY_BORDER = {
  5: "border-amber-500/25 hover:border-amber-400/50",
  4: "border-purple-500/20 hover:border-purple-400/40",
  3: "border-blue-500/20 hover:border-blue-400/40",
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
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

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
        return arr.sort((a, b) => b.rarity - a.rarity);
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
      <Card className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
        </div>

        {/* Weapon Type Filter */}
        <div className="flex flex-wrap gap-2">
          {WEAPON_TYPES.map((w) => (
            <Badge
              key={w}
              variant="outline"
              onClick={() => setType(w)}
              className={cn(
                "cursor-pointer transition-all select-none",
                type === w
                  ? "bg-guild-accent/20 text-guild-accent border-guild-accent/30"
                  : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
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
              variant="outline"
              onClick={() => setRarity(r)}
              className={cn(
                "cursor-pointer transition-all select-none",
                rarity === r
                  ? r === 5 ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : r === 4 ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : r === 3 ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-white/10 text-white border-white/20"
                  : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
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
            {type !== "All" && (
              <Badge
                variant="outline"
                onClick={() => setType("All")}
                className="cursor-pointer gap-1 bg-guild-accent/20 text-guild-accent border-guild-accent/30"
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
                {rarity}\u2605
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

  return (
    <Link href={`/weapons/${weapon.id}`}>
      <Card className={cn(
        "overflow-hidden transition-all hover:scale-105 hover:shadow-lg cursor-pointer group p-0",
        RARITY_BORDER[weapon.rarity]
      )}>
        <div className={cn(
          "relative aspect-square flex items-center justify-center p-4",
          RARITY_COLORS[weapon.rarity]?.bg || "bg-muted"
        )}>
          {!imgErr && weapon.icon ? (
            <Image
              src={weaponIconUrl(weapon.id)}
              alt={weapon.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
              className="object-contain p-3 group-hover:brightness-110 transition-all"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-lg font-bold">
              {weapon.type[0]}
            </div>
          )}
          <Badge variant="secondary" className="absolute top-2 right-2 text-[10px]">
            {weapon.type}
          </Badge>
        </div>
        <CardContent className="p-3 text-center space-y-1">
          <p className="text-sm font-medium truncate">{weapon.name}</p>
          <RarityStars rarity={weapon.rarity} size="xs" className="justify-center" />
          {weapon.substat !== "None" && (
            <Badge variant="outline" className={cn("text-[10px]", SUBSTAT_COLORS[weapon.substat])}>
              {weapon.substat}
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
