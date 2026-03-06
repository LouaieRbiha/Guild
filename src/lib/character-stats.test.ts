import { describe, it, expect } from 'vitest';
import { CHARACTER_STATS } from './character-stats';

describe('CHARACTER_STATS', () => {
  it('contains well-known characters', () => {
    expect(CHARACTER_STATS).toHaveProperty('Hu Tao');
    expect(CHARACTER_STATS).toHaveProperty('Raiden Shogun');
    expect(CHARACTER_STATS).toHaveProperty('Ganyu');
    expect(CHARACTER_STATS).toHaveProperty('Zhongli');
    expect(CHARACTER_STATS).toHaveProperty('Bennett');
    expect(CHARACTER_STATS).toHaveProperty('Mavuika');
  });

  it('has valid base stat values for Hu Tao', () => {
    const ht = CHARACTER_STATS['Hu Tao'];
    expect(ht.hp).toBe(15552);
    expect(ht.atk).toBe(106);
    expect(ht.def).toBe(876);
    expect(ht.asc).toBe('CRIT DMG');
    expect(ht.ascVal).toBe('38.4%');
  });

  it('has valid base stat values for Raiden Shogun', () => {
    const rs = CHARACTER_STATS['Raiden Shogun'];
    expect(rs.hp).toBe(12907);
    expect(rs.atk).toBe(337);
    expect(rs.def).toBe(789);
    expect(rs.asc).toBe('ER');
    expect(rs.ascVal).toBe('32%');
  });

  it('all characters have positive hp, atk, def', () => {
    for (const [name, stats] of Object.entries(CHARACTER_STATS)) {
      expect(stats.hp, `${name} hp`).toBeGreaterThan(0);
      expect(stats.atk, `${name} atk`).toBeGreaterThan(0);
      expect(stats.def, `${name} def`).toBeGreaterThan(0);
    }
  });

  it('all characters have a non-empty ascension stat', () => {
    for (const [name, stats] of Object.entries(CHARACTER_STATS)) {
      expect(stats.asc.length, `${name} asc`).toBeGreaterThan(0);
      expect(stats.ascVal.length, `${name} ascVal`).toBeGreaterThan(0);
    }
  });

  it('contains both 5-star and 4-star level base stats', () => {
    // High hp characters (5-star hp scalers like Hu Tao, Zhongli)
    expect(CHARACTER_STATS['Zhongli'].hp).toBeGreaterThan(14000);
    // Lower hp characters (4-stars like Amber, Barbara)
    expect(CHARACTER_STATS['Amber'].hp).toBeLessThan(10000);
  });

  it('has realistic atk values (between 90 and 400)', () => {
    for (const [name, stats] of Object.entries(CHARACTER_STATS)) {
      expect(stats.atk, `${name} atk`).toBeGreaterThan(90);
      expect(stats.atk, `${name} atk`).toBeLessThan(400);
    }
  });
});
