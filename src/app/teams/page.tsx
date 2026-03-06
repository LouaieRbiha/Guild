"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ALL_CHARACTERS, charIconUrl, type CharacterEntry } from "@/lib/characters";
import { ELEMENT_COLORS } from "@/lib/constants";
import { ELEMENT_ICONS } from "@/components/icons/genshin-icons";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FallbackImage } from "@/components/shared/fallback-image";
import { Users, Search } from "lucide-react";

// ── Character lookup ──────────────────────────────────────────────────

const CHAR_BY_NAME = new Map<string, CharacterEntry>();
for (const c of ALL_CHARACTERS) {
  CHAR_BY_NAME.set(c.name, c);
}

// Also handle display-name aliases (e.g. "Kazuha" -> "Kaedehara Kazuha")
const CHAR_BY_SHORT = new Map<string, CharacterEntry>();
for (const c of ALL_CHARACTERS) {
  const parts = c.name.split(" ");
  if (parts.length > 1) {
    CHAR_BY_SHORT.set(parts[parts.length - 1], c);
  }
}

function findCharacter(name: string): CharacterEntry | undefined {
  return CHAR_BY_NAME.get(name) ?? CHAR_BY_SHORT.get(name);
}

// ── Elemental Resonance Data ──────────────────────────────────────────

const RESONANCES: Record<string, { name: string; effect: string }> = {
  Pyro: { name: "Fervent Flames", effect: "ATK +25%" },
  Hydro: { name: "Soothing Water", effect: "HP +25%" },
  Electro: { name: "High Voltage", effect: "Energy particles from Electro reactions" },
  Cryo: { name: "Shattering Ice", effect: "CRIT Rate +15% vs Frozen/Cryo enemies" },
  Geo: { name: "Enduring Rock", effect: "Shield STR +15%, DMG +15% when shielded" },
  Anemo: { name: "Impetuous Winds", effect: "Stamina -15%, Movement SPD +10%, CD -5%" },
  Dendro: { name: "Sprawling Greenery", effect: "EM +50/30/20 from reactions" },
};

// ── Team Data ─────────────────────────────────────────────────────────

