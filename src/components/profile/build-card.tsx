'use client';

import type { Character, Artifact } from '@/lib/enka/client';
import {
	scoreArtifact,
	scoreCharacterBuild,
	calculateCV,
	grade,
	getTier,
	getTierLabel,
} from '@/lib/scoring';
import { ENKA_UI } from '@/lib/constants';
import { charGachaUrl } from '@/lib/characters';
import { cn } from '@/lib/utils';

// ── Inline color constants (for image-generation / OG contexts) ──────

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

function gradeColor(s: number): string {
	if (s >= 90) return '#6EE7B7'; // emerald-300
	if (s >= 70) return '#4ADE80'; // green-400
	if (s >= 50) return '#FACC15'; // yellow-400
	if (s >= 30) return '#FB923C'; // orange-400
	return '#F87171'; // red-400
}

function tierColor(tier: string): string {
	switch (tier) {
		case 'cracked':
			return '#6EE7B7';
		case 'solid':
			return '#4ADE80';
		case 'mid':
			return '#FACC15';
		case 'tragic':
			return '#FB923C';
		case 'catastrophic':
			return '#F87171';
		default:
			return '#94A3B8';
	}
}

interface BuildCardProps {
	character: Character;
	uid: string;
	/** When true, renders with inline styles only (for HTML export / OG image). */
	inline?: boolean;
	className?: string;
}

