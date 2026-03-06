import { CHARACTER_BUILDS } from '@/data/character-builds';

// Roll tiers for 5-star substats (approximately)
export const ROLL_VALUES: Record<string, number[]> = {
	HP: [209, 239, 269, 299],
	ATK: [14, 16, 18, 19],
	DEF: [16, 19, 21, 23],
	'HP%': [4.1, 4.7, 5.3, 5.8],
	'ATK%': [4.1, 4.7, 5.3, 5.8],
	'DEF%': [5.1, 5.8, 6.6, 7.3],
	'CRIT Rate': [2.7, 3.1, 3.5, 3.9],
	'CRIT DMG': [5.4, 6.2, 7.0, 7.8],
	'Energy Recharge': [4.5, 5.2, 5.8, 6.5],
	'Elemental Mastery': [16, 19, 21, 23],
};

export function estimateRollCount(name: string, valueStr: string): number {
	const numVal = parseFloat(valueStr);
	if (isNaN(numVal)) return 0;
	const tiers = ROLL_VALUES[name];
	if (!tiers) return 0;
	const minRoll = tiers[0];
	if (minRoll <= 0) return 0;
	// Estimate number of rolls by dividing total value by average roll value
	const avgRoll = tiers.reduce((a, b) => a + b, 0) / tiers.length;
	return Math.max(1, Math.round(numVal / avgRoll));
}

export function rollQuality(name: string, valueStr: string): 'high' | 'mid' | 'low' {
	const numVal = parseFloat(valueStr);
	if (isNaN(numVal)) return 'low';
	const tiers = ROLL_VALUES[name];
	if (!tiers) return 'low';
	const rolls = estimateRollCount(name, valueStr);
	const maxPossible = tiers[3] * rolls;
	const ratio = numVal / maxPossible;
	if (ratio >= 0.85) return 'high';
	if (ratio >= 0.65) return 'mid';
	return 'low';
}

export const ROLL_QUALITY_COLORS = {
	high: 'text-emerald-400',
	mid: 'text-yellow-400',
	low: 'text-guild-muted',
};

export const TIER_COLORS = [
	{ bg: 'bg-red-500/20', text: 'text-red-400' },
	{ bg: 'bg-amber-500/20', text: 'text-amber-400' },
	{ bg: 'bg-blue-500/20', text: 'text-blue-400' },
	{ bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
];

// Decompose a substat's total value into individual roll tiers
export function decomposeSubstatRolls(name: string, valueStr: string): { tier: number; value: number }[] {
	const numVal = parseFloat(valueStr);
	if (isNaN(numVal)) return [];
	const tiers = ROLL_VALUES[name];
	if (!tiers) return [];
	const numRolls = estimateRollCount(name, valueStr);
	if (numRolls <= 0) return [];

	// Find counts of each tier that sum to numRolls with total closest to actual value
	let bestCounts = [numRolls, 0, 0, 0];
	let bestError = Infinity;
	for (let c3 = numRolls; c3 >= 0; c3--) {
		for (let c2 = numRolls - c3; c2 >= 0; c2--) {
			for (let c1 = numRolls - c3 - c2; c1 >= 0; c1--) {
				const c0 = numRolls - c3 - c2 - c1;
				const total = c0 * tiers[0] + c1 * tiers[1] + c2 * tiers[2] + c3 * tiers[3];
				const error = Math.abs(total - numVal);
				if (error < bestError) {
					bestError = error;
					bestCounts = [c0, c1, c2, c3];
				}
			}
		}
	}

	const rolls: { tier: number; value: number }[] = [];
	for (let t = 3; t >= 0; t--) {
		for (let i = 0; i < bestCounts[t]; i++) {
			rolls.push({ tier: t, value: tiers[t] });
		}
	}
	return rolls;
}

// Get important substats for a character from build data, fallback to CRIT stats
export function getImportantSubs(charName: string): string[] {
	const build = CHARACTER_BUILDS[charName];
	if (build) return build.substats;
	return ['CRIT Rate', 'CRIT DMG'];
}

// Calculate substat efficiency: how close each artifact's substats are to max possible rolls
export function calcSubstatEfficiency(substats: { name: string; value: string }[]): number {
	let totalActual = 0;
	let totalMax = 0;
	for (const sub of substats) {
		const tiers = ROLL_VALUES[sub.name];
		if (!tiers) continue;
		const numVal = parseFloat(sub.value);
		if (isNaN(numVal)) continue;
		const rollCount = estimateRollCount(sub.name, sub.value);
		if (rollCount <= 0) continue;
		totalActual += numVal;
		totalMax += tiers[3] * rollCount;
	}
	return totalMax > 0 ? (totalActual / totalMax) * 100 : 0;
}
