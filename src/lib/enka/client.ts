// Enka.Network API client and data parser for Genshin Impact

const ENKA_BASE = "https://enka.network";
const ENKA_API = `${ENKA_BASE}/api/uid`;

// ── Prop name mappings ─────────────────────────────────────────────────

const EQUIP_TYPE_MAP: Record<string, string> = {
  EQUIP_BRACER: "Flower",
  EQUIP_NECKLACE: "Plume",
  EQUIP_SHOES: "Sands",
  EQUIP_RING: "Goblet",
  EQUIP_DRESS: "Circlet",
};

const APPEND_PROP_MAP: Record<string, string> = {
  FIGHT_PROP_HP: "HP",
  FIGHT_PROP_ATTACK: "ATK",
  FIGHT_PROP_DEFENSE: "DEF",
  FIGHT_PROP_HP_PERCENT: "HP%",
  FIGHT_PROP_ATTACK_PERCENT: "ATK%",
  FIGHT_PROP_DEFENSE_PERCENT: "DEF%",
  FIGHT_PROP_CRITICAL: "CRIT Rate",
  FIGHT_PROP_CRITICAL_HURT: "CRIT DMG",
  FIGHT_PROP_CHARGE_EFFICIENCY: "Energy Recharge",
  FIGHT_PROP_HEAL_ADD: "Healing Bonus",
  FIGHT_PROP_ELEMENT_MASTERY: "Elemental Mastery",
  FIGHT_PROP_PHYSICAL_ADD_HURT: "Physical DMG%",
  FIGHT_PROP_FIRE_ADD_HURT: "Pyro DMG%",
  FIGHT_PROP_ELEC_ADD_HURT: "Electro DMG%",
  FIGHT_PROP_WATER_ADD_HURT: "Hydro DMG%",
  FIGHT_PROP_WIND_ADD_HURT: "Anemo DMG%",
  FIGHT_PROP_ICE_ADD_HURT: "Cryo DMG%",
  FIGHT_PROP_ROCK_ADD_HURT: "Geo DMG%",
  FIGHT_PROP_GRASS_ADD_HURT: "Dendro DMG%",
  FIGHT_PROP_BASE_ATTACK: "Base ATK",
};

