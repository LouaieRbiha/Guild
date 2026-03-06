import { describe, it, expect } from 'vitest';
import {
  estimateRollCount,
  rollQuality,
  decomposeSubstatRolls,
  calcSubstatEfficiency,
  ROLL_VALUES,
} from './artifact-analysis';

// ── estimateRollCount ───────────────────────────────────────────────

describe('estimateRollCount', () => {
  it('estimates 1 roll for a minimal value', () => {
    // Min CRIT Rate roll is 2.7, so a value of "3.1" should be 1 roll
    expect(estimateRollCount('CRIT Rate', '3.1')).toBe(1);
  });

  it('estimates multiple rolls for higher values', () => {
    // 2 max CRIT Rate rolls = 7.8, avg roll ~3.3, so 6.6 -> ~2 rolls
    expect(estimateRollCount('CRIT Rate', '6.6')).toBe(2);
  });

  it('returns 0 for NaN values', () => {
    expect(estimateRollCount('CRIT Rate', 'invalid')).toBe(0);
  });

  it('returns 0 for unknown stat names', () => {
    expect(estimateRollCount('Unknown Stat', '10')).toBe(0);
  });

  it('returns at least 1 for any valid numeric value', () => {
    expect(estimateRollCount('ATK%', '4.1')).toBeGreaterThanOrEqual(1);
  });

  it('handles flat HP with large values', () => {
    // avg HP roll is ~229, so 700 -> ~3 rolls
    expect(estimateRollCount('HP', '700')).toBe(3);
  });
});

// ── rollQuality ─────────────────────────────────────────────────────

describe('rollQuality', () => {
  it('returns "high" for max-tier single roll', () => {
    // Max single CRIT Rate roll = 3.9
    expect(rollQuality('CRIT Rate', '3.9')).toBe('high');
  });

  it('returns "low" for min-tier rolls', () => {
    // Min CRIT Rate roll = 2.7, max would be 3.9 * 1 = 3.9
    // ratio = 2.7/3.9 ≈ 0.692 -> mid
    expect(rollQuality('CRIT Rate', '2.7')).toBe('mid');
  });

  it('returns "low" for NaN values', () => {
    expect(rollQuality('CRIT Rate', 'abc')).toBe('low');
  });

  it('returns "low" for unknown stats', () => {
    expect(rollQuality('Fake Stat', '10')).toBe('low');
  });

  it('returns "high" for near-max multi-roll values', () => {
    // 3 max CRIT DMG rolls = 7.8 * 3 = 23.4
    // Value of 22.5 -> ratio = 22.5/23.4 ≈ 0.96 -> high
    expect(rollQuality('CRIT DMG', '22.5')).toBe('high');
  });

  it('returns "mid" for average-quality rolls', () => {
    // 2 CRIT DMG rolls, average roll ≈ 6.6, so total ≈ 13.2
    // max = 7.8*2 = 15.6, ratio = 13.2/15.6 ≈ 0.846 -> mid (< 0.85)
    expect(rollQuality('CRIT DMG', '13.2')).toBe('mid');
  });
});

// ── decomposeSubstatRolls ───────────────────────────────────────────

describe('decomposeSubstatRolls', () => {
  it('decomposes a single max roll into tier 3', () => {
    const rolls = decomposeSubstatRolls('CRIT Rate', '3.9');
    expect(rolls).toHaveLength(1);
    expect(rolls[0].tier).toBe(3);
    expect(rolls[0].value).toBe(3.9);
  });

  it('decomposes a single min roll into tier 0', () => {
    const rolls = decomposeSubstatRolls('CRIT Rate', '2.7');
    expect(rolls).toHaveLength(1);
    expect(rolls[0].tier).toBe(0);
    expect(rolls[0].value).toBe(2.7);
  });

  it('returns empty array for NaN', () => {
    expect(decomposeSubstatRolls('CRIT Rate', 'bad')).toEqual([]);
  });

  it('returns empty array for unknown stat', () => {
    expect(decomposeSubstatRolls('Unknown', '5')).toEqual([]);
  });

  it('returns rolls summing closest to the actual value', () => {
    // CRIT DMG with ~2 rolls: value 14.0
    const rolls = decomposeSubstatRolls('CRIT DMG', '14.0');
    expect(rolls.length).toBeGreaterThanOrEqual(1);

    const totalValue = rolls.reduce((sum, r) => sum + r.value, 0);
    // The decomposed value should be close to the original
    expect(Math.abs(totalValue - 14.0)).toBeLessThan(2);
  });

  it('each roll has a valid tier between 0 and 3', () => {
    const rolls = decomposeSubstatRolls('ATK%', '15');
    for (const r of rolls) {
      expect(r.tier).toBeGreaterThanOrEqual(0);
      expect(r.tier).toBeLessThanOrEqual(3);
    }
  });

  it('returns rolls ordered high tier first', () => {
    const rolls = decomposeSubstatRolls('CRIT DMG', '20');
    for (let i = 1; i < rolls.length; i++) {
      expect(rolls[i - 1].tier).toBeGreaterThanOrEqual(rolls[i].tier);
    }
  });
});

// ── calcSubstatEfficiency ───────────────────────────────────────────

describe('calcSubstatEfficiency', () => {
  it('returns 100% for max-rolled substats', () => {
    // Single max roll in CRIT Rate
    const eff = calcSubstatEfficiency([
      { name: 'CRIT Rate', value: '3.9' },
    ]);
    expect(eff).toBeCloseTo(100, 0);
  });

  it('returns less than 100% for average rolls', () => {
    const eff = calcSubstatEfficiency([
      { name: 'CRIT Rate', value: '3.1' },
    ]);
    // 3.1 / 3.9 = ~79.5%
    expect(eff).toBeLessThan(100);
    expect(eff).toBeGreaterThan(50);
  });

  it('returns 0 for empty substats', () => {
    expect(calcSubstatEfficiency([])).toBe(0);
  });

  it('returns 0 for unknown stat names', () => {
    expect(
      calcSubstatEfficiency([{ name: 'Fake', value: '10' }]),
    ).toBe(0);
  });

  it('handles NaN values by skipping them', () => {
    const eff = calcSubstatEfficiency([
      { name: 'CRIT Rate', value: '3.9' },
      { name: 'ATK%', value: 'N/A' },
    ]);
    // Only CRIT Rate should contribute
    expect(eff).toBeCloseTo(100, 0);
  });

  it('combines multiple substats correctly', () => {
    const eff = calcSubstatEfficiency([
      { name: 'CRIT Rate', value: '3.9' },  // max
      { name: 'CRIT DMG', value: '5.4' },   // min
    ]);
    // (3.9 + 5.4) / (3.9 + 7.8) = 9.3/11.7 ≈ 79.5%
    expect(eff).toBeGreaterThan(70);
    expect(eff).toBeLessThan(90);
  });
});
