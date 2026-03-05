'use client';

import {
	ConstellationIcon,
	ELEMENT_ICONS,
	ResinIcon,
	SLOT_ICONS,
	TrophyIcon,
	VerdictIcon,
} from '@/components/icons/genshin-icons';
import type { AkashaCalculation } from '@/lib/akasha/types';
import { ENKA_UI } from '@/lib/constants';
import type { EnkaProfile } from '@/lib/enka/client';
import {
	barColor,
	elBg,
	elColor,
	estimateResin,
	getRoast,
	getTier,
	getTierLabel,
	grade,
	pieceLabel,
	scoreArtifact,
	scoreCharacterBuild,
	scoreColor,
	tierBadge,
} from '@/lib/scoring';
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

// Crit-relevant substats for DPS characters
const CRIT_SUBS = ['CRIT Rate', 'CRIT DMG'];

// Character image with fallback for unknown/new characters
function CharImg({
	src,
	alt,
	size,
	className,
}: {
	src: string;
	alt: string;
	size: number;
	className?: string;
}) {
	const [err, setErr] = useState(false);
	if (err) {
		return (
			<div
				className={cn(
					'flex items-center justify-center bg-guild-elevated text-guild-muted font-bold',
					className,
				)}
				style={{ width: size, height: size }}
			>
				{alt[0]}
			</div>
		);
	}
	return (
		<Image
			src={src}
			alt={alt}
			width={size}
			height={size}
			className={cn('object-cover', className)}
			sizes={`${size}px`}
			onError={() => setErr(true)}
		/>
	);
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
				{profile.characters.map((c, i) => (
					<button
						key={c.id}
						onClick={() => setSelectedIdx(i)}
						className={cn(
							'flex flex-col items-center p-3 rounded-lg border transition-all min-w-20 cursor-pointer',
							selectedIdx === i
								? 'bg-guild-accent/20 border-guild-accent/50 guild-glow'
								: 'bg-guild-card border-white/5 hover:border-white/10',
						)}
					>
						<div className='relative'>
							<div
								className={cn(
									'w-14 h-14 rounded-full overflow-hidden',
									c.rarity === 5
										? 'ring-2 ring-guild-gold/50'
										: 'ring-2 ring-guild-accent-2/50',
								)}
							>
								<CharImg
									src={`${ENKA_UI}/${c.sideIcon}.png`}
									alt={c.name}
									size={56}
								/>
							</div>
							{(() => {
								const EI = ELEMENT_ICONS[c.element];
								const elBgSolid: Record<string, string> = {
									Hydro: 'bg-blue-500/40',
									Pyro: 'bg-red-500/40',
									Cryo: 'bg-cyan-500/40',
									Electro: 'bg-purple-500/40',
									Dendro: 'bg-green-500/40',
									Anemo: 'bg-teal-500/40',
									Geo: 'bg-yellow-500/40',
								};
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
						<span className='text-xs mt-1.5 font-medium truncate w-full text-center'>
							{c.name}
						</span>
						<span className='text-[10px] text-guild-muted flex items-center gap-0.5'>
							<ConstellationIcon size={10} /> {c.constellation}
						</span>
					</button>
				))}
			</div>

			{/* Character Detail Card */}
			<div className='guild-card overflow-hidden'>
				<div className='flex flex-col lg:flex-row'>
					{/* Left: Character splash art */}
					<div
						className={cn(
							'relative lg:w-2/5 min-h-64 lg:min-h-96 bg-linear-to-br to-transparent',
							elBg[selected.element] || elBg.Unknown,
						)}
					>
						<div className='absolute inset-0 flex items-center justify-center p-4'>
							<CharImg
								src={`${ENKA_UI}/${selected.icon}.png`}
								alt={selected.name}
								size={200}
								className='rounded-xl'
							/>
						</div>
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
										<CharImg
											src={`${ENKA_UI}/${selected.weapon.icon}.png`}
											alt={selected.weapon.name}
											size={48}
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
									return (
										<div
											key={a.slot}
											className='flex items-center gap-3 p-2.5 rounded-lg bg-guild-elevated border border-white/5'
										>
											{a.icon && (
												<div className='w-9 h-9 rounded overflow-hidden shrink-0 bg-guild-card'>
													<CharImg
														src={`${ENKA_UI}/${a.icon}.png`}
														alt={a.slot}
														size={36}
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
												<div className='flex flex-wrap gap-x-2.5 gap-y-0.5 mt-0.5'>
													{a.substats.map((sub) => {
														const rolls = estimateRollCount(
															sub.name,
															sub.value,
														);
														const quality = rollQuality(sub.name, sub.value);
														const isCrit = CRIT_SUBS.includes(sub.name);
														return (
															<span
																key={sub.name}
																className={cn(
																	'text-[10px]',
																	isCrit
																		? 'text-white font-medium'
																		: ROLL_QUALITY_COLORS[quality],
																)}
															>
																{sub.name}{' '}
																<span className='font-mono'>{sub.value}</span>
																{rolls > 1 && (
																	<span
																		className={cn(
																			'ml-0.5 text-[9px]',
																			quality === 'high'
																				? 'text-emerald-400'
																				: 'text-guild-dim',
																		)}
																	>
																		×{rolls}
																	</span>
																)}
															</span>
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
													let cv = 0;
													for (const sub of a.substats) {
														const v = parseFloat(sub.value);
														if (sub.name === 'CRIT Rate') cv += v * 2;
														else if (sub.name === 'CRIT DMG') cv += v;
													}
													return cv > 0 ? (
														<div className='text-[9px] text-guild-dim font-mono'>
															{cv.toFixed(1)} CV
														</div>
													) : null;
												})()}
											</div>
										</div>
									);
								})}
								{selected.artifacts.length === 0 && (
									<p className='text-sm text-guild-dim py-4 text-center'>
										No artifacts equipped
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* THE ROAST 🔥 */}
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

					{/* Per-piece bars */}
					<div className='space-y-2'>
						<h4 className='text-sm font-medium text-guild-muted'>
							Roll Quality
						</h4>
						{selected.artifacts.map((a, i) => {
							const s = artifactScores[i];
							const SI = SLOT_ICONS[a.slot];
							return (
								<div key={a.slot} className='flex items-center gap-3'>
									<span className='text-sm w-20 text-guild-muted flex items-center gap-1.5'>
										{SI && <SI size={14} />} {a.slot}
									</span>
									<div className='flex-1 h-2 bg-white/5 rounded-full overflow-hidden'>
										<div
											className={cn('h-full rounded-full', barColor(s))}
											style={{ width: `${s}%` }}
										/>
									</div>
									<span
										className={cn(
											'text-sm font-mono w-10 text-right',
											scoreColor(s),
										)}
									>
										{s}%
									</span>
									<span className='text-xs text-guild-muted w-16'>
										{pieceLabel(s)}
									</span>
								</div>
							);
						})}
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
