"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ALL_CHARACTERS, charIconUrl, type CharacterEntry } from "@/lib/characters";
import { ELEMENT_ICONS } from "@/components/icons/genshin-icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  TIER_LIST,
  TIER_COLORS,
  TIER_ORDER,
  type Tier,
  type Role,
  type TierEntry,
} from "@/data/tier-list";

const ALL_ROLES: ("All" | Role)[] = ["All", "Main DPS", "Sub DPS", "Support", "Healer"];

const ROLE_COLORS: Record<Role, string> = {
  "Main DPS": "bg-red-500/20 text-red-300 border-red-500/30",
  "Sub DPS": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Support: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Healer: "bg-green-500/20 text-green-300 border-green-500/30",
};

// Build a lookup map: character name -> CharacterEntry
const CHAR_BY_NAME = new Map<string, CharacterEntry>();
for (const c of ALL_CHARACTERS) {
  CHAR_BY_NAME.set(c.name, c);
}

export default function TierListPage() {
  const [roleFilter, setRoleFilter] = useState<"All" | Role>("All");

  // Filter tier entries by role
  const filtered = useMemo(() => {
    if (roleFilter === "All") return TIER_LIST;
    return TIER_LIST.filter((entry) => entry.roles.includes(roleFilter));
  }, [roleFilter]);

  // Group by tier
  const grouped = useMemo(() => {
    const map = new Map<Tier, TierEntry[]>();
    for (const tier of TIER_ORDER) {
      map.set(tier, []);
    }
    for (const entry of filtered) {
      map.get(entry.tier)?.push(entry);
    }
    return map;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tier List</h1>
        <span className="text-base text-guild-muted">
          {filtered.length} characters
        </span>
      </div>

      {/* Role Filter */}
      <Card className="p-4 gap-3">
        <p className="text-sm font-medium text-guild-muted">Filter by role</p>
        <div className="flex flex-wrap gap-2">
          {ALL_ROLES.map((role) => (
            <Badge
              key={role}
              variant="outline"
              onClick={() => setRoleFilter(role)}
              className={cn(
                "cursor-pointer transition-all select-none",
                roleFilter === role
                  ? role === "All"
                    ? "bg-guild-accent/15 text-guild-accent border-guild-accent/30"
                    : ROLE_COLORS[role]
                  : "bg-guild-elevated text-guild-muted border-guild-border/50 hover:border-guild-border"
              )}
            >
              {role}
            </Badge>
          ))}
        </div>
      </Card>

      {/* Tier Rows */}
      <div className="space-y-3">
        {TIER_ORDER.map((tier) => {
          const entries = grouped.get(tier) || [];
          if (entries.length === 0) return null;
          const colors = TIER_COLORS[tier];

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

              {/* Characters */}
              <div className="flex-1 flex flex-wrap gap-2 p-3 bg-guild-card/50">
                {entries.map((entry) => {
                  const char = CHAR_BY_NAME.get(entry.name);
                  if (!char) return null;
                  const EI = ELEMENT_ICONS[char.element];

                  return (
                    <Link
                      key={entry.name}
                      href={`/database/${char.id}`}
                      className="group"
                    >
                      <div
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-lg p-2 w-[72px] sm:w-[80px] transition-colors",
                          "bg-guild-elevated/50 hover:bg-guild-elevated border border-transparent hover:border-guild-border"
                        )}
                        title={entry.notes || entry.name}
                      >
                        {/* Icon */}
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-guild-elevated/50">
                          <Image
                            src={charIconUrl(char.id)}
                            alt={char.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                          {/* Element badge */}
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

                        {/* Role badges */}
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
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-lg text-muted-foreground">
            No characters match this role filter.
          </p>
          <Badge
            variant="outline"
            onClick={() => setRoleFilter("All")}
            className="cursor-pointer bg-guild-accent/15 text-guild-accent border-guild-accent/30"
          >
            Show All
          </Badge>
        </div>
      )}
    </div>
  );
}
