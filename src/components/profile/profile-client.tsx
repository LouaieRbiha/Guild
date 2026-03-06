'use client';

import {
	ConstellationIcon,
	ELEMENT_ICONS,
	ResinIcon,
	SLOT_ICONS,
	TrophyIcon,
	VerdictIcon,
} from '@/components/icons/genshin-icons';
import { FallbackImage } from '@/components/shared';
import type { AkashaCalculation } from '@/lib/akasha/types';
import { charGachaUrl } from '@/lib/characters';
import { ENKA_UI } from '@/lib/constants';
import type { EnkaProfile } from '@/lib/enka/client';
import {
	barColor,
	calculateCV,
	elBg,
	elColor,
	estimateResin,
	estimateResinForPiece,
	getPieceRoast,
	getRoast,
	getTier,
	getTierLabel,
	grade,
	scoreArtifact,
	scoreCharacterBuild,
	scoreColor,
	tierBadge,
} from '@/lib/scoring';
import { CHARACTER_BUILDS } from '@/data/character-builds';
import { cn } from '@/lib/utils';
import { Download, Share2, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// Roll tiers for 5★ substats (approximately)
const ROLL_VALUES: Record<string, number[]> = {
	HP: [209, 239, 269, 299],
	ATK: [14, 16, 18, 19],
	DEF: [16, 19, 21, 23],
	'HP%': [4.1, 4.7, 5.3, 5.8],
	'ATK%': [4.1, 4.7, 5.3, 5.8],
	'DEF%': [5.1, 5.8, 6.6, 7.3],
	'CRIT Rate': [2.7, 3.1, 3.5, 3.9],
	'CRIT DMG': [5.4, 6.2, 7.0, 7.8],
	'Energy Recharge': [4.5, 5.2, 5.8, 6.5],
	'Elemental Mastery': [16, 19, 21, 23],
};

function estimateRollCount(name: string, valueStr: string): number {
	const numVal = parseFloat(valueStr);
	if (isNaN(numVal)) return 0;
	const tiers = ROLL_VALUES[name];
	if (!tiers) return 0;
	const minRoll = tiers[0];
	if (minRoll <= 0) return 0;
	// Estimate number of rolls by dividing total value by average roll value
	const avgRoll = tiers.reduce((a, b) => a + b, 0) / tiers.length;
	return Math.max(1, Math.round(numVal / avgRoll));
}

function rollQuality(name: string, valueStr: string): 'high' | 'mid' | 'low' {
	const numVal = parseFloat(valueStr);
	if (isNaN(numVal)) return 'low';
	const tiers = ROLL_VALUES[name];
	if (!tiers) return 'low';
	const rolls = estimateRollCount(name, valueStr);
	const maxPossible = tiers[3] * rolls;
	const ratio = numVal / maxPossible;
	if (ratio >= 0.85) return 'high';
	if (ratio >= 0.65) return 'mid';
	return 'low';
}

const ROLL_QUALITY_COLORS = {
	high: 'text-emerald-400',
	mid: 'text-yellow-400',
	low: 'text-guild-muted',
};

// Get important substats for a character from build data, fallback to CRIT stats
function getImportantSubs(charName: string): string[] {
	const build = CHARACTER_BUILDS[charName];
	if (build) return build.substats;
	return ['CRIT Rate', 'CRIT DMG'];
}

interface ProfileClientProps {
	profile: EnkaProfile;
	rankings?: Record<string, AkashaCalculation>;
	source?: 'akasha' | 'enka';
}

export function ProfileClient({
	profile,
	rankings = {},
	source = 'enka',
}: ProfileClientProps) {
	const [selectedIdx, setSelectedIdx] = useState(0);
	const selected = profile.characters[selectedIdx];

	// Score artifacts
	const artifactScores = selected.artifacts.map(scoreArtifact);
	const overallScore = scoreCharacterBuild(selected);
	const avgScore =
		artifactScores.length > 0
			? artifactScores.reduce((a, b) => a + b, 0) / artifactScores.length
			: 0;
	const resin = estimateResin(avgScore);
	const tier = getTier(overallScore);
	// Deterministic seed: uid + character name → same roast on server and client
	const roast = getRoast(tier, `${profile.uid}-${selected.name}`);

	// Akasha leaderboard ranking for the selected character (if available)
	const ranking = rankings[selected.name];

	const importantSubs = getImportantSubs(selected.name);

	// Aggregate total rolls per substat across all artifacts
	const totalRolls: Record<string, { rolls: number; value: number; quality: 'high' | 'mid' | 'low' }> = {};
	for (const art of selected.artifacts) {
		for (const sub of art.substats) {
			const rolls = estimateRollCount(sub.name, sub.value);
			const numVal = parseFloat(sub.value);
			if (isNaN(numVal)) continue;
			if (!totalRolls[sub.name]) {
				totalRolls[sub.name] = { rolls: 0, value: 0, quality: 'low' };
			}
			totalRolls[sub.name].rolls += rolls;
			totalRolls[sub.name].value += numVal;
		}
	}
	// Calculate overall quality for each aggregated substat
	for (const [name, data] of Object.entries(totalRolls)) {
		const tiers = ROLL_VALUES[name];
		if (!tiers) continue;
		const maxPossible = tiers[3] * data.rolls;
		const ratio = data.value / maxPossible;
		data.quality = ratio >= 0.85 ? 'high' : ratio >= 0.65 ? 'mid' : 'low';
	}

	// Sort: important subs first, then by roll count
	const sortedRollEntries = Object.entries(totalRolls).sort(([aName, aData], [bName, bData]) => {
		const aImp = importantSubs.includes(aName) ? 0 : 1;
		const bImp = importantSubs.includes(bName) ? 0 : 1;
		if (aImp !== bImp) return aImp - bImp;
		return bData.rolls - aData.rolls;
	});

	return (
		<div className='max-w-5xl mx-auto space-y-6'>
			{/* Player Header */}
			<div className='guild-card p-6 space-y-3'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
					<div>
						<div className='flex items-center gap-3'>
							<h1 className='text-2xl sm:text-3xl font-bold'>
								{profile.player.nickname}
							</h1>
							{source === 'akasha' && (
								<span className='px-2 py-0.5 rounded text-[10px] font-semibold bg-guild-gold/15 text-guild-gold uppercase tracking-wider'>
									Akasha
								</span>
							)}
						</div>
						{profile.player.signature && (
							<p className='text-sm text-guild-muted mt-1 italic'>
								&quot;{profile.player.signature}&quot;
							</p>
						)}
					</div>
					<div className='flex gap-2'>
						<button className='h-9 px-4 rounded-md bg-guild-elevated hover:bg-white/10 text-sm flex items-center gap-2 transition-colors cursor-pointer'>
							<Share2 className='h-4 w-4' /> Share
						</button>
						<button className='h-9 px-4 rounded-md bg-guild-accent hover:bg-guild-accent/80 text-sm flex items-center gap-2 transition-colors cursor-pointer'>
							<Download className='h-4 w-4' /> Card
						</button>
					</div>
				</div>
				<div className='flex items-center gap-3 flex-wrap text-sm'>
					<span className='px-2.5 py-1 rounded-md bg-guild-elevated text-guild-accent font-semibold'>
						AR {profile.player.level}
					</span>
					<span className='px-2.5 py-1 rounded-md bg-guild-elevated text-guild-muted'>
						WL {profile.player.worldLevel}
					</span>
					<span className='px-2.5 py-1 rounded-md bg-guild-elevated font-mono text-guild-muted'>
						{profile.uid}
					</span>
					{profile.player.achievements && (
						<span className='px-2.5 py-1 rounded-md bg-guild-gold/10 text-guild-gold flex items-center gap-1.5 font-medium'>
							<TrophyIcon size={14} /> {profile.player.achievements}
						</span>
					)}
					{profile.player.abyssFloor && (
						<span className='px-2.5 py-1 rounded-md bg-guild-elevated text-guild-muted'>
							Abyss {profile.player.abyssFloor}-{profile.player.abyssChamber}
						</span>
					)}
				</div>
			</div>

			{/* Character Selector */}
			<div className='flex gap-3 overflow-x-auto pb-2'>
				{profile.characters.map((c, i) => {
					const charRanking = rankings[c.name];
					const topPct = charRanking && charRanking.outOf > 0
						? (charRanking.ranking / charRanking.outOf) * 100
						: null;
					const elBgSolid: Record<string, string> = {
						Hydro: 'bg-blue-500/40',
						Pyro: 'bg-red-500/40',
						Cryo: 'bg-cyan-500/40',
						Electro: 'bg-purple-500/40',
						Dendro: 'bg-green-500/40',
						Anemo: 'bg-teal-500/40',
						Geo: 'bg-yellow-500/40',
					};
					const elBgSubtle: Record<string, string> = {
						Hydro: 'from-blue-500/10',
						Pyro: 'from-red-500/10',
						Cryo: 'from-cyan-500/10',
						Electro: 'from-purple-500/10',
						Dendro: 'from-green-500/10',
						Anemo: 'from-teal-500/10',
						Geo: 'from-yellow-500/10',
					};
					return (
						<button
							key={c.id}
							onClick={() => setSelectedIdx(i)}
							className={cn(
								'flex flex-col items-center p-3 rounded-lg border transition-all min-w-20 cursor-pointer relative overflow-hidden',
								selectedIdx === i
									? 'bg-guild-accent/20 border-guild-accent/50 guild-glow'
									: 'bg-guild-card border-white/5 hover:border-white/10',
							)}
						>
							{/* Element background tint */}
							{selectedIdx === i && (
								<div className={cn(
									'absolute inset-0 bg-gradient-to-b to-transparent opacity-60',
									elBgSubtle[c.element] || 'from-gray-500/10',
								)} />
							)}
							<div className='relative z-10'>
								<div
									className={cn(
										'w-14 h-14 rounded-full overflow-hidden',
										c.rarity === 5
											? 'ring-2 ring-guild-gold/50'
											: 'ring-2 ring-guild-accent-2/50',
									)}
								>
									<FallbackImage
										src={`${ENKA_UI}/${c.sideIcon}.png`}
										alt={c.name}
										width={56}
										height={56}
									/>
								</div>
								{(() => {
									const EI = ELEMENT_ICONS[c.element];
									return EI ? (
										<div
											className={cn(
												'absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border border-white/10',
												elBgSolid[c.element] || 'bg-gray-500/40',
											)}
										>
											<EI size={12} />
										</div>
									) : null;
								})()}
							</div>
							<span className='text-xs mt-1.5 font-medium truncate w-full text-center relative z-10'>
								{c.name}
							</span>
							<span className='text-[10px] text-guild-muted flex items-center gap-0.5 relative z-10'>
								<ConstellationIcon size={10} /> {c.constellation}
							</span>
							{/* Top% badge */}
							{topPct !== null && (
								<span className={cn(
									'text-[9px] font-bold px-1.5 py-0.5 rounded mt-1 relative z-10',
									topPct <= 1
										? 'bg-guild-gold/20 text-guild-gold'
										: topPct <= 10
											? 'bg-green-500/20 text-green-400'
											: 'bg-guild-accent/15 text-guild-accent',
								)}>
									Top {topPct.toFixed(1)}%
								</span>
							)}
						</button>
					);
				})}
			</div>

			{/* Character Detail Card */}
			<div className='guild-card overflow-hidden'>
				<div className='flex flex-col lg:flex-row'>
					{/* Left: Character splash art */}
					<div
						className={cn(
							'relative lg:w-2/5 min-h-64 lg:min-h-[28rem] overflow-hidden',
							'bg-linear-to-br to-transparent',
							elBg[selected.element] || elBg.Unknown,
						)}
					>
						<Image
							src={charGachaUrl(selected.id)}
							alt={selected.name}
							fill
							className='object-cover object-[50%_15%]'
							sizes='(max-width: 1024px) 100vw, 40vw'
							unoptimized
						/>
						{/* Element-tinted overlay */}
						<div className={cn(
							'absolute inset-0 bg-linear-to-br opacity-40',
							elBg[selected.element] || elBg.Unknown,
						)} />
						<div className='absolute bottom-0 inset-x-0 p-5 bg-linear-to-t from-guild-card via-guild-card/60 to-transparent'>
							<div className='flex items-center gap-2'>
								<h2
									className={cn(
										'text-2xl font-bold drop-shadow-lg',
										elColor[selected.element] || elColor.Unknown,
									)}
								>
									{selected.name}
								</h2>
								{(() => {
									const EI = ELEMENT_ICONS[selected.element];
									return EI ? <EI size={22} /> : null;
								})()}
							</div>
							<p className='text-sm text-white/70 mt-0.5'>
								Lv.{selected.level} · C{selected.constellation} ·{' '}
								{selected.talents.join('/')}
							</p>
							<div className='text-sm text-guild-gold mt-1'>
								{'★'.repeat(selected.rarity)}
							</div>
						</div>
					</div>

					{/* Right: Stats panel */}
					<div className='flex-1 p-5 space-y-5'>
						{/* Weapon */}
						<div>
							<h3 className='text-xs font-medium text-guild-muted uppercase tracking-wider mb-2'>
								Weapon
							</h3>
							<div className='flex items-center gap-3 p-3 rounded-lg bg-guild-elevated border border-white/5'>
								{selected.weapon.icon && (
									<div className='w-12 h-12 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-guild-card'>
										<FallbackImage
											src={`${ENKA_UI}/${selected.weapon.icon}.png`}
											alt={selected.weapon.name}
											width={48}
											height={48}
										/>
									</div>
								)}
								<div className='flex-1 min-w-0'>
									<p className='font-semibold text-guild-gold truncate'>
										{selected.weapon.name}
									</p>
									<p className='text-xs text-guild-muted'>
										R{selected.weapon.refinement} · Lv.{selected.weapon.level} ·{' '}
										{'★'.repeat(selected.weapon.rarity)}
									</p>
								</div>
							</div>
						</div>

						{/* Combat Stats */}
						{selected.combatStats && (
							<div>
								<h3 className='text-xs font-medium text-guild-muted uppercase tracking-wider mb-2'>
									Combat Stats
								</h3>
								<div className='grid grid-cols-2 sm:grid-cols-3 gap-1.5'>
									<div className='flex items-center justify-between p-2 rounded-md bg-guild-elevated border border-white/5'>
										<span className='text-[11px] text-guild-muted'>Max HP</span>
										<span className='text-sm font-mono font-semibold text-white'>
											{selected.combatStats.maxHP.toLocaleString()}
										</span>
									</div>
									<div className='flex items-center justify-between p-2 rounded-md bg-guild-elevated border border-white/5'>
										<span className='text-[11px] text-guild-muted'>ATK</span>
										<span className='text-sm font-mono font-semibold text-white'>
											{selected.combatStats.atk.toLocaleString()}
										</span>
									</div>
									<div className='flex items-center justify-between p-2 rounded-md bg-guild-elevated border border-white/5'>
										<span className='text-[11px] text-guild-muted'>DEF</span>
										<span className='text-sm font-mono font-semibold text-white'>
											{selected.combatStats.def.toLocaleString()}
										</span>
									</div>
									<div className='flex items-center justify-between p-2 rounded-md bg-guild-elevated border border-white/5'>
										<span className='text-[11px] text-amber-400'>CRIT Rate</span>
										<span className='text-sm font-mono font-semibold text-amber-400'>
											{selected.combatStats.critRate.toFixed(1)}%
										</span>
									</div>
									<div className='flex items-center justify-between p-2 rounded-md bg-guild-elevated border border-white/5'>
										<span className='text-[11px] text-amber-400'>CRIT DMG</span>
										<span className='text-sm font-mono font-semibold text-amber-400'>
											{selected.combatStats.critDMG.toFixed(1)}%
										</span>
									</div>
									<div className='flex items-center justify-between p-2 rounded-md bg-guild-elevated border border-white/5'>
										<span className='text-[11px] text-green-400'>ER</span>
										<span className='text-sm font-mono font-semibold text-green-400'>
											{selected.combatStats.energyRecharge.toFixed(1)}%
										</span>
									</div>
									<div className='flex items-center justify-between p-2 rounded-md bg-guild-elevated border border-white/5'>
										<span className='text-[11px] text-teal-400'>EM</span>
										<span className='text-sm font-mono font-semibold text-teal-400'>
											{selected.combatStats.elementalMastery.toLocaleString()}
										</span>
									</div>
									{selected.combatStats.dmgBonus && (
										<div className='flex items-center justify-between p-2 rounded-md bg-guild-elevated border border-white/5 col-span-2'>
											<span className='text-[11px] text-guild-accent'>
												{selected.combatStats.dmgBonus.element} DMG
											</span>
											<span className='text-sm font-mono font-semibold text-guild-accent'>
												+{selected.combatStats.dmgBonus.value.toFixed(1)}%
											</span>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Akasha Ranking */}
						{ranking && (
							<div>
								<h3 className='text-xs font-medium text-guild-muted uppercase tracking-wider mb-2'>
									Akasha Leaderboard
								</h3>
								<div className='p-3 rounded-lg bg-guild-elevated border border-white/5 space-y-2'>
									<div className='flex items-center justify-between'>
										<span className='text-xs text-guild-muted flex items-center gap-1.5'>
											<Trophy size={12} className='text-guild-gold' />
											{ranking.name || 'Best Fit'}
										</span>
										<span
											className={cn(
												'text-xs font-bold px-2 py-0.5 rounded',
												ranking.outOf > 0 &&
													ranking.ranking / ranking.outOf <= 0.01
													? 'bg-guild-gold/20 text-guild-gold'
													: ranking.outOf > 0 &&
														  ranking.ranking / ranking.outOf <= 0.1
														? 'bg-green-500/20 text-green-400'
														: 'bg-guild-accent/20 text-guild-accent',
											)}
										>
											Top{' '}
											{ranking.outOf > 0
												? ((ranking.ranking / ranking.outOf) * 100).toFixed(1)
												: '?'}
											%
										</span>
									</div>
									<div className='flex items-center justify-between text-sm'>
										<span className='text-guild-muted font-mono'>
											#{ranking.ranking.toLocaleString()} /{' '}
											{ranking.outOf.toLocaleString()}
										</span>
										<span className='text-guild-gold font-mono font-bold'>
											{Math.round(ranking.result).toLocaleString()}
										</span>
									</div>
								</div>
							</div>
						)}

						{/* Artifact rows */}
						<div>
							<h3 className='text-xs font-medium text-guild-muted uppercase tracking-wider mb-2'>
								Artifacts
							</h3>
							<div className='grid grid-cols-1 gap-2'>
								{selected.artifacts.map((a, i) => {
									const s = artifactScores[i];
									const SI = SLOT_ICONS[a.slot];
									const pieceRoast = getPieceRoast(s, `${profile.uid}-${selected.name}-${a.slot}`);
									return (
										<div
											key={a.slot}
											className='rounded-lg bg-guild-elevated border border-white/5 overflow-hidden'
										>
											<div className='flex items-center gap-3 p-3'>
											{a.icon && (
												<div className='w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-guild-card border border-white/5'>
													<FallbackImage
														src={`${ENKA_UI}/${a.icon}.png`}
														alt={a.slot}
														width={48}
														height={48}
													/>
												</div>
											)}
											<div className='flex-1 min-w-0'>
												<div className='flex items-center gap-1.5'>
													{SI && (
														<SI
															size={12}
															className='text-guild-muted shrink-0'
														/>
													)}
													<span className='text-xs font-medium text-guild-gold truncate'>
														{a.mainStat}
													</span>
												</div>
												<div className='grid grid-cols-2 gap-x-3 gap-y-1.5 mt-1'>
													{a.substats.map((sub) => {
														const rolls = estimateRollCount(
															sub.name,
															sub.value,
														);
														const quality = rollQuality(sub.name, sub.value);
														const isImportant = importantSubs.includes(sub.name);
														return (
															<div
																key={sub.name}
																className={cn(
																	'flex flex-col',
																	isImportant
																		? 'text-white font-medium'
																		: ROLL_QUALITY_COLORS[quality],
																)}
															>
																<span className='text-xs flex items-center gap-1'>
																	{isImportant && (
																		<span className='w-1 h-1 rounded-full bg-guild-accent shrink-0' />
																	)}
																	{sub.name}{' '}
																	<span className='font-mono'>{sub.value}</span>
																</span>
																{/* Roll dots below the substat */}
																<span className='flex items-center gap-0.5 mt-0.5 ml-0.5'>
																	{Array.from({ length: Math.min(rolls, 6) }).map((_, dotIdx) => (
																		<span
																			key={dotIdx}
																			className={cn(
																				'w-1.5 h-1.5 rounded-full',
																				quality === 'high'
																					? 'bg-emerald-400'
																					: quality === 'mid'
																						? 'bg-yellow-400'
																						: 'bg-guild-dim',
																			)}
																		/>
																	))}
																</span>
															</div>
														);
													})}
												</div>
											</div>
											<div className='text-right shrink-0 space-y-0.5'>
												<span
													className={cn(
														'text-sm font-bold font-mono',
														scoreColor(s),
													)}
												>
													{grade(s)}
												</span>
												<div className='w-12 h-1.5 bg-white/5 rounded-full overflow-hidden'>
													<div
														className={cn('h-full rounded-full', barColor(s))}
														style={{ width: `${s}%` }}
													/>
												</div>
												{(() => {
													const cv = calculateCV(a.substats);
													return cv > 0 ? (
														<div className='text-[9px] text-guild-dim font-mono'>
															{cv.toFixed(1)} CV
														</div>
													) : null;
												})()}
												<div className='text-[9px] text-guild-dim font-mono'>
													~{estimateResinForPiece(s).resin}
												</div>
											</div>
											</div>
											{/* Per-piece roast for extreme pieces */}
											{pieceRoast && (
												<div className={cn(
													'text-[11px] italic px-3 pb-2',
													s <= 35 ? 'text-red-400/70' : 'text-emerald-400/70',
												)}>
													{pieceRoast}
												</div>
											)}
										</div>
									);
								})}
								{selected.artifacts.length === 0 && (
									<p className='text-sm text-guild-dim py-4 text-center'>
										No artifacts equipped
									</p>
								)}
							</div>

							{/* Total Roll Summary */}
							{sortedRollEntries.length > 0 && (
								<div className='mt-3 p-3 rounded-lg bg-guild-card border border-white/5'>
									<h4 className='text-[10px] font-medium text-guild-muted uppercase tracking-wider mb-2'>
										Total Rolls
									</h4>
									<div className='flex flex-wrap gap-x-4 gap-y-2'>
										{sortedRollEntries.map(([name, data]) => {
											const isImportant = importantSubs.includes(name);
											const isPercent = name.includes('%') || name === 'CRIT Rate' || name === 'CRIT DMG' || name === 'Energy Recharge';
											return (
												<div
													key={name}
													className={cn(
														'flex items-center gap-1.5 text-xs',
														isImportant
															? 'text-white font-medium'
															: 'text-guild-muted',
													)}
												>
													<span className={cn(
														'font-mono text-[11px] font-bold px-1 py-0.5 rounded',
														data.quality === 'high'
															? 'bg-emerald-500/20 text-emerald-400'
															: data.quality === 'mid'
																? 'bg-yellow-500/20 text-yellow-400'
																: 'bg-white/5 text-guild-dim',
													)}>
														x{data.rolls}
													</span>
													<span>{name}</span>
													<span className='font-mono text-guild-dim'>
														{data.value.toFixed(isPercent ? 1 : 0)}{isPercent ? '%' : ''}
													</span>
												</div>
											);
										})}
									</div>
								</div>
							)}

							{/* Recommended Substats */}
							{CHARACTER_BUILDS[selected.name] && (
								<div className='mt-2 flex items-center gap-2 flex-wrap'>
									<span className='text-[10px] font-medium text-guild-muted uppercase tracking-wider'>
										Priority:
									</span>
									{CHARACTER_BUILDS[selected.name].substats.map((sub, i) => (
										<span
											key={sub}
											className={cn(
												'text-[10px] px-1.5 py-0.5 rounded',
												i === 0
													? 'bg-guild-accent/20 text-guild-accent font-medium'
													: 'bg-white/5 text-guild-dim',
											)}
										>
											{sub}
										</span>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* BUILD IMPROVEMENT */}
			{selected.artifacts.length > 0 && CHARACTER_BUILDS[selected.name] && (() => {
				const build = CHARACTER_BUILDS[selected.name];
				// Analyze current sets
				const setCounts: Record<string, number> = {};
				for (const a of selected.artifacts) {
					setCounts[a.set] = (setCounts[a.set] || 0) + 1;
				}
				// Check if current sets match recommended
				const has4pc = Object.values(setCounts).some(c => c >= 4);
				const recSets = build.artifactSets;
				const matchedSets = recSets.filter(s => setCounts[s] && setCounts[s] >= 2);

				// Find weakest piece (lowest score)
				const weakestIdx = artifactScores.indexOf(Math.min(...artifactScores));
				const weakestArt = selected.artifacts[weakestIdx];

				// Check main stats for sands/goblet/circlet
				const mainStatIssues: { slot: string; current: string; recommended: string }[] = [];
				for (const a of selected.artifacts) {
					const slot = a.slot.toLowerCase();
					let rec: string | undefined;
					if (slot.includes('sands') || slot.includes('hourglass')) rec = build.mainStats.sands;
					else if (slot.includes('goblet') || slot.includes('cup')) rec = build.mainStats.goblet;
					else if (slot.includes('circlet') || slot.includes('crown') || slot.includes('hat')) rec = build.mainStats.circlet;
					if (rec) {
						const recOptions = rec.split('/').map(s => s.trim());
						const currentMain = a.mainStat.replace(/[0-9.%+]+/g, '').trim();
						const matches = recOptions.some(r => currentMain.toLowerCase().includes(r.toLowerCase()) || r.toLowerCase().includes(currentMain.toLowerCase()));
						if (!matches) {
							mainStatIssues.push({ slot: a.slot, current: a.mainStat, recommended: rec });
						}
					}
				}

				return (
					<div className='guild-card p-5 space-y-4'>
						<h3 className='text-sm font-bold flex items-center gap-2 text-guild-muted uppercase tracking-wider'>
							How to Improve
						</h3>

						{/* Set Analysis */}
						<div className='space-y-2'>
							<div className='text-xs text-guild-muted'>Current Sets</div>
							<div className='flex flex-wrap gap-2'>
								{Object.entries(setCounts).map(([set, count]) => {
									const isRec = recSets.includes(set);
									return (
										<span
											key={set}
											className={cn(
												'text-xs px-2 py-1 rounded border',
												isRec
													? 'bg-green-500/10 border-green-500/20 text-green-400'
													: 'bg-white/5 border-white/5 text-guild-muted',
											)}
										>
											{count}pc {set}
										</span>
									);
								})}
							</div>
							{matchedSets.length === 0 && (
								<p className='text-xs text-orange-400'>
									None of your sets match recommendations. Consider farming: {recSets.join(', ')}
								</p>
							)}
							{matchedSets.length > 0 && !has4pc && recSets.length === 1 && (
								<p className='text-xs text-yellow-400'>
									You have a 2pc {matchedSets[0]} but this character benefits from a full 4pc. Farm more pieces to complete the set.
								</p>
							)}
						</div>

						{/* Recommended Sets */}
						<div className='space-y-2'>
							<div className='text-xs text-guild-muted'>Recommended Sets</div>
							<div className='flex flex-wrap gap-2'>
								{recSets.map((set) => (
									<span
										key={set}
										className='text-xs px-2 py-1 rounded bg-guild-accent/10 border border-guild-accent/20 text-guild-accent'
									>
										{recSets.length === 1 ? '4pc' : '2pc'} {set}
									</span>
								))}
							</div>
						</div>

						{/* Main Stat Issues */}
						{mainStatIssues.length > 0 && (
							<div className='space-y-2'>
								<div className='text-xs text-orange-400 font-medium'>Main Stat Mismatches</div>
								{mainStatIssues.map((issue) => (
									<div key={issue.slot} className='text-xs flex items-center gap-2'>
										<span className='text-guild-muted'>{issue.slot}:</span>
										<span className='text-red-400 line-through'>{issue.current}</span>
										<span className='text-guild-dim'>→</span>
										<span className='text-green-400'>{issue.recommended}</span>
									</div>
								))}
							</div>
						)}

						{/* Weakest Piece */}
						{weakestArt && (
							<div className='p-3 rounded-lg bg-red-500/5 border border-red-500/10'>
								<div className='text-xs text-red-400 font-medium mb-1'>Weakest Piece</div>
								<div className='text-xs text-guild-muted'>
									<span className='text-white'>{weakestArt.slot}</span>
									{' '}— scored {artifactScores[weakestIdx]}/100 ({grade(artifactScores[weakestIdx])}).
									Replacing this piece would improve your build the most.
								</div>
							</div>
						)}

						{/* Main Stats Recommendation */}
						<div className='grid grid-cols-3 gap-2'>
							{(['sands', 'goblet', 'circlet'] as const).map((slot) => (
								<div key={slot} className='text-center p-2 rounded bg-white/5'>
									<div className='text-[10px] text-guild-muted uppercase'>{slot}</div>
									<div className='text-xs text-white font-medium mt-0.5'>
										{build.mainStats[slot]}
									</div>
								</div>
							))}
						</div>
					</div>
				);
			})()}

			{/* THE ROAST */}
			{selected.artifacts.length > 0 && (
				<div className='guild-card p-6 space-y-6 guild-glow'>
					<div className='flex items-center justify-between'>
						<h3 className='text-lg font-bold flex items-center gap-2'>
							<VerdictIcon className='text-orange-500' size={22} /> BUILD
							VERDICT
						</h3>
						<div className='flex items-center gap-2'>
							<span className='text-3xl font-bold font-mono'>
								{overallScore}
							</span>
							<span className='text-sm text-guild-muted'>/10</span>
							<span
								className={cn(
									'text-sm font-medium px-2 py-0.5 rounded',
									tierBadge[tier],
								)}
							>
								{getTierLabel(overallScore)}
							</span>
						</div>
					</div>

					<div className='bg-guild-elevated rounded-lg p-4 border border-white/5'>
						{roast.split('\n').map((line, i) => (
							<p
								key={i}
								className={cn(
									'text-lg italic leading-relaxed',
									i > 0 && 'mt-2 text-base text-guild-muted',
								)}
							>
								{i === 0 ? `"${line}` : line}
								{i === roast.split('\n').length - 1 ? '"' : ''}
							</p>
						))}
					</div>

					{/* Resin Estimate */}
					<div className='border-t border-white/5 pt-4 space-y-3'>
						<h4 className='text-sm font-medium text-guild-muted flex items-center gap-2'>
							<ResinIcon className='text-guild-muted' size={18} /> Resin Cost
							Estimate
						</h4>
						<div className='grid grid-cols-3 gap-3'>
							{(
								[
									{
										label: 'To match this build',
										data: resin.match,
										color: 'text-yellow-400',
									},
									{
										label: 'For a good build',
										data: resin.good,
										color: 'text-green-400',
									},
									{
										label: '95th percentile',
										data: resin.god,
										color: 'text-red-400',
									},
								] as const
							).map((r) => (
								<div
									key={r.label}
									className='bg-guild-elevated rounded-lg p-3 text-center'
								>
									<div className='text-xs text-guild-muted mb-1'>{r.label}</div>
									<div className={cn('text-lg font-bold font-mono', r.color)}>
										{r.data.resin.toLocaleString()}
									</div>
									<div className='text-xs text-guild-muted'>
										≈{r.data.days} days {r.label.includes('95') ? '💀' : ''}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