// Character ID → name mapping (top used characters)
const CHARACTER_MAP: Record<number, { name: string; element: string }> = {
  10000002: { name: "Kamisato Ayaka", element: "Cryo" },
  10000003: { name: "Jean", element: "Anemo" },
  10000005: { name: "Traveler", element: "Anemo" },
  10000006: { name: "Lisa", element: "Electro" },
  10000007: { name: "Traveler", element: "Anemo" },
  10000014: { name: "Barbara", element: "Hydro" },
  10000015: { name: "Kaeya", element: "Cryo" },
  10000016: { name: "Diluc", element: "Pyro" },
  10000020: { name: "Razor", element: "Electro" },
  10000021: { name: "Amber", element: "Pyro" },
  10000022: { name: "Venti", element: "Anemo" },
  10000023: { name: "Xiangling", element: "Pyro" },
  10000024: { name: "Beidou", element: "Electro" },
  10000025: { name: "Xingqiu", element: "Hydro" },
  10000026: { name: "Xiao", element: "Anemo" },
  10000027: { name: "Ningguang", element: "Geo" },
  10000029: { name: "Klee", element: "Pyro" },
  10000030: { name: "Zhongli", element: "Geo" },
  10000031: { name: "Fischl", element: "Electro" },
  10000032: { name: "Bennett", element: "Pyro" },
  10000033: { name: "Tartaglia", element: "Hydro" },
  10000034: { name: "Noelle", element: "Geo" },
  10000035: { name: "Qiqi", element: "Cryo" },
  10000036: { name: "Chongyun", element: "Cryo" },
  10000037: { name: "Ganyu", element: "Cryo" },
  10000038: { name: "Albedo", element: "Geo" },
  10000039: { name: "Diona", element: "Cryo" },
  10000041: { name: "Mona", element: "Hydro" },
  10000042: { name: "Keqing", element: "Electro" },
  10000043: { name: "Sucrose", element: "Anemo" },
  10000044: { name: "Xinyan", element: "Pyro" },
  10000045: { name: "Rosaria", element: "Cryo" },
  10000046: { name: "Hu Tao", element: "Pyro" },
  10000047: { name: "Kaedehara Kazuha", element: "Anemo" },
  10000048: { name: "Yanfei", element: "Pyro" },
  10000049: { name: "Yoimiya", element: "Pyro" },
  10000050: { name: "Thoma", element: "Pyro" },
  10000051: { name: "Arataki Itto", element: "Geo" },
  10000052: { name: "Raiden Shogun", element: "Electro" },
  10000053: { name: "Sangonomiya Kokomi", element: "Hydro" },
  10000054: { name: "Gorou", element: "Geo" },
  10000055: { name: "Kujou Sara", element: "Electro" },
  10000056: { name: "Kamisato Ayato", element: "Hydro" },
  10000057: { name: "Yae Miko", element: "Electro" },
  10000058: { name: "Yelan", element: "Hydro" },
  10000059: { name: "Kirara", element: "Dendro" },
  10000060: { name: "Shikanoin Heizou", element: "Anemo" },
  10000062: { name: "Aloy", element: "Cryo" },
  10000063: { name: "Shenhe", element: "Cryo" },
  10000064: { name: "Yun Jin", element: "Geo" },
  10000065: { name: "Kuki Shinobu", element: "Electro" },
  10000066: { name: "Collei", element: "Dendro" },
  10000067: { name: "Dori", element: "Electro" },
  10000068: { name: "Tighnari", element: "Dendro" },
  10000069: { name: "Nilou", element: "Hydro" },
  10000070: { name: "Cyno", element: "Electro" },
  10000071: { name: "Candace", element: "Hydro" },
  10000072: { name: "Nahida", element: "Dendro" },
  10000073: { name: "Layla", element: "Cryo" },
  10000074: { name: "Wanderer", element: "Anemo" },
  10000075: { name: "Faruzan", element: "Anemo" },
  10000076: { name: "Yaoyao", element: "Dendro" },
  10000077: { name: "Alhaitham", element: "Dendro" },
  10000078: { name: "Dehya", element: "Pyro" },
  10000079: { name: "Mika", element: "Cryo" },
  10000080: { name: "Kaveh", element: "Dendro" },
  10000081: { name: "Baizhu", element: "Dendro" },
  10000082: { name: "Lynette", element: "Anemo" },
  10000083: { name: "Lyney", element: "Pyro" },
  10000084: { name: "Freminet", element: "Cryo" },
  10000085: { name: "Wriothesley", element: "Cryo" },
  10000086: { name: "Neuvillette", element: "Hydro" },
  10000087: { name: "Charlotte", element: "Cryo" },
  10000088: { name: "Furina", element: "Hydro" },
  10000089: { name: "Chevreuse", element: "Pyro" },
  10000090: { name: "Navia", element: "Geo" },
  10000091: { name: "Gaming", element: "Pyro" },
  10000092: { name: "Xianyun", element: "Anemo" },
  10000093: { name: "Chiori", element: "Geo" },
  10000094: { name: "Sigewinne", element: "Hydro" },
  10000095: { name: "Arlecchino", element: "Pyro" },
  10000096: { name: "Sethos", element: "Electro" },
  10000097: { name: "Clorinde", element: "Electro" },
  10000098: { name: "Emilie", element: "Dendro" },
  10000099: { name: "Kachina", element: "Geo" },
  10000100: { name: "Kinich", element: "Dendro" },
  10000101: { name: "Mualani", element: "Hydro" },
  10000102: { name: "Xilonen", element: "Geo" },
  10000103: { name: "Chasca", element: "Anemo" },
  10000104: { name: "Ororon", element: "Electro" },
  10000105: { name: "Citlali", element: "Cryo" },
  10000106: { name: "Mavuika", element: "Pyro" },
  10000107: { name: "Lan Yan", element: "Anemo" },
  10000108: { name: "Mizuki", element: "Anemo" },
  10000110: { name: "Iansan", element: "Electro" },
  10000111: { name: "Varesa", element: "Electro" },
  10000112: { name: "Escoffier", element: "Hydro" },
  10000113: { name: "Ifa", element: "Electro" },
  10000114: { name: "Skirk", element: "Hydro" },
  10000115: { name: "Dahlia", element: "Dendro" },
  10000116: { name: "Ineffa", element: "Cryo" },
  10000119: { name: "Lauma", element: "Dendro" },
  10000120: { name: "Flins", element: "Electro" },
  10000121: { name: "Aino", element: "Hydro" },
  10000122: { name: "Nefer", element: "Dendro" },
  10000123: { name: "Durin", element: "Pyro" },
  10000124: { name: "Jahoda", element: "Anemo" },
  10000125: { name: "Columbina", element: "Hydro" },
  10000126: { name: "Zibai", element: "Geo" },
  10000127: { name: "Illuga", element: "Geo" },
  10000128: { name: "Varka", element: "Anemo" },
};

