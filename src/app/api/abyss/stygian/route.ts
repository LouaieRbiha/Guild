import { NextResponse } from 'next/server';
import { ALL_CHARACTERS } from '@/lib/characters';

// ── Types ─────────────────────────────────────────────────────────────

interface SsrCharacter {
	id: string;
	use_rate: number;
	own_rate: number;
	use_by_own_rate: number;
}

interface SsrRoom {
	characters: SsrCharacter[];
}

export interface StygianCharacterRate {
	id: string;
	name: string;
	pickRate: number;
	ownRate: number;
	useByOwnRate: number;
}

export interface StygianRatesData {
	updatedAt: number;
	rooms: {
		room: number;
		characters: StygianCharacterRate[];
	}[];
	overall: StygianCharacterRate[];
}

// ── In-memory cache (5 min) ───────────────────────────────────────────

let cache: { data: StygianRatesData; expiresAt: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// ── Character name lookup ─────────────────────────────────────────────

const ID_TO_NAME: Record<string, string> = {};
for (const c of ALL_CHARACTERS) {
	ID_TO_NAME[c.id] = c.name;
}

// ── helpers ───────────────────────────────────────────────────────────

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

// ── Route handler ─────────────────────────────────────────────────────

export async function GET() {
	if (cache && cache.expiresAt > Date.now()) {
		return NextResponse.json(cache.data);
	}

	try {
		const res = await fetch('https://genshin.aza.gg/leyline', {
			headers: {
				Accept: 'text/html',
				'User-Agent': 'Guild-GenshinApp/1.0',
			},
			next: { revalidate: 300 },
		});

		if (!res.ok) {
			return NextResponse.json(
				{ error: 'Failed to fetch leyline page', status: res.status },
				{ status: 502 },
			);
		}

		const html = await res.text();

		// Extract SSR data from SvelteKit page
		// The data is embedded as JSON in the page's script tags
		const dataMatch = html.match(
			/ssr_load_data\s*=\s*(\[[\s\S]*?\]);\s*(?:const|let|var|<\/script>)/,
		);

		if (!dataMatch) {
			return NextResponse.json(
				{ error: 'Could not extract SSR data from leyline page' },
				{ status: 502 },
			);
		}

		let ssrData: unknown;
		try {
			ssrData = JSON.parse(dataMatch[1]);
		} catch {
			return NextResponse.json(
				{ error: 'Failed to parse SSR data' },
				{ status: 502 },
			);
		}

		// SSR data is an array; the main data is typically in the first element
		// Structure: [{data: {rooms: [...], difficulties: [...], ...}, ...}]
		const loadData = Array.isArray(ssrData)
			? (ssrData as Record<string, unknown>[])
			: [];
		const pageData = loadData.find(
			(d) => d && typeof d === 'object' && 'data' in d,
		) as { data: { rooms: SsrRoom[]; updated_at?: number } } | undefined;

		if (!pageData?.data?.rooms) {
			return NextResponse.json(
				{ error: 'Unexpected SSR data structure' },
				{ status: 502 },
			);
		}

		const { rooms: ssrRooms } = pageData.data;
		const updatedAt =
			pageData.data.updated_at || Date.now();

		// Build per-room data
		const rooms = ssrRooms.map((room, idx) => ({
			room: idx + 1,
			characters: transformCharacters(room.characters),
		}));

		// Build overall stats by averaging across rooms
		const charMap = new Map<
			string,
			{ pickSum: number; ownMax: number; useOwnSum: number; count: number }
		>();
		for (const room of ssrRooms) {
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

		const overall: StygianCharacterRate[] = [...charMap.entries()]
			.map(([id, data]) => ({
				id,
				name: ID_TO_NAME[id] || `Unknown (${id})`,
				pickRate:
					Math.round((data.pickSum / ssrRooms.length) * 1000) / 10,
				ownRate: Math.round(data.ownMax * 1000) / 10,
				useByOwnRate:
					Math.round((data.useOwnSum / data.count) * 1000) / 10,
			}))
			.sort((a, b) => b.pickRate - a.pickRate);

		const result: StygianRatesData = {
			updatedAt,
			rooms,
			overall,
		};

		cache = { data: result, expiresAt: Date.now() + CACHE_TTL };
		return NextResponse.json(result);
	} catch (err) {
		console.error('Stygian API error:', err);
		return NextResponse.json(
			{ error: 'Failed to fetch stygian data' },
			{ status: 500 },
		);
	}
}
