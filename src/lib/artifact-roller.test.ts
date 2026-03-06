import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  weightedPick,
  rollArtifact,
  MAIN_STATS,
  SUB_STATS,
  MAIN_STAT_VALUES,
  SLOT_META,
  ARTIFACT_DOMAINS,
  getArtifactPieceIcon,
} from './artifact-roller';

// ── weightedPick ────────────────────────────────────────────────────

describe('weightedPick', () => {
  it('returns the only key when a single entry has all weight', () => {
    expect(weightedPick({ HP: 100 })).toBe('HP');
  });

  it('always returns a valid key from the weights map', () => {
    const weights = { A: 10, B: 20, C: 30 };
    for (let i = 0; i < 50; i++) {
      const result = weightedPick(weights);
      expect(Object.keys(weights)).toContain(result);
    }
  });

  it('respects probability distribution (statistical test)', () => {
    const weights = { A: 90, B: 10 };
    const counts: Record<string, number> = { A: 0, B: 0 };
    const iterations = 1000;
    for (let i = 0; i < iterations; i++) {
      counts[weightedPick(weights)]++;
    }
    // A should appear roughly 90% of the time
    expect(counts.A).toBeGreaterThan(iterations * 0.75);
    expect(counts.B).toBeGreaterThan(0);
  });
});

// ── rollArtifact ────────────────────────────────────────────────────

describe('rollArtifact', () => {
  it('returns a valid artifact structure', () => {
    const art = rollArtifact('Emblem of Severed Fate');
    expect(art.set).toBe('Emblem of Severed Fate');
    expect(Object.keys(MAIN_STATS)).toContain(art.slot);
    expect([4, 5]).toContain(art.rarity);
    expect(art.substats.length).toBeGreaterThanOrEqual(3);
    expect(art.substats.length).toBeLessThanOrEqual(4);
  });

  it('picks a valid main stat for the rolled slot', () => {
    for (let i = 0; i < 20; i++) {
      const art = rollArtifact('Test Set');
      const validMains = MAIN_STATS[art.slot];
      expect(validMains).toContain(art.mainStat);
    }
  });

  it('never duplicates substats', () => {
    for (let i = 0; i < 20; i++) {
      const art = rollArtifact('Test Set');
      const subNames = art.substats.map((s) => s.name);
      expect(new Set(subNames).size).toBe(subNames.length);
    }
  });

  it('does not include the main stat as a substat', () => {
    for (let i = 0; i < 20; i++) {
      const art = rollArtifact('Test Set');
      const subNames = art.substats.map((s) => s.name);
      // For % main stats, the base stat (e.g. "HP" for "HP%") is excluded
      expect(subNames).not.toContain(art.mainStat);
    }
  });

  it('has substats with roll counts summing correctly', () => {
    for (let i = 0; i < 20; i++) {
      const art = rollArtifact('Test Set');
      const totalRolls = art.substats.reduce((sum, s) => sum + s.rolls, 0);
      // base substats get 1 roll each, then upgrades happen
      // 5★: 5 upgrades total, 4★: 4 upgrades total
      const expectedUpgrades = art.rarity === 5 ? 5 : 4;
      const expectedTotalRolls = art.baseSubCount + expectedUpgrades;
      expect(totalRolls).toBe(expectedTotalRolls);
    }
  });

  it('formats percent substats with % suffix', () => {
    // Roll many artifacts, find a percent substat
    let foundPercent = false;
    for (let i = 0; i < 50; i++) {
      const art = rollArtifact('Test Set');
      for (const sub of art.substats) {
        if (
          sub.name.includes('%') ||
          ['CRIT Rate', 'CRIT DMG', 'Energy Recharge'].includes(sub.name)
        ) {
          expect(sub.value).toMatch(/%$/);
          foundPercent = true;
        }
      }
    }
    expect(foundPercent).toBe(true);
  });

  it('baseSubCount is always 3 or 4', () => {
    for (let i = 0; i < 30; i++) {
      const art = rollArtifact('Test Set');
      expect([3, 4]).toContain(art.baseSubCount);
    }
  });
});

