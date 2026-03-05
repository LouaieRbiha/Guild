// gi.yatta.moe API client for character detail data

const YATTA_BASE = "https://gi.yatta.moe/api/v2/en";
import { YATTA_ASSETS } from "@/lib/constants";
export { YATTA_ASSETS } from "@/lib/constants";

// ── Types ──────────────────────────────────────────────────────────────

export interface CharacterDetail {
  id: number;
  name: string;
  title: string;
  description: string;
  element: string;
  weapon: string;
  rarity: number;
  region: string;
  birthday: string;
  constellation: string;
  affiliation: string;
  cv: { EN: string; JP: string; CHS: string; KR: string };
  icon: string;
  release: string;
  talents: TalentInfo[];
  constellations: ConstellationInfo[];
  passives: TalentInfo[];
  ascensionStat: string;
  ascensionMaterials: MaterialGroup[];
  talentMaterials: MaterialGroup[];
}

export interface TalentInfo {
  name: string;
  icon: string; // icon key for yatta assets
  description: string;
  type: "Normal Attack" | "Elemental Skill" | "Elemental Burst" | "Passive" | "Utility";
}

export interface ConstellationInfo {
  index: number; // 1-6
  name: string;
  icon: string;
  description: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  icon: string;
  rarity: number;
  count: number;
}

export interface MaterialGroup {
  phase: string; // e.g. "Phase 1 (Lv 20→40)" or "Lv 2→3"
  items: MaterialItem[];
}

// ── Internal API Response Types ───────────────────────────────────────

interface YattaTalentEntry {
  name?: string;
  icon?: string;
  description?: string;
  type?: number;
  promote?: Record<string, YattaPromoteEntry>;
}

interface YattaConstellationEntry {
  name?: string;
  icon?: string;
  description?: string;
}

interface YattaPromoteEntry {
  unlockMaxLevel?: number;
  costItems?: Record<string, number>;
  addProps?: Record<string, number>;
}

interface YattaItemEntry {
  name?: string;
  icon?: string;
  rank?: number;
}

interface YattaUpgradeProp {
  propType?: string;
  initValue?: number;
  type?: string;
}

interface YattaAffixUpgrade {
  name?: string;
  upgrade?: Record<string, string>;
}

// ── Helpers ────────────────────────────────────────────────────────────

const ELEM_MAP: Record<string, string> = {
  Fire: "Pyro", Water: "Hydro", Wind: "Anemo", Ice: "Cryo",
  Electric: "Electro", Rock: "Geo", Grass: "Dendro",
};

