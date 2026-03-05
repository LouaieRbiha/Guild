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
          { name: "Hilichurl Fighter", hp: "25,000" },
          { name: "Hilichurl Berserker", hp: "30,000" },
          { name: "Stonehide Lawachurl", hp: "180,000", element: "Geo" },
        ],
        secondHalf: [
          { name: "Hilichurl Shooter", hp: "20,000" },
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
          { name: "Eremite Ravenbeak Halberdier", hp: "180,000" },
          { name: "Eremite Crossbow", hp: "150,000" },
          { name: "Eremite Scorching Loremaster", hp: "220,000", element: "Pyro" },
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
          { name: "Treasure Hoarder (multiple)", hp: "150,000" },
        ],
        secondHalf: [
          { name: "Hilichurl Roguelike Wave", hp: "100,000" },
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
          { name: "Maguu Kenki", hp: "700,000" },
        ],
        secondHalf: [
          { name: "Perpetual Mechanical Array", hp: "700,000" },
        ],
        tips: "Focus DPS on the PMA's mini-sentinels to break its invincibility phase faster.",
      },
    ],
  },
  {
    floor: 12,
    disorder: "For this floor only, the weights of all Elemental Shards absorbed by characters are increased.",
    chambers: [
      {
        chamber: 1,
        firstHalf: [
          { name: "Primal Bathysmal Vishap Herd", hp: "500,000" },
        ],
        secondHalf: [
          { name: "Ruin Serpent", hp: "800,000", element: "Geo" },
        ],
      },
      {
        chamber: 2,
        firstHalf: [
          { name: "Coral Defenders", hp: "600,000" },
        ],
        secondHalf: [
          { name: "Thunder Manifestation", hp: "700,000", element: "Electro" },
        ],
      },
      {
        chamber: 3,
        firstHalf: [
          { name: "Guardian of Apep's Oasis", hp: "1,200,000", element: "Dendro" },
        ],
        secondHalf: [
          { name: "All-Devouring Narwhal", hp: "1,500,000", element: "Hydro" },
        ],
        tips: "The Narwhal has no elemental resistance to Pyro — use Pyro DPS for maximum damage.",
      },
    ],
    bosses: [
      {
        name: "Guardian of Apep's Oasis",
        hp: "1,200,000",
        resistances: [
          { element: "Pyro", value: 10 },
          { element: "Hydro", value: 10 },
          { element: "Electro", value: 10 },
          { element: "Cryo", value: 10 },
          { element: "Anemo", value: 10 },
          { element: "Geo", value: 10 },
          { element: "Dendro", value: 70 },
        ],
        weaknesses: ["Non-Dendro elements", "Crowd control during root phase"],
        tips: ["Avoid Dendro DPS", "Use shields to tank AoE attacks", "Focus damage during stunned phase"],
      },
      {
        name: "All-Devouring Narwhal",
        hp: "1,500,000",
        resistances: [
          { element: "Pyro", value: 10 },
          { element: "Hydro", value: 70 },
          { element: "Electro", value: 10 },
          { element: "Cryo", value: 10 },
          { element: "Anemo", value: 10 },
          { element: "Geo", value: 10 },
          { element: "Dendro", value: 10 },
        ],
        weaknesses: ["Pyro damage", "Electro reactions"],
        tips: ["Avoid Hydro DPS", "Stay close during dive attacks", "Use Pyro characters for maximum damage"],
      },
    ],
  },
];

export const RECOMMENDED_TEAMS: TeamComp[] = [
  { name: "National Team", characters: ["Xiangling", "Bennett", "Xingqiu", "Sucrose"], usage: 28, clearRate: 96, archetype: "Vaporize" },
  { name: "Raiden National", characters: ["Raiden Shogun", "Xiangling", "Bennett", "Xingqiu"], usage: 25, clearRate: 98, archetype: "Overloaded/Vape" },
  { name: "Neuvillette Furina", characters: ["Neuvillette", "Furina", "Kaedehara Kazuha", "Zhongli"], usage: 45, clearRate: 99, archetype: "Hydro Hypercarry" },
  { name: "Alhaitham Spread", characters: ["Alhaitham", "Nahida", "Furina", "Zhongli"], usage: 18, clearRate: 97, archetype: "Spread" },
  { name: "Hu Tao Vape", characters: ["Hu Tao", "Xingqiu", "Yelan", "Zhongli"], usage: 15, clearRate: 95, archetype: "Vaporize" },
  { name: "Ayaka Freeze", characters: ["Kamisato Ayaka", "Shenhe", "Kaedehara Kazuha", "Sangonomiya Kokomi"], usage: 12, clearRate: 94, archetype: "Freeze" },
  { name: "Wanderer Hypercarry", characters: ["Wanderer", "Faruzan", "Bennett", "Zhongli"], usage: 8, clearRate: 92, archetype: "Anemo DPS" },
  { name: "Raiden Hypercarry", characters: ["Raiden Shogun", "Kujou Sara", "Kaedehara Kazuha", "Bennett"], usage: 10, clearRate: 96, archetype: "Electro Hypercarry" },
  { name: "Tartaglia International", characters: ["Tartaglia", "Xiangling", "Bennett", "Kaedehara Kazuha"], usage: 9, clearRate: 94, archetype: "Vaporize" },
  { name: "Mono Geo", characters: ["Navia", "Zhongli", "Albedo", "Gorou"], usage: 7, clearRate: 91, archetype: "Geo Resonance" },
];
