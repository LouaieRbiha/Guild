import { NextRequest, NextResponse } from 'next/server';
import { getCached } from '@/lib/redis';

// ── Types ─────────────────────────────────────────────────────────────

interface KQMGuide {
	name: string;
	url: string;
	talentPriority: string[];
	weapons: Array<{ name: string; note: string }>;
	artifacts: Array<{ set: string; pieces: number; note: string }>;
	teams: Array<{ name: string; members: string[]; archetype: string }>;
	tips: string[];
}

// ── Scraper ───────────────────────────────────────────────────────────

const KQM_ALIASES: Record<string, string> = {
	'raiden-shogun': 'raiden',
	'kamisato-ayaka': 'ayaka',
	'kamisato-ayato': 'ayato',
	'kaedehara-kazuha': 'kazuha',
	'arataki-itto': 'itto',
	'yae-miko': 'yae-miko',
	'kujou-sara': 'sara',
	'sangonomiya-kokomi': 'kokomi',
	'shikanoin-heizou': 'heizou',
	'kuki-shinobu': 'shinobu',
	'hu-tao': 'hu-tao',
	'yun-jin': 'yunjin',
};

async function scrapeKQM(slug: string): Promise<KQMGuide | null> {
	const kqmSlug = KQM_ALIASES[slug] || slug;
	const url = `https://keqingmains.com/${kqmSlug}/`;

	try {
		const res = await fetch(url, {
			headers: {
				'User-Agent': 'Guild-GenshinApp/1.0 (guide-aggregator)',
				Accept: 'text/html',
			},
			next: { revalidate: 86400 }, // Cache for 24h
		});

		if (!res.ok) return null;

		const html = await res.text();

		// Extract talent priority from heading or content
		const talentPriority = extractTalentPriority(html);

		// Extract weapon recommendations
		const weapons = extractWeapons(html);

		// Extract artifact sets
		const artifacts = extractArtifacts(html);

		// Extract tips from key takeaways or similar sections
		const tips = extractTips(html);

		// Only return if we got meaningful data
		if (weapons.length === 0 && artifacts.length === 0) return null;

		return {
			name: slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
			url,
			talentPriority,
			weapons,
			artifacts,
			teams: [],
			tips,
		};
	} catch {
		return null;
	}
}

function extractTalentPriority(html: string): string[] {
	// Look for "Burst > Skill > Normal" or similar patterns
	const priorityMatch = html.match(
		/(?:Talent\s*Priority|Priority)[:\s]*(?:<[^>]*>)*\s*([^<]{5,80}(?:>|&gt;)[^<]{2,80})/i,
	);
	if (priorityMatch) {
		const raw = priorityMatch[1]
			.replace(/&gt;/g, '>')
			.replace(/<[^>]*>/g, '')
			.trim();
		return raw.split(/\s*>\s*/).map((s) => s.trim()).filter(Boolean);
	}
	return [];
}

function extractWeapons(html: string): Array<{ name: string; note: string }> {
	const weapons: Array<{ name: string; note: string }> = [];
	// Match weapon names from headings or strong tags near weapon sections
	const weaponSection = html.match(
		/(?:Weapon|Weapons)(?:<[^>]*>)*[\s\S]{0,5000}?(?=(?:<h[23]|<\/section|$))/i,
	);
	if (!weaponSection) return weapons;

	const nameMatches = weaponSection[0].matchAll(
		/<(?:strong|b|h[34])[^>]*>([^<]{3,50})<\/(?:strong|b|h[34])>/gi,
	);
	for (const m of nameMatches) {
		const name = m[1].replace(/&[^;]+;/g, '').trim();
		if (
			name.length > 2 &&
			name.length < 50 &&
			!name.match(/^(weapon|best|recommended|note|tier|rank)/i)
		) {
			weapons.push({ name, note: '' });
		}
		if (weapons.length >= 6) break;
	}
	return weapons;
}

function extractArtifacts(
	html: string,
): Array<{ set: string; pieces: number; note: string }> {
	const artifacts: Array<{ set: string; pieces: number; note: string }> = [];
	// Common artifact set names
	const setNames = [
		'Emblem of Severed Fate',
		'Crimson Witch of Flames',
		'Blizzard Strayer',
		'Viridescent Venerer',
		'Noblesse Oblige',
		'Tenacity of the Millelith',
		"Wanderer's Troupe",
		'Gladiator\'s Finale',
		'Heart of Depth',
		'Marechaussee Hunter',
		'Golden Troupe',
		'Gilded Dreams',
		'Deepwood Memories',
		"Shimenawa's Reminiscence",
		'Thundering Fury',
		'Pale Flame',
		'Husk of Opulent Dreams',
		'Ocean-Hued Clam',
		'Desert Pavilion Chronicle',
		'Obsidian Codex',
		'Fragment of Harmonic Whimsy',
		'Scroll of the Hero of Cinder City',
		'Song of Days Past',
		'Nighttime Whispers in the Echoing Woods',
		'Unfinished Reverie',
		'Flower of Paradise Lost',
		'Vourukasha\'s Glow',
	];

	for (const name of setNames) {
		if (html.includes(name)) {
			// Check if it mentions 4pc or 2pc
			const contextMatch = html.match(
				new RegExp(`(4[- ]?(?:pc|piece)|2[- ]?(?:pc|piece))?[^<]{0,100}${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i'),
			);
			const pieces = contextMatch?.[1]?.startsWith('2') ? 2 : 4;
			artifacts.push({ set: name, pieces, note: '' });
		}
		if (artifacts.length >= 4) break;
	}
	return artifacts;
}

function extractTips(html: string): string[] {
	const tips: string[] = [];
	// Look for key takeaway sections or pro tips
	const tipMatches = html.matchAll(
		/<li[^>]*>(?:<[^>]*>)*([^<]{20,200})(?:<[^>]*>)*<\/li>/gi,
	);
	for (const m of tipMatches) {
		const text = m[1].replace(/&[^;]+;/g, '').trim();
		if (
			text.length > 20 &&
			text.length < 200 &&
			!text.match(/^(table of|copyright|privacy|cookie|share|like)/i)
		) {
			tips.push(text);
		}
		if (tips.length >= 5) break;
	}
	return tips;
}

// ── Route handler ─────────────────────────────────────────────────────

const CACHE_TTL = 86400; // 24 hours

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ name: string }> },
) {
	const { name } = await params;
	const slug = name.toLowerCase().replace(/\s+/g, '-');
	const cacheKey = `guild:guides:${slug}`;

	const guide = await getCached<KQMGuide | null>(
		cacheKey,
		CACHE_TTL,
		() => scrapeKQM(slug),
	);

	return NextResponse.json(guide);
}
