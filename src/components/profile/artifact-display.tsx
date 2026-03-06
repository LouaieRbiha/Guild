'use client';

import { Check, X } from 'lucide-react';

import {
	ResinIcon,
	SLOT_ICONS,
} from '@/components/icons/genshin-icons';
import { FallbackImage } from '@/components/shared';
import { ENKA_UI } from '@/lib/constants';
import type { EnkaProfile } from '@/lib/enka/client';
import { ALL_WEAPONS } from '@/lib/weapons';
import {
	barColor,
	calculateCV,
	estimateResinForPiece,
	getPieceRoast,
	grade,
	scoreColor,
} from '@/lib/scoring';
import { CHARACTER_BUILDS } from '@/data/character-builds';
import { cn } from '@/lib/utils';

import {
	ROLL_VALUES,
	estimateRollCount,
	rollQuality,
	ROLL_QUALITY_COLORS,
	getImportantSubs,
	calcSubstatEfficiency,
} from './artifact-analysis';

type ProfileCharacter = EnkaProfile['characters'][number];

interface ArtifactDisplayProps {
	selected: ProfileCharacter;
	artifactScores: number[];
	uid: string;
	importantSubs: string[];
}

export function ArtifactDisplay({
	selected,
	artifactScores,
	uid,
	importantSubs,
}: ArtifactDisplayProps) {
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
		<div>
			<h3 className='text-xs font-medium text-guild-muted uppercase tracking-wider mb-2'>
				Artifacts
			</h3>

			{/* Scoring basis: show what stats matter for this character */}
			{CHARACTER_BUILDS[selected.name] && (
				<div className='mb-3 p-2.5 rounded-lg bg-guild-card border border-white/5'>
					<div className='text-[10px] text-guild-muted uppercase tracking-wider mb-1.5'>
						Scoring based on
					</div>
					<div className='flex items-center gap-1.5 flex-wrap'>
						{CHARACTER_BUILDS[selected.name].substats.map((sub, i) => (
							<span
								key={sub}
								className={cn(
									'text-[11px] px-2 py-0.5 rounded',
									i === 0
										? 'bg-guild-accent/20 text-guild-accent font-medium border border-guild-accent/20'
										: i === 1
											? 'bg-white/10 text-white/80 font-medium'
											: 'bg-white/5 text-guild-dim',
								)}
							>
								{sub}
							</span>
						))}
						<span className='text-[10px] text-guild-dim ml-1'>+ Crit Value</span>
					</div>
				</div>
			)}

			{/* Build Checklist -- compare current vs recommended */}
			{CHARACTER_BUILDS[selected.name] && (() => {
				const build = CHARACTER_BUILDS[selected.name];
				const checks: { label: string; pass: boolean; detail: string }[] = [];

				// Weapon check
				const recWeaponIds = build.weaponIds || [];
				const recWeaponNames = recWeaponIds.map(id => ALL_WEAPONS.find(w => w.id === id)?.name).filter(Boolean);
				const weaponMatch = recWeaponNames.includes(selected.weapon.name);
				checks.push({
					label: 'Weapon',
					pass: weaponMatch,
					detail: weaponMatch ? selected.weapon.name : `${selected.weapon.name} (not recommended)`,
				});

				// Artifact set check
				const setCounts: Record<string, number> = {};
				for (const a of selected.artifacts) {
					setCounts[a.set] = (setCounts[a.set] || 0) + 1;
				}
				const recSets = build.artifactSets || [];
				const has4pc = Object.entries(setCounts).some(([s, c]) => c >= 4 && recSets.includes(s));
				const matched2pc = recSets.filter(s => setCounts[s] && setCounts[s] >= 2);
				const setPass = has4pc || matched2pc.length >= 2;
				checks.push({
					label: 'Artifact Set',
					pass: setPass,
					detail: setPass
						? Object.entries(setCounts).filter(([, c]) => c >= 2).map(([s, c]) => `${c}pc ${s}`).join(', ')
						: `No matching set (need ${recSets.join(' or ')})`,
				});

				// Main stat checks (sands, goblet, circlet)
				for (const a of selected.artifacts) {
					const slot = a.slot.toLowerCase();
					let rec: string | undefined;
					let slotLabel = '';
					if (slot.includes('sands') || slot.includes('hourglass')) { rec = build.mainStats.sands; slotLabel = 'Sands'; }
					else if (slot.includes('goblet') || slot.includes('cup')) { rec = build.mainStats.goblet; slotLabel = 'Goblet'; }
					else if (slot.includes('circlet') || slot.includes('crown') || slot.includes('hat')) { rec = build.mainStats.circlet; slotLabel = 'Circlet'; }
					if (rec && slotLabel) {
						const pass = a.mainStat === rec;
						checks.push({
							label: `${slotLabel} Main`,
							pass,
							detail: pass ? a.mainStat : `${a.mainStat} (want ${rec})`,
						});
					}
				}

				return (
					<div className='mb-3 p-3 rounded-lg bg-guild-card border border-white/5'>
						<div className='text-[10px] text-guild-muted uppercase tracking-wider mb-2'>
							Build Checklist
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-1.5'>
							{checks.map((c) => (
								<div key={c.label} className='flex items-center gap-2 text-xs'>
									{c.pass ? (
										<Check size={14} className='text-emerald-400 shrink-0' />
									) : (
										<X size={14} className='text-red-400 shrink-0' />
									)}
									<span className={cn(
										'font-medium shrink-0',
										c.pass ? 'text-emerald-400' : 'text-red-400',
									)}>
										{c.label}
									</span>
									<span className='text-guild-dim truncate'>{c.detail}</span>
								</div>
							))}
						</div>
					</div>
				);
			})()}

			<div className='grid grid-cols-1 gap-3'>
				{selected.artifacts.map((a, i) => {
					const s = artifactScores[i];
					const SI = SLOT_ICONS[a.slot];
					const pieceRoast = getPieceRoast(s, `${uid}-${selected.name}-${a.slot}`);
					return (
						<div
							key={a.slot}
							className='rounded-lg bg-guild-elevated border border-white/5 overflow-hidden'
						>
							<div className='flex items-start gap-4 p-4'>
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
									<span className='text-sm font-medium text-guild-gold truncate'>
										{a.mainStat}
									</span>
								</div>
								<div className='grid grid-cols-2 gap-x-4 gap-y-2.5 mt-2'>
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
							<div className='text-right shrink-0 space-y-1'>
								<span
									className={cn(
										'text-sm font-bold font-mono',
										scoreColor(s),
									)}
								>
									{grade(s)}
								</span>
								<div className='w-14 h-1.5 bg-white/5 rounded-full overflow-hidden'>
									<div
										className={cn('h-full rounded-full', barColor(s))}
										style={{ width: `${s}%` }}
									/>
								</div>
								{(() => {
									const cv = calculateCV(a.substats);
									return cv > 0 ? (
										<div className='text-[10px] text-guild-dim font-mono'>
											{cv.toFixed(1)} CV
										</div>
									) : null;
								})()}
								{(() => {
									const eff = calcSubstatEfficiency(a.substats);
									return (
										<div className={cn(
											'text-[10px] font-mono font-semibold',
											eff >= 85 ? 'text-emerald-400' : eff >= 70 ? 'text-blue-400' : eff >= 55 ? 'text-amber-400' : 'text-red-400',
										)}>
											{eff.toFixed(0)}% eff
										</div>
									);
								})()}
								<div className='text-xs text-guild-dim font-mono flex items-center gap-1 justify-end'>
									<ResinIcon size={12} className='text-guild-dim' />
									{estimateResinForPiece(s).resin.toLocaleString()}
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
		</div>
	);
}
