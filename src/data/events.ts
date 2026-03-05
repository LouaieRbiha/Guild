export interface GameEvent {
  name: string;
  type: "In-Game" | "Web Event" | "Test Run" | "Permanent" | "Update";
  start: string; // ISO date
  end: string;
  description: string;
  rewards?: string[]; // e.g., ["Primogems x420", "Hero's Wit x12"]
}

export interface VersionInfo {
  version: string;
  name: string;
  region: string;
  start: string;
  end: string;
  events: GameEvent[];
}

// Current version 6.4 events (hardcoded — easy to update)
export const CURRENT_VERSION: VersionInfo = {
  version: "6.4",
  name: "Natlan — Chapter IV",
  region: "Natlan",
  start: "2026-02-25T10:00:00Z",
  end: "2026-04-07T06:00:00Z",
  events: [
    {
      name: "Phase 1 Character Banner: Varka & Flins",
      type: "Update",
      start: "2026-02-25T10:00:00Z",
      end: "2026-03-17T06:59:59Z",
      description:
        "Featured 5★ Characters: Varka, Flins. Featured 4★: Bennett, Xiangling, Sucrose.",
      rewards: ["Acquaint Fate x10"],
    },
    {
      name: "Spiral Abyss Reset",
      type: "Permanent",
      start: "2026-03-01T04:00:00Z",
      end: "2026-03-16T04:00:00Z",
      description:
        "New Spiral Abyss cycle with updated enemies and disorders.",
      rewards: ["Primogems x600", "Mora x680000"],
    },
    {
      name: "Battle Pass Season",
      type: "Permanent",
      start: "2026-02-25T10:00:00Z",
      end: "2026-04-07T06:00:00Z",
      description:
        "Complete weekly and seasonal challenges for rewards.",
      rewards: ["Intertwined Fate x4", "Fragile Resin x1"],
    },
    {
      name: "Adventurer's Booster Bundle",
      type: "Web Event",
      start: "2026-02-25T10:00:00Z",
      end: "2026-03-10T06:00:00Z",
      description:
        "Log in daily and complete web event tasks for primogem rewards.",
      rewards: ["Primogems x120"],
    },
    {
      name: "Character Trial: Varka",
      type: "Test Run",
      start: "2026-02-25T10:00:00Z",
      end: "2026-03-17T06:59:59Z",
      description:
        "Try out Varka in a special trial domain to test his abilities.",
      rewards: ["Primogems x20", "Adventurer's Experience x6"],
    },
    {
      name: "Character Trial: Flins",
      type: "Test Run",
      start: "2026-02-25T10:00:00Z",
      end: "2026-03-17T06:59:59Z",
      description: "Try out Flins in a special trial domain.",
      rewards: ["Primogems x20", "Adventurer's Experience x6"],
    },
    {
      name: "Ley Line Overflow",
      type: "In-Game",
      start: "2026-03-03T10:00:00Z",
      end: "2026-03-10T04:00:00Z",
      description:
        "Claim double rewards from Blossoms of Wealth and Revelation without using extra resin.",
      rewards: ["Mora x240000", "Hero's Wit x24"],
    },
    {
      name: "Talent Material Double Drops",
      type: "In-Game",
      start: "2026-03-10T10:00:00Z",
      end: "2026-03-17T04:00:00Z",
      description:
        "Receive double talent level-up materials from all talent material domains.",
      rewards: ["Talent Books x2 multiplier"],
    },
    {
      name: "Adventurer's Journey — Natlan Edition",
      type: "Web Event",
      start: "2026-03-05T10:00:00Z",
      end: "2026-03-15T04:00:00Z",
      description:
        "Complete web-based exploration challenges for in-game rewards. Share Natlan landmarks on social media for bonus Primogems.",
      rewards: ["Primogems x120", "Mystic Enhancement Ore x20", "Mora x50000"],
    },
    {
      name: "Genius Invokation TCG — Grand Tournament",
      type: "In-Game",
      start: "2026-03-02T10:00:00Z",
      end: "2026-03-16T04:00:00Z",
      description:
        "Compete in the seasonal TCG tournament with special rules and exclusive card rewards.",
      rewards: ["Primogems x180", "Lucky Coins x1200"],
    },
    {
      name: "Vibro-Crystal Research — Resonant Frequencies",
      type: "In-Game",
      start: "2026-03-07T10:00:00Z",
      end: "2026-03-21T04:00:00Z",
      description:
        "Match elemental crystals to achieve high scores in this combat optimization challenge.",
      rewards: ["Primogems x420", "Hero's Wit x12", "Mora x200000"],
    },
    {
      name: "HoYoLAB Daily Check-in — March",
      type: "Web Event",
      start: "2026-03-01T00:00:00Z",
      end: "2026-03-31T23:59:59Z",
      description:
        "Check in daily on HoYoLAB for cumulative rewards throughout the month.",
      rewards: ["Primogems x60", "Hero's Wit x3", "Mystic Enhancement Ore x10"],
    },
    {
      name: "Energy Amplifier Fruition",
      type: "In-Game",
      start: "2026-03-12T10:00:00Z",
      end: "2026-03-25T04:00:00Z",
      description:
        "Use Energy Amplifier components to enhance your characters and complete combat challenges at higher difficulties for greater rewards.",
      rewards: ["Primogems x420", "Mystic Enhancement Ore x20", "Mora x200000"],
    },
    {
      name: "Phase 2 Character Banner",
      type: "Update",
      start: "2026-03-17T07:00:00Z",
      end: "2026-04-07T06:00:00Z",
      description: "Phase 2 featured banners. Characters to be announced.",
    },
    {
      name: "Imaginarium Theater Season",
      type: "Permanent",
      start: "2026-03-01T04:00:00Z",
      end: "2026-04-01T04:00:00Z",
      description:
        "Complete floors in the Imaginarium Theater for rewards.",
      rewards: ["Primogems x680", "Visionary Flames"],
    },
  ],
};

export const PERMANENT_EVENTS: GameEvent[] = [
  {
    name: "Daily Commissions",
    type: "Permanent",
    start: "2020-09-28T00:00:00Z",
    end: "2099-12-31T00:00:00Z",
    description:
      "Complete 4 daily commissions and claim rewards from the Adventurers' Guild.",
    rewards: ["Primogems x60/day"],
  },
  {
    name: "Spiral Abyss",
    type: "Permanent",
    start: "2020-09-28T00:00:00Z",
    end: "2099-12-31T00:00:00Z",
    description:
      "Resets on the 1st and 16th of every month. Clear floors 9-12 for Primogems.",
    rewards: ["Primogems x600 per cycle"],
  },
  {
    name: "Imaginarium Theater",
    type: "Permanent",
    start: "2024-06-05T00:00:00Z",
    end: "2099-12-31T00:00:00Z",
    description:
      "Monthly endgame content using a rotating character roster.",
    rewards: ["Primogems x680/month"],
  },
];
