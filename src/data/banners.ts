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

import bannersJson from "./json/banners.json";

export const BANNER_HISTORY: BannerPhase[] = bannersJson;

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
