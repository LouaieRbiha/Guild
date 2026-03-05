import { NextResponse } from 'next/server';

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

// ── In-memory cache (5 min) ───────────────────────────────────────────

let cache: { data: AbyssRatesData; expiresAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// ── Character name lookup ─────────────────────────────────────────────

// We import statically to map IDs to names
import { ALL_CHARACTERS } from '@/lib/characters';

const ID_TO_NAME: Record<string, string> = {};
for (const c of ALL_CHARACTERS) {
	ID_TO_NAME[c.id] = c.name;
}

// ── Route handler ─────────────────────────────────────────────────────

export async function GET() {
	// Check cache
	if (cache && cache.expiresAt > Date.now()) {
		return NextResponse.json(cache.data);
	}

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

		if (!res.ok) {
			// Try the SSR page fallback for embedded data
			return NextResponse.json(
				{ error: 'Failed to fetch from AZA.GG', status: res.status },
				{ status: 502 },
			);
		}

		const json: AzaResponse = await res.json();

		if (json.retcode !== 0 || !json.data?.character) {
			return NextResponse.json(
				{ error: 'Invalid response from AZA.GG' },
				{ status: 502 },
			);
		}

		// Transform data
		const characters: AbyssCharacterRate[] = [];

		for (const [id, charData] of Object.entries(json.data.character)) {
			const name = ID_TO_NAME[id] || `Unknown (${id})`;

			// Top 3 weapons
			const topWeaponIds = charData.weapons
				.sort((a, b) => b.value - a.value)
				.slice(0, 3)
				.map((w) => w.id);

			// Top 4 teammates
			const topTeammateIds = charData.relation_overall
				.sort((a, b) => b.value - a.value)
				.slice(0, 4)
				.map((t) => String(t.id));

			// Constellation distribution
			const constellations: Record<number, number> = {};
			for (const c of charData.constellations) {
				constellations[c.id] = Math.round(c.value * 1000) / 10;
			}

			characters.push({
				id,
				name,
				pickRate: Math.round(charData.use_rate * 1000) / 10,
				ownRate: Math.round(charData.own_rate * 1000) / 10,
				useByOwnRate:
					Math.round(charData.use_by_own_rate * 1000) / 10,
				topWeaponIds,
				topTeammateIds,
				constellations,
			});
		}

		// Sort by pick rate descending
		characters.sort((a, b) => b.pickRate - a.pickRate);

		const result: AbyssRatesData = {
			sampleSize: json.data.sample_size_x_a,
			updatedAt: json.meta.updated_at,
			characters,
		};

		// Update cache
		cache = { data: result, expiresAt: Date.now() + CACHE_TTL };

		return NextResponse.json(result);
	} catch (err) {
		console.error('Abyss API error:', err);
		return NextResponse.json(
			{ error: 'Failed to fetch abyss data' },
			{ status: 500 },
		);
	}
}
