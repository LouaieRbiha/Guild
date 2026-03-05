export interface BannerPhase {
  version: string;
  phase: number;
  start: string;  // ISO date
  end: string;
  characters: {
    featured5: string[];  // character names
    featured4: string[];
  };
  weapons: {
    featured5: string[];  // weapon names
    featured4: string[];
  };
}

export const BANNER_HISTORY: BannerPhase[] = [
  {
    version: "6.4",
    phase: 1,
    start: "2026-02-25T10:00:00Z",
    end: "2026-03-17T06:59:59Z",
    characters: {
      featured5: ["Varka", "Flins"],
      featured4: ["Bennett", "Xiangling", "Sucrose"],
    },
    weapons: {
      featured5: ["Wolf's Gravestone", "Staff of the Scarlet Sands"],
      featured4: ["The Flute", "Sacrificial Greatsword", "Dragon's Bane", "Rust", "Eye of Perception"],
    },
  },
];

export function getActiveBanner(): BannerPhase | null {
  const now = new Date();
  for (const banner of BANNER_HISTORY) {
    const start = new Date(banner.start);
    const end = new Date(banner.end);
    if (now >= start && now <= end) return banner;
  }
  // Return latest banner as fallback
  return BANNER_HISTORY[0] || null;
}
