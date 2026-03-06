// Gacha/wish simulation engine — wiki-accurate rates, pity, 50/50, Epitomized Path
// Sources: Game8 wiki, paimon.moe, community statistical analysis

import { ALL_CHARACTERS, charIconUrl, charGachaUrl } from '@/lib/characters';
import type { CharacterEntry } from '@/lib/characters';
import { ALL_WEAPONS } from '@/lib/weapons';
import type { WeaponEntry } from '@/lib/weapons';
import { weaponIconUrl } from '@/lib/constants';
import { getActiveBanner } from '@/data/banners';

// ── Types ─────────────────────────────────────────────────────────────

export type BannerType = 'character' | 'weapon' | 'standard';

export interface WishResult {
	rarity: 3 | 4 | 5;
	itemType: 'character' | 'weapon';
	name: string;
	icon: string;        // URL to icon image
	splash: string;      // URL to gacha/splash art (characters) or icon (weapons)
	isFeatured: boolean;
	pullNumber: number;
	pityCount: number;
	banner: BannerType;
	fiftyFiftyOutcome?: 'won' | 'lost' | 'guaranteed' | 'radiance';
}

export interface BannerPity {
	pity5: number;
	pity4: number;
	guaranteed5: boolean;       // next 5★ is guaranteed featured
	guaranteed4: boolean;       // next 4★ is guaranteed rate-up
	capturingRadianceActive: boolean;
	fatePoints: number;         // weapon banner epitomized path (0-2)
	epitomizedTarget: number;   // index of targeted weapon (0 or 1)
}

// ── Constants ─────────────────────────────────────────────────────────

export const BANNER_CONFIG: Record<
	BannerType,
	{
		hardPity: number;
		softPityStart: number;
		softPityIncrease: number;
		base5Rate: number;
		label: string;
		description: string;
	}
> = {
	character: {
		hardPity: 90,
		softPityStart: 73,
		softPityIncrease: 0.06,
		base5Rate: 0.006,
		label: 'Character Event Wish',
		description: 'Boosted drop rate for the featured 5★ character',
	},
	weapon: {
		hardPity: 80,
		softPityStart: 62,
		softPityIncrease: 0.07,
		base5Rate: 0.007,
		label: 'Weapon Event Wish',
		description: 'Boosted drop rate for featured 5★ weapons',
	},
	standard: {
		hardPity: 90,
		softPityStart: 73,
		softPityIncrease: 0.06,
		base5Rate: 0.006,
		label: 'Standard Wish',
		description: 'Standard wish pool with no rate-up items',
	},
};

export const BASE_4_RATE = 0.051;
export const GUARANTEED_4_PITY = 10;
export const WISH_COST = 160;
export const STARTING_PRIMOGEMS = 28800;

// ── Item Pools ────────────────────────────────────────────────────────

// Standard 5★ characters (lose 50/50 pool)
const STANDARD_5_STAR_NAMES = [
	'Jean', 'Diluc', 'Qiqi', 'Mona', 'Keqing', 'Tighnari', 'Dehya',
];

// Standard 5★ weapons
const STANDARD_5_STAR_WEAPON_NAMES = [
	"Amos' Bow", 'Skyward Harp', 'Skyward Atlas', 'Lost Prayer to the Sacred Winds',
	'Skyward Pride', "Wolf's Gravestone", 'Skyward Blade', 'Aquila Favonia',
	'Skyward Spine', 'Primordial Jade Winged-Spear',
];

// 3★ weapons (gacha pool)
const THREE_STAR_WEAPON_NAMES = [
	'Cool Steel', 'Harbinger of Dawn', "Traveler's Handy Sword", 'Skyrider Sword',
	'Dark Iron Sword', 'Fillet Blade', 'White Iron Greatsword', 'Debate Club',
	'Bloodtainted Greatsword', 'Ferrous Shadow', 'Skyrider Greatsword',
	'White Tassel', 'Halberd', 'Black Tassel',
	'Slingshot', "Sharpshooter's Oath", 'Raven Bow', 'Recurve Bow',
	'Magic Guide', 'Thrilling Tales of Dragon Slayers', 'Otherworldly Story',
	'Emerald Orb', 'Twin Nephrite',
];

// Characters excluded from standard 4★ pool (traveler, limited events, etc.)
const EXCLUDED_4_STAR_CHARS = new Set(['Traveler']);

// ── Pool Builders ─────────────────────────────────────────────────────