// ── Types ──────────────────────────────────────────────────────────────

export interface PlayerInfo {
  nickname: string;
  level: number;
  worldLevel: number;
  signature?: string;
  achievements?: number;
  abyssFloor?: number;
  abyssChamber?: number;
}

export interface ArtifactSub {
  name: string;
  value: string;
}

export interface Artifact {
  slot: string;
  set: string;
  mainStat: string;
  mainValue: string;
  substats: ArtifactSub[];
  rarity: number;
  icon: string;
}

export interface Weapon {
  name: string;
  rarity: number;
  level: number;
  refinement: number;
  icon: string;
}

export interface Character {
  id: string;
  name: string;
  element: string;
  rarity: number;
  level: number;
  constellation: number;
  talents: number[];
  weapon: Weapon;
  artifacts: Artifact[];
  icon: string;
  sideIcon: string;
}

export interface EnkaProfile {
  player: PlayerInfo;
  characters: Character[];
  uid: string;
}

// ── API fetch ──────────────────────────────────────────────────────────

export async function fetchEnkaProfile(uid: string): Promise<EnkaProfile> {
  // Fetch API data, localization, and character store in parallel
  const [res, loc, charStore] = await Promise.all([
    fetch(`${ENKA_API}/${uid}`, {
      headers: { "User-Agent": "Guild-GenshinApp/1.0" },
      next: { revalidate: 60 },
    }),
    loadLocale(),
    loadCharStore(),
  ]);

  if (!res.ok) {
    const codes: Record<number, string> = {
      400: "Invalid UID format",
      404: "Player not found",
      424: "Game maintenance in progress",
      429: "Rate limited — try again shortly",
      500: "Enka server error",
    };
    throw new Error(codes[res.status] || `Enka API error: ${res.status}`);
  }

  const data = await res.json();
  return parseEnkaResponse(data, uid, loc, charStore);
}

