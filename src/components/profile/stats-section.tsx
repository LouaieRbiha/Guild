'use client';

import { Trophy } from 'lucide-react';

import { FallbackImage } from '@/components/shared';
import type { AkashaCalculation } from '@/lib/akasha/types';
import { ENKA_UI } from '@/lib/constants';
import type { EnkaProfile } from '@/lib/enka/client';
import { cn } from '@/lib/utils';

type ProfileCharacter = EnkaProfile['characters'][number];

interface StatsSectionProps {
	selected: ProfileCharacter;
	ranking?: AkashaCalculation;
}

export function StatsSection({
	selected,
	ranking,
}: StatsSectionProps) {
	return (
		<>
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
			{ranking && (() => {
				const topPct = ranking.outOf > 0 ? (ranking.ranking / ranking.outOf) * 100 : null;
				const pctColor = topPct !== null && topPct <= 1
					? 'text-guild-gold'
					: topPct !== null && topPct <= 10
						? 'text-green-400'
						: 'text-guild-accent';
				const pctBg = topPct !== null && topPct <= 1
					? 'bg-guild-gold/20'
					: topPct !== null && topPct <= 10
						? 'bg-green-500/20'
						: 'bg-guild-accent/20';
				const barClr = topPct !== null && topPct <= 1
					? 'bg-guild-gold'
					: topPct !== null && topPct <= 10
						? 'bg-green-500'
						: 'bg-guild-accent';
				return (
					<div>
						<h3 className='text-xs font-medium text-guild-muted uppercase tracking-wider mb-2'>
							Akasha Leaderboard
						</h3>
						<div className='p-4 rounded-xl bg-guild-elevated border border-white/5 space-y-3'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-2'>
									<Trophy size={18} className='text-guild-gold' />
									<span className='text-sm font-medium text-white'>{ranking.name || 'Best Fit'}</span>
								</div>
								<span className={cn('text-lg font-bold px-3 py-1 rounded-lg', pctBg, pctColor)}>
									Top {topPct !== null ? topPct.toFixed(1) : '?'}%
								</span>
							</div>
							{/* Progress bar */}
							{topPct !== null && (
								<div className='relative h-3 bg-white/5 rounded-full overflow-hidden'>
									<div
										className={cn('absolute inset-y-0 left-0 rounded-full transition-all', barClr)}
										style={{ width: `${Math.max(2, 100 - topPct)}%` }}
									/>
								</div>
							)}
							<div className='flex items-center justify-between'>
								<span className='text-sm text-guild-muted font-mono'>
									#{ranking.ranking.toLocaleString()} / {ranking.outOf.toLocaleString()}
								</span>
								<span className='text-lg text-guild-gold font-mono font-bold'>
									{Math.round(ranking.result).toLocaleString()}
								</span>
							</div>
						</div>
					</div>
				);
			})()}
		</>
	);
}
