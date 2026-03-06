import { describe, it, expect } from 'vitest';
import {
  scoreArtifact,
  scoreCharacterBuild,
  estimateResinForPiece,
  estimateResin,
  getPieceRoast,
  getTier,
  getTierLabel,
  getRoast,
  calculateCV,
  scoreColor,
  grade,
  barColor,
  pieceLabel,
} from './scoring';
import type { Artifact, Character } from './enka/client';

// ── Helper to build a minimal Artifact ──────────────────────────────

function makeArtifact(
  substats: { name: string; value: string }[],
): Artifact {
  return {
    slot: 'Flower',
    set: 'Test Set',
    mainStat: 'HP',
    mainValue: '4780',
    substats,
    rarity: 5,
    icon: '',
  };
}

// ── scoreArtifact ───────────────────────────────────────────────────

describe('scoreArtifact', () => {
  it('returns 0 for an artifact with no substats', () => {
    const art = makeArtifact([]);
    expect(scoreArtifact(art)).toBe(0);
  });

  it('scores CRIT Rate substats with 2x weight', () => {
    const artCR = makeArtifact([{ name: 'CRIT Rate', value: '10' }]);
    const artCD = makeArtifact([{ name: 'CRIT DMG', value: '10' }]);
    // CRIT Rate contributes cv = 10*2 = 20, CRIT DMG contributes cv = 10
    expect(scoreArtifact(artCR)).toBeGreaterThan(scoreArtifact(artCD));
  });

  it('caps score at 100', () => {
    const art = makeArtifact([
      { name: 'CRIT Rate', value: '30' },
      { name: 'CRIT DMG', value: '40' },
      { name: 'ATK%', value: '30' },
    ]);
    expect(scoreArtifact(art)).toBeLessThanOrEqual(100);
  });

  it('returns non-negative scores for garbage substats', () => {
    const art = makeArtifact([
      { name: 'HP', value: '100' },
      { name: 'DEF', value: '50' },
    ]);
    expect(scoreArtifact(art)).toBeGreaterThanOrEqual(0);
  });

  it('adds useful sub contribution for ATK%, HP%, DEF%, ER, EM', () => {
    const artCritOnly = makeArtifact([{ name: 'CRIT Rate', value: '5' }]);
    const artWithUseful = makeArtifact([
      { name: 'CRIT Rate', value: '5' },
      { name: 'ATK%', value: '10' },
    ]);
    expect(scoreArtifact(artWithUseful)).toBeGreaterThan(
      scoreArtifact(artCritOnly),
    );
  });

  it('handles non-numeric substat values gracefully', () => {
    const art = makeArtifact([{ name: 'CRIT Rate', value: 'N/A' }]);
    expect(scoreArtifact(art)).toBe(0);
  });
});

// ── scoreCharacterBuild ─────────────────────────────────────────────

describe('scoreCharacterBuild', () => {
  it('returns 0 if the character has no artifacts', () => {
    const char = { artifacts: [] } as unknown as Character;
    expect(scoreCharacterBuild(char)).toBe(0);
  });

  it('averages the per-artifact scores and maps to 0-10', () => {
    const artifacts = [
      makeArtifact([{ name: 'CRIT DMG', value: '20' }]),
      makeArtifact([{ name: 'CRIT DMG', value: '20' }]),
    ];
    const char = { artifacts } as unknown as Character;
    const score = scoreCharacterBuild(char);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(10);
  });
});

// ── estimateResinForPiece ───────────────────────────────────────────

describe('estimateResinForPiece', () => {
  it('returns resin and days for a given piece score', () => {
    const result = estimateResinForPiece(50);
    expect(result).toHaveProperty('resin');
    expect(result).toHaveProperty('days');
    expect(result.resin).toBeGreaterThan(0);
    expect(result.days).toBeGreaterThanOrEqual(0);
  });

  it('increases resin exponentially with higher scores', () => {
    const low = estimateResinForPiece(20);
    const high = estimateResinForPiece(80);
    expect(high.resin).toBeGreaterThan(low.resin);
  });
});

// ── estimateResin ───────────────────────────────────────────────────

describe('estimateResin', () => {
  it('returns match, good, and god tiers', () => {
    const result = estimateResin(50);
    expect(result.match.resin).toBeGreaterThan(0);
    expect(result.good.resin).toBeGreaterThan(result.match.resin);
    expect(result.god.resin).toBeGreaterThan(result.good.resin);
  });
});

// ── getTier / getTierLabel ──────────────────────────────────────────

describe('getTier', () => {
  it('returns catastrophic for scores <= 2', () => {
    expect(getTier(0)).toBe('catastrophic');
    expect(getTier(1)).toBe('catastrophic');
    expect(getTier(2)).toBe('catastrophic');
  });

  it('returns tragic for scores 2.1-4', () => {
    expect(getTier(3)).toBe('tragic');
    expect(getTier(4)).toBe('tragic');
  });

  it('returns mid for scores 4.1-6', () => {
    expect(getTier(5)).toBe('mid');
    expect(getTier(6)).toBe('mid');
  });

  it('returns solid for scores 6.1-8', () => {
    expect(getTier(7)).toBe('solid');
    expect(getTier(8)).toBe('solid');
  });

  it('returns cracked for scores > 8', () => {
    expect(getTier(9)).toBe('cracked');
    expect(getTier(10)).toBe('cracked');
  });
});

