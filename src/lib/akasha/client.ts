import { getCached } from "@/lib/redis";
import type { AkashaProfile, AkashaCharacter } from "./types";

const AKASHA_BASE = "https://akasha.cv/api";
const USER_AGENT = "Guild-GenshinApp/2.0";
const TIMEOUT_MS = 15000;

export async function fetchAkashaProfile(uid: string): Promise<AkashaProfile> {
  return getCached<AkashaProfile>(
    `guild:profile:${uid}`,
    300, // 5 min TTL
    () => fetchFromAkasha(uid)
  );
}

async function fetchFromAkasha(uid: string): Promise<AkashaProfile> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${AKASHA_BASE}/getCalculationsForUser/${uid}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Akasha API returned ${res.status}`);
    }

    const json = await res.json();
    const characters: AkashaCharacter[] = (json.data || []).map(
      (entry: Record<string, unknown>) => parseCharacter(entry)
    );

    return {
      uid,
      characters,
      fetchedAt: Date.now(),
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Akasha request timed out after 15 seconds");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

function parseCharacter(raw: Record<string, unknown>): AkashaCharacter {
  const weaponRaw = raw.weapon as Record<string, unknown> | undefined;
  const weaponInfo = weaponRaw?.weaponInfo as Record<string, unknown> | undefined;
  const refinementLevel = weaponInfo?.refinementLevel as Record<string, unknown> | undefined;

  return {
    id: String(raw._id || ""),
    name: String(raw.name || "Unknown"),
    characterId: Number(raw.characterId || 0),
    constellation: Number(raw.constellation || 0),
    icon: String(raw.icon || ""),
    weapon: {
      name: String(weaponRaw?.name || "Unknown"),
      icon: String(weaponRaw?.icon || ""),
      weaponId: Number(weaponRaw?.weaponId || 0),
      level: Number((weaponInfo?.level as number) || 1),
      refinement: Number((refinementLevel?.value as number) || 1),
      rarity: Number(weaponRaw?.rarity || 3),
    },
    artifactSets: (raw.artifactSets || {}) as Record<string, { count: number; icon: string }>,
    calculations: {
      fit: raw.calculations
        ? parseCalculation((raw.calculations as Record<string, unknown>).fit)
        : undefined,
    },
  };
}

function parseCalculation(
  raw: unknown
): AkashaCharacter["calculations"]["fit"] | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const calc = raw as Record<string, unknown>;
  const weapon = calc.weapon as Record<string, unknown> | undefined;
  return {
    calculationId: String(calc.calculationId || ""),
    name: String(calc.name || ""),
    details: String(calc.details || ""),
    ranking: Number(calc.ranking || 0),
    outOf: Number(calc.outOf || 0),
    result: Number(calc.result || 0),
    weapon: {
      name: String(weapon?.name || ""),
      rarity: Number(weapon?.rarity || 3),
      refinement: Number(weapon?.refinement || 1),
    },
  };
}
