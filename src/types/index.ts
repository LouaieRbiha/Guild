// ── Core Entity Types ────────────────────────────────────────────────────
export type { CharacterEntry } from "@/lib/characters";
export type { WeaponEntry } from "@/lib/weapons";
export type { CharacterDetail, WeaponDetail, TalentInfo, ConstellationInfo, MaterialItem, MaterialGroup } from "@/lib/yatta/client";

// ── Common Enums / Unions ───────────────────────────────────────────────
export type Element = "Pyro" | "Hydro" | "Anemo" | "Cryo" | "Electro" | "Geo" | "Dendro";
export type WeaponType = "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst";
export type Rarity = 3 | 4 | 5;

// ── Banner Types ────────────────────────────────────────────────────────
export type { BannerPhase } from "@/data/banners";

// ── Event Types ─────────────────────────────────────────────────────────
export type { GameEvent, VersionInfo } from "@/data/events";

// ── Redemption Code Types ───────────────────────────────────────────────
export type { RedemptionCode } from "@/data/codes";

// ── Build / Guide Types ─────────────────────────────────────────────────
export type { CharacterBuild } from "@/data/character-builds";
export type { CharacterGuide, WeaponSource } from "@/data/character-guides";

// ── Tier List Types ─────────────────────────────────────────────────────
export type { Tier, Role, TierEntry } from "@/data/tier-list";

// ── Abyss Types ─────────────────────────────────────────────────────────
export type { AbyssEnemy, EnemyResistance, AbyssBoss, AbyssChamber, AbyssFloor, TeamComp, StygianModifier, StygianStage } from "@/data/abyss";

// ── Character Meta Types ────────────────────────────────────────────────
export type { Gender, Region, CharacterMeta } from "@/data/character-meta";
