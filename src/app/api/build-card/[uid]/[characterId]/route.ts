import { NextRequest } from 'next/server';
import { fetchEnkaProfile } from '@/lib/enka/client';
import {
	scoreArtifact,
	scoreCharacterBuild,
	calculateCV,
	grade,
	getTier,
	getTierLabel,
} from '@/lib/scoring';

// ── Element color constants ─────────────────────────────────────────────

const ELEMENT_HEX: Record<string, string> = {
	Pyro: '#EF4444',
	Hydro: '#3B82F6',
	Anemo: '#5EEAD4',
	Cryo: '#67E8F9',
	Electro: '#A78BFA',
	Geo: '#FACC15',
	Dendro: '#4ADE80',
	Unknown: '#94A3B8',
};

const ELEMENT_BG_HEX: Record<string, string> = {
	Pyro: 'rgba(239,68,68,0.12)',
	Hydro: 'rgba(59,130,246,0.12)',
	Anemo: 'rgba(94,234,212,0.12)',
	Cryo: 'rgba(103,232,249,0.12)',
	Electro: 'rgba(167,139,250,0.12)',
	Geo: 'rgba(250,204,21,0.12)',
	Dendro: 'rgba(74,222,128,0.12)',
	Unknown: 'rgba(148,163,184,0.12)',
};

const SLOT_LABELS: Record<string, string> = {
	Flower: 'Flower',
	Plume: 'Plume',
	Sands: 'Sands',
	Goblet: 'Goblet',
	Circlet: 'Circlet',
};

const SLOT_ORDER = ['Flower', 'Plume', 'Sands', 'Goblet', 'Circlet'];

const ENKA_UI = 'https://enka.network/ui';

function tierColor(tier: string): string {
	switch (tier) {
		case 'cracked': return '#6EE7B7';
		case 'solid': return '#4ADE80';
		case 'mid': return '#FACC15';
		case 'tragic': return '#FB923C';
		case 'catastrophic': return '#F87171';
		default: return '#94A3B8';
	}
}

function gradeColor(s: number): string {
	if (s >= 90) return '#6EE7B7';
	if (s >= 70) return '#4ADE80';
	if (s >= 50) return '#FACC15';
	if (s >= 30) return '#FB923C';
	return '#F87171';
}

function escHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

// ── Route handler ───────────────────────────────────────────────────────

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ uid: string; characterId: string }> },
) {
	const { uid, characterId } = await params;

	if (!/^\d{9,10}$/.test(uid)) {
		return new Response('Invalid UID format', { status: 400 });
	}

	// Fetch character data from Enka (has full artifact info)
	let characters;
	try {
		const enkaProfile = await fetchEnkaProfile(uid);
		characters = enkaProfile.characters;
	} catch {
		return new Response(
			`Could not fetch profile for UID ${escHtml(uid)}. API is unavailable.`,
			{ status: 502 },
		);
	}

	// Find the character
	const character = characters.find((c) => c.id === characterId);
	if (!character) {
		return new Response(
			`Character ${escHtml(characterId)} not found in showcase for UID ${escHtml(uid)}.`,
			{ status: 404 },
		);
	}

	// ── Compute scoring data ─────────────────────────────────────────
	const artifactScores = character.artifacts.map(scoreArtifact);
	const overallScore = scoreCharacterBuild(character);
	const tier = getTier(overallScore);
	const tierLabel = getTierLabel(overallScore);
	const totalCV = character.artifacts.reduce(
		(sum, art) => sum + calculateCV(art.substats),
		0,
	);

	// Artifact set bonuses
	const setCounts: Record<string, number> = {};
	for (const art of character.artifacts) {
		setCounts[art.set] = (setCounts[art.set] || 0) + 1;
	}
	const activeSets = Object.entries(setCounts)
		.filter(([, count]) => count >= 2)
		.map(([name, count]) => ({ name, pieces: count >= 4 ? 4 : 2 }));

	const sortedArtifacts = [...character.artifacts].sort(
		(a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot),
	);

	const elHex = ELEMENT_HEX[character.element] || ELEMENT_HEX.Unknown;
	const elBgHex = ELEMENT_BG_HEX[character.element] || ELEMENT_BG_HEX.Unknown;

	// Character gacha splash URL (uses local API proxy)
	const origin = _request.nextUrl.origin;
	const gachaUrl = `${origin}/api/images/characters/${character.id}/gacha.png`;

	// ── Build HTML ───────────────────────────────────────────────────
	const ogTitle = `${character.name} Build - ${tierLabel} (${overallScore.toFixed(1)}/10)`;
	const ogDesc = `Lv.${character.level} C${character.constellation} | ${character.weapon.name} R${character.weapon.refinement} | CV ${totalCV.toFixed(1)} | ${activeSets.map((s) => `${s.name} ${s.pieces}pc`).join(', ')}`;

	const artifactRows = sortedArtifacts.map((art) => {
		const artIdx = character.artifacts.indexOf(art);
		const score = artifactScores[artIdx];
		const cv = calculateCV(art.substats);
		const gc = gradeColor(score);

		const subsHtml = art.substats
			.map((sub) => {
				const isCrit = sub.name === 'CRIT Rate' || sub.name === 'CRIT DMG';
				return `<span style="font-size:11px;color:${isCrit ? '#F8FAFC' : '#94A3B8'}">${escHtml(sub.name)}: ${escHtml(sub.value)}</span>`;
			})
			.join('');

		const iconHtml = art.icon
			? `<img src="${ENKA_UI}/${escHtml(art.icon)}.png" alt="${escHtml(art.slot)}" style="width:40px;height:40px;border-radius:4px" />`
			: '';

		return `
		<div style="display:flex;align-items:flex-start;gap:12px;padding:10px;border-radius:8px;background:#252841">
			<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:52px;flex-shrink:0">
				${iconHtml}
				<span style="font-size:10px;color:#94A3B8;font-weight:500">${escHtml(SLOT_LABELS[art.slot] || art.slot)}</span>
			</div>
			<div style="flex:1;min-width:0">
				<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
					<span style="font-size:12px;font-weight:600">${escHtml(art.mainStat)} ${escHtml(art.mainValue)}</span>
					<span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:${gc}20;color:${gc}">${grade(score)}</span>
				</div>
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 12px">
					${subsHtml}
				</div>
			</div>
			<div style="text-align:right;flex-shrink:0">
				<span style="font-size:10px;color:#94A3B8">CV ${cv.toFixed(1)}</span>
			</div>
		</div>`;
	}).join('');

	const setsHtml = activeSets
		.map((s) => `<span>${escHtml(s.name)} (${s.pieces}pc)</span>`)
		.join('');

	const weaponIconHtml = character.weapon.icon
		? `<img src="${ENKA_UI}/${escHtml(character.weapon.icon)}.png" alt="${escHtml(character.weapon.name)}" style="width:48px;height:48px;border-radius:8px;background:#252841" />`
		: '';

	const html = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=600" />
	<title>${escHtml(ogTitle)}</title>
	<meta property="og:title" content="${escHtml(ogTitle)}" />
	<meta property="og:description" content="${escHtml(ogDesc)}" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="${escHtml(origin)}/api/build-card/${escHtml(uid)}/${escHtml(characterId)}" />
	<meta property="og:image" content="${escHtml(gachaUrl)}" />
	<meta property="og:image:width" content="600" />
	<meta property="og:image:height" content="800" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="${escHtml(ogTitle)}" />
	<meta name="twitter:description" content="${escHtml(ogDesc)}" />
	<meta name="twitter:image" content="${escHtml(gachaUrl)}" />
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }
		body {
			background: #0f0f1a;
			display: flex;
			justify-content: center;
			align-items: flex-start;
			padding: 20px;
			min-height: 100vh;
		}
	</style>
