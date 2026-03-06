import type { Metadata } from 'next';
import type { BannerHistoryEntry } from '@/app/api/banners/history/route';
import { ALL_CHARACTERS } from '@/lib/characters';
import type { CharacterEntry, WeaponEntry } from '@/types';
import { ALL_WEAPONS } from '@/lib/weapons';
import { BannerHistoryClient, type ResolvedVersionGroup } from './banner-history-client';

export const metadata: Metadata = {
	title: 'Banner History - Guild',
	description: 'Complete Genshin Impact wish banner history from v1.0 to present. Browse all character and weapon event banners with featured 5-star and 4-star items.',
};

// ── ID Mapping ──────────────────────────────────────────────────────

const charByNormalizedName = new Map<string, CharacterEntry>();
for (const c of ALL_CHARACTERS) {
	charByNormalizedName.set(c.name.toLowerCase().replace(/[^a-z0-9]/g, ''), c);
}

const weaponByNormalizedName = new Map<string, WeaponEntry>();
for (const w of ALL_WEAPONS) {
	weaponByNormalizedName.set(w.name.toLowerCase().replace(/[^a-z0-9]/g, ''), w);
}

const CHAR_ID_OVERRIDES: Record<string, string> = {
	hu_tao: 'hutao',
	raiden_shogun: 'raidenshogun',
	kamisato_ayaka: 'kamisatoayaka',
	kamisato_ayato: 'kamisatoayato',
	kaedehara_kazuha: 'kaedeharakazuha',
	arataki_itto: 'aratakiitto',
	yae_miko: 'yaemiko',
	shikanoin_heizou: 'shikanoinheizou',
	sangonomiya_kokomi: 'sangonomiyakokomi',
	kuki_shinobu: 'kukishinobu',
	yun_jin: 'yunjin',
};

function snakeToNormalized(snakeId: string): string {
	if (CHAR_ID_OVERRIDES[snakeId]) return CHAR_ID_OVERRIDES[snakeId];
	return snakeId.replace(/[_-]/g, '');
}

function resolveCharacter(snakeId: string): CharacterEntry | undefined {
	return charByNormalizedName.get(snakeToNormalized(snakeId));
}

function resolveWeapon(snakeId: string): WeaponEntry | undefined {
	return weaponByNormalizedName.get(snakeToNormalized(snakeId));
}

// ── Serializable types for client ───────────────────────────────────

interface ResolvedChar {
	id: string;
	name: string;
	element: string;
	rarity: number;
}

interface ResolvedWeapon {
	id: number;
	name: string;
	rarity: number;
	type: string;
}

interface ResolvedPhase {
	start: string;
	end: string;
	characters: {
		banner: BannerHistoryEntry;
		featured5: ResolvedChar[];
		featured4: ResolvedChar[];
	} | null;
	weapons: {
		banner: BannerHistoryEntry;
		featured5: ResolvedWeapon[];
		featured4: ResolvedWeapon[];
	} | null;
}

// ── Data Fetching ───────────────────────────────────────────────────

async function fetchBannerHistory(): Promise<{ characters: BannerHistoryEntry[]; weapons: BannerHistoryEntry[] }> {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
		? `https://${process.env.VERCEL_URL}`
		: 'http://localhost:3000';

	try {
		const res = await fetch(`${baseUrl}/api/banners/history`, {
			next: { revalidate: 3600 },
		});
		if (!res.ok) return { characters: [], weapons: [] };
		return res.json();
	} catch {
		return { characters: [], weapons: [] };
	}
}

function groupAndResolve(
	characters: BannerHistoryEntry[],
	weapons: BannerHistoryEntry[],
): ResolvedVersionGroup[] {
	const weaponsByStart = new Map<string, BannerHistoryEntry>();
	for (const w of weapons) {
		weaponsByStart.set(w.start, w);
	}

	const versionMap = new Map<string, Map<string, ResolvedPhase>>();

	for (const c of characters) {
		if (!versionMap.has(c.version)) versionMap.set(c.version, new Map());
		const phases = versionMap.get(c.version)!;
		if (!phases.has(c.start)) {
			const f5 = c.featured.map(resolveCharacter).filter(Boolean) as CharacterEntry[];
			const f4 = c.featuredRare.map(resolveCharacter).filter(Boolean) as CharacterEntry[];
			const wBanner = weaponsByStart.get(c.start);
			let weaponData = null;
			if (wBanner) {
				const wf5 = wBanner.featured.map(resolveWeapon).filter(Boolean) as WeaponEntry[];
				const wf4 = wBanner.featuredRare.map(resolveWeapon).filter(Boolean) as WeaponEntry[];
				weaponData = {
					banner: wBanner,
					featured5: wf5.map(w => ({ id: w.id, name: w.name, rarity: w.rarity, type: w.type })),
					featured4: wf4.map(w => ({ id: w.id, name: w.name, rarity: w.rarity, type: w.type })),
				};
			}
			phases.set(c.start, {
				start: c.start,
				end: c.end,
				characters: {
					banner: c,
					featured5: f5.map(ch => ({ id: ch.id, name: ch.name, element: ch.element, rarity: ch.rarity })),
					featured4: f4.map(ch => ({ id: ch.id, name: ch.name, element: ch.element, rarity: ch.rarity })),
				},
				weapons: weaponData,
			});
		}
	}

	// Weapon-only banners
	for (const w of weapons) {
		if (!versionMap.has(w.version)) versionMap.set(w.version, new Map());
		const phases = versionMap.get(w.version)!;
		if (!phases.has(w.start)) {
			const wf5 = w.featured.map(resolveWeapon).filter(Boolean) as WeaponEntry[];
			const wf4 = w.featuredRare.map(resolveWeapon).filter(Boolean) as WeaponEntry[];
			phases.set(w.start, {
				start: w.start,
				end: w.end,
				characters: null,
				weapons: {
					banner: w,
					featured5: wf5.map(wpn => ({ id: wpn.id, name: wpn.name, rarity: wpn.rarity, type: wpn.type })),
					featured4: wf4.map(wpn => ({ id: wpn.id, name: wpn.name, rarity: wpn.rarity, type: wpn.type })),
				},
			});
		}
	}

	const groups: ResolvedVersionGroup[] = [];
	for (const [version, phases] of versionMap) {
		const sortedPhases = Array.from(phases.values()).sort(
			(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
		);
		groups.push({ version, phases: sortedPhases });
	}

	groups.sort((a, b) => {
		const [aMaj, aMin] = a.version.split('.').map(Number);
		const [bMaj, bMin] = b.version.split('.').map(Number);
		return bMaj - aMaj || bMin - aMin;
	});

	return groups;
}

// ── Page ────────────────────────────────────────────────────────────

export default async function BannersPage() {
	const { characters, weapons } = await fetchBannerHistory();
	const groups = groupAndResolve(characters, weapons);

	return (
		<BannerHistoryClient
			groups={groups}
			totalCharBanners={characters.length}
			totalWeaponBanners={weapons.length}
		/>
	);
}
