// Artifact domain roller with wiki-accurate weights and roll values

import { YATTA_ASSETS } from '@/lib/constants';

// ── Types ─────────────────────────────────────────────────────────────

export interface ArtifactDomain {
	name: string;
	location: string;
	sets: { name: string; icon: string }[];
}

export interface RolledArtifact {
	set: string;
	slot: string;
	rarity: number;
	mainStat: string;
	substats: { name: string; value: string }[];
}

// ── Domain Data ───────────────────────────────────────────────────────

export const ARTIFACT_DOMAINS: ArtifactDomain[] = [
	{
		name: 'Momiji-Dyed Court',
		location: 'Inazuma',
		sets: [
			{ name: 'Emblem of Severed Fate', icon: 'UI_RelicIcon_15020_4' },
			{ name: "Shimenawa's Reminiscence", icon: 'UI_RelicIcon_15019_4' },
		],
	},
	{
		name: 'Spire of Solitary Enlightenment',
		location: 'Sumeru',
		sets: [
			{ name: 'Deepwood Memories', icon: 'UI_RelicIcon_15025_4' },
			{ name: 'Gilded Dreams', icon: 'UI_RelicIcon_15026_4' },
		],
	},
	{
		name: 'Denouement of Sin',
		location: 'Fontaine',
		sets: [
			{ name: 'Golden Troupe', icon: 'UI_RelicIcon_15031_4' },
			{ name: 'Marechaussee Hunter', icon: 'UI_RelicIcon_15032_4' },
		],
	},
	{
		name: 'Sanctum of Rainbow Spirits',
		location: 'Natlan',
		sets: [
			{ name: 'Obsidian Codex', icon: 'UI_RelicIcon_15035_4' },
			{
				name: 'Scroll of the Hero of Cinder City',
				icon: 'UI_RelicIcon_15036_4',
			},
		],
	},
	{
		name: 'Domain of Guyun',
		location: 'Liyue',
		sets: [
			{ name: 'Archaic Petra', icon: 'UI_RelicIcon_15014_4' },
			{ name: 'Retracing Bolide', icon: 'UI_RelicIcon_15015_4' },
		],
	},
	{
		name: 'Valley of Remembrance',
		location: 'Mondstadt',
		sets: [
			{ name: 'Viridescent Venerer', icon: 'UI_RelicIcon_15002_4' },
			{ name: 'Maiden Beloved', icon: 'UI_RelicIcon_15003_4' },
		],
	},
	{
		name: 'Ridge Watch',
		location: 'Liyue',
		sets: [
			{ name: 'Husk of Opulent Dreams', icon: 'UI_RelicIcon_15021_4' },
			{ name: 'Ocean-Hued Clam', icon: 'UI_RelicIcon_15022_4' },
		],
	},
	{
		name: 'Slumbering Court',
		location: 'Inazuma',
		sets: [
			{ name: 'Vermillion Hereafter', icon: 'UI_RelicIcon_15023_4' },
			{ name: 'Echoes of an Offering', icon: 'UI_RelicIcon_15024_4' },
		],
	},
];

// ── Stat Constants ────────────────────────────────────────────────────

export const MAIN_STATS: Record<string, string[]> = {
	Flower: ['HP'],
	Plume: ['ATK'],
	Sands: ['HP%', 'ATK%', 'DEF%', 'Energy Recharge', 'Elemental Mastery'],
	Goblet: [
		'HP%',
		'ATK%',
		'DEF%',
		'Pyro DMG%',
		'Hydro DMG%',
		'Electro DMG%',
		'Cryo DMG%',
		'Anemo DMG%',
		'Geo DMG%',
		'Dendro DMG%',
	],
	Circlet: ['HP%', 'ATK%', 'DEF%', 'CRIT Rate', 'CRIT DMG', 'Healing Bonus'],
};

export const SUB_STATS = [
	'HP',
	'ATK',
	'DEF',
	'HP%',
	'ATK%',
	'DEF%',
	'Energy Recharge',
	'Elemental Mastery',
	'CRIT Rate',
	'CRIT DMG',
] as const;

export const SLOT_META: Record<string, { label: string; iconSuffix: string }> =
	{
		Flower: { label: 'Flower of Life', iconSuffix: '_4' },
		Plume: { label: 'Plume of Death', iconSuffix: '_2' },
		Sands: { label: 'Sands of Eon', iconSuffix: '_5' },
		Goblet: { label: 'Goblet of Eonothem', iconSuffix: '_1' },
		Circlet: { label: 'Circlet of Logos', iconSuffix: '_3' },
	};

export const MAIN_STAT_VALUES: Record<string, string> = {
	HP: '4,780',
	ATK: '311',
	'HP%': '46.6%',
	'ATK%': '46.6%',
	'DEF%': '58.3%',
	'Energy Recharge': '51.8%',
	'Elemental Mastery': '187',
	'Pyro DMG%': '46.6%',
	'Hydro DMG%': '46.6%',
	'Electro DMG%': '46.6%',
	'Cryo DMG%': '46.6%',
	'Anemo DMG%': '46.6%',
	'Geo DMG%': '46.6%',
	'Dendro DMG%': '46.6%',
	'CRIT Rate': '31.1%',
	'CRIT DMG': '62.2%',
	'Healing Bonus': '35.9%',
};