</head>
<body>
	<div style="width:600px;font-family:'Inter','Segoe UI',system-ui,-apple-system,sans-serif;border-radius:12px;overflow:hidden;background:#1a1b2e;color:#F8FAFC">
		<!-- Header -->
		<div style="position:relative;height:160px;overflow:hidden;background:linear-gradient(135deg,${elBgHex},#1a1b2e)">
			<div style="position:absolute;right:0;top:0;height:100%;width:200px;overflow:hidden;opacity:0.4">
				<img src="${escHtml(gachaUrl)}" alt="" style="height:100%;width:auto;object-fit:cover;object-position:top" />
			</div>
			<div style="position:relative;z-index:10;padding:20px;display:flex;flex-direction:column;justify-content:flex-end;height:100%">
				<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
					<span style="font-size:24px;font-weight:700;color:${elHex}">${escHtml(character.name)}</span>
					<span style="font-size:11px;padding:2px 8px;border-radius:9999px;font-weight:600;background:${elBgHex};color:${elHex}">${escHtml(character.element)}</span>
				</div>
				<div style="display:flex;align-items:center;gap:12px;font-size:13px;color:#94A3B8">
					<span>Lv.${character.level}</span>
					<span>C${character.constellation}</span>
					<span>${character.talents.join('/')}</span>
					<span style="color:#FBBF24">${'★'.repeat(character.rarity)}</span>
				</div>
			</div>
		</div>

		<!-- Weapon -->
		<div style="padding:12px 20px;display:flex;align-items:center;gap:16px;border-bottom:1px solid #363b5e">
			${weaponIconHtml}
			<div style="flex:1;min-width:0">
				<div style="font-weight:600;font-size:14px">${escHtml(character.weapon.name)}</div>
				<div style="font-size:12px;color:#94A3B8">R${character.weapon.refinement} · Lv.${character.weapon.level} · ${'★'.repeat(character.weapon.rarity)}</div>
			</div>
			<div style="text-align:right">
				<div style="font-size:11px;color:#94A3B8">Build Score</div>
				<div style="font-size:20px;font-weight:700;color:${tierColor(tier)}">${overallScore.toFixed(1)}</div>
			</div>
		</div>

		<!-- Score Summary -->
		<div style="padding:10px 20px;display:flex;align-items:center;gap:16px;border-bottom:1px solid #363b5e">
			<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:4px;background:${tierColor(tier)}20;color:${tierColor(tier)}">${escHtml(tierLabel)}</span>
			<div style="display:flex;align-items:center;gap:16px;font-size:12px;color:#94A3B8">
				<span>Total CV: <strong style="color:#F8FAFC">${totalCV.toFixed(1)}</strong></span>
				${setsHtml}
			</div>
		</div>

		<!-- Artifacts -->
		<div style="padding:16px 20px;display:flex;flex-direction:column;gap:8px">
			${artifactRows}
		</div>

		<!-- Footer -->
		<div style="padding:12px 20px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #363b5e">
			<div style="display:flex;align-items:center;gap:8px">
				<span style="font-size:12px;font-weight:700;color:#6366F1">guild</span>
				<span style="font-size:10px;color:#94A3B8">UID ${escHtml(uid)}</span>
			</div>
			<span style="font-size:10px;color:#94A3B8">guild.build</span>
		</div>
	</div>
</body>
</html>`;

	return new Response(html, {
		status: 200,
		headers: {
			'Content-Type': 'text/html; charset=utf-8',
			'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
		},
	});
}
