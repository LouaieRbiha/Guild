export interface AbyssEnemy {
  name: string;
  element?: string;  // element affinity if relevant
  hp?: string;       // e.g., "350,000"
  notes?: string;
}

export interface EnemyResistance {
  element: string;
  value: number;  // percentage, e.g., 10 = 10%
}

export interface AbyssBoss {
  name: string;
  hp: string;
  icon?: string;
  image?: string;
  description?: string;
  resistances: EnemyResistance[];
  weaknesses: string[];
  tips: string[];
}

export interface AbyssChamber {
  chamber: number;
  firstHalf: AbyssEnemy[];
  secondHalf: AbyssEnemy[];
  tips?: string;
}

export interface AbyssFloor {
  floor: number;
  disorder: string;
  chambers: AbyssChamber[];
  bosses?: AbyssBoss[];
}

export interface TeamComp {
  name: string;
  characters: string[];  // character names matching ALL_CHARACTERS
  usage: number;         // usage rate percentage
  clearRate: number;     // clear rate percentage
  archetype: string;     // e.g., "Vaporize", "Freeze", "Hyperbloom"
}

// ── Stygian Onslaught Types ──────────────────────────────────────────

export interface StygianModifier {
  name: string;
  description: string;
  type: "buff" | "debuff" | "mechanic";
}

export interface StygianStage {
  stage: number;
  name: string;
  enemies: AbyssEnemy[];
  modifiers: StygianModifier[];
  boss?: AbyssBoss;
  tips?: string;
}

// ── Spiral Abyss Data (v6.4 Luna V) ─────────────────────────────────

export const ABYSS_VERSION = "6.4 Luna V";
export const ABYSS_CYCLE = "March 1 - March 16, 2026";