// Wiki-accurate main stat weighted selection
const MAIN_STAT_WEIGHTS: Record<string, Record<string, number>> = {
	Flower: { HP: 100 },
	Plume: { ATK: 100 },
	Sands: {
		'HP%': 26.68,
		'ATK%': 26.66,
		'DEF%': 26.66,
		'Energy Recharge': 10,
		'Elemental Mastery': 10,
	},
	Goblet: {
		'HP%': 19.25,
		'ATK%': 19.25,
		'DEF%': 19,
		'Pyro DMG%': 5,
		'Hydro DMG%': 5,
		'Electro DMG%': 5,
		'Cryo DMG%': 5,
		'Anemo DMG%': 5,
		'Geo DMG%': 5,
		'Dendro DMG%': 5,
	},
	Circlet: {
		'HP%': 22,
		'ATK%': 22,
		'DEF%': 22,
		'CRIT Rate': 10,
		'CRIT DMG': 10,
		'Healing Bonus': 10,
		'Elemental Mastery': 4,
	},
};

// Wiki-accurate substat weights (crit substats are rarer)
const SUB_STAT_WEIGHTS: Record<string, number> = {
	HP: 6,
	ATK: 6,
	DEF: 6,
	'HP%': 4,
	'ATK%': 4,
	'DEF%': 4,
	'Elemental Mastery': 4,
	'Energy Recharge': 4,
	'CRIT Rate': 3,
	'CRIT DMG': 3,
};

// Wiki-accurate substat roll values (4 tiers per stat)
const SUB_ROLL_VALUES: Record<string, number[]> = {
	HP: [209.13, 239.0, 268.88, 298.75],
	ATK: [13.62, 15.56, 17.51, 19.45],
	DEF: [16.2, 18.52, 20.83, 23.15],
	'HP%': [4.08, 4.66, 5.25, 5.83],
	'ATK%': [4.08, 4.66, 5.25, 5.83],
	'DEF%': [5.1, 5.83, 6.56, 7.29],
	'Elemental Mastery': [16.32, 18.65, 20.98, 23.31],
	'Energy Recharge': [4.53, 5.18, 5.83, 6.48],
	'CRIT Rate': [2.72, 3.11, 3.5, 3.89],
	'CRIT DMG': [5.44, 6.22, 6.99, 7.77],
};

// ── Utility ───────────────────────────────────────────────────────────

/** Weighted random pick from {name: weight} map */
export function weightedPick(weights: Record<string, number>): string {
	const entries = Object.entries(weights);
	const total = entries.reduce((sum, [, w]) => sum + w, 0);
	let r = Math.random() * total;
	for (const [name, w] of entries) {
		r -= w;
		if (r <= 0) return name;
	}
	return entries[entries.length - 1]?.[0] ?? '';
}

// ── Roll Logic ────────────────────────────────────────────────────────

export function rollArtifact(set: string): RolledArtifact {
	const slots = Object.keys(MAIN_STATS);
	const slot = slots[Math.floor(Math.random() * slots.length)];

	const weights = MAIN_STAT_WEIGHTS[slot] || {};
	const main = weightedPick(weights);

	// Remove main stat from substat pool
	const availPool = { ...SUB_STAT_WEIGHTS };
	for (const key of Object.keys(availPool)) {
		if (key === main || main.startsWith(key)) {
			delete availPool[key];
		}
	}

	// 20% chance for 4 starting substats (wiki-accurate)
	const subCount = Math.random() < 0.2 ? 4 : 3;
	const picked: { name: string; value: string }[] = [];
	const currentPool = { ...availPool };

	for (let i = 0; i < subCount; i++) {
		const stat = weightedPick(currentPool);
		if (!stat) break;
		delete currentPool[stat]; // Each substat can only appear once

		const tiers = SUB_ROLL_VALUES[stat];
		if (tiers) {
			// Pick a random roll tier (equal 25% each)
			const rollValue = tiers[Math.floor(Math.random() * 4)];
			const isPercent =
				stat.includes('%') ||
				['CRIT Rate', 'CRIT DMG', 'Energy Recharge'].includes(stat);
			picked.push({
				name: stat,
				value: isPercent
					? `${rollValue.toFixed(1)}%`
					: `${Math.round(rollValue)}`,
			});
		}
	}

	return {
		set,
		slot,
		rarity: Math.random() > 0.15 ? 5 : 4,
		mainStat: main,
		substats: picked,
	};
}

export function getArtifactPieceIcon(
	setName: string,
	slot: string,
): string | null {
	for (const domain of ARTIFACT_DOMAINS) {
		for (const set of domain.sets) {
			if (set.name === setName) {
				const baseIcon = set.icon.replace(/_\d+$/, '');
				const suffix = SLOT_META[slot]?.iconSuffix ?? '_4';
				return `${YATTA_ASSETS}/${baseIcon}${suffix}.png`;
			}
		}
	}
	return null;
}
