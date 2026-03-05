import { NextResponse } from 'next/server';
import { ALL_CHARACTERS } from '@/lib/characters';
import { getCached } from '@/lib/redis';

// ── Types ─────────────────────────────────────────────────────────────

interface SsrCharacter {
	id: string;
	use_rate: number;
	own_rate: number;
	use_by_own_rate: number;
}

interface SsrRoom {
	id: number;
	characters: SsrCharacter[];
}

interface SsrDifficulty {
	id: string;
	sample_size: number;
	rooms: SsrRoom[];
}

interface SsrData {
	updated_at: number;
	difficulties: SsrDifficulty[];
}

export interface StygianCharacterRate {
	id: string;
	name: string;
	pickRate: number;
	ownRate: number;
	useByOwnRate: number;
}

export interface StygianDifficulty {
	id: string;
	sampleSize: number;
	rooms: {
		room: number;
		characters: StygianCharacterRate[];
	}[];
	overall: StygianCharacterRate[];
}

export interface StygianRatesData {
	updatedAt: number;
	difficulties: StygianDifficulty[];
	// Backward-compatible: flatten the highest-difficulty data as default
	rooms: {
		room: number;
		characters: StygianCharacterRate[];
	}[];
	overall: StygianCharacterRate[];
}

// ── Cache TTL ─────────────────────────────────────────────────────────

const CACHE_TTL = 300; // 5 minutes

// ── Character name lookup ─────────────────────────────────────────────

const ID_TO_NAME: Record<string, string> = {};
for (const c of ALL_CHARACTERS) {
	ID_TO_NAME[c.id] = c.name;
}

// ── Helpers ───────────────────────────────────────────────────────────

function transformCharacters(chars: SsrCharacter[]): StygianCharacterRate[] {
	return chars
		.map((c) => ({
			id: c.id,
			name: ID_TO_NAME[c.id] || `Unknown (${c.id})`,
			pickRate: Math.round(c.use_rate * 1000) / 10,
			ownRate: Math.round(c.own_rate * 1000) / 10,
			useByOwnRate: Math.round(c.use_by_own_rate * 1000) / 10,
		}))
		.sort((a, b) => b.pickRate - a.pickRate);
}

function jsToJson(js: string): string {
	return js
		.replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g, '$1"$2":')
		.replace(/:(\s*)\./g, ':$10.')
		.replace(/:(\s*)-\./g, ':$1-0.');
}

function computeOverall(
	rooms: SsrRoom[],
): StygianCharacterRate[] {
	const charMap = new Map<
		string,
		{ pickSum: number; ownMax: number; useOwnSum: number; count: number }
	>();
	for (const room of rooms) {
		for (const c of room.characters) {
			const existing = charMap.get(c.id);
			if (existing) {
				existing.pickSum += c.use_rate;
				existing.ownMax = Math.max(existing.ownMax, c.own_rate);
				existing.useOwnSum += c.use_by_own_rate;
				existing.count++;
			} else {
				charMap.set(c.id, {
					pickSum: c.use_rate,
					ownMax: c.own_rate,
					useOwnSum: c.use_by_own_rate,
					count: 1,
				});
			}
		}
	}

	return [...charMap.entries()]
		.map(([id, data]) => ({
			id,
			name: ID_TO_NAME[id] || `Unknown (${id})`,
			pickRate: Math.round((data.pickSum / rooms.length) * 1000) / 10,
			ownRate: Math.round(data.ownMax * 1000) / 10,
			useByOwnRate:
				Math.round((data.useOwnSum / data.count) * 1000) / 10,
		}))
		.sort((a, b) => b.pickRate - a.pickRate);
}

// ── Fetch from SSR HTML ──────────────────────────────────────────────

async function fetchStygianData(): Promise<StygianRatesData | null> {
	try {
		const res = await fetch('https://genshin.aza.gg/leyline', {
			headers: {
				Accept: 'text/html',
				'User-Agent': 'Guild-GenshinApp/1.0',
			},
			next: { revalidate: 300 },
		});

		if (!res.ok) return null;

		const html = await res.text();

		// Extract the ssr_load_data object via brace-matching
		const marker = 'ssr_load_data:';
		const markerIdx = html.indexOf(marker);
		if (markerIdx === -1) return null;

		const startIdx = html.indexOf('{', markerIdx + marker.length);
		if (startIdx === -1) return null;

		let depth = 0;
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

		let parsed: { retcode: number; data: SsrData };
		try {
			parsed = JSON.parse(jsonStr);
		} catch {
			return null;
		}

		if (!parsed.data?.difficulties?.length) return null;

		const updatedAt = parsed.data.updated_at || Date.now();

		// Transform each difficulty level
		const difficulties: StygianDifficulty[] = parsed.data.difficulties.map(
			(diff) => {
				const rooms = diff.rooms.map((room) => ({
					room: room.id,
					characters: transformCharacters(room.characters),
				}));
				const overall = computeOverall(diff.rooms);

				return {
					id: diff.id,
					sampleSize: Math.round(diff.sample_size * 1000) / 10,
					rooms,
					overall,
				};
			},
		);

		// Find the highest-difficulty data (largest id) as the default
		const sortedDiffs = [...difficulties].sort(
			(a, b) => Number(b.id) - Number(a.id),
		);
		const defaultDiff = sortedDiffs[0];

		return {
			updatedAt,
			difficulties,
			rooms: defaultDiff.rooms,
			overall: defaultDiff.overall,
		};
	} catch (err) {
		console.error('Stygian fetch error:', err);
		return null;
	}
}

// ── Route handler ─────────────────────────────────────────────────────

export async function GET() {
	const result = await getCached<StygianRatesData | null>(
		'guild:stygian:rates',
		CACHE_TTL,
		fetchStygianData,
	);

	if (!result) {
		return NextResponse.json(
			{ error: 'Failed to fetch stygian data' },
			{ status: 502 },
		);
	}

	return NextResponse.json(result);
}
