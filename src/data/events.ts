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
