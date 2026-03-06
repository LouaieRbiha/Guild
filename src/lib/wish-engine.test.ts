import { describe, it, expect } from 'vitest';
import {
  get5StarRate,
  BANNER_CONFIG,
  BASE_4_RATE,
  GUARANTEED_4_PITY,
  WISH_COST,
  STARTING_PRIMOGEMS,
  type BannerPity,
  type BannerType,
} from './wish-engine';

// ── BANNER_CONFIG constants ─────────────────────────────────────────

describe('BANNER_CONFIG', () => {
  it('character banner has hard pity at 90', () => {
    expect(BANNER_CONFIG.character.hardPity).toBe(90);
  });

  it('weapon banner has hard pity at 80', () => {
    expect(BANNER_CONFIG.weapon.hardPity).toBe(80);
  });

  it('standard banner has hard pity at 90', () => {
    expect(BANNER_CONFIG.standard.hardPity).toBe(90);
  });

  it('character banner soft pity starts at 73', () => {
    expect(BANNER_CONFIG.character.softPityStart).toBe(73);
  });

  it('weapon banner soft pity starts at 62', () => {
    expect(BANNER_CONFIG.weapon.softPityStart).toBe(62);
  });

  it('all banners have labels and descriptions', () => {
    for (const type of ['character', 'weapon', 'standard'] as BannerType[]) {
      expect(BANNER_CONFIG[type].label.length).toBeGreaterThan(0);
      expect(BANNER_CONFIG[type].description.length).toBeGreaterThan(0);
    }
  });
});

// ── Exported constants ──────────────────────────────────────────────

describe('wish constants', () => {
  it('BASE_4_RATE is 5.1%', () => {
    expect(BASE_4_RATE).toBe(0.051);
  });

  it('4-star guarantee at 10 pity', () => {
    expect(GUARANTEED_4_PITY).toBe(10);
  });

  it('wish cost is 160 primogems', () => {
    expect(WISH_COST).toBe(160);
  });

  it('starting primogems is 28800 (180 wishes)', () => {
    expect(STARTING_PRIMOGEMS).toBe(28800);
    expect(STARTING_PRIMOGEMS / WISH_COST).toBe(180);
  });
});

// ── get5StarRate ────────────────────────────────────────────────────

describe('get5StarRate', () => {
  describe('character banner', () => {
    it('returns base rate before soft pity', () => {
      const rate = get5StarRate(0, 'character');
      expect(rate).toBe(0.006);
    });

    it('returns base rate at pity 72 (just before soft pity)', () => {
      const rate = get5StarRate(72, 'character');
      expect(rate).toBe(0.006);
    });

    it('increases rate during soft pity', () => {
      const baseRate = get5StarRate(0, 'character');
      const softRate = get5StarRate(73, 'character');
      expect(softRate).toBeGreaterThan(baseRate);
    });

    it('rate increases progressively during soft pity', () => {
      const rate73 = get5StarRate(73, 'character');
      const rate80 = get5StarRate(80, 'character');
      expect(rate80).toBeGreaterThan(rate73);
    });

    it('returns 1.0 at hard pity (pity 89, meaning next pull is 90th)', () => {
      const rate = get5StarRate(89, 'character');
      expect(rate).toBe(1.0);
    });

    it('soft pity rate formula: base + increase * (pulls past soft pity)', () => {
      const pity = 75; // 2 pulls past soft pity start of 73
      const expected = 0.006 + 0.06 * (75 - 73 + 1);
      const rate = get5StarRate(pity, 'character');
      expect(rate).toBeCloseTo(expected);
    });
  });

  describe('weapon banner', () => {
    it('returns base rate before soft pity', () => {
      expect(get5StarRate(0, 'weapon')).toBe(0.007);
    });

    it('returns base rate at pity 61 (just before soft pity)', () => {
      expect(get5StarRate(61, 'weapon')).toBe(0.007);
    });

    it('increases rate during soft pity', () => {
      const softRate = get5StarRate(62, 'weapon');
      expect(softRate).toBeGreaterThan(0.007);
    });

    it('returns 1.0 at hard pity (pity 79)', () => {
      expect(get5StarRate(79, 'weapon')).toBe(1.0);
    });
  });

  describe('standard banner', () => {
    it('uses same rates as character banner', () => {
      expect(get5StarRate(0, 'standard')).toBe(get5StarRate(0, 'character'));
      expect(get5StarRate(73, 'standard')).toBe(get5StarRate(73, 'character'));
    });
  });

  it('rate never exceeds 1.0', () => {
    for (let pity = 0; pity < 100; pity++) {
      for (const banner of ['character', 'weapon', 'standard'] as BannerType[]) {
        const rate = get5StarRate(pity, banner);
        expect(rate).toBeLessThanOrEqual(1.0);
        expect(rate).toBeGreaterThan(0);
      }
    }
  });
});

// ── BannerPity type ─────────────────────────────────────────────────

describe('BannerPity shape', () => {
  it('has the expected fields', () => {
    const pity: BannerPity = {
      pity5: 0,
      pity4: 0,
      guaranteed5: false,
      guaranteed4: false,
      capturingRadianceActive: false,
      fatePoints: 0,
      epitomizedTarget: 0,
    };

    expect(pity.pity5).toBe(0);
    expect(pity.pity4).toBe(0);
    expect(pity.guaranteed5).toBe(false);
    expect(pity.guaranteed4).toBe(false);
    expect(pity.capturingRadianceActive).toBe(false);
    expect(pity.fatePoints).toBe(0);
    expect(pity.epitomizedTarget).toBe(0);
  });
});