export const ABYSS_FLOORS: AbyssFloor[] = [
  {
    floor: 9,
    disorder: "Characters' Lunar reaction DMG increased by 50%.",
    chambers: [
      {
        chamber: 1,
        firstHalf: [
          { name: "Close Combat Storm Landcruiser x1" },
          { name: "Force Recon Storm Landcruiser x1" },
          { name: "Close Combat Scout Landcruiser x1" },
        ],
        secondHalf: [
          { name: "Fluid Avatar of Lava", hp: "350,000", element: "Pyro" },
        ],
      },
      {
        chamber: 2,
        firstHalf: [
          { name: "Force Recon Ground Effect Landcruiser x1" },
          { name: "Force Recon Scout Landcruiser x2" },
          { name: "Cutting Edge All-Purpose Storm Landcruiser x1" },
        ],
        secondHalf: [
          { name: "Ruin Grader", hp: "400,000" },
        ],
      },
      {
        chamber: 3,
        firstHalf: [
          { name: "Cutting Edge Fire Support Ground Effect Landcruiser x2" },
          { name: "Force Recon Scout Landcruiser x3" },
        ],
        secondHalf: [
          { name: "Blazing Brilliance: Frostnight Scion", hp: "500,000", element: "Cryo" },
        ],
      },
    ],
  },
  {
    floor: 10,
    disorder: "Characters' Lunar reaction DMG increased by 50%.",
    chambers: [
      {
        chamber: 1,
        firstHalf: [
          { name: "Close Combat Storm Landcruiser x1" },
          { name: "Oprichniki Line Trooper x2" },
          { name: "Oprichniki Fireblade Shock Trooper x1" },
        ],
        secondHalf: [
          { name: "Foliar-Swift Wayob Manifestation", hp: "500,000", element: "Dendro" },
        ],
      },
      {
        chamber: 2,
        firstHalf: [
          { name: "Force Recon Storm Landcruiser x1" },
          { name: "Oprichniki Vanguard x2" },
          { name: "Oprichniki Thunderblitz Gvardiya x1", element: "Electro" },
        ],
        secondHalf: [
          { name: "Tangled Vines: Frostnight Scion", hp: "550,000", element: "Cryo" },
        ],
      },
      {
        chamber: 3,
        firstHalf: [
          { name: "Oprichniki Medic x1" },
          { name: "Oprichniki Vanguard x2" },
          { name: "Oprichniki Hailstorm Canoneer x1", element: "Cryo" },
        ],
        secondHalf: [
          { name: "Radiant Bladehorn", hp: "600,000", element: "Pyro" },
        ],
      },
    ],
  },
  {
    floor: 11,
    disorder: "All party members gain a 60% Hydro DMG Bonus and a 60% Geo DMG Bonus.",
    chambers: [
      {
        chamber: 1,
        firstHalf: [
          { name: "Large Pyro Slime x8", element: "Pyro" },
          { name: "Pyro Slime x40", element: "Pyro" },
        ],
        secondHalf: [
          { name: "Primordial Bathysmal Vishap x12", element: "Hydro" },
        ],
        tips: "Use AoE Hydro to clear the slime waves quickly. Vishaps spawn in groups of 3.",
      },
      {
        chamber: 2,
        firstHalf: [
          { name: "Assault Specialist Mek x2" },
          { name: "Eremite Stone Enchanter", element: "Geo" },
          { name: "Eremite Galehunter", element: "Anemo" },
        ],
        secondHalf: [
          { name: "Praetorian Golem x6", element: "Geo" },
        ],
        tips: "Mek enemies appear first, then Eremites. Golems spawn in pairs across 3 waves.",
      },
      {
        chamber: 3,
        firstHalf: [
          { name: "Radiant Glacial Wolf", hp: "800,000", element: "Cryo" },
        ],
        secondHalf: [
          { name: "Tainted Water-Spouting Phantasm", hp: "700,000", element: "Hydro" },
        ],
        tips: "Hydro DPS for wolf, Geo DPS for phantasm. Match the floor disorder bonuses.",
      },
    ],
  },
  {
    floor: 12,
    disorder: "1st Half: Lunar-Charged DMG increased by 75%. 2nd Half: Lunar-Crystallize DMG increased by 75%.",
    chambers: [
      {
        chamber: 1,
        firstHalf: [
          { name: "Fishers of Hidden Depths x15", element: "Hydro" },
        ],
        secondHalf: [
          { name: "Frostnight Herra", hp: "900,000", element: "Cryo", notes: "Cryo boss with shield phase" },
        ],
      },
      {
        chamber: 2,
        firstHalf: [
          { name: "Sternshield Crab x2", element: "Geo" },
          { name: "Emperor of Fire and Iron", hp: "1,000,000", element: "Pyro", notes: "Boss wave 2" },
        ],
        secondHalf: [
          { name: "Wilderness Hunter x4" },
        ],
        tips: "Crabs appear first, then the Emperor spawns. Front-load burst damage on the Emperor.",
      },
      {
        chamber: 3,
        firstHalf: [
          { name: "Lord of the Hidden Depths — Whisperer of Nightmares", hp: "1,800,000", element: "Hydro", notes: "Final boss — use Electro for Lunar-Charged" },
        ],
        secondHalf: [
          { name: "Legatus Golem", hp: "1,500,000", element: "Geo", notes: "Final boss — use Hydro for Lunar-Crystallize" },
        ],
        tips: "First half: Electro + Hydro for Lunar-Charged. Second half: Geo + Hydro for Lunar-Crystallize.",
      },
    ],
    bosses: [
      {
        name: "Lord of the Hidden Depths — Whisperer of Nightmares",
        hp: "1,800,000",
        description: "A dangerous Hydro entity that conjures nightmare illusions. Use Electro to trigger Lunar-Charged reactions for bonus damage. Stay mobile during its sweeping attacks.",
        resistances: [
          { element: "Pyro", value: 10 },
          { element: "Hydro", value: 70 },
          { element: "Electro", value: -10 },
          { element: "Cryo", value: 10 },
          { element: "Anemo", value: 10 },
          { element: "Geo", value: 10 },
          { element: "Dendro", value: 10 },
        ],
        weaknesses: ["Electro DMG (negative resistance)", "Lunar-Charged reactions"],
        tips: [
          "Electro DPS like Clorinde, Raiden, or Varesa excel here",
          "Avoid Hydro DPS — 70% resistance",
          "Dodge the nightmare field AoE or use shields",
          "The Lunar-Charged disorder gives 75% bonus to Electro+Hydro reactions",
        ],
      },
      {
        name: "Legatus Golem",
        hp: "1,500,000",
        description: "A massive Geo construct that generates crystallize shields. Use Hydro to trigger Lunar-Crystallize for devastating reactions. Break its core during the stagger window.",
        resistances: [
          { element: "Pyro", value: 10 },
          { element: "Hydro", value: -10 },
          { element: "Electro", value: 10 },
          { element: "Cryo", value: 10 },
          { element: "Anemo", value: 10 },
          { element: "Geo", value: 70 },
          { element: "Dendro", value: 10 },
        ],
        weaknesses: ["Hydro DMG (negative resistance)", "Lunar-Crystallize reactions"],
        tips: [
          "Geo DPS like Navia or Itto paired with Hydro supports",
          "Avoid pure Geo DPS — 70% resistance, use Geo+Hydro for Lunar-Crystallize",
          "Attack the exposed core during stagger for massive damage",
          "The Lunar-Crystallize disorder gives 75% bonus to Geo+Hydro reactions",
        ],
      },
    ],
  },
];