function getStandard5StarChars(): CharacterEntry[] {
	return ALL_CHARACTERS.filter(c => STANDARD_5_STAR_NAMES.includes(c.name));
}

function getStandard5StarWeapons(): WeaponEntry[] {
	return ALL_WEAPONS.filter(w => STANDARD_5_STAR_WEAPON_NAMES.includes(w.name) && w.rarity === 5);
}

function get3StarWeapons(): WeaponEntry[] {
	return ALL_WEAPONS.filter(w => THREE_STAR_WEAPON_NAMES.includes(w.name) && w.rarity === 3);
}

function getStandard4StarChars(): CharacterEntry[] {
	return ALL_CHARACTERS.filter(c => c.rarity === 4 && !EXCLUDED_4_STAR_CHARS.has(c.name));
}

function getStandard4StarWeapons(): WeaponEntry[] {
	return ALL_WEAPONS.filter(w => w.rarity === 4);
}

// ── Banner Data Access ────────────────────────────────────────────────

export interface ResolvedBanner {
	featured5Chars: CharacterEntry[];
	featured4Chars: CharacterEntry[];
	featured5Weapons: WeaponEntry[];
	featured4Weapons: WeaponEntry[];
}

export function getResolvedBanner(): ResolvedBanner {
	const banner = getActiveBanner();
	const result: ResolvedBanner = {
		featured5Chars: [],
		featured4Chars: [],
		featured5Weapons: [],
		featured4Weapons: [],
	};

	if (!banner) return result;

	for (const name of banner.characters.featured5) {
		const char = ALL_CHARACTERS.find(c => c.name === name);
		if (char) result.featured5Chars.push(char);
	}
	for (const name of banner.characters.featured4) {
		const char = ALL_CHARACTERS.find(c => c.name === name);
		if (char) result.featured4Chars.push(char);
	}
	for (const name of banner.weapons.featured5) {
		const wpn = ALL_WEAPONS.find(w => w.name === name);
		if (wpn) result.featured5Weapons.push(wpn);
	}
	for (const name of banner.weapons.featured4) {
		const wpn = ALL_WEAPONS.find(w => w.name === name);
		if (wpn) result.featured4Weapons.push(wpn);
	}

	return result;
}

// ── Helpers ───────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function charToResult(char: CharacterEntry): { name: string; icon: string; splash: string } {
	return {
		name: char.name,
		icon: charIconUrl(char.id),
		splash: charGachaUrl(char.id),
	};
}

function weaponToResult(wpn: WeaponEntry): { name: string; icon: string; splash: string } {
	return {
		name: wpn.name,
		icon: weaponIconUrl(wpn.id),
		splash: weaponIconUrl(wpn.id), // weapons use icon as splash
	};
}

// ── Rate Calculation ──────────────────────────────────────────────────

