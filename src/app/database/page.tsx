"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, X, RotateCcw, ChevronDown } from "lucide-react";
import {
  ALL_CHARACTERS,
  ELEMENTS,
  WEAPONS,
  ELEMENT_COLORS,
  charIconUrl,
  charGachaUrl,
  type CharacterEntry,
} from "@/lib/characters";
import { CHARACTER_STATS } from "@/lib/character-stats";
import { ELEMENT_ICONS } from "@/components/icons/genshin-icons";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RarityStars } from "@/components/shared";

const RARITY_BORDER = {
  5: "border-amber-500/25 hover:border-amber-400/50",
  4: "border-purple-500/20 hover:border-purple-400/40",
} as const;

const ELEMENT_GLOW: Record<string, string> = {
  Pyro:    "0 0 20px rgba(239, 68, 68, 0.4)",
  Hydro:   "0 0 20px rgba(59, 130, 246, 0.4)",
  Anemo:   "0 0 20px rgba(94, 234, 212, 0.4)",
  Cryo:    "0 0 20px rgba(103, 232, 249, 0.4)",
  Electro: "0 0 20px rgba(168, 85, 247, 0.4)",
  Geo:     "0 0 20px rgba(250, 204, 21, 0.4)",
  Dendro:  "0 0 20px rgba(74, 222, 128, 0.4)",
};

type SortOption = "newest" | "oldest" | "name-az" | "name-za" | "element" | "rarity";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest First",
  oldest: "Oldest First",
  "name-az": "Name A-Z",
  "name-za": "Name Z-A",
  element: "Element",
  rarity: "Rarity (5\u2605 first)",
};

const ELEMENT_ORDER: Record<string, number> = {
  Pyro: 0, Hydro: 1, Anemo: 2, Cryo: 3, Electro: 4, Geo: 5, Dendro: 6,
};

function gachaArtUrl(id: string): string {
  return charGachaUrl(id);
}

