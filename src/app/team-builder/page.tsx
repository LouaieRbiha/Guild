"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  ALL_CHARACTERS,
  charIconUrl,
  type CharacterEntry,
} from "@/lib/characters";
import { ELEMENT_COLORS } from "@/lib/constants";
import { ELEMENT_ICONS } from "@/components/icons/genshin-icons";
import { CHARACTER_BUILDS } from "@/data/character-builds";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FallbackImage } from "@/components/shared/fallback-image";
import {
  Users,
  Plus,
  X,
  Search,
  Save,
  Trash2,
  Shield,
  Zap,
  Sparkles,
  Download,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────

const STORAGE_KEY = "guild-team-builder";
const MAX_SAVED_TEAMS = 10;
const TEAM_SIZE = 4;

const ELEMENT_FILTERS = [
  "All",
  "Pyro",
  "Hydro",
  "Anemo",
  "Cryo",
  "Electro",
  "Geo",
  "Dendro",
] as const;

const ELEMENT_RING: Record<string, string> = {
  Pyro: "ring-red-500/60",
  Hydro: "ring-blue-500/60",
  Anemo: "ring-teal-400/60",
  Cryo: "ring-cyan-400/60",
  Electro: "ring-purple-500/60",
  Geo: "ring-yellow-500/60",
  Dendro: "ring-green-500/60",
};

const ELEMENT_BORDER: Record<string, string> = {
  Pyro: "border-red-500/40",
  Hydro: "border-blue-500/40",
  Anemo: "border-teal-400/40",
  Cryo: "border-cyan-400/40",
  Electro: "border-purple-500/40",
  Geo: "border-yellow-500/40",
  Dendro: "border-green-500/40",
};

// ── Elemental Resonance Data ─────────────────────────────────────────

const RESONANCE_DATA: Record<
  string,
  { name: string; description: string }
> = {
  Pyro: {
    name: "Fervent Flames",
    description: "Affected by Cryo for 40% less time. Increases ATK by 25%.",
  },
  Hydro: {
    name: "Soothing Water",
    description:
      "Affected by Pyro for 40% less time. Increases Max HP by 25%.",
  },
  Cryo: {
    name: "Shattering Ice",
    description:
      "Affected by Electro for 40% less time. Increases CRIT Rate against Frozen or Cryo-affected enemies by 15%.",
  },
  Electro: {
    name: "High Voltage",
    description:
      "Affected by Hydro for 40% less time. Superconduct, Overloaded, Electro-Charged, Quicken, Aggravate, and Hyperbloom have a 100% chance to generate an Electro Elemental Particle (CD: 5s).",
  },
  Geo: {
    name: "Enduring Rock",
    description:
      "Increases shield strength by 15%. Characters protected by a shield deal 15% more DMG.",
  },
  Anemo: {
    name: "Impetuous Winds",
    description:
      "Decreases Stamina Consumption by 15%. Increases Movement SPD by 10%. Shortens Skill CD by 5%.",
  },
  Dendro: {
    name: "Sprawling Greenery",
    description:
      "Elemental Mastery increased by 50. After triggering Burning, Quicken, or Bloom, all members gain 30 EM for 6s. After Aggravate, Spread, Hyperbloom, or Burgeon, all members gain 20 EM for 6s.",
  },
};

const PROTECTIVE_CANOPY = {
  name: "Protective Canopy",
  description: "All Elemental RES +15%, Physical RES +15%.",
};

// ── Types ────────────────────────────────────────────────────────────

type TeamSlot = CharacterEntry | null;

interface SavedTeam {
  name: string;
  characterIds: string[];
  savedAt: number;
}

// ── Character Lookup ─────────────────────────────────────────────────

const CHAR_BY_ID = new Map<string, CharacterEntry>();
for (const c of ALL_CHARACTERS) CHAR_BY_ID.set(c.id, c);

// ── Role Detection ───────────────────────────────────────────────────

function getCharacterRole(name: string): string | null {
  const build = CHARACTER_BUILDS[name];
  if (!build) return null;

  // Check if character appears first in any of their teams (likely Main DPS)
  const isMainDPS = build.teams.some((team) => team[0] === name);

  // Check main stats to infer role
  const { sands, goblet, circlet } = build.mainStats;
  const hasEMBuild =
    sands === "Elemental Mastery" &&
    goblet === "Elemental Mastery" &&
    circlet === "Elemental Mastery";
  const hasHPBuild =
    sands.includes("HP") &&
    goblet.includes("HP") &&
    circlet.includes("HP");
  const hasDEFBuild =
    sands.includes("DEF") &&
    goblet.includes("DEF") &&
    circlet.includes("DEF");
  const hasHealingBuild = circlet.includes("Healing Bonus");

  if (hasEMBuild) return "Support";
  if (hasDEFBuild) return "Support";
  if (hasHPBuild && hasHealingBuild) return "Healer";
  if (hasHPBuild && !isMainDPS) return "Support";
  if (isMainDPS) return "Main DPS";
  return "Sub DPS";
}

const ROLE_COLORS: Record<string, string> = {
  "Main DPS": "bg-red-500/15 text-red-400 border-red-500/25",
  "Sub DPS": "bg-amber-500/15 text-amber-400 border-amber-500/25",
  Support: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Healer: "bg-green-500/15 text-green-400 border-green-500/25",
};

// ── Resonance Calculator ─────────────────────────────────────────────

function calculateResonances(
  team: TeamSlot[]
): { element: string; name: string; description: string }[] {
  const filled = team.filter(Boolean) as CharacterEntry[];
  if (filled.length < TEAM_SIZE) return [];

  const elementCounts = new Map<string, number>();
  for (const char of filled) {
    elementCounts.set(
      char.element,
      (elementCounts.get(char.element) ?? 0) + 1
    );
  }

  const resonances: { element: string; name: string; description: string }[] =
    [];

  // Check for 4 unique elements -> Protective Canopy
  if (elementCounts.size === 4) {
    resonances.push({
      element: "All",
      name: PROTECTIVE_CANOPY.name,
      description: PROTECTIVE_CANOPY.description,
    });
  }

  // Check for element pairs
  for (const [element, count] of elementCounts) {
    if (count >= 2 && RESONANCE_DATA[element]) {
      resonances.push({
        element,
        ...RESONANCE_DATA[element],
      });
    }
  }

  return resonances;
}

// ── Page Component ───────────────────────────────────────────────────

export default function TeamBuilderPage() {
  const [team, setTeam] = useState<TeamSlot[]>([null, null, null, null]);
  const [search, setSearch] = useState("");
  const [elementFilter, setElementFilter] = useState("All");
  const [rarityFilter, setRarityFilter] = useState<number>(0);
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as SavedTeam[];
    } catch {
      // Ignore parse errors
    }
    return [];
  });
  const [teamName, setTeamName] = useState("");

  // Persist saved teams
  const persistTeams = useCallback((teams: SavedTeam[]) => {
    setSavedTeams(teams);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // IDs of characters currently in the team
  const teamIds = useMemo(
    () => new Set(team.filter(Boolean).map((c) => c!.id)),
    [team]
  );

  // Filtered character roster
  const filteredCharacters = useMemo(() => {
    const q = search.toLowerCase().trim();
    return ALL_CHARACTERS.filter((c) => {
      if (elementFilter !== "All" && c.element !== elementFilter) return false;
      if (rarityFilter && c.rarity !== rarityFilter) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    }).reverse(); // newest first
  }, [search, elementFilter, rarityFilter]);

  // Elemental resonances
  const resonances = useMemo(() => calculateResonances(team), [team]);

  // Team roles
  const teamRoles = useMemo(() => {
    return team.map((char) => {
      if (!char) return null;
      return getCharacterRole(char.name);
    });
  }, [team]);

  // ── Handlers ─────────────────────────────────────────────────────

  function addCharacter(char: CharacterEntry) {
    if (teamIds.has(char.id)) return;
    const emptyIdx = team.findIndex((slot) => slot === null);
    if (emptyIdx === -1) return;
    const newTeam = [...team];
    newTeam[emptyIdx] = char;
    setTeam(newTeam);
  }

  function removeCharacter(slotIdx: number) {
    const newTeam = [...team];
    newTeam[slotIdx] = null;
    setTeam(newTeam);
  }

  function clearTeam() {
    setTeam([null, null, null, null]);
  }

  function saveTeam() {
    const filled = team.filter(Boolean) as CharacterEntry[];
    if (filled.length === 0) return;

    const name =
      teamName.trim() ||
      filled.map((c) => c.name.split(" ").pop()).join(" / ");

    const newSaved: SavedTeam = {
      name,
      characterIds: team.map((c) => c?.id ?? ""),
      savedAt: Date.now(),
    };

    const updated = [newSaved, ...savedTeams].slice(0, MAX_SAVED_TEAMS);
    persistTeams(updated);
    setTeamName("");
  }

  function loadTeam(saved: SavedTeam) {
    const loaded: TeamSlot[] = saved.characterIds.map(
      (id) => CHAR_BY_ID.get(id) ?? null
    );
    setTeam(loaded);
  }

  function deleteSavedTeam(index: number) {
    const updated = savedTeams.filter((_, i) => i !== index);
    persistTeams(updated);
  }

  // ── Render ───────────────────────────────────────────────────────

  const filledCount = team.filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2.5">
          <Users className="h-7 w-7 text-guild-accent" />
          Team Builder
        </h1>
        <p className="text-sm text-guild-muted mt-1">
          Build your team, check elemental resonances, and save compositions
        </p>
      </div>

      {/* ── Team Slots ──────────────────────────────────────────────── */}
      <div className="rounded-xl bg-guild-card border border-white/5 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-guild-accent" />
            Your Team
            <span className="text-sm text-guild-muted font-normal">
              ({filledCount}/{TEAM_SIZE})
            </span>
          </h2>
          {filledCount > 0 && (
            <button
              onClick={clearTeam}
              className="text-xs text-guild-muted hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {team.map((char, idx) => (
            <TeamSlotCard
              key={idx}
              char={char}
              slotIndex={idx}
              role={teamRoles[idx]}
              onRemove={() => removeCharacter(idx)}
            />
          ))}
        </div>

        {/* ── Team Role Summary ────────────────────────────────────── */}
        {filledCount > 0 && teamRoles.some(Boolean) && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <h3 className="text-xs font-medium text-guild-muted uppercase tracking-wider mb-2">
              Team Roles
            </h3>
            <div className="flex flex-wrap gap-2">
              {team.map((char, idx) => {
                if (!char || !teamRoles[idx]) return null;
                const colors = ELEMENT_COLORS[char.element];
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span className={cn("font-medium", colors?.text)}>
                      {char.name.split(" ").pop()}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5 py-0",
                        ROLE_COLORS[teamRoles[idx]!]
                      )}
                    >
                      {teamRoles[idx]}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Elemental Resonances ────────────────────────────────── */}
        {resonances.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <h3 className="text-xs font-medium text-guild-muted uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" />
              Elemental Resonance
            </h3>
            <div className="space-y-2.5">
              {resonances.map((res) => {
                const colors =
                  res.element === "All" ? null : ELEMENT_COLORS[res.element];
                const EI =
                  res.element === "All" ? null : ELEMENT_ICONS[res.element];

                return (
                  <div
                    key={res.name}
                    className={cn(
                      "rounded-lg border p-3",
                      colors
                        ? `${colors.bg} ${colors.border}`
                        : "bg-white/5 border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {EI ? (
                        <EI size={16} />
                      ) : (
                        <Sparkles className="h-4 w-4 text-white/60" />
                      )}
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          colors?.text ?? "text-white/80"
                        )}
                      >
                        {res.name}
                      </span>
                    </div>
                    <p className="text-xs text-guild-muted leading-relaxed">
                      {res.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filledCount === TEAM_SIZE && resonances.length === 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-guild-dim italic">
              No elemental resonance active. You need at least 2 characters of
              the same element, or 4 unique elements.
            </p>
          </div>
        )}
      </div>

      {/* ── Save / Load ─────────────────────────────────────────────── */}
      <div className="rounded-xl bg-guild-card border border-white/5 p-4 sm:p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Save className="h-5 w-5 text-guild-accent" />
          Save &amp; Load Teams
        </h2>

        {/* Save Controls */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Team name (optional)"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") saveTeam();
            }}
          />
          <button
            onClick={saveTeam}
            disabled={filledCount === 0}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shrink-0",
              filledCount > 0
                ? "bg-guild-accent/20 text-guild-accent hover:bg-guild-accent/30 border border-guild-accent/30"
                : "bg-white/5 text-guild-dim border border-white/5 cursor-not-allowed"
            )}
          >
            <Save className="h-4 w-4" />
            Save
          </button>
        </div>

        {/* Saved Teams List */}
        {savedTeams.length > 0 ? (
          <div className="space-y-2">
            {savedTeams.map((saved, idx) => {
              const chars = saved.characterIds
                .map((id) => CHAR_BY_ID.get(id))
                .filter(Boolean) as CharacterEntry[];

              return (
                <div
                  key={`${saved.name}-${saved.savedAt}`}
                  className="flex items-center gap-3 rounded-lg bg-guild-elevated border border-white/5 p-3 group hover:border-white/10 transition-colors"
                >
                  {/* Character icons */}
                  <div className="flex -space-x-2">
                    {chars.map((c) => {
                      const ring = ELEMENT_RING[c.element] ?? "ring-white/20";
                      return (
                        <div
                          key={c.id}
                          className={cn(
                            "w-8 h-8 rounded-full overflow-hidden ring-2 bg-guild-elevated",
                            ring
                          )}
                        >
                          <FallbackImage
                            src={charIconUrl(c.id)}
                            alt={c.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        </div>
                      );
                    })}
                    {/* Empty slot placeholders */}
                    {Array.from({
                      length: TEAM_SIZE - chars.length,
                    }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="w-8 h-8 rounded-full bg-white/5 ring-2 ring-white/10"
                      />
                    ))}
                  </div>

                  {/* Team name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {saved.name}
                    </p>
                    <p className="text-[10px] text-guild-dim">
                      {new Date(saved.savedAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => loadTeam(saved)}
                      className="p-1.5 rounded-md hover:bg-guild-accent/20 text-guild-muted hover:text-guild-accent transition-colors"
                      title="Load team"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteSavedTeam(idx)}
                      className="p-1.5 rounded-md hover:bg-red-500/20 text-guild-muted hover:text-red-400 transition-colors"
                      title="Delete team"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-guild-dim text-center py-4">
            No saved teams yet. Build a team above and save it!
          </p>
        )}
      </div>

      {/* ── Character Roster ────────────────────────────────────────── */}
      <div className="rounded-xl bg-guild-card border border-white/5 p-4 sm:p-6">
        <h2 className="text-lg font-semibold mb-4">
          Character Roster
          <span className="text-sm text-guild-muted font-normal ml-2">
            {filteredCharacters.length} characters
          </span>
        </h2>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-guild-muted pointer-events-none" />
          <Input
            placeholder="Search characters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-guild-muted hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Element Filter */}
        <div className="flex flex-wrap gap-2 mb-3">
          {ELEMENT_FILTERS.map((el) => {
            const isAll = el === "All";
            const isActive = isAll
              ? elementFilter === "All"
              : elementFilter === el;
            const colors = !isAll ? ELEMENT_COLORS[el] : null;
            const EI = !isAll ? ELEMENT_ICONS[el] : null;

            return (
              <Badge
                key={el}
                onClick={() => setElementFilter(el)}
                className={cn(
                  "cursor-pointer transition-all select-none flex items-center gap-1.5",
                  isActive
                    ? colors
                      ? `${colors.bg} ${colors.text} ${colors.border}`
                      : "bg-guild-accent/15 text-guild-accent border-guild-accent/30"
                    : "bg-guild-elevated text-guild-muted border-transparent hover:bg-guild-elevated/80"
                )}
              >
                {EI && <EI size={14} />}
                {el}
              </Badge>
            );
          })}
        </div>

        {/* Rarity Filter */}
        <div className="flex gap-2 mb-4">
          {[0, 5, 4].map((r) => (
            <Badge
              key={r}
              onClick={() => setRarityFilter(r)}
              className={cn(
                "cursor-pointer transition-all select-none",
                rarityFilter === r
                  ? r === 5
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                    : r === 4
                      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                      : "bg-guild-accent/15 text-guild-accent border-guild-accent/30"
                  : "bg-guild-elevated text-guild-muted border-transparent hover:bg-guild-elevated/80"
              )}
            >
              {r === 0 ? "All" : `${r}\u2605`}
            </Badge>
          ))}
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2">
          {filteredCharacters.map((char) => {
            const inTeam = teamIds.has(char.id);
            const teamFull =
              team.filter(Boolean).length >= TEAM_SIZE && !inTeam;
            const EI = ELEMENT_ICONS[char.element];
            const ring = ELEMENT_RING[char.element] ?? "ring-white/20";

            return (
              <button
                key={char.id}
                onClick={() => addCharacter(char)}
                disabled={inTeam || teamFull}
                className={cn(
                  "relative group flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all",
                  inTeam
                    ? "opacity-40 cursor-not-allowed"
                    : teamFull
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:bg-white/5 cursor-pointer"
                )}
                title={
                  inTeam
                    ? `${char.name} (already in team)`
                    : teamFull
                      ? "Team is full"
                      : `Add ${char.name}`
                }
              >
                <div
                  className={cn(
                    "relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2",
                    inTeam ? "ring-white/10" : ring,
                    "bg-guild-elevated/50"
                  )}
                >
                  <FallbackImage
                    src={charIconUrl(char.id)}
                    alt={char.name}
                    width={56}
                    height={56}
                    className="rounded-full"
                  />
                  {inTeam && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-guild-accent" />
                    </div>
                  )}
                </div>
                {EI && (
                  <div className="absolute top-0 right-0 bg-black/80 rounded-full p-0.5">
                    <EI size={12} />
                  </div>
                )}
                <span className="text-[10px] text-guild-muted truncate w-full text-center leading-tight">
                  {char.name.split(" ").pop()}
                </span>
                {/* Rarity indicator */}
                <span
                  className={cn(
                    "text-[9px] leading-none",
                    char.rarity === 5 ? "text-amber-400/60" : "text-purple-400/60"
                  )}
                >
                  {char.rarity === 5 ? "\u2605\u2605\u2605\u2605\u2605" : "\u2605\u2605\u2605\u2605"}
                </span>
              </button>
            );
          })}
        </div>

        {filteredCharacters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Search className="h-8 w-8 text-guild-dim" />
            <p className="text-sm text-guild-muted">
              No characters match your filters.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setElementFilter("All");
                setRarityFilter(0);
              }}
              className="text-xs text-guild-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Team Slot Card ───────────────────────────────────────────────────

function TeamSlotCard({
  char,
  slotIndex,
  role,
  onRemove,
}: {
  char: TeamSlot;
  slotIndex: number;
  role: string | null;
  onRemove: () => void;
}) {
  if (!char) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-guild-elevated/30 p-4 sm:p-6 min-h-[140px] sm:min-h-[160px] transition-colors hover:border-white/20">
        <Plus className="h-8 w-8 text-guild-dim mb-2" />
        <span className="text-xs text-guild-dim">Slot {slotIndex + 1}</span>
      </div>
    );
  }

  const borderColor = ELEMENT_BORDER[char.element] ?? "border-white/10";
  const EI = ELEMENT_ICONS[char.element];

  return (
    <div
      className={cn(
        "relative group flex flex-col items-center rounded-xl border-2 p-4 sm:p-5 min-h-[140px] sm:min-h-[160px] transition-all cursor-pointer hover:bg-white/[0.03]",
        borderColor,
        "bg-guild-elevated/30"
      )}
      onClick={onRemove}
      title={`Click to remove ${char.name}`}
    >
      {/* Remove button */}
      <button
        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-guild-dim hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Character Icon */}
      <div
        className={cn(
          "w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden ring-2 mb-2",
          ELEMENT_RING[char.element] ?? "ring-white/20",
          "bg-guild-elevated/50"
        )}
      >
        <FallbackImage
          src={charIconUrl(char.id)}
          alt={char.name}
          width={80}
          height={80}
          className="rounded-full"
        />
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-white text-center truncate w-full">
        {char.name.length > 12 ? char.name.split(" ").pop() : char.name}
      </p>

      {/* Element + Rarity */}
      <div className="flex items-center gap-1.5 mt-1">
        {EI && <EI size={14} />}
        <span
          className={cn(
            "text-xs",
            char.rarity === 5 ? "text-amber-400" : "text-purple-400"
          )}
        >
          {char.rarity === 5 ? "\u2605\u2605\u2605\u2605\u2605" : "\u2605\u2605\u2605\u2605"}
        </span>
      </div>

      {/* Role Badge */}
      {role && (
        <Badge
          variant="outline"
          className={cn("mt-2 text-[10px] px-1.5 py-0", ROLE_COLORS[role])}
        >
          {role}
        </Badge>
      )}
    </div>
  );
}
