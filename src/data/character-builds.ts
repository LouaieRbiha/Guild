export interface CharacterBuild {
  weaponIds: number[];       // weapon IDs in priority order (best first)
  artifactSets: string[];    // artifact set names like "Emblem of Severed Fate"
  mainStats: {
    sands: string;
    goblet: string;
    circlet: string;
  };
  substats: string[];        // priority order
  teams: string[][];         // array of 4-character-name arrays
  notes?: string;
}

// Map of character name -> build recommendations
export const CHARACTER_BUILDS: Record<string, CharacterBuild> = {
  "Hu Tao": {
    weaponIds: [13501, 13401], // Staff of Homa, Dragon's Bane
    artifactSets: ["Crimson Witch of Flames", "Shimenawa's Reminiscence"],
    mainStats: { sands: "HP%", goblet: "Pyro DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "HP%", "Elemental Mastery"],
    teams: [
      ["Hu Tao", "Xingqiu", "Yelan", "Zhongli"],
      ["Hu Tao", "Xingqiu", "Kaedehara Kazuha", "Amber"],
    ],
  },
  "Raiden Shogun": {
    weaponIds: [13509, 13415], // Engulfing Lightning, The Catch
    artifactSets: ["Emblem of Severed Fate"],
    mainStats: { sands: "Energy Recharge/ATK%", goblet: "Electro DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "ATK%", "Energy Recharge"],
    teams: [
      ["Raiden Shogun", "Kujou Sara", "Kaedehara Kazuha", "Bennett"],
      ["Raiden Shogun", "Xiangling", "Bennett", "Xingqiu"],
    ],
  },
  "Neuvillette": {
    weaponIds: [14514, 14513], // Tome of the Eternal Flow, Cashflow Supervision
    artifactSets: ["Marechaussee Hunter", "Heart of Depth"],
    mainStats: { sands: "HP%", goblet: "Hydro DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "HP%", "ATK%"],
    teams: [
      ["Neuvillette", "Furina", "Kaedehara Kazuha", "Zhongli"],
      ["Neuvillette", "Furina", "Xilonen", "Zhongli"],
    ],
  },
  "Kamisato Ayaka": {
    weaponIds: [11509, 11414], // Mistsplitter Reforged, Amenoma Kageuchi
    artifactSets: ["Blizzard Strayer"],
    mainStats: { sands: "ATK%", goblet: "Cryo DMG", circlet: "CRIT DMG" },
    substats: ["CRIT DMG", "ATK%", "Energy Recharge", "CRIT Rate"],
    teams: [
      ["Kamisato Ayaka", "Citlali", "Kaedehara Kazuha", "Furina"],
      ["Kamisato Ayaka", "Shenhe", "Kaedehara Kazuha", "Kokomi"],
    ],
  },
  "Mavuika": {
    weaponIds: [12514, 12511], // A Thousand Blazing Suns, Beacon of the Reed Sea
    artifactSets: ["Obsidian Codex", "Crimson Witch of Flames"],
    mainStats: { sands: "ATK%", goblet: "Pyro DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "ATK%", "Elemental Mastery"],
    teams: [
      ["Mavuika", "Xilonen", "Bennett", "Furina"],
      ["Mavuika", "Xilonen", "Bennett", "Citlali"],
    ],
  },
  "Furina": {
    weaponIds: [11513, 11413], // Splendor of Tranquil Waters, Festering Desire
    artifactSets: ["Golden Troupe"],
    mainStats: { sands: "HP%", goblet: "HP%", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "HP%", "Energy Recharge"],
    teams: [
      ["Neuvillette", "Furina", "Kaedehara Kazuha", "Zhongli"],
      ["Mavuika", "Xilonen", "Furina", "Bennett"],
    ],
  },
  "Kaedehara Kazuha": {
    weaponIds: [11503, 11407], // Freedom-Sworn, Iron Sting
    artifactSets: ["Viridescent Venerer"],
    mainStats: { sands: "Elemental Mastery", goblet: "Elemental Mastery", circlet: "Elemental Mastery" },
    substats: ["Elemental Mastery", "Energy Recharge", "CRIT Rate", "CRIT DMG"],
    teams: [
      ["Neuvillette", "Furina", "Kaedehara Kazuha", "Zhongli"],
      ["Raiden Shogun", "Kujou Sara", "Kaedehara Kazuha", "Bennett"],
    ],
  },
  "Nahida": {
    weaponIds: [14511, 14403], // A Thousand Floating Dreams, Sacrificial Fragments
    artifactSets: ["Deepwood Memories", "Gilded Dreams"],
    mainStats: { sands: "Elemental Mastery", goblet: "Dendro DMG/EM", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "Elemental Mastery", "ATK%"],
    teams: [
      ["Alhaitham", "Nahida", "Furina", "Zhongli"],
      ["Cyno", "Nahida", "Furina", "Baizhu"],
    ],
  },
  "Xilonen": {
    weaponIds: [11516, 11424], // Peak Patrol Song, Wolf-Fang
    artifactSets: ["Scroll of the Hero of Cinder City"],
    mainStats: { sands: "DEF%", goblet: "DEF%", circlet: "DEF%" },
    substats: ["DEF%", "Energy Recharge", "CRIT Rate", "HP%"],
    teams: [
      ["Mavuika", "Xilonen", "Bennett", "Furina"],
      ["Kinich", "Xilonen", "Bennett", "Furina"],
    ],
  },
  "Zhongli": {
    weaponIds: [13501, 13303], // Staff of Homa, Black Tassel
    artifactSets: ["Tenacity of the Millelith", "Archaic Petra"],
    mainStats: { sands: "HP%", goblet: "HP%", circlet: "HP%" },
    substats: ["HP%", "Energy Recharge", "CRIT Rate", "CRIT DMG"],
    teams: [
      ["Hu Tao", "Xingqiu", "Yelan", "Zhongli"],
      ["Neuvillette", "Furina", "Kaedehara Kazuha", "Zhongli"],
    ],
  },
};
