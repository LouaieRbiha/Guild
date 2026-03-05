'use client';

import { WishAnimation } from '@/components/simulator/wish-animation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
	ChevronDown,
	Dices,
	Gem,
	History,
	RotateCcw,
	Sparkles,
	Star,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

// ── Artifact Roller Constants ─────────────────────────────────────────

const YATTA_ASSETS = 'https://gi.yatta.moe/assets/UI';

interface ArtifactDomain {
	name: string;
	location: string;
	sets: { name: string; icon: string }[];
}

const ARTIFACT_DOMAINS: ArtifactDomain[] = [
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

const ARTIFACT_SETS = ARTIFACT_DOMAINS.flatMap((d) =>
	d.sets.map((s) => s.name),
);

const MAIN_STATS: Record<string, string[]> = {
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

const SUB_STATS = [
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
];

const ARTIFACT_QUIPS = [
	'Another day, another trash artifact. Welcome to Genshin.',
	'DEF% sends its regards.',
	'You could farm for a year and not see a good goblet.',
	'Copium levels: critical.',
	'The domain heard you wanted CRIT and chose violence.',
];

// ── Artifact Types & Logic ────────────────────────────────────────────

interface Artifact {
	set: string;
	slot: string;
	rarity: number;
	mainStat: string;
	substats: { name: string; value: string }[];
}

function rollArtifact(set: string): Artifact {
	const slots = Object.keys(MAIN_STATS);
	const slot = slots[Math.floor(Math.random() * slots.length)];

	// Wiki-accurate main stat weighted selection
	const mainStatWeights: Record<string, Record<string, number>> = {
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

	const weights = mainStatWeights[slot] || {};
	const main = weightedPick(weights);

	// Wiki-accurate substat weights (crit substats are rarer)
	const subWeights: Record<string, number> = {
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
	const subRolls: Record<string, number[]> = {
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

	// Remove main stat from substat pool
	const availPool = { ...subWeights };
	// Remove the main stat and any variant (e.g., "CRIT Rate" main blocks "CRIT Rate" sub)
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

		const tiers = subRolls[stat];
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

/** Weighted random pick from {name: weight} map */
function weightedPick(weights: Record<string, number>): string {
	const entries = Object.entries(weights);
	const total = entries.reduce((sum, [, w]) => sum + w, 0);
	let r = Math.random() * total;
	for (const [name, w] of entries) {
		r -= w;
		if (r <= 0) return name;
	}
	return entries[entries.length - 1]?.[0] ?? '';
}

// ── Wish Simulator Constants ──────────────────────────────────────────

// ── Crit Value Calculation ───────────────────────────────────────────

function calculateCV(substats: { name: string; value: string }[]): number {
	let cv = 0;
	for (const sub of substats) {
		const numericValue = parseFloat(sub.value);
		if (Number.isNaN(numericValue)) continue;

		if (sub.name === 'CRIT Rate') {
			cv += numericValue * 2;
		} else if (sub.name === 'CRIT DMG') {
			cv += numericValue;
		}
	}
	return cv;
}

function getCVColorClass(cv: number): string {
	if (cv >= 30) return 'text-green-400';
	if (cv >= 20) return 'text-yellow-400';
	return 'text-guild-dim';
}

const SLOT_META: Record<string, { label: string; iconSuffix: string }> = {
	Flower: { label: 'Flower of Life', iconSuffix: '_4' },
	Plume: { label: 'Plume of Death', iconSuffix: '_2' },
	Sands: { label: 'Sands of Eon', iconSuffix: '_5' },
	Goblet: { label: 'Goblet of Eonothem', iconSuffix: '_1' },
	Circlet: { label: 'Circlet of Logos', iconSuffix: '_3' },
};

const MAIN_STAT_VALUES: Record<string, string> = {
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

function getArtifactPieceIcon(setName: string, slot: string): string | null {
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

function getScoreGrade(cv: number): { grade: string; color: string } {
	if (cv >= 40) return { grade: 'SS', color: 'text-amber-400' };
	if (cv >= 30) return { grade: 'S', color: 'text-green-400' };
	if (cv >= 20) return { grade: 'A', color: 'text-yellow-400' };
	if (cv >= 10) return { grade: 'B', color: 'text-blue-400' };
	return { grade: 'C', color: 'text-guild-dim' };
}

type BannerType = 'character' | 'weapon' | 'standard';

interface WishResult {
	rarity: 3 | 4 | 5;
	itemType: 'character' | 'weapon';
	name: string;
	isFeatured: boolean;
	pullNumber: number;
	pityCount: number;
	banner: BannerType;
	fiftyFiftyOutcome?: 'won' | 'lost' | 'guaranteed' | 'radiance';
}

interface BannerPity {
	pity5: number;
	pity4: number;
	guaranteed: boolean;
	capturingRadianceActive: boolean;
}

const BANNER_CONFIG: Record<
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

const BASE_5_RATE = 0.006;
const BASE_4_RATE = 0.051;
const GUARANTEED_4_PITY = 10;
const WISH_COST = 160;
const STARTING_PRIMOGEMS = 28800;

function get5StarRate(pity: number, banner: BannerType): number {
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

function performSingleWish(
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

// ── Rarity helpers ────────────────────────────────────────────────────

const RARITY_COLORS = {
	text: { 5: 'text-amber-400', 4: 'text-purple-400', 3: 'text-blue-400' },
	bg: {
		5: 'bg-amber-500/10',
		4: 'bg-purple-500/10',
		3: 'bg-blue-500/10',
	},
	border: {
		5: 'border-amber-500/20',
		4: 'border-purple-500/20',
		3: 'border-blue-500/20',
	},
	borderStrong: {
		5: 'border-amber-500/30',
		4: 'border-purple-500/30',
		3: 'border-blue-500/30',
	},
} as const;

function RarityStarsRow({
	count,
	rarity,
	size = 'h-3 w-3',
}: {
	count: number;
	rarity: 3 | 4 | 5;
	size?: string;
}) {
	return (
		<span className='inline-flex gap-0.5'>
			{Array.from({ length: count }, (_, i) => (
				<Star
					key={i}
					className={cn(size, 'fill-current', RARITY_COLORS.text[rarity])}
				/>
			))}
		</span>
	);
}

// ── Main Component ────────────────────────────────────────────────────

export default function SimulatorPage() {
	const [mode, setMode] = useState<'wish' | 'artifact'>('wish');

	// ── Wish Simulator State ──────────────────────────────────────────
	const [bannerType, setBannerType] = useState<BannerType>('character');
	const [pityStates, setPityStates] = useState<Record<BannerType, BannerPity>>({
		character: {
			pity5: 0,
			pity4: 0,
			guaranteed: false,
			capturingRadianceActive: false,
		},
		weapon: {
			pity5: 0,
			pity4: 0,
			guaranteed: false,
			capturingRadianceActive: false,
		},
		standard: {
			pity5: 0,
			pity4: 0,
			guaranteed: false,
			capturingRadianceActive: false,
		},
	});
	const [primogems, setPrimogems] = useState(STARTING_PRIMOGEMS);
	const [wishResults, setWishResults] = useState<WishResult[]>([]);
	const [lastPull, setLastPull] = useState<WishResult[]>([]);
	const [totalWishes, setTotalWishes] = useState(0);
	const [showHistory, setShowHistory] = useState(false);
	const [animState, setAnimState] = useState<'idle' | 'animating'>('idle');

	// ── Artifact Roller State ─────────────────────────────────────────
	const [selectedDomainIdx, setSelectedDomainIdx] = useState(0);
	const [artifacts, setArtifacts] = useState<Artifact[]>([]);
	const [resin, setResin] = useState(0);

	// ── Wish Logic ────────────────────────────────────────────────────
	const doWish = useCallback(
		(count: 1 | 10) => {
			const cost = WISH_COST * count;
			if (primogems < cost) return;

			setPrimogems((p) => p - cost);

			const results: WishResult[] = [];
			let currentPity = { ...pityStates[bannerType] };

			for (let i = 0; i < count; i++) {
				const { result, newPity } = performSingleWish(
					bannerType,
					currentPity,
					totalWishes + i + 1,
				);
				results.push(result);
				currentPity = newPity;
			}

			setPityStates((prev) => ({ ...prev, [bannerType]: currentPity }));
			setLastPull(results);
			setWishResults((prev) => [...[...results].reverse(), ...prev]);
			setTotalWishes((prev) => prev + count);
			setAnimState('animating');
		},
		[bannerType, pityStates, primogems, totalWishes],
	);

	const resetWish = useCallback(() => {
		setPityStates({
			character: {
				pity5: 0,
				pity4: 0,
				guaranteed: false,
				capturingRadianceActive: false,
			},
			weapon: {
				pity5: 0,
				pity4: 0,
				guaranteed: false,
				capturingRadianceActive: false,
			},
			standard: {
				pity5: 0,
				pity4: 0,
				guaranteed: false,
				capturingRadianceActive: false,
			},
		});
		setPrimogems(STARTING_PRIMOGEMS);
		setWishResults([]);
		setLastPull([]);
		setTotalWishes(0);
		setShowHistory(false);
	}, []);

	// ── Wish Statistics ───────────────────────────────────────────────
	const wishStats = useMemo(() => {
		const fiveStars = wishResults.filter((r) => r.rarity === 5);
		const fourStars = wishResults.filter((r) => r.rarity === 4);
		const avgPity =
			fiveStars.length > 0
				? fiveStars.reduce((sum, r) => sum + r.pityCount, 0) / fiveStars.length
				: 0;

		const eventFiveStars = fiveStars.filter(
			(r) => r.banner === 'character' || r.banner === 'weapon',
		);
		const won5050 = eventFiveStars.filter(
			(r) => r.fiftyFiftyOutcome === 'won',
		).length;
		const lost5050 = eventFiveStars.filter(
			(r) => r.fiftyFiftyOutcome === 'lost',
		).length;
		const radianceWins = eventFiveStars.filter(
			(r) => r.fiftyFiftyOutcome === 'radiance',
		).length;

		return {
			total: totalWishes,
			primogemsSpent: totalWishes * WISH_COST,
			fiveStarCount: fiveStars.length,
			fourStarCount: fourStars.length,
			fiveStars,
			avgPity: avgPity.toFixed(1),
			won5050,
			lost5050,
			radianceWins,
		};
	}, [wishResults, totalWishes]);

	// ── Artifact Logic ────────────────────────────────────────────────
	const doArtRoll = useCallback(() => {
		const domain = ARTIFACT_DOMAINS[selectedDomainIdx];
		const randomSet =
			domain.sets[Math.floor(Math.random() * domain.sets.length)];
		setArtifacts((p) => [rollArtifact(randomSet.name), ...p]);
		setResin((p) => p + 20);
	}, [selectedDomainIdx]);

	const resetArtifacts = useCallback(() => {
		setArtifacts([]);
		setResin(0);
	}, []);

	const goodArtCount = useMemo(
		() =>
			artifacts.filter((a) =>
				a.substats.some((s) => s.name === 'CRIT Rate' || s.name === 'CRIT DMG'),
			).length,
		[artifacts],
	);

	const quipIndex = useMemo(
		() => Math.floor(Math.random() * ARTIFACT_QUIPS.length),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[artifacts.length],
	);

	// ── Derived values ────────────────────────────────────────────────
	const currentPity = pityStates[bannerType];
	const currentConfig = BANNER_CONFIG[bannerType];
	const currentRate = get5StarRate(currentPity.pity5, bannerType);
	const inSoftPity = currentPity.pity5 >= currentConfig.softPityStart;
	const isEventBanner = bannerType !== 'standard';

	// ── Render ────────────────────────────────────────────────────────
	return (
		<div className='max-w-6xl mx-auto space-y-6'>
			{/* ═══ Wish Animation Overlay ═══ */}
			{animState === 'animating' && lastPull.length > 0 && (
				<WishAnimation
					results={lastPull}
					onComplete={() => setAnimState('idle')}
				/>
			)}
			{/* ═══ Page Header ═══ */}
			<div className='flex items-center gap-3'>
				<Dices className='h-6 w-6 text-guild-accent' />
				<h1 className='text-2xl font-bold'>Simulator</h1>
			</div>

			{/* ═══ Mode Toggle ═══ */}
			<div className='flex gap-1 p-1 rounded-lg bg-guild-card border border-white/5 w-fit'>
				<button
					onClick={() => setMode('wish')}
					className={cn(
						'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer',
						mode === 'wish'
							? 'bg-guild-accent text-white'
							: 'text-guild-muted hover:text-white hover:bg-white/5',
					)}
				>
					<Sparkles className='h-4 w-4' />
					Wish Simulator
				</button>
				<button
					onClick={() => setMode('artifact')}
					className={cn(
						'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer',
						mode === 'artifact'
							? 'bg-guild-accent text-white'
							: 'text-guild-muted hover:text-white hover:bg-white/5',
					)}
				>
					<Dices className='h-4 w-4' />
					Artifact Roller
				</button>
			</div>

			{/* ═══════════════════════════════════════════════════════════════
           WISH SIMULATOR
         ═══════════════════════════════════════════════════════════════ */}
			{mode === 'wish' && (
				<div className='space-y-5'>
					{/* ── Banner Selection + Primogem Display ── */}
					<Card className='bg-guild-card border-white/5 py-0'>
						<CardContent className='flex flex-wrap items-center gap-4 py-4'>
							<div className='flex gap-1 p-1 rounded-lg bg-guild-elevated'>
								{(['character', 'weapon', 'standard'] as BannerType[]).map(
									(bt) => (
										<button
											key={bt}
											onClick={() => setBannerType(bt)}
											className={cn(
												'px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
												bannerType === bt
													? 'bg-guild-accent text-white'
													: 'text-guild-muted hover:text-white',
											)}
										>
											{BANNER_CONFIG[bt].label}
										</button>
									),
								)}
							</div>

							<div className='sm:ml-auto flex items-center gap-2 flex-wrap'>
								<Gem className='h-4 w-4 text-blue-400' />
								<span className='font-mono text-sm text-guild-gold'>
									{primogems.toLocaleString()}
								</span>
								<span className='text-xs text-guild-dim'>Primogems</span>
								<button
									onClick={() => setPrimogems((p) => p + 1600)}
									className='ml-2 px-2 py-0.5 text-xs rounded bg-guild-accent/20 text-guild-accent hover:bg-guild-accent/30 transition-colors cursor-pointer'
								>
									+1600
								</button>
								<button
									onClick={() => setPrimogems((p) => p + 28800)}
									className='px-2 py-0.5 text-xs rounded bg-guild-gold/20 text-guild-gold hover:bg-guild-gold/30 transition-colors cursor-pointer'
								>
									+180 pulls
								</button>
							</div>
						</CardContent>
					</Card>

					{/* ── Banner Info + Stats (side by side) ── */}
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
						{/* Banner panel */}
						<Card
							className={cn(
								'lg:col-span-2 border-white/5 overflow-hidden py-0',
								bannerType === 'character'
									? 'bg-linear-to-br from-amber-500/5 to-guild-card'
									: bannerType === 'weapon'
										? 'bg-linear-to-br from-purple-500/5 to-guild-card'
										: 'bg-linear-to-br from-blue-500/5 to-guild-card',
							)}
						>
							<CardContent className='space-y-4 py-5'>
								{/* Banner header */}
								<div className='flex items-start justify-between'>
									<div>
										<h2 className='text-lg font-bold'>{currentConfig.label}</h2>
										<p className='text-sm text-guild-muted mt-1'>
											{currentConfig.description}
										</p>
									</div>
									<Badge
										className={cn(
											'text-xs shrink-0',
											isEventBanner
												? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
												: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
										)}
									>
										{isEventBanner ? 'Limited' : 'Permanent'}
									</Badge>
								</div>

								{/* Rate info cards */}
								<div className='grid grid-cols-3 gap-3'>
									<div className='rounded-lg bg-guild-elevated p-3 border border-white/5'>
										<div className='text-[10px] text-guild-dim uppercase tracking-wider'>
											Base 5&#9733; Rate
										</div>
										<div className='text-sm font-mono text-amber-400 mt-1'>
											0.6%
										</div>
									</div>
									<div className='rounded-lg bg-guild-elevated p-3 border border-white/5'>
										<div className='text-[10px] text-guild-dim uppercase tracking-wider'>
											Current Rate
										</div>
										<div
											className={cn(
												'text-sm font-mono mt-1',
												inSoftPity ? 'text-amber-400' : 'text-guild-muted',
											)}
										>
											{(currentRate * 100).toFixed(1)}%
										</div>
									</div>
									<div className='rounded-lg bg-guild-elevated p-3 border border-white/5'>
										<div className='text-[10px] text-guild-dim uppercase tracking-wider'>
											Soft Pity At
										</div>
										<div className='text-sm font-mono text-guild-muted mt-1'>
											{currentConfig.softPityStart + 1}+
										</div>
									</div>
								</div>

								{/* Pull buttons */}
								<div className='flex flex-wrap gap-3'>
									<button
										onClick={() => doWish(1)}
										disabled={primogems < WISH_COST}
										className={cn(
											'h-11 px-6 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer',
											primogems >= WISH_COST
												? 'bg-guild-accent hover:bg-guild-accent/80 text-white guild-glow'
												: 'bg-guild-elevated text-guild-dim cursor-not-allowed',
										)}
									>
										<Sparkles className='h-4 w-4' />
										Wish x1
										<span className='text-xs opacity-70 ml-1'>160</span>
										<Gem className='h-3 w-3 opacity-70' />
									</button>
									<button
										onClick={() => doWish(10)}
										disabled={primogems < WISH_COST * 10}
										className={cn(
											'h-11 px-6 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer',
											primogems >= WISH_COST * 10
												? 'bg-linear-to-r from-guild-accent to-guild-accent-2 hover:opacity-90 text-white guild-glow'
												: 'bg-guild-elevated text-guild-dim cursor-not-allowed',
										)}
									>
										<Sparkles className='h-4 w-4' />
										Wish x10
										<span className='text-xs opacity-70 ml-1'>1,600</span>
										<Gem className='h-3 w-3 opacity-70' />
									</button>
									<button
										onClick={resetWish}
										className='h-11 px-4 rounded-lg bg-guild-elevated hover:bg-white/10 text-sm text-guild-muted flex items-center gap-2 transition-colors cursor-pointer ml-auto'
									>
										<RotateCcw className='h-4 w-4' />
										Reset
									</button>
								</div>
							</CardContent>
						</Card>

						{/* Statistics panel */}
						<Card className='bg-guild-card border-white/5 py-0'>
							<CardContent className='space-y-3 py-5'>
								<h3 className='text-sm font-semibold flex items-center gap-2'>
									<Star className='h-4 w-4 text-guild-gold fill-guild-gold' />
									Statistics
								</h3>

								<div className='space-y-2'>
									<StatRow label='Total Wishes' value={wishStats.total} />
									<StatRow
										label='Primogems Spent'
										value={wishStats.primogemsSpent.toLocaleString()}
										valueClass='text-blue-400'
									/>

									<div className='h-px bg-white/5' />

									<StatRow
										label='5\u2605 Obtained'
										value={wishStats.fiveStarCount}
										labelClass='text-amber-400'
										valueClass='text-amber-400'
									/>
									<StatRow
										label='4\u2605 Obtained'
										value={wishStats.fourStarCount}
										labelClass='text-purple-400'
										valueClass='text-purple-400'
									/>
									<StatRow
										label='Avg 5\u2605 Pity'
										value={
											wishStats.fiveStarCount > 0 ? wishStats.avgPity : '\u2014'
										}
									/>

									<div className='h-px bg-white/5' />

									{/* Pity counter */}
									<StatRow
										label='Current Pity'
										value={`${currentPity.pity5} / ${currentConfig.hardPity}`}
										valueClass={inSoftPity ? 'text-amber-400' : ''}
									/>

									{/* Pity bar */}
									<div className='w-full h-2 rounded-full bg-guild-elevated overflow-hidden'>
										<div
											className={cn(
												'h-full rounded-full transition-all duration-300',
												inSoftPity
													? 'bg-linear-to-r from-amber-500 to-amber-300'
													: 'bg-guild-accent',
											)}
											style={{
												width: `${(currentPity.pity5 / currentConfig.hardPity) * 100}%`,
											}}
										/>
									</div>

									{/* 50/50 status (event banners only) */}
									{isEventBanner && (
										<>
											<StatRow
												label='50/50 Status'
												value={currentPity.guaranteed ? 'Guaranteed' : '50/50'}
												valueClass={
													currentPity.guaranteed
														? 'text-guild-success'
														: 'text-guild-muted'
												}
											/>
											<div className='flex items-center justify-between text-sm'>
												<span className='text-guild-muted'>
													Capturing Radiance
												</span>
												<span
													className={cn(
														'font-medium',
														currentPity.capturingRadianceActive
															? 'text-amber-400'
															: 'text-guild-muted',
													)}
												>
													{currentPity.capturingRadianceActive
														? 'Active'
														: 'Inactive'}
												</span>
											</div>
											{(wishStats.won5050 > 0 ||
												wishStats.lost5050 > 0 ||
												wishStats.radianceWins > 0) && (
												<div className='flex justify-between text-sm'>
													<span className='text-guild-muted'>Won / Lost</span>
													<span className='font-mono text-xs'>
														<span className='text-guild-success'>
															{wishStats.won5050}W
														</span>
														{' / '}
														<span className='text-guild-danger'>
															{wishStats.lost5050}L
														</span>
														{wishStats.radianceWins > 0 && (
															<>
																{' / '}
																<span className='text-amber-400'>
																	{wishStats.radianceWins}R
																</span>
															</>
														)}
													</span>
												</div>
											)}
										</>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* ── Latest Pull Results ── */}
					{lastPull.length > 0 && (
						<Card className='bg-guild-card border-white/5 py-0'>
							<CardContent className='space-y-3 py-5'>
								<h3 className='text-sm font-semibold flex items-center gap-2'>
									<Sparkles className='h-4 w-4 text-guild-accent' />
									Latest Results
								</h3>
								<div className='flex flex-wrap gap-2'>
									{lastPull.map((r, i) => (
										<div
											key={i}
											className={cn(
												'rounded-lg p-3 border text-center min-w-[100px] transition-all',
												RARITY_COLORS.bg[r.rarity],
												RARITY_COLORS.border[r.rarity],
												r.rarity === 5 && 'gold-glow',
											)}
										>
											<div className='flex justify-center mb-1'>
												<RarityStarsRow count={r.rarity} rarity={r.rarity} />
											</div>
											<div
												className={cn(
													'text-xs font-medium',
													RARITY_COLORS.text[r.rarity],
												)}
											>
												{r.name}
												{r.rarity === 5 && r.isFeatured && '!'}
											</div>
											{r.rarity === 5 && (
												<div className='text-[10px] text-guild-dim mt-1'>
													Pity: {r.pityCount}
												</div>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* ── Pull History ── */}
					{wishResults.length > 0 && (
						<Card className='bg-guild-card border-white/5 py-0'>
							<CardContent className='space-y-3 py-5'>
								<button
									onClick={() => setShowHistory((h) => !h)}
									className='w-full flex items-center justify-between text-sm font-semibold cursor-pointer'
								>
									<span className='flex items-center gap-2'>
										<History className='h-4 w-4 text-guild-muted' />
										Pull History ({wishResults.length} total)
									</span>
									<ChevronDown
										className={cn(
											'h-4 w-4 text-guild-muted transition-transform',
											showHistory && 'rotate-180',
										)}
									/>
								</button>

								{showHistory && (
									<>
										{/* Compact grid of last 30 */}
										<div className='flex flex-wrap gap-1.5'>
											{wishResults.slice(0, 30).map((r, i) => (
												<div
													key={i}
													className={cn(
														'w-8 h-8 rounded border flex items-center justify-center text-[10px] font-mono shrink-0',
														RARITY_COLORS.bg[r.rarity],
														RARITY_COLORS.borderStrong[r.rarity],
														RARITY_COLORS.text[r.rarity],
													)}
													title={`#${r.pullNumber}: ${r.name} (${r.rarity}\u2605)`}
												>
													{r.rarity}\u2605
												</div>
											))}
										</div>

										{/* 5-star log */}
										{wishStats.fiveStarCount > 0 && (
											<div className='space-y-1.5 pt-2'>
												<div className='text-xs text-guild-dim font-medium uppercase tracking-wider'>
													5&#9733; Log
												</div>
												<div className='flex flex-wrap gap-2'>
													{wishStats.fiveStars.map((r, i) => (
														<Badge
															key={i}
															className='bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs'
														>
															#{r.pullNumber} &ndash; {r.name} (Pity{' '}
															{r.pityCount})
														</Badge>
													))}
												</div>
											</div>
										)}
									</>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{/* ═══════════════════════════════════════════════════════════════
           ARTIFACT ROLLER
         ═══════════════════════════════════════════════════════════════ */}
			{mode === 'artifact' && (
				<div className='space-y-5'>
					{/* ── Domain Grid Selector ── */}
					<div>
						<h3 className='text-sm font-semibold mb-3 flex items-center gap-2'>
							<Dices className='h-4 w-4 text-guild-accent' />
							Select Domain
						</h3>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
							{ARTIFACT_DOMAINS.map((domain, idx) => (
								<button
									key={domain.name}
									onClick={() => setSelectedDomainIdx(idx)}
									className={cn(
										'rounded-lg p-3 border text-left transition-all cursor-pointer',
										selectedDomainIdx === idx
											? 'bg-guild-accent/10 border-guild-accent ring-1 ring-guild-accent/30'
											: 'bg-guild-card border-white/5 hover:border-white/20',
									)}
								>
									<div className='font-medium text-sm'>{domain.name}</div>
									<div className='text-[11px] text-guild-muted mb-2'>
										{domain.location}
									</div>
									<div className='flex items-center gap-2'>
										{domain.sets.map((set) => (
											<div key={set.name} className='flex items-center gap-1.5'>
												<Image
													src={`${YATTA_ASSETS}/${set.icon}.png`}
													alt={set.name}
													width={32}
													height={32}
													className='rounded'
													unoptimized
												/>
												<span className='text-[10px] text-guild-dim leading-tight max-w-[70px] truncate'>
													{set.name}
												</span>
											</div>
										))}
									</div>
								</button>
							))}
						</div>
					</div>

					{/* ── Roll Controls + Stats ── */}
					<Card className='bg-guild-card border-white/5 py-0'>
						<CardContent className='flex flex-wrap items-center gap-4 py-4'>
							<button
								onClick={doArtRoll}
								className='h-10 px-6 rounded-lg bg-guild-accent hover:bg-guild-accent/80 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer guild-glow'
							>
								<Dices className='h-4 w-4' /> Roll (20 Resin)
							</button>
							<button
								onClick={resetArtifacts}
								className='h-10 px-4 rounded-lg bg-guild-elevated hover:bg-white/10 text-sm flex items-center gap-2 transition-colors cursor-pointer'
							>
								<RotateCcw className='h-4 w-4' /> Reset
							</button>
							<div className='ml-auto flex gap-6 text-sm'>
								<span className='text-guild-muted'>
									Resin:{' '}
									<span className='font-mono text-guild-gold'>{resin}</span>
								</span>
								<span className='text-guild-muted'>
									Rolled: <span className='font-mono'>{artifacts.length}</span>
								</span>
								<span className='text-guild-muted'>
									Good:{' '}
									<span className='font-mono text-guild-success'>
										{goodArtCount} (
										{artifacts.length
											? ((goodArtCount / artifacts.length) * 100).toFixed(1)
											: 0}
										%)
									</span>
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Quip */}
					{artifacts.length > 0 && artifacts.length % 5 === 0 && (
						<Card className='bg-guild-card border-orange-500/20 py-0'>
							<CardContent className='py-4'>
								<p className='text-sm italic text-orange-400'>
									&quot;{ARTIFACT_QUIPS[quipIndex]}&quot;
								</p>
							</CardContent>
						</Card>
					)}

					{/* ── Artifact Grid ── */}
					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'>
						{artifacts.slice(0, 20).map((a, i) => {
							const cv = calculateCV(a.substats);
							const cvColor = getCVColorClass(cv);
							const pieceIcon = getArtifactPieceIcon(a.set, a.slot);
							const grade = getScoreGrade(cv);
							return (
								<Card
									key={i}
									className={cn(
										'bg-guild-card py-0',
										a.rarity === 5
											? 'border-amber-500/20'
											: 'border-purple-500/20',
									)}
								>
									<CardContent className='space-y-2 p-3'>
										{/* Header: piece icon + type + rarity */}
										<div className='flex items-center gap-2'>
											{pieceIcon && (
												<Image
													src={pieceIcon}
													alt={SLOT_META[a.slot]?.label ?? a.slot}
													width={36}
													height={36}
													className='rounded shrink-0'
													unoptimized
												/>
											)}
											<div className='flex-1 min-w-0'>
												<div className='text-xs font-medium truncate'>
													{SLOT_META[a.slot]?.label ?? a.slot}
												</div>
												<span
													className={cn(
														'text-[10px]',
														a.rarity === 5
															? 'text-amber-400'
															: 'text-purple-400',
													)}
												>
													{'\u2605'.repeat(a.rarity)}
												</span>
											</div>
										</div>

										{/* Main stat */}
										<div className='flex items-center justify-between bg-guild-elevated rounded px-2 py-1'>
											<span className='text-xs font-medium text-guild-gold'>
												{a.mainStat}
											</span>
											<span className='text-xs font-mono text-guild-gold'>
												{MAIN_STAT_VALUES[a.mainStat] ?? ''}
											</span>
										</div>

										{/* Substats */}
										<div className='space-y-0.5'>
											{a.substats.map((s) => (
												<div
													key={s.name}
													className={cn(
														'text-[10px] flex justify-between',
														s.name === 'CRIT Rate' || s.name === 'CRIT DMG'
															? 'text-white/80'
															: 'text-guild-muted',
													)}
												>
													<span>{s.name}</span>
													<span className='font-mono'>{s.value}</span>
												</div>
											))}
										</div>

										{/* Set name + CV + grade */}
										<div className='flex items-center justify-between pt-1 border-t border-white/5'>
											<span className='text-[9px] text-guild-dim truncate mr-2'>
												{a.set}
											</span>
											<div className='flex items-center gap-1.5 shrink-0'>
												{cv > 0 && (
													<span
														className={cn(
															'text-[10px] font-mono font-medium',
															cvColor,
														)}
														title='Crit Value = (CRIT Rate x 2) + CRIT DMG'
													>
														CV {cv.toFixed(1)}
													</span>
												)}
												<span
													className={cn(
														'text-[10px] font-mono font-bold',
														grade.color,
													)}
												>
													{grade.grade}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>

					{artifacts.length > 20 && (
						<p className='text-sm text-guild-muted text-center'>
							Showing last 20 of {artifacts.length}
						</p>
					)}
				</div>
			)}
		</div>
	);
}

// ── Stat Row helper ───────────────────────────────────────────────────

function StatRow({
	label,
	value,
	labelClass,
	valueClass,
}: {
	label: string;
	value: string | number;
	labelClass?: string;
	valueClass?: string;
}) {
	return (
		<div className='flex justify-between text-sm'>
			<span className={cn('text-guild-muted', labelClass)}>{label}</span>
			<span className={cn('font-mono', valueClass)}>{value}</span>
		</div>
	);
}
