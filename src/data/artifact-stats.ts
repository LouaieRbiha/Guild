// Real artifact stat distribution data from the Genshin Impact wiki
// https://genshin-impact.fandom.com/wiki/Artifact/Stats

/** Main stat drop rates per artifact slot */
export const MAIN_STAT_RATES: Record<string, Record<string, number>> = {
  Flower: {
    "HP": 100,
  },
  Plume: {
    "ATK": 100,
  },
  Sands: {
    "HP%": 26.68,
    "ATK%": 26.66,
    "DEF%": 26.66,
    "Energy Recharge%": 10.00,
    "Elemental Mastery": 10.00,
  },
  Goblet: {
    "HP%": 19.25,
    "ATK%": 19.25,
    "DEF%": 19.00,
    "Elemental Mastery": 2.50,
    "Pyro DMG Bonus%": 5.00,
    "Electro DMG Bonus%": 5.00,
    "Cryo DMG Bonus%": 5.00,
    "Hydro DMG Bonus%": 5.00,
    "Dendro DMG Bonus%": 5.00,
    "Anemo DMG Bonus%": 5.00,
    "Geo DMG Bonus%": 5.00,
    "Physical DMG Bonus%": 5.00,
  },
  Circlet: {
    "HP%": 22.00,
    "ATK%": 22.00,
    "DEF%": 22.00,
    "CRIT Rate%": 10.00,
    "CRIT DMG%": 10.00,
    "Healing Bonus%": 10.00,
    "Elemental Mastery": 4.00,
  },
};

/** Substat possible values at +0 (4 tiers: 70%, 80%, 90%, 100%) */
export const SUBSTAT_ROLLS: Record<string, number[]> = {
  "HP":               [209.13, 239.00, 268.88, 298.75],
  "ATK":              [13.62,  15.56,  17.51,  19.45],
  "DEF":              [16.20,  18.52,  20.83,  23.15],
  "HP%":              [4.08,   4.66,   5.25,   5.83],
  "ATK%":             [4.08,   4.66,   5.25,   5.83],
  "DEF%":             [5.10,   5.83,   6.56,   7.29],
  "Elemental Mastery":[16.32,  18.65,  20.98,  23.31],
  "Energy Recharge%": [4.53,   5.18,   5.83,   6.48],
  "CRIT Rate%":       [2.72,   3.11,   3.50,   3.89],
  "CRIT DMG%":        [5.44,   6.22,   6.99,   7.77],
};

/** Substat weight distribution (equal probability for each substat) */
export const SUBSTAT_WEIGHTS: Record<string, number> = {
  "HP":               6,
  "ATK":              6,
  "DEF":              6,
  "HP%":              4,
  "ATK%":             4,
  "DEF%":             4,
  "Elemental Mastery":4,
  "Energy Recharge%": 4,
  "CRIT Rate%":       3,
  "CRIT DMG%":        3,
};

/** Probability of starting with 4 substats vs 3 */
export const FOUR_SUBSTAT_CHANCE = 0.2; // 20% chance to start with 4 substats

/** Resin cost per domain run */
export const RESIN_PER_RUN = 20;

/** Average artifacts per domain run (AR 45+) */
export const ARTIFACTS_PER_RUN = 1.065; // ~1 guaranteed + small chance of second

/** Daily resin budget */
export const DAILY_RESIN_NO_REFRESH = 160;
export const DAILY_RESIN_WITH_REFRESH = 220; // 1 refill = +60

/**
 * Calculate probability of getting a specific main stat on a given slot
 */
export function mainStatProbability(slot: string, mainStat: string): number {
  const rates = MAIN_STAT_RATES[slot];
  if (!rates) return 0;
  return (rates[mainStat] ?? 0) / 100;
}

/**
 * Calculate probability of getting at least one crit substat
 * Given a main stat (which can't appear as substat), calculate odds
 * of getting CRIT Rate or CRIT DMG in the initial substats
 */
export function critSubstatProbability(mainStat: string): number {
  const totalWeight = Object.entries(SUBSTAT_WEIGHTS)
    .filter(([name]) => name !== mainStat)
    .reduce((sum, [, w]) => sum + w, 0);

  const critWeight = (mainStat !== "CRIT Rate%" ? (SUBSTAT_WEIGHTS["CRIT Rate%"] ?? 0) : 0)
    + (mainStat !== "CRIT DMG%" ? (SUBSTAT_WEIGHTS["CRIT DMG%"] ?? 0) : 0);

  // Probability of NOT getting any crit in 3 picks (simplified)
  const noCritPerPick = 1 - critWeight / totalWeight;
  const noCritIn3 = noCritPerPick ** 3;

  return 1 - noCritIn3;
}

/**
 * Estimate resin needed to get a piece with specific main stat and crit subs
 */
export function estimateResinForPiece(
  slot: string,
  mainStat: string,
  wantCrit: boolean = true,
): { resin: number; runs: number; days: number; daysRefresh: number } {
  const mainProb = mainStatProbability(slot, mainStat);
  if (mainProb === 0) return { resin: Infinity, runs: Infinity, days: Infinity, daysRefresh: Infinity };

  // Probability of getting the right set piece (50% — domains drop 2 sets)
  const setProb = 0.5;

  // Probability of getting the right slot (1/5)
  const slotProb = 0.2;

  let totalProb = setProb * slotProb * mainProb;

  if (wantCrit) {
    totalProb *= critSubstatProbability(mainStat);
  }

  // Expected runs = 1 / probability
  const expectedRuns = 1 / totalProb;
  const resin = Math.round(expectedRuns * RESIN_PER_RUN);
  const days = Math.round(resin / DAILY_RESIN_NO_REFRESH);
  const daysRefresh = Math.round(resin / DAILY_RESIN_WITH_REFRESH);

  return { resin, runs: Math.round(expectedRuns), days, daysRefresh };
}

/**
 * Get a human-readable farming estimate string
 */
export function farmingEstimate(slot: string, mainStat: string): string {
  if (slot === "Flower" || slot === "Plume") {
    return "Guaranteed main stat -- farm for substats";
  }

  const est = estimateResinForPiece(slot, mainStat, true);
  if (est.resin === Infinity) return "Invalid main stat for this slot";

  const rate = mainStatProbability(slot, mainStat) * 100;
  return `${rate.toFixed(1)}% drop rate · ~${est.resin.toLocaleString()} resin · ~${est.days} days (no refresh)`;
}
