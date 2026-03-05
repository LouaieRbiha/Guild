// Gacha/wish simulation engine with pity, soft pity, 50/50, and Capturing Radiance

// ── Types ─────────────────────────────────────────────────────────────

export type BannerType = 'character' | 'weapon' | 'standard';

export interface WishResult {
	rarity: 3 | 4 | 5;
	itemType: 'character' | 'weapon';
	name: string;
	isFeatured: boolean;
	pullNumber: number;
	pityCount: number;
	banner: BannerType;
	fiftyFiftyOutcome?: 'won' | 'lost' | 'guaranteed' | 'radiance';
}

export interface BannerPity {
	pity5: number;
	pity4: number;
	guaranteed: boolean;
	capturingRadianceActive: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────

export const BANNER_CONFIG: Record<
	BannerType,
	{
		hardPity: number;
		softPityStart: number;
		softPityIncrease: number;
		label: string;
		description: string;
	}
> = {
	character: {
		hardPity: 90,
		softPityStart: 73,
		softPityIncrease: 0.06,
		label: 'Character Event Wish',
		description: 'Boosted drop rate for the featured 5\u2605 character',
	},
	weapon: {
		hardPity: 80,
		softPityStart: 62,
		softPityIncrease: 0.07,
		label: 'Weapon Event Wish',
		description: 'Boosted drop rate for featured 5\u2605 weapons',
	},
	standard: {
		hardPity: 90,
		softPityStart: 73,
		softPityIncrease: 0.06,
		label: 'Standard Wish',
		description: 'Standard wish pool with no rate-up items',
	},
};

export const BASE_5_RATE = 0.006;
export const BASE_4_RATE = 0.051;
export const GUARANTEED_4_PITY = 10;
export const WISH_COST = 160;
export const STARTING_PRIMOGEMS = 28800;

// ── Rate Calculation ──────────────────────────────────────────────────

export function get5StarRate(pity: number, banner: BannerType): number {
	const config = BANNER_CONFIG[banner];
	if (pity + 1 >= config.hardPity) return 1.0;
	if (pity >= config.softPityStart) {
		const softPulls = pity - config.softPityStart;
		return Math.min(
			BASE_5_RATE + config.softPityIncrease * (softPulls + 1),
			1.0,
		);
	}
	return BASE_5_RATE;
}

// ── Wish Execution ────────────────────────────────────────────────────

export function performSingleWish(
	banner: BannerType,
	pity: BannerPity,
	pullNumber: number,
): { result: WishResult; newPity: BannerPity } {
	const newPity: BannerPity = { ...pity };
	const rate5 = get5StarRate(newPity.pity5, banner);
	const is4Guaranteed = newPity.pity4 >= GUARANTEED_4_PITY - 1;
	const roll = Math.random();

	let rarity: 3 | 4 | 5;
	let itemType: 'character' | 'weapon';
	let name: string;
	let isFeatured = false;
	let fiftyFiftyOutcome: WishResult['fiftyFiftyOutcome'];

	if (roll < rate5) {
		// ── 5-star ──
		rarity = 5;
		const pityHit = newPity.pity5 + 1;
		newPity.pity5 = 0;
		newPity.pity4 = 0;

		if (banner === 'character') {
			itemType = 'character';
			if (newPity.guaranteed) {
				name = 'Featured Character';
				isFeatured = true;
				fiftyFiftyOutcome = 'guaranteed';
				newPity.guaranteed = false;
				newPity.capturingRadianceActive = false;
			} else {
				// 50/50 with Capturing Radiance mechanic
				const baseWinRate = 0.5;
				const radianceChance = newPity.capturingRadianceActive ? 0.1 : 0;
				const totalWinRate = baseWinRate + radianceChance;

				if (Math.random() < totalWinRate) {
					name = 'Featured Character';
					isFeatured = true;
					// Determine if it was radiance or natural win
					if (
						radianceChance > 0 &&
						Math.random() < radianceChance / totalWinRate
					) {
						fiftyFiftyOutcome = 'radiance';
					} else {
						fiftyFiftyOutcome = 'won';
					}
					newPity.guaranteed = false;
					newPity.capturingRadianceActive = false;
				} else {
					name = 'Standard Character';
					isFeatured = false;
					fiftyFiftyOutcome = 'lost';
					newPity.guaranteed = true;
					newPity.capturingRadianceActive = true;
				}
			}
		} else if (banner === 'weapon') {
			itemType = 'weapon';
			if (newPity.guaranteed) {
				name = 'Featured Weapon';
				isFeatured = true;
				fiftyFiftyOutcome = 'guaranteed';
				newPity.guaranteed = false;
			} else if (Math.random() < 0.5) {
				name = 'Featured Weapon';
				isFeatured = true;
				fiftyFiftyOutcome = 'won';
			} else {
				name = 'Standard Weapon';
				isFeatured = false;
				fiftyFiftyOutcome = 'lost';
				newPity.guaranteed = true;
			}
		} else {
			// Standard banner: no rate-up, no 50/50
			if (Math.random() < 0.5) {
				name = 'Standard Character';
				itemType = 'character';
			} else {
				name = 'Standard Weapon';
				itemType = 'weapon';
			}
			isFeatured = false;
			fiftyFiftyOutcome = undefined;
		}

		return {
			result: {
				rarity,
				itemType,
				name,
				isFeatured,
				pullNumber,
				pityCount: pityHit,
				banner,
				fiftyFiftyOutcome,
			},
			newPity,
		};
	}

	if (roll < rate5 + BASE_4_RATE || is4Guaranteed) {
		// ── 4-star ──
		rarity = 4;
		newPity.pity5 += 1;
		newPity.pity4 = 0;

		if (Math.random() < 0.5) {
			name = 'Character';
			itemType = 'character';
		} else {
			name = 'Weapon';
			itemType = 'weapon';
		}
	} else {
		// ── 3-star ──
		rarity = 3;
		newPity.pity5 += 1;
		newPity.pity4 += 1;
		name = 'Weapon';
		itemType = 'weapon';
	}

	return {
		result: {
			rarity,
			itemType,
			name,
			isFeatured: false,
			pullNumber,
			pityCount: rarity === 4 ? pity.pity4 + 1 : 0,
			banner,
			fiftyFiftyOutcome: undefined,
		},
		newPity,
	};
}