export function get5StarRate(pity: number, banner: BannerType): number {
	const config = BANNER_CONFIG[banner];
	if (pity + 1 >= config.hardPity) return 1.0;
	if (pity >= config.softPityStart) {
		const softPulls = pity - config.softPityStart;
		return Math.min(
			config.base5Rate + config.softPityIncrease * (softPulls + 1),
			1.0,
		);
	}
	return config.base5Rate;
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

	const resolved = getResolvedBanner();

	let rarity: 3 | 4 | 5;
	let itemType: 'character' | 'weapon';
	let name: string;
	let icon: string;
	let splash: string;
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
			if (newPity.guaranteed5) {
				// Guaranteed featured
				const char = resolved.featured5Chars.length > 0
					? pickRandom(resolved.featured5Chars)
					: null;
				const info = char ? charToResult(char) : { name: 'Featured Character', icon: '', splash: '' };
				name = info.name; icon = info.icon; splash = info.splash;
				isFeatured = true;
				fiftyFiftyOutcome = 'guaranteed';
				newPity.guaranteed5 = false;
				newPity.capturingRadianceActive = false;
			} else {
				// 50/50 with Capturing Radiance
				const baseWinRate = 0.5;
				const radianceChance = newPity.capturingRadianceActive ? 0.1 : 0;
				const totalWinRate = baseWinRate + radianceChance;

				if (Math.random() < totalWinRate) {
					// Won 50/50
					const char = resolved.featured5Chars.length > 0
						? pickRandom(resolved.featured5Chars)
						: null;
					const info = char ? charToResult(char) : { name: 'Featured Character', icon: '', splash: '' };
					name = info.name; icon = info.icon; splash = info.splash;
					isFeatured = true;
					fiftyFiftyOutcome = radianceChance > 0 && Math.random() < radianceChance / totalWinRate
						? 'radiance' : 'won';
					newPity.guaranteed5 = false;
					newPity.capturingRadianceActive = false;
				} else {
					// Lost 50/50 — standard 5★ character
					const stdChars = getStandard5StarChars();
					const char = stdChars.length > 0 ? pickRandom(stdChars) : null;
					const info = char ? charToResult(char) : { name: 'Standard Character', icon: '', splash: '' };
					name = info.name; icon = info.icon; splash = info.splash;
					isFeatured = false;
					fiftyFiftyOutcome = 'lost';
					newPity.guaranteed5 = true;
					newPity.capturingRadianceActive = true;
				}
			}
		} else if (banner === 'weapon') {
			itemType = 'weapon';

			// Weapon banner: 75/25 split (75% featured, 25% standard)
			// + Epitomized Path (fate points)
			if (newPity.fatePoints >= 2) {
				// Guaranteed epitomized target
				const targetIdx = newPity.epitomizedTarget;
				const wpn = resolved.featured5Weapons[targetIdx] || resolved.featured5Weapons[0];
				if (wpn) {
					const info = weaponToResult(wpn);
					name = info.name; icon = info.icon; splash = info.splash;
				} else {
					name = 'Featured Weapon'; icon = ''; splash = '';
				}
				isFeatured = true;
				fiftyFiftyOutcome = 'guaranteed';
				newPity.fatePoints = 0;
				newPity.guaranteed5 = false;
			} else if (newPity.guaranteed5) {
				// Guaranteed one of the two featured weapons
				const wpn = resolved.featured5Weapons.length > 0
					? pickRandom(resolved.featured5Weapons) : null;
				if (wpn) {
					const info = weaponToResult(wpn);
					name = info.name; icon = info.icon; splash = info.splash;
					// Check if it's the epitomized target
					const isTarget = resolved.featured5Weapons.indexOf(wpn) === newPity.epitomizedTarget;
					if (isTarget) {
						newPity.fatePoints = 0;
					} else {
						newPity.fatePoints += 1;
					}
				} else {
					name = 'Featured Weapon'; icon = ''; splash = '';
				}
				isFeatured = true;
				fiftyFiftyOutcome = 'guaranteed';
				newPity.guaranteed5 = false;
			} else if (Math.random() < 0.75) {
				// Won 75/25 — one of the two featured weapons
				const wpn = resolved.featured5Weapons.length > 0
					? pickRandom(resolved.featured5Weapons) : null;
				if (wpn) {
					const info = weaponToResult(wpn);
					name = info.name; icon = info.icon; splash = info.splash;
					const isTarget = resolved.featured5Weapons.indexOf(wpn) === newPity.epitomizedTarget;
					if (isTarget) {
						newPity.fatePoints = 0;
					} else {
						newPity.fatePoints += 1;
					}
				} else {
					name = 'Featured Weapon'; icon = ''; splash = '';
				}
				isFeatured = true;
				fiftyFiftyOutcome = 'won';
			} else {
				// Lost 75/25 — standard 5★ weapon
				const stdWpns = getStandard5StarWeapons();
				const wpn = stdWpns.length > 0 ? pickRandom(stdWpns) : null;
				if (wpn) {
					const info = weaponToResult(wpn);
					name = info.name; icon = info.icon; splash = info.splash;
				} else {
					name = 'Standard Weapon'; icon = ''; splash = '';
				}
				isFeatured = false;
				fiftyFiftyOutcome = 'lost';
				newPity.guaranteed5 = true;
				newPity.fatePoints += 1;
			}
		} else {
			// Standard banner: 50/50 character vs weapon
			if (Math.random() < 0.5) {
				const stdChars = getStandard5StarChars();
				const char = stdChars.length > 0 ? pickRandom(stdChars) : null;
				const info = char ? charToResult(char) : { name: 'Standard Character', icon: '', splash: '' };
				name = info.name; icon = info.icon; splash = info.splash;
				itemType = 'character';
			} else {
				const stdWpns = getStandard5StarWeapons();
				const wpn = stdWpns.length > 0 ? pickRandom(stdWpns) : null;
				const info = wpn ? weaponToResult(wpn) : { name: 'Standard Weapon', icon: '', splash: '' };
				name = info.name; icon = info.icon; splash = info.splash;
				itemType = 'weapon';
			}
			isFeatured = false;
			fiftyFiftyOutcome = undefined;
		}

		return {
			result: {
				rarity, itemType, name, icon, splash, isFeatured,
				pullNumber, pityCount: pityHit, banner, fiftyFiftyOutcome,
			},
			newPity,
		};
	}

	if (roll < rate5 + BASE_4_RATE || is4Guaranteed) {
		// ── 4-star ──
		rarity = 4;
		newPity.pity5 += 1;
		newPity.pity4 = 0;

		if (banner === 'character') {
			// 50/50 for rate-up 4★ characters
			if (newPity.guaranteed4 || Math.random() < 0.5) {
				// Rate-up 4★ character
				if (resolved.featured4Chars.length > 0) {
					const char = pickRandom(resolved.featured4Chars);
					const info = charToResult(char);
					name = info.name; icon = info.icon; splash = info.splash;
					itemType = 'character';
					isFeatured = true;
				} else {
					const stdChars = getStandard4StarChars();
					const char = pickRandom(stdChars);
					const info = charToResult(char);
					name = info.name; icon = info.icon; splash = info.splash;
					itemType = 'character';
				}
				newPity.guaranteed4 = false;
			} else {
				// Off-banner 4★ (character or weapon, roughly equal)
				if (Math.random() < 0.5) {
					const stdChars = getStandard4StarChars();
					const char = pickRandom(stdChars);
					const info = charToResult(char);
					name = info.name; icon = info.icon; splash = info.splash;
					itemType = 'character';
				} else {
					const stdWpns = getStandard4StarWeapons();
					const wpn = pickRandom(stdWpns);
					const info = weaponToResult(wpn);
					name = info.name; icon = info.icon; splash = info.splash;
					itemType = 'weapon';
				}
				newPity.guaranteed4 = true;
			}
		} else if (banner === 'weapon') {
			// Weapon banner 4★: 75/25 for rate-up weapons
			if (newPity.guaranteed4 || Math.random() < 0.75) {
				if (resolved.featured4Weapons.length > 0) {
					const wpn = pickRandom(resolved.featured4Weapons);
					const info = weaponToResult(wpn);
					name = info.name; icon = info.icon; splash = info.splash;
					itemType = 'weapon';
					isFeatured = true;
				} else {
					const stdWpns = getStandard4StarWeapons();
					const wpn = pickRandom(stdWpns);
					const info = weaponToResult(wpn);
					name = info.name; icon = info.icon; splash = info.splash;
					itemType = 'weapon';
				}
				newPity.guaranteed4 = false;
			} else {
				// Off-banner 4★
				if (Math.random() < 0.5) {
					const stdChars = getStandard4StarChars();
					const char = pickRandom(stdChars);
					const info = charToResult(char);
					name = info.name; icon = info.icon; splash = info.splash;
					itemType = 'character';
				} else {
					const stdWpns = getStandard4StarWeapons();
					const wpn = pickRandom(stdWpns);
					const info = weaponToResult(wpn);
					name = info.name; icon = info.icon; splash = info.splash;
					itemType = 'weapon';
				}
				newPity.guaranteed4 = true;
			}
		} else {
			// Standard banner 4★: equal split
			if (Math.random() < 0.5) {
				const stdChars = getStandard4StarChars();
				const char = pickRandom(stdChars);
				const info = charToResult(char);
				name = info.name; icon = info.icon; splash = info.splash;
				itemType = 'character';
			} else {
				const stdWpns = getStandard4StarWeapons();
				const wpn = pickRandom(stdWpns);
				const info = weaponToResult(wpn);
				name = info.name; icon = info.icon; splash = info.splash;
				itemType = 'weapon';
			}
		}
	} else {
		// ── 3-star ──
		rarity = 3;
		newPity.pity5 += 1;
		newPity.pity4 += 1;
		itemType = 'weapon';

		const threeStars = get3StarWeapons();
		const wpn = threeStars.length > 0 ? pickRandom(threeStars) : null;
		if (wpn) {
			const info = weaponToResult(wpn);
			name = info.name; icon = info.icon; splash = info.splash;
		} else {
			name = '3★ Weapon'; icon = ''; splash = '';
		}
	}

	return {
		result: {
			rarity, itemType, name, icon, splash,
			isFeatured: isFeatured || false,
			pullNumber,
			pityCount: rarity === 4 ? pity.pity4 + 1 : 0,
			banner,
			fiftyFiftyOutcome: undefined,
		},
		newPity,
	};
}
