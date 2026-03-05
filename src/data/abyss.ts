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

// ── Spiral Abyss Data (v6.4 Phase 1) ────────────────────────────────

export const ABYSS_VERSION = "6.4 Phase 1";
export const ABYSS_CYCLE = "March 1 - March 16, 2026";

export const ABYSS_FLOORS: AbyssFloor[] = [
  {
    floor: 9,
    disorder: "Characters on the field will continuously have their HP restored.",
    chambers: [
      {
        chamber: 1,
        firstHalf: [
          { name: "Hilichurl Fighter x3", hp: "25,000" },
          { name: "Stonehide Lawachurl", hp: "180,000", element: "Geo" },
        ],
        secondHalf: [
          { name: "Cryo Abyss Mage", hp: "120,000", element: "Cryo" },
          { name: "Hydro Abyss Mage", hp: "120,000", element: "Hydro" },
        ],
      },
      {
        chamber: 2,
        firstHalf: [
          { name: "Ruin Guard", hp: "250,000" },
          { name: "Ruin Scout", hp: "200,000" },
        ],
        secondHalf: [
          { name: "Electro Cicin Mage", hp: "180,000", element: "Electro" },
          { name: "Mirror Maiden", hp: "200,000", element: "Hydro" },
        ],
      },
      {
        chamber: 3,
        firstHalf: [
          { name: "Geovishap", hp: "280,000", element: "Geo" },
        ],
        secondHalf: [
          { name: "Primo Geovishap", hp: "350,000", element: "Geo" },
        ],
      },
    ],
  },
  {
    floor: 10,
    disorder: "After the active character triggers a Swirl reaction, all party members gain 20% ATK for 8s.",
    chambers: [
      {
        chamber: 1,
        firstHalf: [
          { name: "Fatui Skirmisher — Hydrogunner", hp: "200,000", element: "Hydro" },
          { name: "Fatui Skirmisher — Electrohammer", hp: "200,000", element: "Electro" },
          { name: "Fatui Skirmisher — Cryogunner", hp: "200,000", element: "Cryo" },
        ],
        secondHalf: [
          { name: "Eremite Scorching Loremaster", hp: "220,000", element: "Pyro" },
          { name: "Eremite Ravenbeak Halberdier", hp: "180,000" },
        ],
      },
      {
        chamber: 2,
        firstHalf: [
          { name: "Ruin Drake: Skywatch", hp: "350,000" },
          { name: "Ruin Drake: Earthguard", hp: "350,000" },
        ],
        secondHalf: [
          { name: "Consecrated Scorpion", hp: "300,000", element: "Dendro" },
          { name: "Consecrated Flying Serpent", hp: "300,000", element: "Dendro" },
        ],
      },
      {
        chamber: 3,
        firstHalf: [
          { name: "Aeonblight Drake", hp: "500,000" },
        ],
        secondHalf: [
          { name: "Jadeplume Terrorshroom", hp: "500,000", element: "Dendro" },
        ],
        tips: "Use ranged characters to stun the Aeonblight Drake mid-air.",
      },
    ],
  },
  {
    floor: 11,
    disorder: "DMG dealt by all party members' Elemental Burst is increased by 75%.",
    chambers: [
      {
        chamber: 1,
        firstHalf: [
          { name: "Fatui Agent x2", hp: "250,000", element: "Pyro" },
          { name: "Fatui Mirror Maiden", hp: "300,000", element: "Hydro" },
        ],
        secondHalf: [
          { name: "Consecrated Red Vulture", hp: "280,000", element: "Pyro" },
          { name: "Consecrated Horned Crocodile", hp: "280,000" },
        ],
      },
      {
        chamber: 2,
        firstHalf: [
          { name: "Primal Construct: Repulsor", hp: "350,000" },
          { name: "Primal Construct: Prospector", hp: "300,000" },
        ],
        secondHalf: [
          { name: "Black Serpent Knight: Windcutter", hp: "350,000" },
          { name: "Abyss Herald: Wicked Torrents", hp: "400,000", element: "Hydro" },
        ],
      },
      {
        chamber: 3,
        firstHalf: [
          { name: "Icewind Suite", hp: "800,000", element: "Cryo" },
        ],
        secondHalf: [
          { name: "Experimental Field Generator", hp: "700,000" },
        ],
        tips: "The Icewind Suite has two phases — focus the Coppelia (ranged) form first.",
      },
    ],
  },
  {
    floor: 12,
    disorder: "When the active character's Normal, Charged, or Plunging Attack hits an opponent affected by Pyro, an explosion occurs dealing AoE Pyro DMG. CD: 2s.",
    chambers: [
      {
        chamber: 1,
        firstHalf: [
          { name: "Gloomhound x2", hp: "400,000" },
          { name: "Voidshadow Hound", hp: "500,000" },
        ],
        secondHalf: [
          { name: "Frost Operative", hp: "450,000", element: "Cryo" },
          { name: "Wind Operative", hp: "450,000", element: "Anemo" },
        ],
      },
      {
        chamber: 2,
        firstHalf: [
          { name: "Solitary Suanni", hp: "1,000,000" },
        ],
        secondHalf: [
          { name: "Local Legend — Rockfond Rifthound Lord", hp: "900,000", element: "Geo" },
        ],
      },
      {
        chamber: 3,
        firstHalf: [
          { name: "Incandescent Remembrance of Burning Steel", hp: "1,800,000", element: "Pyro", notes: "Snezhnaya elite boss" },
        ],
        secondHalf: [
          { name: "Hydro Tulpa", hp: "1,500,000", element: "Hydro" },
        ],
        tips: "Use Hydro against the Burning Steel boss to extinguish its flame armor. The Hydro Tulpa is weak to Freeze.",
      },
    ],
    bosses: [
      {
        name: "Incandescent Remembrance of Burning Steel",
        hp: "1,800,000",
        resistances: [
          { element: "Pyro", value: 70 },
          { element: "Hydro", value: -20 },
          { element: "Electro", value: 10 },
          { element: "Cryo", value: 10 },
          { element: "Anemo", value: 10 },
          { element: "Geo", value: 10 },
          { element: "Dendro", value: 10 },
        ],
        weaknesses: ["Hydro damage (negative resistance)", "Reactions that apply Hydro"],
        tips: [
          "Use Hydro to strip its Pyro armor for a DPS window",
          "Avoid Pyro DPS entirely — 70% resistance",
          "Stay mobile during charge attacks",
          "Hydro characters like Neuvillette and Yelan excel here",
        ],
      },
      {
        name: "Hydro Tulpa",
        hp: "1,500,000",
        resistances: [
          { element: "Pyro", value: 10 },
          { element: "Hydro", value: 70 },
          { element: "Electro", value: 10 },
          { element: "Cryo", value: -20 },
          { element: "Anemo", value: 10 },
          { element: "Geo", value: 10 },
          { element: "Dendro", value: 10 },
        ],
        weaknesses: ["Cryo damage (negative resistance)", "Freeze reactions"],
        tips: [
          "Freeze the Tulpa to interrupt its attacks",
          "Avoid Hydro DPS — 70% resistance",
          "The Tulpa summons mirages — destroy them quickly",
          "Cryo characters like Ayaka and Ganyu are ideal",
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
    name: "Abyssal Vanguard",
    enemies: [
      { name: "Shadowy Husk: Standard Bearer x2", hp: "300,000" },
      { name: "Shadowy Husk: Line Breaker x2", hp: "300,000" },
      { name: "Black Serpent Knight: Windcutter", hp: "500,000" },
    ],
    modifiers: [
      { name: "Abyssal Erosion", description: "Active character loses 1.5% HP per second. Defeating enemies restores 5% HP.", type: "debuff" },
      { name: "Nightfall's Blessing", description: "After using an Elemental Burst, all party members gain 30% ATK for 10s.", type: "buff" },
    ],
    tips: "Start with a burst rotation to trigger the ATK buff immediately. Prioritize the Standard Bearers who can heal allies.",
  },
  {
    stage: 2,
    name: "Frozen Dominion",
    enemies: [
      { name: "Frostarm Lawachurl", hp: "600,000", element: "Cryo" },
      { name: "Ice Shieldwall Mitachurl x2", hp: "250,000", element: "Cryo" },
      { name: "Cryo Abyss Mage x2", hp: "200,000", element: "Cryo" },
    ],
    modifiers: [
      { name: "Permafrost Field", description: "The arena periodically freezes. Characters standing on ice take Cryo DMG every 2s.", type: "debuff" },
      { name: "Elemental Surge: Pyro", description: "Pyro DMG is increased by 60% for all characters.", type: "buff" },
      { name: "Shatter Bonus", description: "Shattering frozen enemies deals 200% bonus DMG.", type: "mechanic" },
    ],
    tips: "Pyro carries like Mavuika, Hu Tao, or Diluc trivialize this stage. Use shields to avoid Cryo chip damage.",
  },
  {
    stage: 3,
    name: "Thunderous Keep",
    enemies: [
      { name: "Electro Regisvine", hp: "800,000", element: "Electro" },
    ],
    modifiers: [
      { name: "Lightning Strikes", description: "Random lightning strikes deal Electro DMG to characters every 5s.", type: "debuff" },
      { name: "Overclocked", description: "When Overloaded is triggered, deal an additional 150% AoE DMG.", type: "buff" },
      { name: "Weakpoint Exposed", description: "Attacking the Regisvine's weak point deals 300% CRIT DMG.", type: "mechanic" },
    ],
    boss: {
      name: "Electro Regisvine",
      hp: "800,000",
      resistances: [
        { element: "Pyro", value: 10 },
        { element: "Hydro", value: 10 },
        { element: "Electro", value: 70 },
        { element: "Cryo", value: 10 },
        { element: "Anemo", value: 10 },
        { element: "Geo", value: 10 },
        { element: "Dendro", value: -10 },
      ],
      weaknesses: ["Dendro DMG (negative resistance)", "Pyro for Overloaded bonus"],
      tips: ["Target the corolla (top) or roots (bottom) to stun it", "Use Pyro to trigger the Overloaded bonus modifier", "Dendro applies Quicken for even more reaction damage"],
    },
    tips: "Bring a Pyro character to trigger the Overclocked bonus. Target the weak point immediately when exposed for massive damage.",
  },
  {
    stage: 4,
    name: "Abyssal Sovereign",
    enemies: [
      { name: "Abyss Lector: Violet Lightning", hp: "500,000", element: "Electro" },
      { name: "Abyss Lector: Fathomless Flames", hp: "500,000", element: "Pyro" },
    ],
    modifiers: [
      { name: "Dual Shields", description: "Both Lectors deploy Elemental shields simultaneously. Both shields must be broken within 15s of each other.", type: "mechanic" },
      { name: "Resonant Wrath", description: "If one Lector is defeated before the other, the remaining one enrages, gaining 50% ATK.", type: "debuff" },
      { name: "Shield Breaker", description: "Elemental reactions deal 200% bonus DMG to Lector shields.", type: "buff" },
    ],
    tips: "Bring both Cryo (for Pyro shields) and Hydro (for Electro shields). Try to evenly damage both and break shields within the time window.",
  },
  {
    stage: 5,
    name: "The Final Descent",
    enemies: [
      { name: "All-Devouring Narwhal", hp: "2,000,000", element: "Hydro" },
    ],
    modifiers: [
      { name: "Spatial Rift", description: "Characters are periodically pulled into the Narwhal's domain. Escape by dealing enough DMG.", type: "mechanic" },
      { name: "Abyssal Fury", description: "Every 30s, the Narwhal deals a massive AoE attack. Shield or dodge to survive.", type: "debuff" },
      { name: "Final Stand", description: "Below 30% HP, all party members gain 50% CRIT Rate and 100% CRIT DMG.", type: "buff" },
    ],
    boss: {
      name: "All-Devouring Narwhal",
      hp: "2,000,000",
      resistances: [
        { element: "Pyro", value: 10 },
        { element: "Hydro", value: 70 },
        { element: "Electro", value: 10 },
        { element: "Cryo", value: 10 },
        { element: "Anemo", value: 10 },
        { element: "Geo", value: 10 },
        { element: "Dendro", value: 10 },
      ],
      weaknesses: ["Non-Hydro damage", "Pyro carries", "Burst damage during stun phases"],
      tips: [
        "Avoid Hydro DPS — 70% resistance",
        "When pulled into the domain, focus all damage to escape quickly",
        "The Final Stand buff at 30% HP makes your team incredibly strong — save bursts",
        "Shields are critical for surviving the AoE fury attacks",
      ],
    },
    tips: "Save your strongest burst rotation for when the Narwhal drops below 30% to take advantage of the massive CRIT buffs.",
  },
];
