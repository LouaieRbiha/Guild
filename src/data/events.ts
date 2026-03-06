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

import eventsJson from "./json/events.json";

// Current version events (loaded from JSON — easy to update without touching TypeScript)
export const CURRENT_VERSION: VersionInfo = eventsJson.currentVersion as VersionInfo;

export const PERMANENT_EVENTS: GameEvent[] = eventsJson.permanentEvents as GameEvent[];