const WEAPON_MAP: Record<string, string> = {
  WEAPON_SWORD_ONE_HAND: "Sword", WEAPON_CLAYMORE: "Claymore",
  WEAPON_POLE: "Polearm", WEAPON_BOW: "Bow", WEAPON_CATALYST: "Catalyst",
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const TALENT_TYPE_MAP: Record<number, TalentInfo["type"]> = {
  0: "Normal Attack",
  1: "Elemental Burst",
};

export function cleanDescription(desc: string): string {
  if (!desc) return "";
  let cleaned = desc;
  // Remove HTML-style color tags <color=#RRGGBB>
  cleaned = cleaned.replace(/<color=#[A-Fa-f0-9]+>/g, "");
  cleaned = cleaned.replace(/<\/color>/g, "");
  // Remove {LAYOUT_MOBILE#...} blocks (keep PC content)
  cleaned = cleaned.replace(/\{LAYOUT_MOBILE#[^}]*\}/g, "");
  cleaned = cleaned.replace(/\{LAYOUT_PC#([^}]*)\}/g, "$1");
  // Remove {link#...} references
  cleaned = cleaned.replace(/\{link#[^}]*\}/g, "");
  // Remove {color#...} / {/color} tags
  cleaned = cleaned.replace(/\{color[^}]*\}/g, "");
  cleaned = cleaned.replace(/\{\/color\}/g, "");
  // Remove HTML italic tags
  cleaned = cleaned.replace(/<i>/g, "").replace(/<\/i>/g, "");
  // Clean up literal \n to actual newlines
  cleaned = cleaned.replace(/\\n/g, "\n");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  return cleaned.trim();
}

const REGION_DISPLAY: Record<string, string> = {
  MONDSTADT: "Mondstadt",
  LIYUE: "Liyue",
  INAZUMA: "Inazuma",
  SUMERU: "Sumeru",
  FONTAINE: "Fontaine",
  NATLAN: "Natlan",
  SNEZHNAYA: "Snezhnaya",
  NODKRAI: "Snezhnaya",
  NODKRAI_ZIBAI: "Snezhnaya",
  FATUI: "Snezhnaya (Fatui)",
  MAINACTOR: "Teyvat",
  RANGER: "Unknown",
  OMNI_SCOURGE: "Unknown",
};

const STAT_DISPLAY: Record<string, string> = {
  FIGHT_PROP_CRITICAL_HURT: "CRIT DMG",
  FIGHT_PROP_CRITICAL: "CRIT Rate",
  FIGHT_PROP_ATTACK_PERCENT: "ATK%",
  FIGHT_PROP_HP_PERCENT: "HP%",
  FIGHT_PROP_DEFENSE_PERCENT: "DEF%",
  FIGHT_PROP_CHARGE_EFFICIENCY: "Energy Recharge",
  FIGHT_PROP_ELEMENT_MASTERY: "Elemental Mastery",
  FIGHT_PROP_HEAL_ADD: "Healing Bonus",
  FIGHT_PROP_PHYSICAL_ADD_HURT: "Physical DMG Bonus",
  FIGHT_PROP_FIRE_ADD_HURT: "Pyro DMG Bonus",
  FIGHT_PROP_WATER_ADD_HURT: "Hydro DMG Bonus",
  FIGHT_PROP_WIND_ADD_HURT: "Anemo DMG Bonus",
  FIGHT_PROP_ICE_ADD_HURT: "Cryo DMG Bonus",
  FIGHT_PROP_ELEC_ADD_HURT: "Electro DMG Bonus",
  FIGHT_PROP_ROCK_ADD_HURT: "Geo DMG Bonus",
  FIGHT_PROP_GRASS_ADD_HURT: "Dendro DMG Bonus",
};

// ── Fetch ──────────────────────────────────────────────────────────────

export async function fetchCharacterDetail(id: string): Promise<CharacterDetail> {
  const res = await fetch(`${YATTA_BASE}/avatar/${id}`, {
    headers: { "User-Agent": "Guild-GenshinApp/1.0" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Yatta API error: ${res.status}`);
  const json = await res.json();
  const d = json.data;

  // Birthday
  const bday = d.birthday;
  const birthday = bday && bday.length === 2 ? `${MONTHS[bday[0] - 1]} ${bday[1]}` : "Unknown";

  // Release date
  const release = d.release
    ? new Date(d.release * 1000).toISOString().split("T")[0]
    : "Unknown";

  // Talents (type 0 = normal/skill, type 1 = burst)
  const talents: TalentInfo[] = [];
  const passives: TalentInfo[] = [];
  if (d.talent) {
    const entries = Object.values(d.talent) as YattaTalentEntry[];
    for (const t of entries) {
      const info: TalentInfo = {
        name: t.name || "Unknown",
        icon: t.icon || "",
        description: cleanDescription(t.description || ""),
        type: t.type === 2 ? "Passive" : (t.type !== undefined ? TALENT_TYPE_MAP[t.type] || "Normal Attack" : "Normal Attack"),
      };
      // Type 0 entries: first is Normal Attack, second is Elemental Skill
      if (t.type === 2) {
        // Check if it's a utility passive (no combat effect, like cooking/crafting)
        const desc = (t.description || "").toLowerCase();
        if (desc.includes("expedition") || desc.includes("craft") || desc.includes("cook") || desc.includes("recipe")) {
          info.type = "Utility";
        }
        passives.push(info);
      } else {
        // For type 0: first occurrence is NA, subsequent are Skill
        if (t.type === 0 && talents.filter(tt => tt.type === "Normal Attack").length > 0) {
          info.type = "Elemental Skill" as TalentInfo["type"];
        }
        talents.push(info);
      }
    }
  }

  // Constellations
  const constellations: ConstellationInfo[] = [];
  if (d.constellation) {
    const entries = Object.entries(d.constellation) as [string, YattaConstellationEntry][];
    for (const [idx, c] of entries) {
      constellations.push({
        index: parseInt(idx) + 1,
        name: c.name || `C${parseInt(idx) + 1}`,
        icon: c.icon || "",
        description: cleanDescription(c.description || ""),
      });
    }
  }

  // Fetter info
  const fetter = d.fetter || {};

  // Parse materials helper
  const itemsMap = d.items || {};
  function parseMaterials(promote: YattaPromoteEntry[], phaseLabel: (i: number, p: YattaPromoteEntry) => string): MaterialGroup[] {
    const groups: MaterialGroup[] = [];
    for (let i = 0; i < promote.length; i++) {
      const p = promote[i];
      const costs = p.costItems;
      if (!costs || Object.keys(costs).length === 0) continue;
      const items: MaterialItem[] = [];
      for (const [itemId, count] of Object.entries(costs)) {
        const info = itemsMap[itemId];
        items.push({
          id: itemId,
          name: info?.name || `Item ${itemId}`,
          icon: info?.icon || "",
          rarity: info?.rank || 1,
          count: count as number,
        });
      }
      groups.push({ phase: phaseLabel(i, p), items });
    }
    return groups;
  }

  // Ascension materials
  const ascPromote = d.upgrade?.promote || [];
  const ascensionMaterials = parseMaterials(ascPromote, (i, p) => {
    const prevLv = i > 0 ? ascPromote[i - 1]?.unlockMaxLevel || 20 : 20;
    return `Phase ${i} — Lv ${prevLv}→${p.unlockMaxLevel}`;
  });

  // Talent materials (merge from first active talent's promote)
  const firstTalent = d.talent ? (Object.values(d.talent) as YattaTalentEntry[])[0] : null;
  const talentPromote = firstTalent?.promote ? Object.entries(firstTalent.promote) : [];
  const talentMaterials: MaterialGroup[] = [];
  for (const [lvl, info] of talentPromote) {
    const p = info as YattaPromoteEntry;
    const costs = p?.costItems;
    if (!costs || Object.keys(costs).length === 0) continue;
    const items: MaterialItem[] = [];
    for (const [itemId, count] of Object.entries(costs)) {
      const itemInfo = itemsMap[itemId];
      items.push({
        id: itemId,
        name: itemInfo?.name || `Item ${itemId}`,
        icon: itemInfo?.icon || "",
        rarity: itemInfo?.rank || 1,
        count: count as number,
      });
    }
    const from = parseInt(lvl);
    talentMaterials.push({ phase: `Lv ${from}→${from + 1}`, items });
  }

  return {
    id: d.id,
    name: d.name || "Unknown",
    title: fetter.title || d.route || "",
    description: fetter.detail || "",
    element: ELEM_MAP[d.element] || d.element || "Unknown",
    weapon: WEAPON_MAP[d.weaponType] || d.weaponType || "Unknown",
    rarity: d.rank || 5,
    region: REGION_DISPLAY[d.region] || d.region || "Unknown",
    birthday,
    constellation: fetter.constellation || "",
    affiliation: fetter.native || "",
    cv: fetter.cv || { EN: "", JP: "", CHS: "", KR: "" },
    icon: d.icon || "",
    release,
    talents,
    constellations,
    passives,
    ascensionStat: STAT_DISPLAY[d.specialProp] || d.specialProp || "Unknown",
    ascensionMaterials,
    talentMaterials,
  };
}

export function yattaIconUrl(icon: string): string {
  return `${YATTA_ASSETS}/${icon}.png`;
}

// ── Weapon Detail ──────────────────────────────────────────────────────

export interface WeaponDetail {
  id: number;
  name: string;
  rarity: number;
  type: string;
  description: string;
  icon: string;
  baseAtk: number;
  baseAtkMax: number; // Lv 90 value
  substat: string;
  substatValue: number;
  substatValueMax: number; // Lv 90 value
  passiveName: string;
  passiveDesc: string; // R1 passive description
  refinements: { rank: number; description: string }[];
  ascensionMaterials: MaterialGroup[];
}

export async function fetchWeaponDetail(id: string): Promise<WeaponDetail> {
  const res = await fetch(`${YATTA_BASE}/weapon/${id}`, {
    headers: { "User-Agent": "Guild-GenshinApp/1.0" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Yatta weapon API error: ${res.status}`);
  const json = await res.json();
  const d = json.data;

  // Base stats from upgrade.prop
  const props = d.upgrade?.prop || [];
  const baseAtkProp = props.find((p: YattaUpgradeProp) => p.propType === "FIGHT_PROP_BASE_ATTACK");
  const subProp = props.find((p: YattaUpgradeProp) => p.propType !== "FIGHT_PROP_BASE_ATTACK");

  const substatName = STAT_DISPLAY[d.specialProp] || d.specialProp || "None";

  // Affix / passive
  let passiveName = "";
  let passiveDesc = "";
  const refinements: { rank: number; description: string }[] = [];
  if (d.affix) {
    const affixEntry = Object.values(d.affix)[0] as YattaAffixUpgrade;
    if (affixEntry) {
      passiveName = affixEntry.name || "";
      const upgrade = affixEntry.upgrade || {};
      for (const [idx, desc] of Object.entries(upgrade)) {
        const cleaned = cleanDescription(desc as string);
        refinements.push({ rank: parseInt(idx) + 1, description: cleaned });
        if (parseInt(idx) === 0) passiveDesc = cleaned;
      }
    }
  }

  // Compute Lv 90 stats from promote data
  // promote addProps are CUMULATIVE — use the last entry's value
  const promotes = d.upgrade?.promote || [];
  const lastPromote = promotes[promotes.length - 1];
  const promoteAtk = lastPromote?.addProps?.FIGHT_PROP_BASE_ATTACK || 0;

  // Growth curve multipliers at Lv 90 (verified against wiki values)
  const atkCurve = baseAtkProp?.type || "";
  const subCurve = subProp?.type || "";
  const CURVE_MULT: Record<string, number> = {
    "GROW_CURVE_ATTACK_101": 7.337,   // 3★
    "GROW_CURVE_ATTACK_201": 8.358,   // 4★ low base
    "GROW_CURVE_ATTACK_202": 9.359,   // 4★ high base
    "GROW_CURVE_ATTACK_301": 9.171,   // 5★ mid base (46)
    "GROW_CURVE_ATTACK_302": 10.246,  // 5★ high base (48)
    "GROW_CURVE_ATTACK_303": 9.171,   // 5★ (same as 301)
    "GROW_CURVE_ATTACK_304": 8.015,   // 5★ low base (44)
    "GROW_CURVE_CRITICAL_101": 4.596, // 3★ substat
    "GROW_CURVE_CRITICAL_201": 4.596, // 4★ substat
    "GROW_CURVE_CRITICAL_301": 4.594, // 5★ substat
  };
  const atkMult = CURVE_MULT[atkCurve] || 8.0;
  const subMult = CURVE_MULT[subCurve] || 4.595;

  const baseAtkMax = Math.round((baseAtkProp?.initValue || 0) * atkMult + promoteAtk);
  const substatValueMax = (subProp?.initValue || 0) * subMult;

  return {
    id: d.id,
    name: d.name || "Unknown",
    rarity: d.rank || 4,
    type: d.type || "Unknown",
    description: d.description || "",
    icon: d.icon || "",
    baseAtk: Math.round(baseAtkProp?.initValue || 0),
    baseAtkMax,
    substat: substatName,
    substatValue: subProp?.initValue || 0,
    substatValueMax,
    passiveName,
    passiveDesc,
    refinements,
    ascensionMaterials: parseWeaponMaterials(d),
  };
}

interface YattaWeaponData {
  items?: Record<string, YattaItemEntry>;
  upgrade?: {
    promote?: YattaPromoteEntry[];
    prop?: YattaUpgradeProp[];
  };
}

function parseWeaponMaterials(d: YattaWeaponData): MaterialGroup[] {
  const itemsMap = d.items || {};
  const promote = d.upgrade?.promote || [];
  const groups: MaterialGroup[] = [];
  for (let i = 0; i < promote.length; i++) {
    const p = promote[i];
    const costs = p.costItems;
    if (!costs || Object.keys(costs).length === 0) continue;
    const items: MaterialItem[] = [];
    for (const [itemId, count] of Object.entries(costs)) {
      const info = itemsMap[itemId];
      items.push({
        id: itemId,
        name: info?.name || `Item ${itemId}`,
        icon: info?.icon || "",
        rarity: info?.rank || 1,
        count: count as number,
      });
    }
    const prevLv = i > 0 ? promote[i - 1]?.unlockMaxLevel || 20 : 20;
    groups.push({ phase: `Phase ${groups.length + 1} — Lv ${prevLv}→${p.unlockMaxLevel}`, items });
  }
  return groups;
}
