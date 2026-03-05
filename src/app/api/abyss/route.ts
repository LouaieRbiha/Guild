import { NextResponse } from 'next/server';
import { ALL_CHARACTERS } from '@/lib/characters';
import { getCached } from '@/lib/redis';

// ── Types for AZA.GG response ─────────────────────────────────────────

interface AzaCharacterData {
	use_rate: number;
	own_rate: number;
	use_by_own_rate: number;
	weapons: Array<{ id: number; value: number }>;
	artifacts: Array<{ set: Record<string, number>; value: number }>;
	constellations: Array<{ id: number; value: number }>;
	relation_overall: Array<{ id: number; value: number }>;
}

interface AzaResponse {
	retcode: number;
	meta: {
		api_ver: string;
		created_at: number;
		updated_at: number;
	};
	data: {
		schedule: { id: number; start_time: number; end_time: string };
		sample_size_x_a: number;
		sample_size_x_b: number;
		character: Record<string, AzaCharacterData>;
	};
}

// ── Simplified output types ───────────────────────────────────────────

export interface AbyssCharacterRate {
	id: string;
	name: string;
	pickRate: number;
	ownRate: number;
	useByOwnRate: number;
	topWeaponIds: number[];
	topTeammateIds: string[];
	constellations: Record<number, number>;
}

export interface AbyssRatesData {
	sampleSize: number;
	updatedAt: number;
	characters: AbyssCharacterRate[];
}

// ── Cache TTL ─────────────────────────────────────────────────────────

const CACHE_TTL = 300; // 5 minutes in seconds

// ── Character name lookup ─────────────────────────────────────────────

const ID_TO_NAME: Record<string, string> = {};
for (const c of ALL_CHARACTERS) {
	ID_TO_NAME[c.id] = c.name;
}

// ── Transform character data ──────────────────────────────────────────

function transformCharacters(
	charMap: Record<string, AzaCharacterData>,
): AbyssCharacterRate[] {
	const characters: AbyssCharacterRate[] = [];

	for (const [id, charData] of Object.entries(charMap)) {
		const name = ID_TO_NAME[id] || `Unknown (${id})`;

		const topWeaponIds = [...charData.weapons]
			.sort((a, b) => b.value - a.value)
			.slice(0, 3)
			.map((w) => w.id);

		const topTeammateIds = [...charData.relation_overall]
			.sort((a, b) => b.value - a.value)
			.slice(0, 4)
			.map((t) => String(t.id));

		const constellations: Record<number, number> = {};
		for (const c of charData.constellations) {
			constellations[c.id] = Math.round(c.value * 1000) / 10;
		}

		characters.push({
			id,
			name,
			pickRate: Math.round(charData.use_rate * 1000) / 10,
			ownRate: Math.round(charData.own_rate * 1000) / 10,
			useByOwnRate: Math.round(charData.use_by_own_rate * 1000) / 10,
			topWeaponIds,
			topTeammateIds,
			constellations,
		});
	}

	return characters.sort((a, b) => b.pickRate - a.pickRate);
}

// ── Fetch via JSON API ────────────────────────────────────────────────

async function fetchFromApi(): Promise<AbyssRatesData | null> {
	try {
		const res = await fetch(
			'https://genshin.aza.gg/api/v2/statistics/abyss?lang=en',
			{
				headers: {
					Accept: 'application/json',
					'User-Agent': 'Guild-GenshinApp/1.0',
				},
				next: { revalidate: 300 },
			},
		);

		if (!res.ok) return null;

		const json: AzaResponse = await res.json();
		if (json.retcode !== 0 || !json.data?.character) return null;

		return {
			sampleSize: json.data.sample_size_x_a,
			updatedAt: json.meta.updated_at,
			characters: transformCharacters(json.data.character),
		};
	} catch {
		return null;
	}
}

// ── Fallback: scrape SSR data from HTML page ──────────────────────────

function jsToJson(js: string): string {
	return (
		js
			// Add quotes around unquoted keys: word: → "word":
			.replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g, '$1"$2":')
			// Fix shorthand decimals: .123 → 0.123 (but not inside strings)
			.replace(/:(\s*)\./g, ':$10.')
			// Fix negative shorthand: -.123 → -0.123
			.replace(/:(\s*)-\./g, ':$1-0.')
	);
}

async function fetchFromSsr(): Promise<AbyssRatesData | null> {
	try {
		const res = await fetch('https://genshin.aza.gg/abyss', {
			headers: {
				Accept: 'text/html',
				'User-Agent': 'Guild-GenshinApp/1.0',
			},
			next: { revalidate: 300 },
		});

		if (!res.ok) return null;

		const html = await res.text();

		// Extract the genshin_abyss_statistics object from SSR data
		const statsStart = html.indexOf('genshin_abyss_statistics:{');
		if (statsStart === -1) return null;

		// Find the matching closing brace
		let depth = 0;
		let startIdx = html.indexOf('{', statsStart);
		let endIdx = startIdx;

		for (let i = startIdx; i < html.length; i++) {
			if (html[i] === '{') depth++;
			else if (html[i] === '}') {
				depth--;
				if (depth === 0) {
					endIdx = i + 1;
					break;
				}
			}
		}

		if (endIdx <= startIdx) return null;

		const jsObject = html.slice(startIdx, endIdx);
		const jsonStr = jsToJson(jsObject);

		let parsed: AzaResponse;
		try {
			parsed = JSON.parse(jsonStr);
		} catch {
			return null;
		}

		if (!parsed.data?.character) return null;

		return {
			sampleSize: parsed.data.sample_size_x_a || 0,
			updatedAt: parsed.meta?.updated_at || Date.now(),
			characters: transformCharacters(parsed.data.character),
		};
	} catch {
		return null;
	}
}

// ── Route handler ─────────────────────────────────────────────────────

async function fetchAbyssData(): Promise<AbyssRatesData | null> {
	return (await fetchFromApi()) || (await fetchFromSsr());
}

export async function GET() {
	const result = await getCached<AbyssRatesData | null>(
		'guild:abyss:rates',
		CACHE_TTL,
		fetchAbyssData,
	);

	if (!result) {
		return NextResponse.json(
			{ error: 'Failed to fetch abyss data from AZA.GG' },
			{ status: 502 },
		);
	}

	return NextResponse.json(result);
}
