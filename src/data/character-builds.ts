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
  "Bennett": {
    weaponIds: [11509, 11401], // Mistsplitter Reforged, Prototype Rancour
    artifactSets: ["Noblesse Oblige"],
    mainStats: { sands: "Energy Recharge/HP%", goblet: "HP%", circlet: "HP%/Healing Bonus" },
    substats: ["Energy Recharge", "HP%", "CRIT Rate", "CRIT DMG"],
    teams: [
      ["Raiden Shogun", "Xiangling", "Bennett", "Xingqiu"],
      ["Mavuika", "Xilonen", "Bennett", "Furina"],
    ],
  },
  "Yelan": {
    weaponIds: [11503, 14505], // Aqua Simulacra, Favonius Warbow
    artifactSets: ["Emblem of Severed Fate"],
    mainStats: { sands: "HP%", goblet: "Hydro DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "HP%", "Energy Recharge"],
    teams: [
      ["Hu Tao", "Xingqiu", "Yelan", "Zhongli"],
      ["Raiden Shogun", "Xiangling", "Yelan", "Bennett"],
    ],
  },
  "Xingqiu": {
    weaponIds: [11503, 11401], // Sacrificial Sword, Favonius Sword
    artifactSets: ["Emblem of Severed Fate"],
    mainStats: { sands: "ATK%/Energy Recharge", goblet: "Hydro DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "ATK%", "Energy Recharge"],
    teams: [
      ["Hu Tao", "Xingqiu", "Yelan", "Zhongli"],
      ["Raiden Shogun", "Xiangling", "Bennett", "Xingqiu"],
    ],
  },
  "Ganyu": {
    weaponIds: [15503, 15401], // Amos' Bow, Prototype Crescent
    artifactSets: ["Blizzard Strayer", "Wanderer's Troupe"],
    mainStats: { sands: "ATK%", goblet: "Cryo DMG", circlet: "CRIT DMG" },
    substats: ["CRIT DMG", "ATK%", "Energy Recharge", "CRIT Rate"],
    teams: [
      ["Ganyu", "Citlali", "Kaedehara Kazuha", "Bennett"],
      ["Ganyu", "Xiangling", "Bennett", "Zhongli"],
    ],
  },
  "Xiangling": {
    weaponIds: [13503, 13401], // The Catch, Dragon's Bane
    artifactSets: ["Emblem of Severed Fate"],
    mainStats: { sands: "Energy Recharge/Elemental Mastery", goblet: "Pyro DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "Energy Recharge", "Elemental Mastery"],
    teams: [
      ["Raiden Shogun", "Xiangling", "Bennett", "Xingqiu"],
      ["Xiangling", "Bennett", "Xingqiu", "Kaedehara Kazuha"],
    ],
  },
  "Alhaitham": {
    weaponIds: [11514, 11411], // Light of Foliar Incision, Iron Sting
    artifactSets: ["Gilded Dreams"],
    mainStats: { sands: "Elemental Mastery", goblet: "Dendro DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "Elemental Mastery", "ATK%"],
    teams: [
      ["Alhaitham", "Nahida", "Furina", "Zhongli"],
      ["Alhaitham", "Nahida", "Xingqiu", "Kuki Shinobu"],
    ],
  },
  "Kinich": {
    weaponIds: [12514, 12411], // Fang of the Mountain King, Prototype Archaic
    artifactSets: ["Marechaussee Hunter"],
    mainStats: { sands: "ATK%", goblet: "Dendro DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "ATK%", "Elemental Mastery"],
    teams: [
      ["Kinich", "Xilonen", "Bennett", "Furina"],
      ["Kinich", "Nahida", "Xilonen", "Furina"],
    ],
  },
  "Clorinde": {
    weaponIds: [11514, 11411], // Absolution, The Black Sword
    artifactSets: ["Fragment of Harmonic Whimsy"],
    mainStats: { sands: "ATK%", goblet: "Electro DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "ATK%", "Energy Recharge"],
    teams: [
      ["Clorinde", "Nahida", "Furina", "Kaedehara Kazuha"],
      ["Clorinde", "Fischl", "Xingqiu", "Kaedehara Kazuha"],
    ],
  },
  "Citlali": {
    weaponIds: [14514, 14403], // Surf's Up, Thrilling Tales of Dragon Slayers
    artifactSets: ["Scroll of the Hero of Cinder City"],
    mainStats: { sands: "HP%", goblet: "Cryo DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "HP%", "Energy Recharge"],
    teams: [
      ["Kamisato Ayaka", "Citlali", "Kaedehara Kazuha", "Furina"],
      ["Ganyu", "Citlali", "Kaedehara Kazuha", "Bennett"],
    ],
  },
  "Escoffier": {
    weaponIds: [13514, 13401], // Lumidouce Elegy, Favonius Lance
    artifactSets: ["Golden Troupe"],
    mainStats: { sands: "HP%", goblet: "HP%", circlet: "Healing Bonus" },
    substats: ["HP%", "Energy Recharge", "CRIT Rate", "CRIT DMG"],
    teams: [
      ["Neuvillette", "Furina", "Escoffier", "Kaedehara Kazuha"],
      ["Mavuika", "Xilonen", "Escoffier", "Bennett"],
    ],
  },
  "Arlecchino": {
    weaponIds: [13512, 13501, 13405], // Crimson Moon's Semblance, Staff of Homa, Deathmatch
    artifactSets: ["Fragment of Harmonic Whimsy"],
    mainStats: { sands: "ATK%", goblet: "Pyro DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "ATK%", "Elemental Mastery"],
    teams: [
      ["Arlecchino", "Xilonen", "Yelan", "Bennett"],
      ["Arlecchino", "Xilonen", "Xingqiu", "Bennett"],
    ],
  },
  "Navia": {
    weaponIds: [12512, 12409, 12501], // Verdict, Serpent Spine, Skyward Pride
    artifactSets: ["Nighttime Whispers in the Echoing Woods", "Archaic Petra"],
    mainStats: { sands: "ATK%", goblet: "Geo DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "ATK%", "Energy Recharge"],
    teams: [
      ["Navia", "Zhongli", "Xiangling", "Bennett"],
      ["Navia", "Zhongli", "Fischl", "Bennett"],
    ],
  },
  "Xiao": {
    weaponIds: [13505, 13501, 13405], // Primordial Jade Winged-Spear, Staff of Homa, Deathmatch
    artifactSets: ["Vermillion Hereafter"],
    mainStats: { sands: "ATK%", goblet: "Anemo DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "ATK%", "Energy Recharge"],
    teams: [
      ["Xiao", "Faruzan", "Zhongli", "Bennett"],
      ["Xiao", "Faruzan", "Xianyun", "Furina"],
    ],
  },
  "Wanderer": {
    weaponIds: [14512, 14502, 14405], // Tulaytullah's Remembrance, Lost Prayer to the Sacred Winds, Solar Pearl
    artifactSets: ["Desert Pavilion Chronicle"],
    mainStats: { sands: "ATK%", goblet: "Anemo DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "ATK%", "Energy Recharge"],
    teams: [
      ["Wanderer", "Faruzan", "Bennett", "Zhongli"],
      ["Wanderer", "Faruzan", "Xilonen", "Bennett"],
    ],
  },
  "Wriothesley": {
    weaponIds: [14513, 14502, 14402], // Cashflow Supervision, Lost Prayer to the Sacred Winds, The Widsith
    artifactSets: ["Marechaussee Hunter"],
    mainStats: { sands: "ATK%", goblet: "Cryo DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "ATK%", "Energy Recharge"],
    teams: [
      ["Wriothesley", "Xilonen", "Furina", "Shenhe"],
      ["Wriothesley", "Xiangling", "Bennett", "Zhongli"],
    ],
  },
  "Chiori": {
    weaponIds: [11514, 11505, 11302], // Uraku Misugiri, Primordial Jade Cutter, Harbinger of Dawn
    artifactSets: ["Husk of Opulent Dreams"],
    mainStats: { sands: "DEF%", goblet: "Geo DMG", circlet: "CRIT Rate/DMG" },
    substats: ["CRIT Rate", "CRIT DMG", "DEF%", "Energy Recharge"],
    teams: [
      ["Navia", "Chiori", "Zhongli", "Bennett"],
      ["Arataki Itto", "Chiori", "Gorou", "Zhongli"],
    ],
  },
};