// Load English locale and character store for name/icon resolution
let _localePromise: Promise<Record<string, string>> | null = null;
function loadLocale(): Promise<Record<string, string>> {
  if (!_localePromise) {
    _localePromise = fetch("https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/loc.json")
      .then(r => r.json())
      .then(d => d.en || {})
      .catch(() => ({}));
  }
  return _localePromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _charStorePromise: Promise<Record<string, any>> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadCharStore(): Promise<Record<string, any>> {
  if (!_charStorePromise) {
    _charStorePromise = fetch("https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/characters.json")
      .then(r => r.json())
      .catch(() => ({}));
  }
  return _charStorePromise;
}

// ── Parser ─────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEnkaResponse(data: any, uid: string, loc: Record<string, string>, charStore: Record<string, any>): EnkaProfile {
  const pi = data.playerInfo;

  const player: PlayerInfo = {
    nickname: pi.nickname || "Unknown",
    level: pi.level || 0,
    worldLevel: pi.worldLevel || 0,
    signature: pi.signature,
    achievements: pi.finishAchievementNum,
    abyssFloor: pi.towerFloorIndex,
    abyssChamber: pi.towerLevelIndex,
  };

  const characters: Character[] = [];

  if (data.avatarInfoList) {
    for (const avatar of data.avatarInfoList) {
      const char = parseCharacter(avatar, loc, charStore);
      if (char) characters.push(char);
    }
  }

  return { player, characters, uid };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseCharacter(avatar: any, loc: Record<string, string>, charStore: Record<string, any>): Character | null {
  const avatarId = avatar.avatarId;
  const charInfo = CHARACTER_MAP[avatarId];
  
  // Try to resolve name from charStore + loc first, then fall back to our hardcoded map
  const storeEntry = charStore[String(avatarId)];
  const storeNameHash = storeEntry ? String(storeEntry.NameTextMapHash) : null;
  const storeName = storeNameHash ? loc[storeNameHash] : null;
  const name = storeName || charInfo?.name || `Character ${avatarId}`;
  
  // Resolve element from store or hardcoded map
  const ELEM_MAP: Record<string, string> = { Fire: "Pyro", Water: "Hydro", Wind: "Anemo", Ice: "Cryo", Electric: "Electro", Rock: "Geo", Grass: "Dendro" };
  const storeElement = storeEntry ? ELEM_MAP[storeEntry.Element] || "Unknown" : null;
  const element = storeElement || charInfo?.element || "Unknown";
  
  // Resolve icon from store (most reliable) → our AVATAR_KEY map → fallback
  const storeSideIcon = storeEntry?.SideIconName || "";
  const storeIcon = storeSideIcon.replace("_Side_", "_");

  const icon = storeIcon || `UI_AvatarIcon_${getAvatarKey(avatarId)}`;
  const sideIcon = storeSideIcon || `UI_AvatarIcon_Side_${getAvatarKey(avatarId)}`;


  // Level from propMap
  const level = parseInt(avatar.propMap?.["4001"]?.val || "1");

  // Constellation count
  const constellation = avatar.talentIdList?.length || 0;

  // Parse equip list
  let weapon: Weapon = { name: "Unknown", rarity: 1, level: 1, refinement: 1, icon: "" };
  const artifacts: Artifact[] = [];

  if (avatar.equipList) {
    for (const equip of avatar.equipList) {
      if (equip.flat?.itemType === "ITEM_WEAPON") {
        const affixMap = equip.weapon?.affixMap;
        const refinement = affixMap ? Object.values(affixMap)[0] as number + 1 : 1;
        weapon = {
          name: loc[equip.flat.nameTextMapHash] || "Unknown Weapon",
          rarity: equip.flat.rankLevel || 1,
          level: equip.weapon?.level || 1,
          refinement,
          icon: equip.flat.icon || "",
        };
      } else if (equip.flat?.itemType === "ITEM_RELIQUARY") {
        const slot = EQUIP_TYPE_MAP[equip.flat.equipType] || "Unknown";
        const mainStat = equip.flat.reliquaryMainstat;
        const subs = equip.flat.reliquarySubstats || [];

        artifacts.push({
          slot,
          set: loc[equip.flat.setNameTextMapHash] || "Unknown Set",
          mainStat: APPEND_PROP_MAP[mainStat?.mainPropId] || mainStat?.mainPropId || "?",
          mainValue: formatStatValue(mainStat?.mainPropId, mainStat?.statValue),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          substats: subs.map((s: any) => ({
            name: APPEND_PROP_MAP[s.appendPropId] || s.appendPropId,
            value: formatStatValue(s.appendPropId, s.statValue),
          })),
          rarity: equip.flat.rankLevel || 4,
          icon: equip.flat.icon || "",
        });
      }
    }
  }

  // Skill levels
  const talents: number[] = [];
  if (avatar.skillLevelMap) {
    const skillIds = Object.keys(avatar.skillLevelMap).sort();
    for (const id of skillIds) {
      talents.push(avatar.skillLevelMap[id]);
    }
  }
  // Keep only first 3 (NA, Skill, Burst) — some chars have extra
  const mainTalents = talents.slice(0, 3);

  // Determine rarity from store or hardcoded list
  const storeQuality = storeEntry?.QualityType || "";
  const isStore5Star = storeQuality.includes("ORANGE");
  const rarity = storeEntry ? (isStore5Star ? 5 : 4) : (charInfo ? (avatarId >= 10000082 || [10000002, 10000003, 10000016, 10000022, 10000026, 10000029, 10000030, 10000033, 10000035, 10000037, 10000038, 10000041, 10000042, 10000046, 10000047, 10000049, 10000051, 10000052, 10000053, 10000056, 10000057, 10000058, 10000063, 10000068, 10000069, 10000070, 10000072, 10000074, 10000077, 10000078, 10000081, 10000083, 10000085, 10000086, 10000088, 10000090, 10000092, 10000093, 10000094, 10000095, 10000097, 10000098, 10000100, 10000101, 10000102, 10000103, 10000105, 10000106].includes(avatarId) ? 5 : 4) : 5); // Default unknown to 5★

  return {
    id: String(avatarId),
    name,
    element,
    rarity,
    level,
    constellation,
    talents: mainTalents.length > 0 ? mainTalents : [1, 1, 1],
    weapon,
    artifacts,
    icon,
    sideIcon,
  };
}

// Avatar key lookup from Enka store (internal name ≠ display name)
const AVATAR_KEY: Record<number, string> = {
  10000002: "Ayaka", 10000003: "Qin", 10000005: "PlayerBoy", 10000006: "Lisa",
  10000007: "PlayerGirl", 10000014: "Barbara", 10000015: "Kaeya", 10000016: "Diluc",
  10000020: "Razor", 10000021: "Ambor", 10000022: "Venti", 10000023: "Xiangling",
  10000024: "Beidou", 10000025: "Xingqiu", 10000026: "Xiao", 10000027: "Ningguang",
  10000029: "Klee", 10000030: "Zhongli", 10000031: "Fischl", 10000032: "Bennett",
  10000033: "Tartaglia", 10000034: "Noel", 10000035: "Qiqi", 10000036: "Chongyun",
  10000037: "Ganyu", 10000038: "Albedo", 10000039: "Diona", 10000041: "Mona",
  10000042: "Keqing", 10000043: "Sucrose", 10000044: "Xinyan", 10000045: "Rosaria",
  10000046: "Hutao", 10000047: "Kazuha", 10000048: "Feiyan", 10000049: "Yoimiya",
  10000050: "Tohma", 10000051: "Eula", 10000052: "Shougun", 10000053: "Sayu",
  10000054: "Kokomi", 10000055: "Gorou", 10000056: "Sara", 10000057: "Itto",
  10000058: "Yae", 10000059: "Heizo", 10000060: "Yelan", 10000061: "Momoka",
  10000062: "Aloy", 10000063: "Shenhe", 10000064: "Yunjin", 10000065: "Shinobu",
  10000066: "Ayato", 10000067: "Collei", 10000068: "Dori", 10000069: "Tighnari",
  10000070: "Nilou", 10000071: "Cyno", 10000072: "Candace", 10000073: "Nahida",
  10000074: "Layla", 10000075: "Wanderer", 10000076: "Faruzan", 10000077: "Yaoyao",
  10000078: "Alhatham", 10000079: "Dehya", 10000080: "Mika", 10000081: "Kaveh",
  10000082: "Baizhuer", 10000083: "Linette", 10000084: "Liney", 10000085: "Freminet",
  10000086: "Wriothesley", 10000087: "Neuvillette", 10000088: "Charlotte", 10000089: "Furina",
  10000090: "Chevreuse", 10000091: "Navia", 10000092: "Gaming", 10000093: "Liuyun",
  10000094: "Chiori", 10000095: "Sigewinne", 10000096: "Arlecchino", 10000097: "Sethos",
  10000098: "Clorinde", 10000099: "Emilie", 10000100: "Kachina", 10000101: "Kinich",
  10000102: "Mualani", 10000103: "Xilonen", 10000104: "Chasca", 10000105: "Olorun",
  10000106: "Mavuika", 10000107: "Citlali", 10000108: "Lanyan", 10000109: "Mizuki",
  10000110: "Iansan", 10000111: "Varesa", 10000112: "Escoffier", 10000113: "Ifa",
  10000114: "SkirkNew", 10000115: "Dahlia", 10000116: "Ineffa", 10000119: "Lauma",
  10000120: "Flins", 10000121: "Aino", 10000122: "Nefer", 10000123: "Durin", 10000124: "Jahoda",
  10000125: "Columbina", 10000126: "Zibai", 10000127: "Illuga", 10000128: "Varka",
};

function getAvatarKey(id: number): string {
  return AVATAR_KEY[id] || String(id);
}

function formatStatValue(propId: string, value: number): string {
  if (!value) return "0";
  // Percentage stats
  const percentStats = [
    "FIGHT_PROP_HP_PERCENT", "FIGHT_PROP_ATTACK_PERCENT", "FIGHT_PROP_DEFENSE_PERCENT",
    "FIGHT_PROP_CRITICAL", "FIGHT_PROP_CRITICAL_HURT", "FIGHT_PROP_CHARGE_EFFICIENCY",
    "FIGHT_PROP_HEAL_ADD", "FIGHT_PROP_PHYSICAL_ADD_HURT",
    "FIGHT_PROP_FIRE_ADD_HURT", "FIGHT_PROP_ELEC_ADD_HURT", "FIGHT_PROP_WATER_ADD_HURT",
    "FIGHT_PROP_WIND_ADD_HURT", "FIGHT_PROP_ICE_ADD_HURT", "FIGHT_PROP_ROCK_ADD_HURT",
    "FIGHT_PROP_GRASS_ADD_HURT",
  ];
  if (percentStats.includes(propId)) {
    return `${value.toFixed(1)}%`;
  }
  return String(Math.round(value));
}

// ── Localization (weapon/artifact names via hash) ──────────────────────

let localeCache: Record<string, string> | null = null;

export async function getLocaleName(hash: string): Promise<string> {
  if (!localeCache) {
    try {
      const res = await fetch("https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/loc.json");
      const data = await res.json();
      localeCache = data.en || {};
    } catch {
      localeCache = {};
    }
  }
  return localeCache![hash] || hash;
}
