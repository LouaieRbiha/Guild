"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import {
  ALL_CHARACTERS,
  ELEMENTS,
  WEAPONS,
  ELEMENT_COLORS,
  ENKA_UI,
  type CharacterEntry,
} from "@/lib/characters";
import { CHARACTER_STATS } from "@/lib/character-stats";
import { ELEMENT_ICONS } from "@/components/icons/genshin-icons";

const RARITY_BORDER = {
  5: "border-amber-500/25 hover:border-amber-400/50",
  4: "border-purple-500/20 hover:border-purple-400/40",
} as const;

function gachaArtUrl(avatarKey: string): string {
  return `${ENKA_UI}/UI_Gacha_AvatarImg_${avatarKey}.png`;
}

const ASC_LABELS: Record<string, string> = {
  critdmg: "CRIT DMG", critrate: "CRIT Rate", em: "EM", hp: "HP%", atk: "ATK%",
  def: "DEF%", er: "ER", healing: "Healing", physical: "Phys DMG",
  pyro: "Pyro DMG", hydro: "Hydro DMG", cryo: "Cryo DMG", electro: "Electro DMG",
  anemo: "Anemo DMG", geo: "Geo DMG", dendro: "Dendro DMG",
};

export default function DatabasePage() {
  const [element, setElement] = useState<string>("All");
  const [weapon, setWeapon] = useState<string>("All");
  const [rarity, setRarity] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [sortNewest, setSortNewest] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const suggestions = search.length >= 1
    ? ALL_CHARACTERS.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  const filtered = ALL_CHARACTERS.filter((c) => {
    if (element !== "All" && c.element !== element) return false;
    if (weapon !== "All" && c.weapon !== weapon) return false;
    if (rarity && c.rarity !== rarity) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const sorted = sortNewest ? [...filtered].reverse() : filtered;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Characters</h1>
        <span className="text-base text-guild-muted">{filtered.length} / {ALL_CHARACTERS.length} characters</span>
      </div>

      {/* Filters */}
      <div className="guild-card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-guild-muted z-10" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); setSelectedIdx(-1); }}
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
            className="w-full h-10 pl-10 pr-4 rounded-md bg-guild-elevated border border-white/5 text-sm outline-none focus:border-guild-accent/50 transition-colors"
          />
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
                      src={`${ENKA_UI}/${c.icon}.png`}
                      alt={c.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                      unoptimized
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

        <div className="flex flex-wrap gap-2">
          {ELEMENTS.map((el) => {
            const colors = el !== "All" ? ELEMENT_COLORS[el] : null;
            const EI = el !== "All" ? ELEMENT_ICONS[el] : null;
            return (
              <button
                key={el}
                onClick={() => setElement(el)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border flex items-center gap-1.5",
                  element === el
                    ? colors
                      ? `${colors.bg} ${colors.text} ${colors.border}`
                      : "bg-white/10 text-white border-white/20"
                    : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
                )}
              >
                {EI && <EI size={14} />}
                {el}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {WEAPONS.map((w) => (
            <button
              key={w}
              onClick={() => setWeapon(w)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border",
                weapon === w
                  ? "bg-guild-accent/20 text-guild-accent border-guild-accent/30"
                  : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
              )}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          {[0, 5, 4].map((r) => (
            <button
              key={r}
              onClick={() => setRarity(r)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border",
                rarity === r
                  ? r === 5 ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : r === 4 ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : "bg-white/10 text-white border-white/20"
                  : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
              )}
            >
              {r === 0 ? "All" : `${r}★`}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setSortNewest(!sortNewest)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
          >
            {sortNewest ? "Newest First ↓" : "Oldest First ↑"}
          </button>
        </div>
      </div>

      {/* Character Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
        {sorted.map((c) => (
          <CharacterCard key={c.id} char={c} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-guild-muted">No characters match your filters.</div>
      )}
    </div>
  );
}

function CharacterCard({ char }: { char: CharacterEntry }) {
  const [useFallback, setUseFallback] = useState(false);
  const EI = ELEMENT_ICONS[char.element];
  const stats = CHARACTER_STATS[char.name];

  return (
    <Link href={`/database/${char.id}`}>
      <div
        className={cn(
          "relative rounded-xl border overflow-hidden cursor-pointer group",
          RARITY_BORDER[char.rarity]
        )}
      >
        <div className="relative aspect-[3/5] bg-black/60">
          {/* Image with zoom on hover */}
          <Image
            src={useFallback ? `${ENKA_UI}/${char.icon}.png` : gachaArtUrl(char.avatarKey)}
            alt={char.name}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-110"
            unoptimized
            onError={() => { if (!useFallback) setUseFallback(true); }}
          />

          {/* Name + element + weapon — always visible, fades out on hover */}
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-200 pointer-events-none">
            <p className="text-sm font-semibold text-white truncate drop-shadow-lg">{char.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {EI && <EI size={16} />}
              <span className="text-xs text-gray-300 drop-shadow">{char.weapon}</span>
            </div>
          </div>

          {/* Hover stats panel — fades in at bottom */}
          {stats && (
            <div className="absolute inset-x-0 bottom-0 bg-black/70 backdrop-blur-sm px-3 py-2.5 space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <p className="text-sm font-bold text-white truncate">{char.name}</p>
              <div className="flex items-center gap-1.5 mb-1">
                {EI && <EI size={16} />}
                <span className="text-xs text-gray-300">{char.weapon}</span>
              </div>
              <StatRow label="HP" value={stats.hp.toLocaleString()} />
              <StatRow label="ATK" value={stats.atk.toLocaleString()} />
              <StatRow label="DEF" value={stats.def.toLocaleString()} />
              <StatRow label={stats.asc} value={stats.ascVal} accent />
            </div>
          )}
        </div>
      </div>
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