describe('getTierLabel', () => {
  it('returns capitalized tier labels', () => {
    expect(getTierLabel(1)).toBe('Catastrophic');
    expect(getTierLabel(3)).toBe('Tragic');
    expect(getTierLabel(5)).toBe('Mid');
    expect(getTierLabel(7)).toBe('Solid');
    expect(getTierLabel(9)).toBe('Cracked');
  });
});

// ── getRoast ────────────────────────────────────────────────────────

describe('getRoast', () => {
  it('returns a string roast for valid tiers', () => {
    const roast = getRoast('mid', 'test-seed');
    expect(typeof roast).toBe('string');
    expect(roast.length).toBeGreaterThan(0);
  });

  it('is deterministic for the same seed', () => {
    const a = getRoast('cracked', 'some-uid-character');
    const b = getRoast('cracked', 'some-uid-character');
    expect(a).toBe(b);
  });

  it('falls back to mid roasts for unknown tiers', () => {
    const roast = getRoast('nonexistent', 'seed');
    expect(typeof roast).toBe('string');
    expect(roast.length).toBeGreaterThan(0);
  });
});

// ── getPieceRoast ───────────────────────────────────────────────────

describe('getPieceRoast', () => {
  it('returns a roast string for terrible pieces (<= 20)', () => {
    const roast = getPieceRoast(15, 'flower-1');
    expect(typeof roast).toBe('string');
    expect(roast!.length).toBeGreaterThan(0);
  });

  it('returns a roast string for bad pieces (21-35)', () => {
    const roast = getPieceRoast(25, 'plume-2');
    expect(typeof roast).toBe('string');
    expect(roast!.length).toBeGreaterThan(0);
  });

  it('returns null for mid pieces (36-79)', () => {
    expect(getPieceRoast(50, 'sands-3')).toBeNull();
  });

  it('returns a roast string for great pieces (>= 80)', () => {
    const roast = getPieceRoast(85, 'circlet-4');
    expect(typeof roast).toBe('string');
    expect(roast!.length).toBeGreaterThan(0);
  });
});

// ── calculateCV ─────────────────────────────────────────────────────

describe('calculateCV', () => {
  it('calculates CRIT Value as CR*2 + CD', () => {
    const cv = calculateCV([
      { name: 'CRIT Rate', value: '10' },
      { name: 'CRIT DMG', value: '20' },
    ]);
    expect(cv).toBe(40); // 10*2 + 20
  });

  it('ignores non-crit substats', () => {
    const cv = calculateCV([
      { name: 'ATK%', value: '15' },
      { name: 'CRIT Rate', value: '5' },
    ]);
    expect(cv).toBe(10); // 5*2
  });

  it('handles empty substats', () => {
    expect(calculateCV([])).toBe(0);
  });

  it('skips NaN values', () => {
    const cv = calculateCV([{ name: 'CRIT Rate', value: 'invalid' }]);
    expect(cv).toBe(0);
  });
});

// ── scoreColor ──────────────────────────────────────────────────────

describe('scoreColor', () => {
  it('returns red for scores <= 30', () => {
    expect(scoreColor(20)).toBe('text-red-500');
  });
  it('returns orange for scores 31-50', () => {
    expect(scoreColor(40)).toBe('text-orange-400');
  });
  it('returns yellow for scores 51-70', () => {
    expect(scoreColor(60)).toBe('text-yellow-400');
  });
  it('returns green for scores 71-85', () => {
    expect(scoreColor(80)).toBe('text-green-400');
  });
  it('returns emerald for scores > 85', () => {
    expect(scoreColor(90)).toBe('text-emerald-400');
  });
});

// ── grade ───────────────────────────────────────────────────────────

describe('grade', () => {
  it('maps score ranges to letter grades', () => {
    expect(grade(95)).toBe('S');
    expect(grade(85)).toBe('A+');
    expect(grade(75)).toBe('A');
    expect(grade(65)).toBe('B+');
    expect(grade(55)).toBe('B');
    expect(grade(45)).toBe('C+');
    expect(grade(35)).toBe('C');
    expect(grade(25)).toBe('D');
    expect(grade(10)).toBe('F');
  });
});

// ── barColor ────────────────────────────────────────────────────────

describe('barColor', () => {
  it('returns correct color classes for score ranges', () => {
    expect(barColor(80)).toBe('bg-emerald-500');
    expect(barColor(60)).toBe('bg-yellow-500');
    expect(barColor(40)).toBe('bg-orange-500');
    expect(barColor(10)).toBe('bg-red-500');
  });
});

// ── pieceLabel ──────────────────────────────────────────────────────

describe('pieceLabel', () => {
  it('labels pieces by score threshold', () => {
    expect(pieceLabel(90)).toBe('Cracked');
    expect(pieceLabel(65)).toBe('Solid');
    expect(pieceLabel(45)).toBe('Mid');
    expect(pieceLabel(20)).toBe('Pain');
  });
});
