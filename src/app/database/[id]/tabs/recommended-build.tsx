'use client';

import { SLOT_ICONS } from '@/components/icons/genshin-icons';
import { Badge } from '@/components/ui/badge';
import { CHARACTER_BUILDS } from '@/data/character-builds';
import { ALL_WEAPONS } from '@/lib/weapons';
import {
	ALL_CHARACTERS,
	CharacterEntry,
	charIconUrl,
} from '@/lib/characters';
import { weaponIconUrl } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { CharacterDetail } from '@/lib/yatta/client';
import Image from 'next/image';
import Link from 'next/link';
import { type ElementColors } from './detail-helpers';

export function RecommendedBuildSection({
	detail,
	colors,
}: {
	detail: CharacterDetail;
	colors: ElementColors;
}) {
	const build = CHARACTER_BUILDS[detail.name];
	if (!build) return null;

	const findCharEntry = (name: string): CharacterEntry | undefined =>
		ALL_CHARACTERS.find((c) => c.name === name);

	const weapons = build.weaponIds
		.map((id) => ALL_WEAPONS.find((w) => w.id === id))
		.filter(Boolean);

	return (
		<div className='space-y-4'>
			<div className='space-y-2'>
				<h2 className='text-2xl font-bold text-foreground flex items-center gap-3'>
					<span className={colors.text}>&#9733;</span> Recommended Build
				</h2>
				<div className={`h-0.5 rounded-full ${colors.bg}`} />
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				{/* Best Weapons */}
				<div className='guild-card overflow-hidden p-0'>
					<div
						className={cn(
							'px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide',
							colors.bg,
							colors.text,
						)}
					>
						Best Weapons
					</div>
					<div className='p-4'>
						<div className='space-y-3'>
							{weapons.map((w, i) => {
								if (!w) return null;
								return (
									<Link
										key={w.id}
										href={`/weapons/${w.id}`}
										className='flex items-center gap-3 group'
									>
										<div className='relative'>
											<Image
												src={weaponIconUrl(w.id)}
												alt={w.name}
												width={48}
												height={48}
												className='rounded-lg bg-guild-elevated border border-guild-border group-hover:border-guild-accent/50 transition-colors'
												sizes='48px'
												quality={100}
											/>
											{i === 0 && (
												<div className='absolute -top-1 -left-1 w-4 h-4 rounded-full bg-guild-gold flex items-center justify-center text-[8px] font-bold text-black'>
													1
												</div>
											)}
										</div>
										<div className='flex-1 min-w-0'>
											<p className='text-sm font-medium text-foreground group-hover:text-guild-accent transition-colors truncate'>
												{w.name}
											</p>
											<p className='text-xs text-guild-muted'>
												{w.rarity}&#9733; {w.type} &middot;{' '}
												{w.substat}
											</p>
										</div>
										{i === 0 && (
											<Badge
												className={cn(
													'text-[10px] shrink-0',
													colors.bg,
													colors.text,
												)}
											>
												Best
											</Badge>
										)}
									</Link>
								);
							})}
						</div>
					</div>
				</div>

				{/* Artifact Sets */}
				<div className='guild-card overflow-hidden p-0'>
					<div
						className={cn(
							'px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide',
							colors.bg,
							colors.text,
						)}
					>
						Artifact Sets
					</div>
					<div className='p-4'>
						<div className='space-y-2'>
							{build.artifactSets.map((set, i) => (
								<div key={i} className='flex items-center gap-2'>
									<span
										className={cn(
											'text-xs font-bold w-5',
											colors.text,
										)}
									>
										{i + 1}.
									</span>
									<span className='text-sm text-foreground'>{set}</span>
									{i === 0 && (
										<Badge
											className={cn(
												'text-[10px] ml-auto',
												colors.bg,
												colors.text,
											)}
										>
											Best
										</Badge>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Main Stats + Substats side by side */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{/* Main Stats */}
				<div className='guild-card overflow-hidden p-0'>
					<div
						className={cn(
							'px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide',
							colors.bg,
							colors.text,
						)}
					>
						Main Stats
					</div>
					<div className='p-4 space-y-2'>
						{(
							[
								{
									slot: 'Sands' as const,
									value: build.mainStats.sands,
								},
								{
									slot: 'Goblet' as const,
									value: build.mainStats.goblet,
								},
								{
									slot: 'Circlet' as const,
									value: build.mainStats.circlet,
								},
							] as const
						).map(({ slot, value }) => {
							const SI = SLOT_ICONS[slot];
							return (
								<div key={slot} className='flex items-center gap-2'>
									{SI && (
										<SI
											size={16}
											className='text-guild-muted shrink-0'
										/>
									)}
									<span className='text-xs text-guild-muted w-14'>
										{slot}
									</span>
									<span className='text-sm font-medium text-foreground'>
										{value}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* Substats */}
				<div className='guild-card overflow-hidden p-0'>
					<div
						className={cn(
							'px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide',
							colors.bg,
							colors.text,
						)}
					>
						Substat Priority
					</div>
					<div className='p-4'>
						<div className='space-y-1.5'>
							{build.substats.map((sub, i) => (
								<div key={i} className='flex items-center gap-2'>
									<span
										className={cn(
											'text-xs font-bold w-5',
											colors.text,
										)}
									>
										{i + 1}.
									</span>
									<span className='text-sm text-foreground'>{sub}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Team Comps */}
			<div className='guild-card overflow-hidden p-0'>
				<div
					className={cn(
						'px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide',
						colors.bg,
						colors.text,
					)}
				>
					Example Teams
				</div>
				<div className='p-4 space-y-4'>
					{build.teams.map((team, i) => (
						<div key={i} className='flex items-center gap-4'>
							<div className='flex items-center gap-1'>
								{team.map((member, j) => {
									const entry = findCharEntry(member);
									return entry ? (
										<Link
											key={j}
											href={`/database/${entry.id}`}
										>
											<div className='w-10 h-10 rounded-lg overflow-hidden border border-guild-border bg-guild-elevated hover:border-guild-accent/50 transition-colors'>
												<Image
													src={charIconUrl(entry.id)}
													alt={member}
													width={40}
													height={40}
													className='object-cover'
													sizes='40px'
												/>
											</div>
										</Link>
									) : (
										<div
											key={j}
											className='w-10 h-10 rounded-lg bg-guild-elevated border border-guild-border flex items-center justify-center text-[10px] text-guild-muted'
										>
											{member.slice(0, 2)}
										</div>
									);
								})}
							</div>
							<div className='flex-1 min-w-0'>
								<p className='text-xs text-foreground font-medium truncate'>
									{team.join(' / ')}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Notes */}
			{build.notes && (
				<div
					className={cn(
						'guild-card p-4 border-l-4',
						colors.border,
					)}
				>
					<p className='text-sm text-foreground/90 italic leading-relaxed'>
						{build.notes}
					</p>
				</div>
			)}
		</div>
	);
}
