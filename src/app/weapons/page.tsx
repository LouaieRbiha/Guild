"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { ALL_WEAPONS, DISPLAYABLE_WEAPONS, WEAPON_TYPES, type WeaponEntry } from "@/lib/weapons";
import { ENKA_UI } from "@/lib/characters";

const RARITY_BG = {
  5: "bg-gradient-to-b from-amber-900/40 to-amber-950/20 border-amber-500/20",
  4: "bg-gradient-to-b from-purple-900/30 to-purple-950/20 border-purple-500/20",
  3: "bg-gradient-to-b from-blue-900/30 to-blue-950/20 border-blue-500/20",
} as const;

const RARITY_STAR = { 5: "text-amber-400", 4: "text-purple-400", 3: "text-blue-400" } as const;

const SUBSTAT_COLOR: Record<string, string> = {
  "CRIT Rate": "text-red-400",
  "CRIT DMG": "text-orange-400",
  "ATK%": "text-yellow-400",
  "HP%": "text-green-400",
  "DEF%": "text-cyan-400",
  "Energy Recharge": "text-purple-400",
  "Elemental Mastery": "text-emerald-400",
  "Physical DMG%": "text-gray-300",
};

export default function WeaponsPage() {
  const [type, setType] = useState<string>("All");
  const [rarity, setRarity] = useState<number>(0);
  const [search, setSearch] = useState("");

  const filtered = DISPLAYABLE_WEAPONS.filter((w) => {
    if (type !== "All" && w.type !== type) return false;
    if (rarity && w.rarity !== rarity) return false;
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Weapon Database</h1>
        <span className="text-sm text-guild-muted">{filtered.length} / {DISPLAYABLE_WEAPONS.length} weapons</span>
      </div>

      <div className="guild-card p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-guild-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search weapons..."
            className="w-full h-9 pl-10 pr-4 rounded-md bg-guild-elevated border border-white/5 text-sm outline-none focus:border-guild-accent/50 transition-colors"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {WEAPON_TYPES.map((w) => (
            <button
              key={w}
              onClick={() => setType(w)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border",
                type === w
                  ? "bg-guild-accent/20 text-guild-accent border-guild-accent/30"
                  : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
              )}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {[0, 5, 4, 3].map((r) => (
            <button
              key={r}
              onClick={() => setRarity(r)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border",
                rarity === r
                  ? r === 5 ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : r === 4 ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : r === 3 ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                  : "bg-white/10 text-white border-white/20"
                  : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
              )}
            >
              {r === 0 ? "All" : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
        {filtered.map((w) => (
          <WeaponCard key={w.id} weapon={w} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-guild-muted">No weapons match your filters.</div>
      )}
    </div>
  );
}

function WeaponCard({ weapon }: { weapon: WeaponEntry }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <Link href={`/weapons/${weapon.id}`}>
      <div className={cn(
        "rounded-lg border overflow-hidden transition-all hover:scale-105 hover:shadow-lg cursor-pointer group",
        RARITY_BG[weapon.rarity]
      )}>
      <div className="relative aspect-square flex items-center justify-center p-2">
        {!imgErr && weapon.icon ? (
          <Image
            src={`${ENKA_UI}/${weapon.icon}.png`}
            alt={weapon.name}
            fill
            sizes="(max-width: 640px) 33vw, 12vw"
            className="object-contain p-1 group-hover:brightness-110 transition-all"
            unoptimized
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-guild-muted text-xs font-bold">
            {weapon.type[0]}
          </div>
        )}
        <div className="absolute top-1 right-1 text-[9px] px-1.5 py-0.5 rounded-full bg-black/40 text-white/70 font-medium">
          {weapon.type}
        </div>
      </div>
      <div className="p-2 text-center space-y-0.5">
        <p className="text-xs font-medium truncate">{weapon.name}</p>
        <div className="flex items-center justify-center gap-0.5">
          {Array.from({ length: weapon.rarity }).map((_, i) => (
            <span key={i} className={cn("text-[8px]", RARITY_STAR[weapon.rarity])}>★</span>
          ))}
        </div>
        {weapon.substat !== "None" && (
          <p className={cn("text-[10px]", SUBSTAT_COLOR[weapon.substat] || "text-guild-muted")}>{weapon.substat}</p>
        )}
      </div>
    </div>
    </Link>
  );
}
