'use client';

import {
	ResinIcon,
	SLOT_ICONS,
	VerdictIcon,
} from '@/components/icons/genshin-icons';
import { FallbackImage } from '@/components/shared';
import { ENKA_UI } from '@/lib/constants';
import type { EnkaProfile } from '@/lib/enka/client';
import {
	estimateResin,
	estimateResinForPiece,
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

import {
	TIER_COLORS,
	decomposeSubstatRolls,
	getImportantSubs,
} from './artifact-analysis';

type ProfileCharacter = EnkaProfile['characters'][number];

interface BuildEvaluationProps {
	selected: ProfileCharacter;
	artifactScores: number[];
	overallScore: number;
	tier: string;
	roast: string;
	resin: ReturnType<typeof estimateResin>;
	uid: string;
	importantSubs: string[];
}

export function BuildEvaluation({
	selected,
	artifactScores,
	overallScore,
	tier,
	roast,
	resin,
	uid,
	importantSubs,
}: BuildEvaluationProps) {
	return (
		<>
			{/* ROLL ANALYSIS -- per-piece substat roll breakdown */}
			{selected.artifacts.length > 0 && (
				<div className='guild-card p-6 space-y-5'>
					<h3 className='text-base font-bold text-guild-muted uppercase tracking-wider'>
						Roll Analysis
					</h3>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						{selected.artifacts.map((a, i) => {
							const SI = SLOT_ICONS[a.slot];
							return (
								<div
									key={a.slot}
									className='rounded-xl bg-guild-elevated border border-white/5 p-4 space-y-3'
								>
									{/* Piece header */}
									<div className='flex items-center gap-3'>
										{a.icon && (
											<div className='w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-guild-card border border-white/10'>
												<FallbackImage
													src={`${ENKA_UI}/${a.icon}.png`}
													alt={a.slot}
													width={40}
													height={40}
												/>
											</div>
										)}
										<div className='min-w-0 flex-1'>
											<div className='flex items-center gap-1.5'>
												{SI && <SI size={16} className='text-guild-muted shrink-0' />}
												<span className='text-sm font-semibold text-white truncate'>{a.slot}</span>
											</div>
											<div className='text-xs text-guild-dim truncate'>{a.set}</div>
										</div>
										<span className={cn('text-sm font-bold font-mono shrink-0', scoreColor(artifactScores[i]))}>
											{grade(artifactScores[i])}
										</span>
									</div>
									{/* Substat roll breakdown */}
									<div className='space-y-2.5'>
										{a.substats.map((sub) => {
											const rolls = decomposeSubstatRolls(sub.name, sub.value);
											const isImportant = importantSubs.includes(sub.name);
											return (
												<div key={sub.name} className='space-y-1'>
													<div className={cn(
														'text-sm flex items-center gap-1.5',
														isImportant ? 'text-white font-medium' : 'text-guild-muted',
													)}>
														{isImportant && (
															<span className='w-1.5 h-1.5 rounded-full bg-guild-accent shrink-0' />
														)}
														<span className='truncate'>{sub.name}</span>
														<span className='font-mono text-guild-dim ml-auto shrink-0'>{sub.value}</span>
													</div>
													<div className='flex items-center gap-1 flex-wrap'>
														{rolls.map((roll, rollIdx) => (
															<span
																key={rollIdx}
																className={cn(
																	'text-xs font-mono px-1.5 py-0.5 rounded-md font-semibold',
																	TIER_COLORS[roll.tier].bg,
																	TIER_COLORS[roll.tier].text,
																)}
															>
																{Number.isInteger(roll.value) ? roll.value : roll.value.toFixed(1)}
															</span>
														))}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
					{/* Legend */}
					<div className='flex items-center gap-4 text-xs text-guild-dim justify-center pt-1'>
						<span className='flex items-center gap-1.5'>
							<span className='w-2.5 h-2.5 rounded bg-emerald-500/40' /> Max
						</span>
						<span className='flex items-center gap-1.5'>
							<span className='w-2.5 h-2.5 rounded bg-blue-500/40' /> High
						</span>
						<span className='flex items-center gap-1.5'>
							<span className='w-2.5 h-2.5 rounded bg-amber-500/40' /> Mid
						</span>
						<span className='flex items-center gap-1.5'>
							<span className='w-2.5 h-2.5 rounded bg-red-500/40' /> Low
						</span>
					</div>
				</div>
			)}

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
				const mainStatIssues: { slot: string; current: string; recommended: string; icon?: string }[] = [];
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
							mainStatIssues.push({ slot: a.slot, current: a.mainStat, recommended: rec, icon: a.icon });
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
							{has4pc && matchedSets.length === 0 && (
								<p className='text-xs text-orange-400'>
									You have a 4pc set but it&apos;s not recommended for this character.
								</p>
							)}
							{recSets.length >= 2 && matchedSets.length === 1 && (
								<p className='text-xs text-yellow-400'>
									You have 2pc {matchedSets[0]} — pair it with 2pc {recSets.find(s => s !== matchedSets[0]) ?? recSets[1]} for the best combo.
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
								{recSets.length >= 2 && (
									<span className='text-[10px] text-guild-dim self-center'>
										(mix any two)
									</span>
								)}
							</div>
						</div>

						{/* Main Stat Issues */}
						{mainStatIssues.length > 0 && (
							<div className='space-y-2'>
								<div className='text-xs text-orange-400 font-medium'>Main Stat Mismatches</div>
								{mainStatIssues.map((issue) => (
									<div key={issue.slot} className='text-xs flex items-center gap-2'>
										{issue.icon && (
											<div className='w-5 h-5 rounded overflow-hidden shrink-0 bg-guild-card'>
												<FallbackImage
													src={`${ENKA_UI}/${issue.icon}.png`}
													alt={issue.slot}
													width={20}
													height={20}
												/>
											</div>
										)}
										<span className='text-guild-muted'>{issue.slot}:</span>
										<span className='text-red-400 line-through'>{issue.current}</span>
										<span className='text-guild-dim'>&rarr;</span>
										<span className='text-green-400'>{issue.recommended}</span>
									</div>
								))}
							</div>
						)}

						{/* Weakest Piece */}
						{weakestArt && (
							<div className='p-3 rounded-lg bg-red-500/5 border border-red-500/10'>
								<div className='text-xs text-red-400 font-medium mb-1'>Weakest Piece</div>
								<div className='text-xs text-guild-muted flex items-center gap-2'>
									{weakestArt.icon && (
										<div className='w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-guild-card border border-white/5'>
											<FallbackImage
												src={`${ENKA_UI}/${weakestArt.icon}.png`}
												alt={weakestArt.slot}
												width={32}
												height={32}
											/>
										</div>
									)}
									<div>
										<span className='text-white'>{weakestArt.slot}</span>
										{' '}— scored {artifactScores[weakestIdx]}/100 ({grade(artifactScores[weakestIdx])}).
										Replacing this piece would improve your build the most.
									</div>
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
					<div className='border-t border-white/5 pt-5 space-y-5'>
						<h4 className='text-base font-semibold text-guild-muted flex items-center gap-2'>
							<ResinIcon className='text-guild-muted' size={22} /> Resin Cost
							Estimate
						</h4>

						{/* Per-piece breakdown */}
						<div className='space-y-2'>
							{selected.artifacts.map((a, i) => {
								const s = artifactScores[i];
								const pieceResin = estimateResinForPiece(s);
								return (
									<div key={a.slot} className='flex items-center justify-between text-sm'>
										<div className='flex items-center gap-3 min-w-0'>
											{a.icon && (
												<div className='w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-guild-card border border-white/10'>
													<FallbackImage
														src={`${ENKA_UI}/${a.icon}.png`}
														alt={a.slot}
														width={28}
														height={28}
													/>
												</div>
											)}
											<span className='text-guild-muted truncate'>{a.slot}</span>
										</div>
										<div className='flex items-center gap-3'>
											<span className={cn(
												'font-mono font-semibold',
												scoreColor(s),
											)}>
												{grade(s)}
											</span>
											<span className='font-mono text-guild-dim w-16 text-right'>
												{pieceResin.resin.toLocaleString()}
											</span>
										</div>
									</div>
								);
							})}
							<div className='flex items-center justify-between text-sm border-t border-white/5 pt-2 mt-2'>
								<span className='text-white font-semibold'>Total</span>
								<span className='font-mono text-white font-bold w-16 text-right'>
									{selected.artifacts.reduce((sum, _, i) => sum + estimateResinForPiece(artifactScores[i]).resin, 0).toLocaleString()}
								</span>
							</div>
						</div>

						{/* Overall estimates */}
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
									className='bg-guild-elevated rounded-xl p-4 text-center'
								>
									<div className='text-sm text-guild-muted mb-1'>{r.label}</div>
									<div className={cn('text-xl font-bold font-mono', r.color)}>
										{r.data.resin.toLocaleString()}
									</div>
									<div className='text-sm text-guild-muted'>
										&asymp;{r.data.days} days
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
