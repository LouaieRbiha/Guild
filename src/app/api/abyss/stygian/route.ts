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

// ── Cache TTL ─────────────────────────────────────────────────────────

const CACHE_TTL = 300; // 5 minutes in seconds

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

		// Extract SSR data from SvelteKit page
		const dataMatch = html.match(
			/ssr_load_data\s*=\s*(\[[\s\S]*?\]);\s*(?:const|let|var|<\/script>)/,
		);

		if (!dataMatch) return null;

		let ssrData: unknown;
		try {
			ssrData = JSON.parse(dataMatch[1]);
		} catch {
			return null;
		}

		const loadData = Array.isArray(ssrData)
			? (ssrData as Record<string, unknown>[])
			: [];
		const pageData = loadData.find(
			(d) => d && typeof d === 'object' && 'data' in d,
		) as { data: { rooms: SsrRoom[]; updated_at?: number } } | undefined;

		if (!pageData?.data?.rooms) return null;

		const { rooms: ssrRooms } = pageData.data;
		const updatedAt = pageData.data.updated_at || Date.now();

		const rooms = ssrRooms.map((room, idx) => ({
			room: idx + 1,
			characters: transformCharacters(room.characters),
		}));

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

		return { updatedAt, rooms, overall };
	} catch (err) {
		console.error('Stygian fetch error:', err);
		return null;
	}
}

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