// ── MAIN_STATS ──────────────────────────────────────────────────────

describe('MAIN_STATS', () => {
  it('Flower always has HP as main stat', () => {
    expect(MAIN_STATS.Flower).toEqual(['HP']);
  });

  it('Plume always has ATK as main stat', () => {
    expect(MAIN_STATS.Plume).toEqual(['ATK']);
  });

  it('Sands has expected options', () => {
    expect(MAIN_STATS.Sands).toContain('ATK%');
    expect(MAIN_STATS.Sands).toContain('Energy Recharge');
  });

  it('Goblet includes elemental DMG% stats', () => {
    expect(MAIN_STATS.Goblet).toContain('Pyro DMG%');
    expect(MAIN_STATS.Goblet).toContain('Hydro DMG%');
  });

  it('Circlet includes CRIT Rate and CRIT DMG', () => {
    expect(MAIN_STATS.Circlet).toContain('CRIT Rate');
    expect(MAIN_STATS.Circlet).toContain('CRIT DMG');
  });
});

// ── MAIN_STAT_VALUES ────────────────────────────────────────────────

describe('MAIN_STAT_VALUES', () => {
  it('has Flower HP at 4,780', () => {
    expect(MAIN_STAT_VALUES['HP']).toBe('4,780');
  });
  it('has CRIT Rate at 31.1%', () => {
    expect(MAIN_STAT_VALUES['CRIT Rate']).toBe('31.1%');
  });
  it('has CRIT DMG at 62.2%', () => {
    expect(MAIN_STAT_VALUES['CRIT DMG']).toBe('62.2%');
  });
});

// ── SLOT_META ───────────────────────────────────────────────────────

describe('SLOT_META', () => {
  it('has labels for all 5 artifact slots', () => {
    expect(SLOT_META.Flower.label).toBe('Flower of Life');
    expect(SLOT_META.Plume.label).toBe('Plume of Death');
    expect(SLOT_META.Sands.label).toBe('Sands of Eon');
    expect(SLOT_META.Goblet.label).toBe('Goblet of Eonothem');
    expect(SLOT_META.Circlet.label).toBe('Circlet of Logos');
  });
});

// ── ARTIFACT_DOMAINS ────────────────────────────────────────────────

describe('ARTIFACT_DOMAINS', () => {
  it('contains at least 5 domains', () => {
    expect(ARTIFACT_DOMAINS.length).toBeGreaterThanOrEqual(5);
  });

  it('each domain has exactly 2 sets', () => {
    for (const domain of ARTIFACT_DOMAINS) {
      expect(domain.sets).toHaveLength(2);
    }
  });

  it('each domain has a name and location', () => {
    for (const domain of ARTIFACT_DOMAINS) {
      expect(domain.name.length).toBeGreaterThan(0);
      expect(domain.location.length).toBeGreaterThan(0);
    }
  });
});

// ── getArtifactPieceIcon ────────────────────────────────────────────

describe('getArtifactPieceIcon', () => {
  it('returns a URL for a known set and slot', () => {
    const icon = getArtifactPieceIcon('Emblem of Severed Fate', 'Flower');
    expect(icon).not.toBeNull();
    expect(icon).toContain('reliquary');
    expect(icon).toContain('.png');
  });

  it('returns null for unknown set names', () => {
    expect(getArtifactPieceIcon('Nonexistent Set', 'Flower')).toBeNull();
  });

  it('uses the correct slot suffix', () => {
    const flower = getArtifactPieceIcon('Emblem of Severed Fate', 'Flower');
    const plume = getArtifactPieceIcon('Emblem of Severed Fate', 'Plume');
    expect(flower).toContain('_4.png');
    expect(plume).toContain('_2.png');
  });
});