export default function DatabasePage() {
  const [elements, setElements] = useState<string[]>([]);
  const [weapon, setWeapon] = useState<string>("All");
  const [rarity, setRarity] = useState<number>(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
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
    ? ALL_CHARACTERS.filter((c) => c.name.toLowerCase().includes(searchInput.toLowerCase())).slice(0, 8)
    : [];

  // Filtering uses debouncedSearch
  const filtered = ALL_CHARACTERS.filter((c) => {
    if (elements.length > 0 && !elements.includes(c.element)) return false;
    if (weapon !== "All" && c.weapon !== weapon) return false;
    if (rarity && c.rarity !== rarity) return false;
    if (debouncedSearch && !c.name.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
    return true;
  });

  // Sorting
  const sorted = (() => {
    const arr = [...filtered];
    switch (sortBy) {
      case "newest":
        return arr.reverse();
      case "oldest":
        return arr;
      case "name-az":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case "name-za":
        return arr.sort((a, b) => b.name.localeCompare(a.name));
      case "element":
        return arr.sort((a, b) => (ELEMENT_ORDER[a.element] ?? 99) - (ELEMENT_ORDER[b.element] ?? 99));
      case "rarity":
        return arr.sort((a, b) => b.rarity - a.rarity);
      default:
        return arr;
    }
  })();

  const hasActiveFilters = elements.length > 0 || weapon !== "All" || rarity !== 0 || debouncedSearch.length > 0;

  function toggleElement(el: string) {
    if (el === "All") {
      setElements([]);
      return;
    }
    setElements((prev) =>
      prev.includes(el) ? prev.filter((e) => e !== el) : [...prev, el]
    );
  }

  function resetFilters() {
    setElements([]);
    setWeapon("All");
    setRarity(0);
    setSearchInput("");
    setDebouncedSearch("");
    setSortBy("newest");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Characters</h1>
        <span className="text-base text-guild-muted">
          {filtered.length} / {ALL_CHARACTERS.length} characters
        </span>
      </div>

      {/* Sticky Filter Bar */}
      <Card className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4 gap-3">
        {/* Search */}
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
              else if (e.key === "Enter" && selectedIdx >= 0) { e.preventDefault(); router.push(`/database/${suggestions[selectedIdx].id}`); setShowSuggestions(false); }
              else if (e.key === "Escape") { setShowSuggestions(false); }
            }}
            placeholder="Search characters..."
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
            <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg bg-guild-elevated border border-white/10 shadow-2xl shadow-black/60 overflow-hidden">
              {suggestions.map((c, i) => {
                const EI = ELEMENT_ICONS[c.element];
                return (
                  <Link
                    key={c.id}
                    href={`/database/${c.id}`}
                    onClick={() => setShowSuggestions(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 transition-colors",
                      i === selectedIdx ? "bg-guild-accent/20" : "hover:bg-white/5"
                    )}
                  >
                    <Image
                      src={charIconUrl(c.id)}
                      alt={c.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                      sizes="32px"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{c.name}</p>
                      <div className="flex items-center gap-1.5">
                        {EI && <EI size={12} />}
                        <span className="text-xs text-guild-muted">{c.weapon} · {c.rarity}★</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Element Filter — multi-select with Badge */}
        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map((el) => {
            const isAll = el === "All";
            const isActive = isAll ? elements.length === 0 : elements.includes(el);
            const colors = !isAll ? ELEMENT_COLORS[el] : null;
            const EI = !isAll ? ELEMENT_ICONS[el] : null;
            return (
              <Badge
                key={el}
                variant="outline"
                onClick={() => toggleElement(el)}
                className={cn(
                  "cursor-pointer transition-all select-none flex items-center gap-1.5",
                  isActive
                    ? colors
                      ? `${colors.bg} ${colors.text} ${colors.border}`
                      : "bg-white/10 text-white border-white/20"
                    : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
                )}
              >
                {EI && <EI size={14} />}
                {el}
              </Badge>
            );
          })}
        </div>

        {/* Weapon Filter — single-select with Badge */}
        <div className="flex flex-wrap gap-2">
          {WEAPONS.map((w) => (
            <Badge
              key={w}
              variant="outline"
              onClick={() => setWeapon(w)}
              className={cn(
                "cursor-pointer transition-all select-none",
                weapon === w
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
          {[0, 5, 4].map((r) => (
            <Badge
              key={r}
              variant="outline"
              onClick={() => setRarity(r)}
              className={cn(
                "cursor-pointer transition-all select-none",
                rarity === r
                  ? r === 5 ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : r === 4 ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : "bg-white/10 text-white border-white/20"
                  : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
              )}
            >
              {r === 0 ? "All" : `${r}★`}
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
            {elements.map((el) => {
              const colors = ELEMENT_COLORS[el];
              const EI = ELEMENT_ICONS[el];
              return (
                <Badge
                  key={el}
                  variant="outline"
                  onClick={() => toggleElement(el)}
                  className={cn(
                    "cursor-pointer gap-1",
                    colors ? `${colors.bg} ${colors.text} ${colors.border}` : ""
                  )}
                >
                  {EI && <EI size={10} />}
                  {el}
                  <X className="h-3 w-3 ml-0.5" />
                </Badge>
              );
            })}
            {weapon !== "All" && (
              <Badge
                variant="outline"
                onClick={() => setWeapon("All")}
                className="cursor-pointer gap-1 bg-guild-accent/20 text-guild-accent border-guild-accent/30"
              >
                {weapon}
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
                    : "bg-purple-500/20 text-purple-400 border-purple-500/30"
                )}
              >
                {rarity}★
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

      {/* Character Grid */}
      {sorted.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {sorted.map((c) => (
            <CharacterCard key={c.id} char={c} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="text-5xl opacity-30">🔍</div>
          <p className="text-lg text-muted-foreground">No characters match your filters.</p>
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

function CharacterCard({ char }: { char: CharacterEntry }) {
  const [useFallback, setUseFallback] = useState(false);
  const EI = ELEMENT_ICONS[char.element];
  const stats = CHARACTER_STATS[char.name];
  const glow = ELEMENT_GLOW[char.element];

  return (
    <Link href={`/database/${char.id}`}>
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer group p-0 transition-shadow duration-300",
          RARITY_BORDER[char.rarity]
        )}
        style={{ "--element-glow": glow } as React.CSSProperties}
      >
        <div className="relative aspect-3/5 bg-black/60 group-hover:[box-shadow:var(--element-glow)]">
          {/* Image with zoom on hover */}
          <Image
            src={useFallback ? charIconUrl(char.id) : gachaArtUrl(char.id)}
            alt={char.name}
            fill
            quality={100}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
            onError={() => { if (!useFallback) setUseFallback(true); }}
          />

          {/* Name + element + weapon + rarity -- always visible, fades out on hover */}
          <div className="absolute inset-x-0 bottom-0 p-2 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
            <p className="text-sm font-semibold text-white truncate drop-shadow-lg">{char.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {EI && <EI size={16} />}
              <span className="text-xs text-gray-300 drop-shadow">{char.weapon}</span>
            </div>
            <RarityStars rarity={char.rarity} size="xs" className="mt-1" />
          </div>

          {/* Hover stats panel -- fades in at bottom */}
          {stats && (
            <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm px-3 py-2.5 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <p className="text-sm font-bold text-white truncate">{char.name}</p>
              <div className="flex items-center gap-1.5 mb-1">
                {EI && <EI size={16} />}
                <span className="text-xs text-gray-300">{char.weapon}</span>
              </div>
              <RarityStars rarity={char.rarity} size="xs" />
              <StatRow label="HP" value={stats.hp.toLocaleString()} />
              <StatRow label="ATK" value={stats.atk.toLocaleString()} />
              <StatRow label="DEF" value={stats.def.toLocaleString()} />
              <StatRow label={stats.asc} value={stats.ascVal} accent />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={cn("text-sm font-semibold", accent ? "text-guild-accent" : "text-white")}>{value}</span>
    </div>
  );
}
