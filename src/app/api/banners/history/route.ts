import { NextResponse } from 'next/server';

export const revalidate = 3600; // 1 hour cache

interface PaimonBanner {
	name: string;
	image: number;
	shortName: string;
	start: string;
	end: string;
	color: string;
	featured: string[];
	featuredRare: string[];
	version: string;
	timezoneDependent?: boolean;
}

export interface BannerHistoryEntry {
	type: 'character' | 'weapon';
	name: string;
	shortName: string;
	start: string;
	end: string;
	color: string;
	featured: string[];
	featuredRare: string[];
	version: string;
}

const PAIMON_MOE_URL =
	'https://raw.githubusercontent.com/MadeBaruna/paimon-moe/main/src/data/banners.js';

function parseJsModule(raw: string): Record<string, PaimonBanner[]> {
	// Remove `export const banners = ` and trailing `;`
	let code = raw.replace(/^export\s+const\s+banners\s*=\s*/m, '');
	code = code.replace(/;\s*$/, '');

	// Remove block comments (/* ... */) that may span lines
	code = code.replace(/\/\*[\s\S]*?\*\//g, '');

	// Remove single-line comments but NOT inside strings
	// Process line by line to avoid breaking string contents
	code = code
		.split('\n')
		.map((line) => {
			// Find // that's not inside a string
			let inSingle = false;
			let inDouble = false;
			for (let i = 0; i < line.length; i++) {
				const ch = line[i];
				const prev = i > 0 ? line[i - 1] : '';
				if (ch === "'" && !inDouble && prev !== '\\') inSingle = !inSingle;
				if (ch === '"' && !inSingle && prev !== '\\') inDouble = !inDouble;
				if (
					ch === '/' &&
					line[i + 1] === '/' &&
					!inSingle &&
					!inDouble
				) {
					return line.slice(0, i);
				}
			}
			return line;
		})
		.join('\n');

	// Use Function constructor to evaluate the JS object literal
	const fn = new Function(`return (${code})`);
	return fn() as Record<string, PaimonBanner[]>;
}

export async function GET() {
	try {
		const res = await fetch(PAIMON_MOE_URL, {
			next: { revalidate: 3600 },
		});

		if (!res.ok) {
			return NextResponse.json(
				{ error: 'Failed to fetch banner data' },
				{ status: 502 },
			);
		}

		const raw = await res.text();
		const parsed = parseJsModule(raw);

		const characters: BannerHistoryEntry[] = (
			parsed.characters || []
		).map((b) => ({
			type: 'character' as const,
			name: b.name,
			shortName: b.shortName,
			start: b.start,
			end: b.end,
			color: b.color,
			featured: b.featured,
			featuredRare: b.featuredRare,
			version: b.version,
		}));

		const weapons: BannerHistoryEntry[] = (parsed.weapons || []).map(
			(b) => ({
				type: 'weapon' as const,
				name: b.name,
				shortName: b.shortName,
				start: b.start,
				end: b.end,
				color: b.color,
				featured: b.featured,
				featuredRare: b.featuredRare,
				version: b.version,
			}),
		);

		return NextResponse.json({ characters, weapons });
	} catch (err) {
		return NextResponse.json(
			{ error: 'Internal error', details: String(err) },
			{ status: 500 },
		);
	}
}
