'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import {
	ConstellationIcon,
	ELEMENT_ICONS,
} from '@/components/icons/genshin-icons';
import { FallbackImage } from '@/components/shared';
import type { AkashaCalculation } from '@/lib/akasha/types';
import { ENKA_UI } from '@/lib/constants';
import type { EnkaProfile } from '@/lib/enka/client';
import { cn } from '@/lib/utils';

interface CharacterSelectorProps {
	characters: EnkaProfile['characters'];
	selectedIdx: number;
	setSelectedIdx: (idx: number | ((prev: number) => number)) => void;
	rankings: Record<string, AkashaCalculation>;
}

export function CharacterSelector({
	characters,
	selectedIdx,
	setSelectedIdx,
	rankings,
}: CharacterSelectorProps) {
	return (
		<div className='flex gap-3 overflow-x-auto pb-2'>
			{characters.length > 1 && (
				<button
					onClick={() => setSelectedIdx((prev: number) => (prev > 0 ? prev - 1 : characters.length - 1))}
					className='self-center shrink-0 w-8 h-8 rounded-full bg-guild-elevated border border-white/5 flex items-center justify-center text-guild-muted hover:text-white hover:border-white/20 transition-colors'
					aria-label='Previous character'
				>
					<ChevronLeft size={16} />
				</button>
			)}
			{characters.map((c, i) => {
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
			{characters.length > 1 && (
				<button
					onClick={() => setSelectedIdx((prev: number) => (prev < characters.length - 1 ? prev + 1 : 0))}
					className='self-center shrink-0 w-8 h-8 rounded-full bg-guild-elevated border border-white/5 flex items-center justify-center text-guild-muted hover:text-white hover:border-white/20 transition-colors'
					aria-label='Next character'
				>
					<ChevronRight size={16} />
				</button>
			)}
		</div>
	);
}
