export interface CharacterGuide {
  characterName: string;
  bestWeapons: { name: string; weaponId: number; note: string }[];
  bestArtifacts: { setName: string; pieces: number; note: string }[];
  teams: { name: string; members: string[]; archetype: string }[];
  talentPriority: string;
  tips: string[];
  playstyle: string;
}

export const CHARACTER_GUIDES: Record<string, CharacterGuide> = {
  "Raiden Shogun": {
    characterName: "Raiden Shogun",
    bestWeapons: [
      { name: "Engulfing Lightning", weaponId: 13509, note: "Best in Slot" },
      { name: "The Catch", weaponId: 13415, note: "F2P Best -- free from fishing" },
      { name: "Staff of Homa", weaponId: 13501, note: "Great stat stick" },
    ],
    bestArtifacts: [
      { setName: "Emblem of Severed Fate", pieces: 4, note: "Best set overall" },
    ],
    teams: [
      { name: "Raiden National", members: ["Raiden Shogun", "Xiangling", "Bennett", "Xingqiu"], archetype: "Overloaded/Vaporize" },
      { name: "Raiden Hypercarry", members: ["Raiden Shogun", "Kujou Sara", "Kaedehara Kazuha", "Bennett"], archetype: "Electro Hypercarry" },
    ],
    talentPriority: "Burst > Skill > Normal",
    tips: [
      "Stack Energy Recharge for higher burst damage via her A4 passive",
      "Use Skill before swapping to supports for coordinated attacks",
      "Burst duration is a long field time -- plan rotations accordingly",
    ],
    playstyle: "Main DPS during Burst, off-field Sub-DPS with Skill. Build Energy Recharge and Crit.",
  },
  "Neuvillette": {
    characterName: "Neuvillette",
    bestWeapons: [
      { name: "Tome of the Eternal Flow", weaponId: 14512, note: "Best in Slot" },
      { name: "Cashflow Supervision", weaponId: 14514, note: "Excellent alternative" },
      { name: "Prototype Amber", weaponId: 14401, note: "F2P option -- provides healing" },
    ],
    bestArtifacts: [
      { setName: "Marechaussee Hunter", pieces: 4, note: "Best with HP drain teams" },
      { setName: "Heart of Depth", pieces: 4, note: "Solid alternative" },
    ],
    teams: [
      { name: "Neuvi Furina", members: ["Neuvillette", "Furina", "Kaedehara Kazuha", "Zhongli"], archetype: "Hydro Hypercarry" },
    ],
    talentPriority: "Normal > Skill > Burst",
    tips: [
      "Charged Attack (hold) is your main damage source",
      "Collect Sourcewater Droplets to heal and buff Charged Attack",
      "Pair with Furina for constant HP changes that trigger passives",
    ],
    playstyle: "Charged Attack focused Hydro DPS. Hold Normal Attack to fire devastating beams.",
  },
  "Hu Tao": {
    characterName: "Hu Tao",
    bestWeapons: [
      { name: "Staff of Homa", weaponId: 13501, note: "Best in Slot" },
      { name: "Dragon's Bane", weaponId: 13401, note: "F2P Best for Vaporize" },
      { name: "Deathmatch", weaponId: 13404, note: "Battle Pass option" },
    ],
    bestArtifacts: [
      { setName: "Crimson Witch of Flames", pieces: 4, note: "Best for Vaporize" },
      { setName: "Shimenawa's Reminiscence", pieces: 4, note: "Higher CA damage but lose Burst" },
    ],
    teams: [
      { name: "Hu Tao Double Hydro", members: ["Hu Tao", "Xingqiu", "Yelan", "Zhongli"], archetype: "Vaporize" },
      { name: "Hu Tao VV Vape", members: ["Hu Tao", "Xingqiu", "Sucrose", "Amber"], archetype: "Vaporize" },
    ],
    talentPriority: "Normal > Skill > Burst",
    tips: [
      "Stay below 50% HP for 33% Pyro DMG bonus from passive",
      "Jump cancel / dash cancel charged attacks for faster combos",
      "Use Burst for healing when low (it heals based on enemies hit)",
    ],
    playstyle: "Melee Pyro DPS who trades HP for damage. Strong Vaporize reactions with Hydro supports.",
  },
  "Bennett": {
    characterName: "Bennett",
    bestWeapons: [
      { name: "Mistsplitter Reforged", weaponId: 11509, note: "Highest Base ATK 5-star" },
      { name: "Aquila Favonia", weaponId: 11501, note: "Highest Base ATK standard" },
      { name: "Prototype Rancour", weaponId: 11406, note: "Highest Base ATK 4-star (F2P)" },
    ],
    bestArtifacts: [
      { setName: "Noblesse Oblige", pieces: 4, note: "Team ATK buff on Burst" },
    ],
    teams: [
      { name: "National Team", members: ["Xiangling", "Bennett", "Xingqiu", "Sucrose"], archetype: "Vaporize" },
    ],
    talentPriority: "Burst > Skill > Normal",
    tips: [
      "DO NOT activate C6 unless you know what you're doing (adds Pyro infusion)",
      "Burst ATK buff scales with BASE ATK only -- use high base ATK weapons",
      "Burst also heals -- no need for HP/healing artifacts",
    ],
    playstyle: "The best support in the game. ATK buff + heal + Pyro application in one Burst.",
  },
  "Xiangling": {
    characterName: "Xiangling",
    bestWeapons: [
      { name: "Staff of Homa", weaponId: 13501, note: "Best in Slot" },
      { name: "The Catch", weaponId: 13415, note: "F2P Best -- free from fishing" },
      { name: "Dragon's Bane", weaponId: 13401, note: "Great for Vaporize" },
    ],
    bestArtifacts: [
      { setName: "Emblem of Severed Fate", pieces: 4, note: "Best set for burst damage" },
    ],
    teams: [
      { name: "National Team", members: ["Xiangling", "Bennett", "Xingqiu", "Sucrose"], archetype: "Vaporize" },
    ],
    talentPriority: "Burst > Skill > Normal",
    tips: [
      "Guoba (Skill) snapshots ATK -- use after Bennett Burst",
      "Pyronado (Burst) lasts 14s and snapshots buffs",
      "Always funnel Energy Recharge through Bennett Skill particles",
    ],
    playstyle: "Off-field Pyro Sub-DPS. Deploy Guoba and Pyronado, then swap to trigger reactions.",
  },
  "Furina": {
    characterName: "Furina",
    bestWeapons: [
      { name: "Splendor of Tranquil Waters", weaponId: 11513, note: "Best in Slot" },
      { name: "Festering Desire", weaponId: 11413, note: "Good ER option" },
      { name: "Favonius Sword", weaponId: 11401, note: "F2P energy battery" },
    ],
    bestArtifacts: [
      { setName: "Golden Troupe", pieces: 4, note: "Best for off-field damage" },
    ],
    teams: [
      { name: "Neuvi Furina", members: ["Neuvillette", "Furina", "Kaedehara Kazuha", "Zhongli"], archetype: "Hydro Hypercarry" },
      { name: "Furina Hyperbloom", members: ["Furina", "Nahida", "Kuki Shinobu", "Baizhu"], archetype: "Hyperbloom" },
    ],
    talentPriority: "Skill > Burst > Normal",
    tips: [
      "Her Burst provides a massive DMG% buff based on Fanfare stacks",
      "Pair with healers to maximize Fanfare stack generation",
      "Salon Members deal damage based on Max HP -- build HP%",
    ],
    playstyle: "Off-field Hydro support. Summons Salon Members that drain/heal party HP for massive team DMG buff.",
  },
  "Kaedehara Kazuha": {
    characterName: "Kaedehara Kazuha",
    bestWeapons: [
      { name: "Freedom-Sworn", weaponId: 11505, note: "Best in Slot for support" },
      { name: "Iron Sting", weaponId: 11407, note: "F2P Best -- craftable EM weapon" },
      { name: "Favonius Sword", weaponId: 11401, note: "Energy battery option" },
    ],
    bestArtifacts: [
      { setName: "Viridescent Venerer", pieces: 4, note: "Must-have for RES shred" },
    ],
    teams: [
      { name: "Raiden Hypercarry", members: ["Raiden Shogun", "Kujou Sara", "Kaedehara Kazuha", "Bennett"], archetype: "Electro Hypercarry" },
      { name: "International", members: ["Tartaglia", "Xiangling", "Kaedehara Kazuha", "Bennett"], archetype: "Vaporize" },
    ],
    talentPriority: "Skill > Burst > Normal",
    tips: [
      "Stack Elemental Mastery for his A4 passive elemental DMG buff",
      "Swirl the element you want to buff before using Burst",
      "Double-tap Skill in midair for plunge attack combos",
    ],
    playstyle: "Premium Anemo support. Provides elemental DMG buff, VV shred, and crowd control.",
  },
  "Mavuika": {
    characterName: "Mavuika",
    bestWeapons: [
      { name: "A Thousand Blazing Suns", weaponId: 12512, note: "Best in Slot" },
      { name: "Verdict", weaponId: 12510, note: "Strong alternative" },
      { name: "Serpent Spine", weaponId: 12410, note: "Battle Pass option" },
    ],
    bestArtifacts: [
      { setName: "Obsidian Codex", pieces: 4, note: "Best set for Nightsoul builds" },
    ],
    teams: [
      { name: "Mavuika Vaporize", members: ["Mavuika", "Xilonen", "Furina", "Bennett"], archetype: "Vaporize" },
      { name: "Mono Pyro", members: ["Mavuika", "Xilonen", "Bennett", "Dehya"], archetype: "Mono Pyro" },
    ],
    talentPriority: "Burst > Skill > Normal",
    tips: [
      "Build Fighting Spirit gauge before unleashing Burst for maximum damage",
      "Nightsoul state enables powerful motorcycle attacks",
      "Pair with Nightsoul characters for faster gauge building",
    ],
    playstyle: "Pyro DPS who builds Fighting Spirit for devastating Burst. Transforms with Nightsoul mechanics.",
  },
};