// ── Recommended Teams (v6.4 meta) ────────────────────────────────────

export const RECOMMENDED_TEAMS: TeamComp[] = [
  { name: "Neuvillette Furina", characters: ["Neuvillette", "Furina", "Kaedehara Kazuha", "Zhongli"], usage: 45, clearRate: 99, archetype: "Hydro Hypercarry" },
  { name: "Mavuika Vaporize", characters: ["Mavuika", "Xilonen", "Bennett", "Furina"], usage: 35, clearRate: 98, archetype: "Pyro Hypercarry" },
  { name: "Raiden National", characters: ["Raiden Shogun", "Xiangling", "Bennett", "Xingqiu"], usage: 22, clearRate: 97, archetype: "Overloaded/Vape" },
  { name: "Citlali Freeze", characters: ["Kamisato Ayaka", "Citlali", "Kaedehara Kazuha", "Furina"], usage: 20, clearRate: 96, archetype: "Freeze" },
  { name: "National Team", characters: ["Xiangling", "Bennett", "Xingqiu", "Sucrose"], usage: 18, clearRate: 95, archetype: "Vaporize" },
  { name: "Alhaitham Spread", characters: ["Alhaitham", "Nahida", "Furina", "Zhongli"], usage: 16, clearRate: 97, archetype: "Spread" },
  { name: "Hu Tao Double Hydro", characters: ["Hu Tao", "Xingqiu", "Yelan", "Zhongli"], usage: 14, clearRate: 95, archetype: "Vaporize" },
  { name: "Kinich Burning", characters: ["Kinich", "Mavuika", "Bennett", "Xilonen"], usage: 12, clearRate: 94, archetype: "Burgeon/Burning" },
  { name: "Raiden Hypercarry", characters: ["Raiden Shogun", "Kujou Sara", "Kaedehara Kazuha", "Bennett"], usage: 10, clearRate: 96, archetype: "Electro Hypercarry" },
  { name: "Clorinde Aggravate", characters: ["Clorinde", "Fischl", "Nahida", "Kaedehara Kazuha"], usage: 9, clearRate: 93, archetype: "Aggravate" },
];

// ── Stygian Onslaught Data (v6.4) ────────────────────────────────────

export const STYGIAN_VERSION = "6.4";
export const STYGIAN_CYCLE = "March 3 - March 17, 2026";

