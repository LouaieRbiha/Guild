import { ALL_CHARACTERS } from "@/lib/characters";
import { ALL_WEAPONS } from "@/lib/weapons";
import type {
  ActiveBanners,
  Banner,
  BannerCharacterInfo,
  BannerWeaponInfo,
} from "./types";

const BANNERS_URL =
  "https://raw.githubusercontent.com/MadeBaruna/paimon-moe/main/src/data/banners.js";

// Parse a JavaScript date string like "2026-02-25 18:00:00" to Date
function parseBannerDate(dateStr: string): Date {
  return new Date(dateStr.replace(" ", "T") + "+08:00"); // Server times are in UTC+8
}

// Extract JSON-like arrays from JavaScript source
function parseJSArray(source: string, varName: string): any[] {
  // Find the array export
  const regex = new RegExp(
    `export\\s+const\\s+${varName}\\s*=\\s*\\[`,
    "s"
  );
  const match = source.match(regex);
  if (!match || match.index === undefined) return [];

  // Find matching bracket
  let depth = 0;
  const start = match.index + match[0].length - 1;
  let i = start;
  for (; i < source.length; i++) {
    if (source[i] === "[") depth++;
    else if (source[i] === "]") {
      depth--;
      if (depth === 0) break;
    }
  }

  let arrayStr = source.slice(start, i + 1);

  // Convert JS to valid JSON:
  // 1. Add quotes around unquoted keys
  arrayStr = arrayStr.replace(/(\s+)(\w+)(\s*:)/g, '$1"$2"$3');
  // 2. Replace single quotes with double quotes
  arrayStr = arrayStr.replace(/'/g, '"');
  // 3. Remove trailing commas
  arrayStr = arrayStr.replace(/,\s*([}\]])/g, "$1");
  // 4. Handle true/false/null properly (they're already valid JSON)

  try {
    return JSON.parse(arrayStr);
  } catch {
    console.error("Failed to parse banner data for:", varName);
    return [];
  }
}

export async function getActiveBanners(): Promise<ActiveBanners> {
  try {
    const res = await fetch(BANNERS_URL, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error("Failed to fetch banner data:", res.status);
      return getFallbackBanners();
    }

    const source = await res.text();
    const now = new Date();

    // Parse character banners and weapon banners from the JS source
    const charBanners = parseJSArray(source, "characters");
    const weaponBanners = parseJSArray(source, "weapons");

    // Find active character banner (search from end for most recent)
    let activeChar: Banner | null = null;
    for (let idx = charBanners.length - 1; idx >= 0; idx--) {
      const b = charBanners[idx];
      const start = parseBannerDate(b.start);
      const end = parseBannerDate(b.end);
      if (now >= start && now <= end) {
        activeChar = {
          name: b.name || b.featured?.[0] || "Character Event Wish",
          image: b.image || "",
          start: b.start,
          end: b.end,
          featured5Star: b.featured || [],
          featured4Star: b.featuredRare || [],
          type: "character",
          version: b.version || "",
        };
        break;
      }
    }

    // Find active weapon banner (search from end for most recent)
    let activeWeapon: Banner | null = null;
    for (let idx = weaponBanners.length - 1; idx >= 0; idx--) {
      const b = weaponBanners[idx];
      const start = parseBannerDate(b.start);
      const end = parseBannerDate(b.end);
      if (now >= start && now <= end) {
        activeWeapon = {
          name: b.name || "Epitome Invocation",
          image: b.image || "",
          start: b.start,
          end: b.end,
          featured5Star: b.featured || [],
          featured4Star: b.featuredRare || [],
          type: "weapon",
          version: b.version || "",
        };
        break;
      }
    }

    return {
      character: activeChar,
      weapon: activeWeapon,
      chronicled: null, // parse separately if needed
    };
  } catch (error) {
    console.error("Error fetching banners:", error);
    return getFallbackBanners();
  }
}

// Map banner character names to existing character entries for icons
export function findCharacterByName(
  name: string
): BannerCharacterInfo | null {
  const char = ALL_CHARACTERS.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (!char) return null;
  return {
    name: char.name,
    id: char.id,
    element: char.element,
    icon: char.icon,
    rarity: char.rarity,
  };
}

// Map banner weapon names to existing weapon entries for icons
export function findWeaponByName(name: string): BannerWeaponInfo | null {
  const weapon = ALL_WEAPONS.find(
    (w) => w.name.toLowerCase() === name.toLowerCase()
  );
  if (!weapon) return null;
  return {
    name: weapon.name,
    id: weapon.id,
    type: weapon.type,
    icon: weapon.icon,
    rarity: weapon.rarity,
  };
}

// Fallback banner data if fetch fails
function getFallbackBanners(): ActiveBanners {
  return {
    character: {
      name: "Featured Character Banner",
      image: "",
      start: "2026-02-25 18:00:00",
      end: "2026-03-17 14:59:59",
      featured5Star: ["Varka", "Flins"],
      featured4Star: ["Bennett", "Xiangling", "Sucrose"],
      type: "character",
      version: "6.4",
    },
    weapon: {
      name: "Epitome Invocation",
      image: "",
      start: "2026-02-25 18:00:00",
      end: "2026-03-17 14:59:59",
      featured5Star: ["Gest of the Mighty Wolf", "Bloodsoaked Ruins"],
      featured4Star: [],
      type: "weapon",
      version: "6.4",
    },
    chronicled: null,
  };
}