export function BuildCard({ character, uid, inline = false, className }: BuildCardProps) {
	const artifactScores = character.artifacts.map(scoreArtifact);
	const overallScore = scoreCharacterBuild(character);
	const tier = getTier(overallScore);
	const tierLabel = getTierLabel(overallScore);

	// Calculate total CV across all artifacts
	const totalCV = character.artifacts.reduce(
		(sum, art) => sum + calculateCV(art.substats),
		0,
	);

	// Determine artifact set bonuses
	const setCounts: Record<string, number> = {};
	for (const art of character.artifacts) {
		setCounts[art.set] = (setCounts[art.set] || 0) + 1;
	}
	const activeSets = Object.entries(setCounts)
		.filter(([, count]) => count >= 2)
		.map(([name, count]) => ({ name, pieces: count >= 4 ? 4 : 2 }));

	// Sort artifacts by slot order
	const sortedArtifacts = [...character.artifacts].sort(
		(a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot),
	);

	const elHex = ELEMENT_HEX[character.element] || ELEMENT_HEX.Unknown;
	const elBgHex = ELEMENT_BG_HEX[character.element] || ELEMENT_BG_HEX.Unknown;

	// ── Inline-style rendering (for API route / OG image) ────────────
	if (inline) {
		return <BuildCardInline
			character={character}
			uid={uid}
			sortedArtifacts={sortedArtifacts}
			artifactScores={artifactScores}
			overallScore={overallScore}
			tier={tier}
			tierLabel={tierLabel}
			totalCV={totalCV}
			activeSets={activeSets}
			elHex={elHex}
			elBgHex={elBgHex}
		/>;
	}

	// ── Tailwind rendering (for in-app usage) ────────────────────────
	return (
		<div className={cn('w-[600px] rounded-xl overflow-hidden bg-[#1a1b2e] text-[#F8FAFC] font-sans', className)}>
			{/* Header */}
			<div className="relative h-[160px] overflow-hidden" style={{ background: `linear-gradient(135deg, ${elBgHex}, #1a1b2e)` }}>
				<div className="absolute right-0 top-0 h-full w-[200px] overflow-hidden opacity-40">
					<img
						src={charGachaUrl(character.id)}
						alt=""
						className="h-full w-auto object-cover object-top"
					/>
				</div>
				<div className="relative z-10 p-5 flex flex-col justify-end h-full">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-2xl font-bold" style={{ color: elHex }}>
							{character.name}
						</span>
						<span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: elBgHex, color: elHex }}>
							{character.element}
						</span>
					</div>
					<div className="flex items-center gap-3 text-sm text-[#94A3B8]">
						<span>Lv.{character.level}</span>
						<span>C{character.constellation}</span>
						<span>{character.talents.join('/')}</span>
						<span className="text-amber-400">{'★'.repeat(character.rarity)}</span>
					</div>
				</div>
			</div>

			{/* Weapon + Stats Row */}
			<div className="px-5 py-3 flex items-center gap-4 border-b border-[#363b5e]">
				{character.weapon.icon && (
					<img
						src={`${ENKA_UI}/${character.weapon.icon}.png`}
						alt={character.weapon.name}
						className="w-12 h-12 rounded-lg bg-[#252841]"
					/>
				)}
				<div className="flex-1 min-w-0">
					<div className="font-semibold text-sm truncate">{character.weapon.name}</div>
					<div className="text-xs text-[#94A3B8]">
						R{character.weapon.refinement} · Lv.{character.weapon.level} · {'★'.repeat(character.weapon.rarity)}
					</div>
				</div>
				<div className="text-right">
					<div className="text-xs text-[#94A3B8]">Build Score</div>
					<div className="text-lg font-bold" style={{ color: tierColor(tier) }}>
						{overallScore.toFixed(1)}
					</div>
				</div>
			</div>

			{/* Score Summary Bar */}
			<div className="px-5 py-3 flex items-center gap-4 border-b border-[#363b5e]">
				<div className="flex items-center gap-2">
					<span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: `${tierColor(tier)}20`, color: tierColor(tier) }}>
						{tierLabel}
					</span>
				</div>
				<div className="flex items-center gap-4 text-xs text-[#94A3B8]">
					<span>Total CV: <strong className="text-[#F8FAFC]">{totalCV.toFixed(1)}</strong></span>
					{activeSets.map((s) => (
						<span key={s.name} className="truncate max-w-[140px]">
							{s.name} ({s.pieces}pc)
						</span>
					))}
				</div>
			</div>

			{/* Artifacts Grid */}
			<div className="px-5 py-4 space-y-2">
				{sortedArtifacts.map((art, i) => {
					const artIdx = character.artifacts.indexOf(art);
					const score = artifactScores[artIdx];
					const cv = calculateCV(art.substats);
					return (
						<div key={art.slot} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#252841]">
							<div className="flex flex-col items-center gap-1 w-[52px] flex-shrink-0">
								{art.icon && (
									<img
										src={`${ENKA_UI}/${art.icon}.png`}
										alt={art.slot}
										className="w-10 h-10 rounded"
									/>
								)}
								<span className="text-[10px] text-[#94A3B8] font-medium">
									{SLOT_LABELS[art.slot] || art.slot}
								</span>
							</div>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between mb-1">
									<span className="text-xs font-semibold truncate">{art.mainStat} {art.mainValue}</span>
									<span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${gradeColor(score)}20`, color: gradeColor(score) }}>
										{grade(score)}
									</span>
								</div>
								<div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
									{art.substats.map((sub) => {
										const isCrit = sub.name === 'CRIT Rate' || sub.name === 'CRIT DMG';
										return (
											<span key={sub.name} className={cn('text-[11px]', isCrit ? 'text-[#F8FAFC]' : 'text-[#94A3B8]')}>
												{sub.name}: {sub.value}
											</span>
										);
									})}
								</div>
							</div>
							<div className="text-right flex-shrink-0">
								<span className="text-[10px] text-[#94A3B8]">CV {cv.toFixed(1)}</span>
							</div>
						</div>
					);
				})}
			</div>

			{/* Footer / Watermark */}
			<div className="px-5 py-3 flex items-center justify-between border-t border-[#363b5e]">
				<div className="flex items-center gap-2">
					<span className="text-xs font-bold text-[#6366F1]">guild</span>
					<span className="text-[10px] text-[#94A3B8]">UID {uid}</span>
				</div>
				<span className="text-[10px] text-[#94A3B8]">guild.build</span>
			</div>
		</div>
	);
}

// ── Inline-styles version (for API HTML rendering) ─────────────────────

interface BuildCardInlineProps {
	character: Character;
	uid: string;
	sortedArtifacts: Artifact[];
	artifactScores: number[];
	overallScore: number;
	tier: string;
	tierLabel: string;
	totalCV: number;
	activeSets: { name: string; pieces: number }[];
	elHex: string;
	elBgHex: string;
}

function BuildCardInline({
	character,
	uid,
	sortedArtifacts,
	artifactScores,
	overallScore,
	tier,
	tierLabel,
	totalCV,
	activeSets,
	elHex,
	elBgHex,
}: BuildCardInlineProps) {
	return (
		<div style={{
			width: 600,
			fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
			borderRadius: 12,
			overflow: 'hidden',
			backgroundColor: '#1a1b2e',
			color: '#F8FAFC',
		}}>
			{/* Header */}
			<div style={{
				position: 'relative',
				height: 160,
				overflow: 'hidden',
				background: `linear-gradient(135deg, ${elBgHex}, #1a1b2e)`,
			}}>
				<div style={{
					position: 'absolute',
					right: 0,
					top: 0,
					height: '100%',
					width: 200,
					overflow: 'hidden',
					opacity: 0.4,
				}}>
					<img
						src={charGachaUrl(character.id)}
						alt=""
						style={{ height: '100%', width: 'auto', objectFit: 'cover', objectPosition: 'top' }}
					/>
				</div>
				<div style={{
					position: 'relative',
					zIndex: 10,
					padding: 20,
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'flex-end',
					height: '100%',
				}}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
						<span style={{ fontSize: 24, fontWeight: 700, color: elHex }}>
							{character.name}
						</span>
						<span style={{
							fontSize: 11,
							padding: '2px 8px',
							borderRadius: 9999,
							fontWeight: 600,
							backgroundColor: elBgHex,
							color: elHex,
						}}>
							{character.element}
						</span>
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#94A3B8' }}>
						<span>Lv.{character.level}</span>
						<span>C{character.constellation}</span>
						<span>{character.talents.join('/')}</span>
						<span style={{ color: '#FBBF24' }}>{'★'.repeat(character.rarity)}</span>
					</div>
				</div>
			</div>

			{/* Weapon Row */}
			<div style={{
				padding: '12px 20px',
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				borderBottom: '1px solid #363b5e',
			}}>
				{character.weapon.icon && (
					<img
						src={`${ENKA_UI}/${character.weapon.icon}.png`}
						alt={character.weapon.name}
						style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: '#252841' }}
					/>
				)}
				<div style={{ flex: 1, minWidth: 0 }}>
					<div style={{ fontWeight: 600, fontSize: 14 }}>{character.weapon.name}</div>
					<div style={{ fontSize: 12, color: '#94A3B8' }}>
						R{character.weapon.refinement} · Lv.{character.weapon.level} · {'★'.repeat(character.weapon.rarity)}
					</div>
				</div>
				<div style={{ textAlign: 'right' }}>
					<div style={{ fontSize: 11, color: '#94A3B8' }}>Build Score</div>
					<div style={{ fontSize: 20, fontWeight: 700, color: tierColor(tier) }}>
						{overallScore.toFixed(1)}
					</div>
				</div>
			</div>

			{/* Score Summary */}
			<div style={{
				padding: '10px 20px',
				display: 'flex',
				alignItems: 'center',
				gap: 16,
				borderBottom: '1px solid #363b5e',
			}}>
				<span style={{
					fontSize: 11,
					fontWeight: 600,
					padding: '2px 8px',
					borderRadius: 4,
					backgroundColor: `${tierColor(tier)}20`,
					color: tierColor(tier),
				}}>
					{tierLabel}
				</span>
				<div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: '#94A3B8' }}>
					<span>Total CV: <strong style={{ color: '#F8FAFC' }}>{totalCV.toFixed(1)}</strong></span>
					{activeSets.map((s) => (
						<span key={s.name}>{s.name} ({s.pieces}pc)</span>
					))}
				</div>
			</div>

			{/* Artifacts */}
			<div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
				{sortedArtifacts.map((art) => {
					const artIdx = character.artifacts.indexOf(art);
					const score = artifactScores[artIdx];
					const cv = calculateCV(art.substats);
					return (
						<div key={art.slot} style={{
							display: 'flex',
							alignItems: 'flex-start',
							gap: 12,
							padding: 10,
							borderRadius: 8,
							backgroundColor: '#252841',
						}}>
							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 52, flexShrink: 0 }}>
								{art.icon && (
									<img
										src={`${ENKA_UI}/${art.icon}.png`}
										alt={art.slot}
										style={{ width: 40, height: 40, borderRadius: 4 }}
									/>
								)}
								<span style={{ fontSize: 10, color: '#94A3B8', fontWeight: 500 }}>
									{SLOT_LABELS[art.slot] || art.slot}
								</span>
							</div>
							<div style={{ flex: 1, minWidth: 0 }}>
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
									<span style={{ fontSize: 12, fontWeight: 600 }}>{art.mainStat} {art.mainValue}</span>
									<span style={{
										fontSize: 10,
										fontWeight: 700,
										padding: '2px 6px',
										borderRadius: 4,
										backgroundColor: `${gradeColor(score)}20`,
										color: gradeColor(score),
									}}>
										{grade(score)}
									</span>
								</div>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 12px' }}>
									{art.substats.map((sub) => {
										const isCrit = sub.name === 'CRIT Rate' || sub.name === 'CRIT DMG';
										return (
											<span key={sub.name} style={{
												fontSize: 11,
												color: isCrit ? '#F8FAFC' : '#94A3B8',
											}}>
												{sub.name}: {sub.value}
											</span>
										);
									})}
								</div>
							</div>
							<div style={{ textAlign: 'right', flexShrink: 0 }}>
								<span style={{ fontSize: 10, color: '#94A3B8' }}>CV {cv.toFixed(1)}</span>
							</div>
						</div>
					);
				})}
			</div>

			{/* Footer Watermark */}
			<div style={{
				padding: '12px 20px',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				borderTop: '1px solid #363b5e',
			}}>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<span style={{ fontSize: 12, fontWeight: 700, color: '#6366F1' }}>guild</span>
					<span style={{ fontSize: 10, color: '#94A3B8' }}>UID {uid}</span>
				</div>
				<span style={{ fontSize: 10, color: '#94A3B8' }}>guild.build</span>
			</div>
		</div>
	);
}