interface TeamComp {
  name: string;
  members: string[];
  archetype: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const TEAMS: TeamComp[] = [
  { name: "National Team", members: ["Xiangling", "Bennett", "Xingqiu", "Raiden Shogun"], archetype: "Vaporize/Overload", description: "The most versatile team in Genshin. Bennett buffs, Xingqiu applies Hydro, Xiangling vaporizes, Raiden drives and provides energy.", difficulty: "Easy" },
  { name: "Hyperbloom", members: ["Nahida", "Xingqiu", "Raiden Shogun", "Zhongli"], archetype: "Dendro", description: "Nahida applies Dendro, Xingqiu creates Bloom seeds, Raiden triggers Hyperbloom for massive AoE damage.", difficulty: "Medium" },
  { name: "Freeze (Morgana)", members: ["Ganyu", "Mona", "Venti", "Diona"], archetype: "Freeze", description: "Classic permafreeze team. Ganyu's quadratic scaling with Venti's vortex creates absurd AoE damage.", difficulty: "Medium" },
  { name: "Double Hydro", members: ["Neuvillette", "Furina", "Kaedehara Kazuha", "Zhongli"], archetype: "Hydro", description: "Neuvillette main DPS powered by Furina's Fanfare stacks. Kazuha shreds resistance, Zhongli shields.", difficulty: "Easy" },
  { name: "Mono Geo", members: ["Navia", "Zhongli", "Albedo", "Gorou"], archetype: "Geo", description: "Full Geo resonance with Crystallize shields. Navia as DPS, Albedo sub-DPS, Gorou buffs DEF-scaling characters.", difficulty: "Easy" },
  { name: "Taser", members: ["Sucrose", "Fischl", "Beidou", "Xingqiu"], archetype: "Electro-Charged", description: "Sucrose drives Electro-Charged reactions. Fischl and Beidou provide off-field Electro, Xingqiu adds Hydro and damage reduction.", difficulty: "Medium" },
  { name: "Burning Melt", members: ["Wriothesley", "Xiangling", "Bennett", "Nahida"], archetype: "Melt", description: "Nahida maintains Burning on enemies, giving Wriothesley consistent Melt reactions on his charged attacks.", difficulty: "Hard" },
  { name: "Quicken Aggravate", members: ["Keqing", "Fischl", "Nahida", "Kaedehara Kazuha"], archetype: "Quicken", description: "Nahida applies Dendro for Quicken aura. Keqing and Fischl Aggravate for massive Electro damage. Kazuha buffs and shreds.", difficulty: "Medium" },
  { name: "Xiao Hyper", members: ["Xiao", "Faruzan", "Bennett", "Zhongli"], archetype: "Anemo", description: "Xiao plunging focused DPS. Faruzan provides Anemo RES shred and DMG bonus. Bennett ATK buff, Zhongli shields.", difficulty: "Medium" },
  { name: "Furina Overvape", members: ["Chevreuse", "Furina", "Fischl", "Bennett"], archetype: "Overload/Vape", description: "Chevreuse enables Pyro+Electro resonance with massive RES shred. Furina drives reactions, Bennett heals and buffs.", difficulty: "Easy" },
  { name: "Physical", members: ["Eula", "Raiden Shogun", "Rosaria", "Zhongli"], archetype: "Physical", description: "Eula physical DPS with Superconduct from Raiden. Rosaria provides CRIT share and Cryo resonance, Zhongli shields and shreds.", difficulty: "Easy" },
  { name: "Bloom Nilou", members: ["Nilou", "Nahida", "Yelan", "Baizhu"], archetype: "Bloom", description: "Nilou transforms Bloom seeds into Bountiful cores that deal massive AoE Dendro damage. Full Dendro+Hydro team required.", difficulty: "Hard" },
];

// ── Archetype filters ─────────────────────────────────────────────────

const ARCHETYPES = ["All", ...Array.from(new Set(TEAMS.map((t) => t.archetype)))];

// ── Difficulty colors ─────────────────────────────────────────────────

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-green-500/20 text-green-400 border-green-500/30",
  Medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

// ── Element ring color mapping (for character icon borders) ───────────

const ELEMENT_RING_COLOR: Record<string, string> = {
  Pyro: "ring-red-500/60",
  Hydro: "ring-blue-500/60",
  Anemo: "ring-teal-400/60",
  Cryo: "ring-cyan-400/60",
  Electro: "ring-purple-500/60",
  Geo: "ring-yellow-500/60",
  Dendro: "ring-green-500/60",
};

// ── Helpers ───────────────────────────────────────────────────────────

function getTeamResonances(members: string[]): { element: string; name: string; effect: string }[] {
  const elementCounts = new Map<string, number>();
  for (const name of members) {
    const char = findCharacter(name);
    if (!char) continue;
    elementCounts.set(char.element, (elementCounts.get(char.element) ?? 0) + 1);
  }

  const result: { element: string; name: string; effect: string }[] = [];
  for (const [element, count] of elementCounts) {
    if (count >= 2 && RESONANCES[element]) {
      result.push({ element, ...RESONANCES[element] });
    }
  }
  return result;
}

// ── Page Component ────────────────────────────────────────────────────

export default function TeamsPage() {
  const [search, setSearch] = useState("");
  const [archetype, setArchetype] = useState("All");

  const filteredTeams = useMemo(() => {
    const q = search.toLowerCase().trim();
    return TEAMS.filter((team) => {
      // Archetype filter
      if (archetype !== "All" && team.archetype !== archetype) return false;

      // Search filter — match team name or any member name
      if (q) {
        const matchesName = team.name.toLowerCase().includes(q);
        const matchesMember = team.members.some((m) => m.toLowerCase().includes(q));
        const matchesArchetype = team.archetype.toLowerCase().includes(q);
        if (!matchesName && !matchesMember && !matchesArchetype) return false;
      }

      return true;
    });
  }, [search, archetype]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2.5">
          <Users className="h-7 w-7 text-guild-accent" />
          Team Compositions
        </h1>
        <p className="text-sm text-guild-muted mt-1">
          Popular team compositions with elemental resonance info &middot; {TEAMS.length} teams
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-guild-muted pointer-events-none" />
        <Input
          placeholder="Search teams or characters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Archetype Filters */}
      <div className="flex flex-wrap gap-2">
        {ARCHETYPES.map((a) => (
          <Badge
            key={a}
            onClick={() => setArchetype(a)}
            className={cn(
              "cursor-pointer transition-all select-none",
              archetype === a
                ? "bg-guild-accent/15 text-guild-accent border-guild-accent/30"
                : "bg-guild-elevated text-guild-muted border-transparent hover:bg-guild-elevated/80",
            )}
          >
            {a}
          </Badge>
        ))}
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTeams.map((team) => {
          const resonances = getTeamResonances(team.members);

          return (
            <div
              key={team.name}
              className={cn(
                "guild-elevated rounded-xl border border-white/5 p-6",
                "hover:border-white/10 transition-colors",
              )}
            >
              {/* Team Name + Badges */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="text-lg font-bold">{team.name}</h2>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={cn(DIFFICULTY_COLORS[team.difficulty])}
                  >
                    {team.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Archetype Badge */}
              <div className="mb-4">
                <ArchetypeBadge archetype={team.archetype} />
              </div>

              {/* Character Icons */}
              <div className="flex items-center gap-3 mb-4">
                {team.members.map((memberName) => {
                  const char = findCharacter(memberName);
                  if (!char) {
                    return (
                      <div
                        key={memberName}
                        className="w-14 h-14 rounded-full bg-guild-elevated flex items-center justify-center text-guild-muted text-xs font-bold ring-2 ring-white/10"
                        title={memberName}
                      >
                        {memberName[0]}
                      </div>
                    );
                  }

                  const ringColor = ELEMENT_RING_COLOR[char.element] ?? "ring-white/20";
                  const EI = ELEMENT_ICONS[char.element];

                  return (
                    <div key={memberName} className="relative" title={char.name}>
                      <div
                        className={cn(
                          "w-14 h-14 rounded-full overflow-hidden ring-2",
                          ringColor,
                          "bg-guild-elevated/50",
                        )}
                      >
                        <FallbackImage
                          src={charIconUrl(char.id)}
                          alt={char.name}
                          width={56}
                          height={56}
                          className="rounded-full"
                        />
                      </div>
                      {EI && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-black/80 rounded-full p-0.5">
                          <EI size={14} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Description */}
              <p className="text-sm text-guild-muted leading-relaxed mb-3">
                {team.description}
              </p>

              {/* Elemental Resonances */}
              {resonances.length > 0 && (
                <div className="space-y-1.5 pt-3 border-t border-white/5">
                  {resonances.map((res) => {
                    const colors = ELEMENT_COLORS[res.element];
                    const EI = ELEMENT_ICONS[res.element];
                    return (
                      <div key={res.element} className="flex items-center gap-2 text-xs">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md font-medium",
                            colors?.bg,
                            colors?.text,
                            colors?.border,
                            "border",
                          )}
                        >
                          {EI && <EI size={11} />}
                          {res.name}
                        </span>
                        <span className="text-guild-dim">{res.effect}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredTeams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Users className="h-10 w-10 text-guild-dim" />
          <p className="text-lg text-guild-muted">No teams match your search.</p>
          <Badge
            onClick={() => {
              setSearch("");
              setArchetype("All");
            }}
            className="cursor-pointer bg-guild-accent/15 text-guild-accent border-guild-accent/30"
          >
            Clear Filters
          </Badge>
        </div>
      )}
    </div>
  );
}

// ── Archetype Badge ───────────────────────────────────────────────────

function ArchetypeBadge({ archetype }: { archetype: string }) {
  // Map archetype to an element color for visual consistency
  const ARCHETYPE_ELEMENT_MAP: Record<string, string> = {
    "Vaporize/Overload": "Pyro",
    "Dendro": "Dendro",
    "Freeze": "Cryo",
    "Hydro": "Hydro",
    "Geo": "Geo",
    "Electro-Charged": "Electro",
    "Melt": "Pyro",
    "Quicken": "Dendro",
    "Anemo": "Anemo",
    "Overload/Vape": "Pyro",
    "Physical": "Cryo",
    "Bloom": "Dendro",
  };

  const element = ARCHETYPE_ELEMENT_MAP[archetype];
  const colors = element ? ELEMENT_COLORS[element] : null;
  const EI = element ? ELEMENT_ICONS[element] : null;

  if (!colors) {
    return (
      <Badge variant="outline" className="text-guild-muted">
        {archetype}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(colors.text, colors.bg, colors.border, "gap-1")}
    >
      {EI && <EI size={12} />}
      {archetype}
    </Badge>
  );
}
