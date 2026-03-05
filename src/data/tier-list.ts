export type Tier = "SS" | "S" | "A" | "B" | "C";
export type Role = "Main DPS" | "Sub DPS" | "Support" | "Healer";

export interface TierEntry {
  name: string;  // must match ALL_CHARACTERS name
  tier: Tier;
  roles: Role[];
  notes?: string;
}

export const TIER_LIST: TierEntry[] = [
  // SS Tier
  { name: "Neuvillette", tier: "SS", roles: ["Main DPS"], notes: "Best Hydro DPS, self-sufficient" },
  { name: "Mavuika", tier: "SS", roles: ["Main DPS"], notes: "Top Pyro DPS, Nightsoul synergy" },
  { name: "Furina", tier: "SS", roles: ["Sub DPS", "Support"], notes: "Universal Hydro support, huge team DMG buff" },
  { name: "Kaedehara Kazuha", tier: "SS", roles: ["Support"], notes: "Best Anemo grouper and buffer" },
  { name: "Nahida", tier: "SS", roles: ["Sub DPS", "Support"], notes: "Core Dendro enabler" },
  { name: "Xilonen", tier: "SS", roles: ["Support"], notes: "Universal Nightsoul shredder" },

  // S Tier
  { name: "Raiden Shogun", tier: "S", roles: ["Main DPS", "Sub DPS"], notes: "Strong burst DPS, energy battery" },
  { name: "Kamisato Ayaka", tier: "S", roles: ["Main DPS"], notes: "Top Cryo DPS" },
  { name: "Hu Tao", tier: "S", roles: ["Main DPS"], notes: "Vaporize specialist" },
  { name: "Yelan", tier: "S", roles: ["Sub DPS"], notes: "Off-field Hydro, DMG buff" },
  { name: "Zhongli", tier: "S", roles: ["Support"], notes: "Strongest shielder, universal RES shred" },
  { name: "Bennett", tier: "S", roles: ["Support", "Healer"], notes: "ATK buff + heal, pyro battery" },
  { name: "Xingqiu", tier: "S", roles: ["Sub DPS"], notes: "Off-field Hydro applicator" },
  { name: "Citlali", tier: "S", roles: ["Support", "Sub DPS"], notes: "Cryo/Nightsoul support" },
  { name: "Clorinde", tier: "S", roles: ["Main DPS"], notes: "Electro on-field DPS" },
  { name: "Alhaitham", tier: "S", roles: ["Main DPS"], notes: "Spread DPS carry" },
  { name: "Kinich", tier: "S", roles: ["Main DPS"], notes: "Strong Dendro DPS, Nightsoul" },
  { name: "Escoffier", tier: "S", roles: ["Support", "Healer"], notes: "Fontaine support" },

  // A Tier
  { name: "Ganyu", tier: "A", roles: ["Main DPS", "Sub DPS"] },
  { name: "Xiangling", tier: "A", roles: ["Sub DPS"], notes: "Free Pyro off-field DPS" },
  { name: "Fischl", tier: "A", roles: ["Sub DPS"], notes: "Best Electro off-field" },
  { name: "Sucrose", tier: "A", roles: ["Support"], notes: "EM share, budget Kazuha" },
  { name: "Sangonomiya Kokomi", tier: "A", roles: ["Healer", "Support"], notes: "Hydro healer, Bloom enabler" },
  { name: "Yae Miko", tier: "A", roles: ["Sub DPS"] },
  { name: "Shenhe", tier: "A", roles: ["Support"], notes: "Cryo buffer" },
  { name: "Nilou", tier: "A", roles: ["Sub DPS"], notes: "Bloom specialist" },
  { name: "Cyno", tier: "A", roles: ["Main DPS"] },
  { name: "Navia", tier: "A", roles: ["Main DPS"] },
  { name: "Wriothesley", tier: "A", roles: ["Main DPS"] },
  { name: "Chiori", tier: "A", roles: ["Sub DPS"], notes: "Geo off-field DPS" },
  { name: "Baizhu", tier: "A", roles: ["Healer", "Support"] },

  // B Tier
  { name: "Diluc", tier: "B", roles: ["Main DPS"] },
  { name: "Keqing", tier: "B", roles: ["Main DPS"] },
  { name: "Tartaglia", tier: "B", roles: ["Main DPS"] },
  { name: "Eula", tier: "B", roles: ["Main DPS"] },
  { name: "Yoimiya", tier: "B", roles: ["Main DPS"] },
  { name: "Klee", tier: "B", roles: ["Main DPS"] },
  { name: "Kuki Shinobu", tier: "B", roles: ["Healer", "Sub DPS"] },
  { name: "Diona", tier: "B", roles: ["Support", "Healer"] },
  { name: "Rosaria", tier: "B", roles: ["Sub DPS"] },
  { name: "Beidou", tier: "B", roles: ["Sub DPS"] },
  { name: "Kaeya", tier: "B", roles: ["Sub DPS"] },
  { name: "Layla", tier: "B", roles: ["Support"] },

  // C Tier
  { name: "Qiqi", tier: "C", roles: ["Healer"] },
  { name: "Xinyan", tier: "C", roles: ["Support"] },
  { name: "Amber", tier: "C", roles: ["Support"] },
  { name: "Lisa", tier: "C", roles: ["Sub DPS"] },
];

export const TIER_COLORS: Record<Tier, { bg: string; border: string; text: string }> = {
  SS: { bg: "bg-red-500/15", border: "border-red-500/30", text: "text-red-400" },
  S: { bg: "bg-orange-500/15", border: "border-orange-500/30", text: "text-orange-400" },
  A: { bg: "bg-purple-500/15", border: "border-purple-500/30", text: "text-purple-400" },
  B: { bg: "bg-blue-500/15", border: "border-blue-500/30", text: "text-blue-400" },
  C: { bg: "bg-gray-500/15", border: "border-gray-500/30", text: "text-gray-400" },
};

export const TIER_ORDER: Tier[] = ["SS", "S", "A", "B", "C"];