export const STYGIAN_STAGES: StygianStage[] = [
  {
    stage: 1,
    name: "Hexadecatonic Mandragora",
    enemies: [
      { name: "Hexadecatonic Mandragora", hp: "800,000", element: "Dendro" },
      { name: "Mandragora Spore x4", hp: "100,000", element: "Dendro" },
    ],
    modifiers: [
      { name: "Spore Bloom", description: "The Mandragora splits into 4 spores periodically. Use Anemo to group them and AoE to eliminate quickly.", type: "mechanic" },
      { name: "Elemental Surge: Pyro", description: "Pyro DMG is increased by 60% for all characters.", type: "buff" },
      { name: "Dendro Erosion", description: "Standing in the bloom field deals Dendro DMG every 2s and reduces healing by 30%.", type: "debuff" },
    ],
    boss: {
      name: "Hexadecatonic Mandragora",
      hp: "800,000",
      description: "A monstrous Dendro plant that periodically splits into small spores. Group the spores with Anemo and use Pyro for the elemental surge bonus. Burning and Overloaded reactions are especially effective.",
      resistances: [
        { element: "Pyro", value: -20 },
        { element: "Hydro", value: 10 },
        { element: "Electro", value: 10 },
        { element: "Cryo", value: 10 },
        { element: "Anemo", value: 10 },
        { element: "Geo", value: 10 },
        { element: "Dendro", value: 70 },
      ],
      weaknesses: ["Pyro DMG (negative resistance)", "Anemo grouping for spores", "Burning/Burgeon reactions"],
      tips: [
        "Use Anemo to group spores quickly before they explode",
        "Pyro carries get 60% DMG bonus from the modifier",
        "Avoid Dendro DPS — 70% resistance",
        "Clear spores within time limit or they regenerate the boss HP",
      ],
    },
    tips: "Bring Pyro DPS and Anemo support. Mavuika, Hu Tao, or Diluc with Kazuha for grouping.",
  },
  {
    stage: 2,
    name: "Knuckle Duckle",
    enemies: [
      { name: "Knuckle Duckle", hp: "1,000,000", element: "Hydro" },
      { name: "Shield Device x2", hp: "150,000" },
    ],
    modifiers: [
      { name: "Shield Protocol", description: "Knuckle Duckle deploys energy shields periodically. Destroy the shield devices to remove protection.", type: "mechanic" },
      { name: "Electro-Charged Field", description: "Electro-Charged reactions deal 200% bonus DMG in this stage.", type: "buff" },
      { name: "Tidal Surge", description: "Every 20s, a tidal wave sweeps the arena dealing Hydro DMG. Jump or use shields to avoid.", type: "debuff" },
    ],
    tips: "Destroy shield devices first. Use Electro-Charged teams (Raiden, Fischl + Hydro applier). AoE helps with devices.",
  },
  {
    stage: 3,
    name: "Secret Source Automaton: Overseer Device",
    enemies: [
      { name: "Secret Source Automaton: Overseer Device", hp: "1,200,000" },
      { name: "Repair Drone x3", hp: "80,000" },
    ],
    modifiers: [
      { name: "Repair Protocol", description: "Repair drones periodically heal the Automaton for 5% HP. Destroy them immediately.", type: "mechanic" },
      { name: "Cryo Amplification", description: "Cryo application freezes the Automaton's joints, creating a 5s vulnerability window with 50% increased DMG taken.", type: "buff" },
      { name: "Overload Discharge", description: "The Automaton emits AoE Electro pulses every 15s. Standing too close deals heavy Electro DMG.", type: "debuff" },
    ],
    boss: {
      name: "Secret Source Automaton: Overseer Device",
      hp: "1,200,000",
      description: "A heavily armored automaton that deploys repair drones. Apply Cryo to freeze its joints and create vulnerability windows. Prioritize destroying repair drones, then burst during the frozen window.",
      resistances: [
        { element: "Pyro", value: 10 },
        { element: "Hydro", value: 10 },
        { element: "Electro", value: 30 },
        { element: "Cryo", value: -20 },
        { element: "Anemo", value: 10 },
        { element: "Geo", value: 10 },
        { element: "Dendro", value: 10 },
      ],
      weaknesses: ["Cryo DMG (negative resistance)", "Freeze reactions for vulnerability", "AoE to clear repair drones"],
      tips: [
        "Apply Cryo to freeze joints for a 5s damage window",
        "Destroy repair drones immediately or they heal the boss",
        "Freeze teams (Ayaka, Ganyu, Citlali) are ideal",
        "Keep distance during Electro discharge pulses",
      ],
    },
    tips: "Freeze teams are recommended. Ayaka or Ganyu with Hydro support. Kill repair drones on sight.",
  },
];
