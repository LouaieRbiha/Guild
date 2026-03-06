'use client';

import {
	ChevronLeft,
	ChevronRight,
	Swords,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { PrimogemIcon } from '@/components/icons/genshin-icons';
import { Countdown, ElementBadge, RarityStars } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { ActiveBanners, BannerWeaponInfo } from '@/lib/banners/types';
import type { CharacterEntry } from '@/types';
import { charGachaUrl, charIconUrl } from '@/lib/characters';
import { weaponIconUrl } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { parseBannerDate } from './banner-helpers';

interface BannerSectionProps {
	banners: ActiveBanners;
	featured5StarChars: CharacterEntry[];
	featured4StarChars: CharacterEntry[];
	featured5StarWeapons: BannerWeaponInfo[];
}

export function BannerSection({
	banners,
	featured5StarChars,
	featured4StarChars,
	featured5StarWeapons,
}: BannerSectionProps) {
	const [activeBannerIdx, setActiveBannerIdx] = useState(0);
	const [activeCharIdx, setActiveCharIdx] = useState(0);
	const [activeWeaponIdx, setActiveWeaponIdx] = useState(0);

	const charBanner = banners.character;
	const weaponBanner = banners.weapon;
	const bannerEndDate = charBanner ? parseBannerDate(charBanner.end) : null;
	const bannerCount = (charBanner ? 1 : 0) + (weaponBanner ? 1 : 0);

	// Auto-rotate banners on mobile every 6 seconds
	const nextBanner = useCallback(() => {
		if (bannerCount > 1) setActiveBannerIdx((i) => (i + 1) % bannerCount);
	}, [bannerCount]);

	useEffect(() => {
		if (bannerCount <= 1) return;
		const timer = setInterval(nextBanner, 6000);
		return () => clearInterval(timer);
	}, [bannerCount, nextBanner]);

	// Auto-rotate featured 5-star characters every 5 seconds
	useEffect(() => {
		if (featured5StarChars.length <= 1) return;
		const timer = setInterval(() => {
			setActiveCharIdx((i) => (i + 1) % featured5StarChars.length);
		}, 5000);
		return () => clearInterval(timer);
	}, [featured5StarChars.length]);

	// Auto-rotate featured 5-star weapons every 5 seconds (independent timer)
	useEffect(() => {
		if (featured5StarWeapons.length <= 1) return;
		const timer = setInterval(() => {
			setActiveWeaponIdx((i) => (i + 1) % featured5StarWeapons.length);
		}, 5000);
		return () => clearInterval(timer);
	}, [featured5StarWeapons.length]);

	return (
		<section className='px-6 pb-12'>
			<div className='max-w-6xl mx-auto space-y-4'>
				<div className='flex items-center justify-between'>
					<h2 className='text-xl font-bold'>Active Banners</h2>
					{charBanner?.version && (
						<Badge
							variant='outline'
							className='text-guild-accent border-guild-accent/30'
						>
							v{charBanner.version}
						</Badge>
					)}
				</div>

				{/* Desktop: side by side. Mobile: carousel with rotation */}
				<div className='relative'>
					{/* Desktop layout - both visible */}
					<div className='hidden md:grid md:grid-cols-2 gap-4'>
						{/* Character Banner Card */}
						{charBanner ? (
							<Card className='overflow-hidden relative min-h-96 border-guild-border/50 p-0 gap-0'>
								{/* Background splash art -- crossfade between featured chars */}
								{featured5StarChars.map((char, idx) => {
									const url = charGachaUrl(char.id);
									return (
										<Image
											key={char.id}
											src={url}
											alt={char.name}
											fill
											quality={100}
											className={cn(
												'object-cover object-top transition-opacity duration-700',
												idx === activeCharIdx ? 'opacity-80' : 'opacity-0',
											)}
											sizes='(max-width: 768px) 100vw, 50vw'
											priority={idx === 0}
										/>
									);
								})}
								<div className='absolute inset-0 bg-linear-to-t from-card via-card/40 to-transparent' />

								<div className='relative z-10 p-6 flex flex-col justify-between h-full min-h-96'>
									{/* Top label + version */}
									<div className='flex items-center justify-between'>
										<span className='text-sm text-guild-muted drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]'>
											Character Event Wish
										</span>
										{charBanner.version && (
											<Badge className='bg-guild-accent/20 text-guild-accent border-guild-accent/30'>
												v{charBanner.version}
											</Badge>
										)}
									</div>

									{/* Featured 5-star names + element badges */}
									<div className='space-y-2 my-auto py-6'>
										{featured5StarChars.length > 0
											? featured5StarChars.map((char, idx) => (
													<Link
														key={char.id}
														href={`/database/${char.id}`}
														className='flex items-center gap-3 group/name'
													>
														<h3
															className={cn(
																'text-2xl font-bold transition-all duration-500 group-hover/name:text-guild-accent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]',
																idx === activeCharIdx
																	? 'text-foreground scale-105 origin-left'
																	: 'text-foreground/50',
															)}
														>
															{char.name}
														</h3>
														<ElementBadge element={char.element} />
													</Link>
												))
											: charBanner.featured5Star.map((name) => (
													<h3 key={name} className='text-2xl font-bold'>
														{name}
													</h3>
												))}
										{/* Navigation dots */}
										{featured5StarChars.length > 1 && (
											<div className='flex items-center gap-1.5 pt-2'>
												{featured5StarChars.map((char, idx) => (
													<button
														key={char.id}
														onClick={() => setActiveCharIdx(idx)}
														className={cn(
															'h-1.5 rounded-full transition-all duration-300',
															idx === activeCharIdx
																? 'w-5 bg-guild-accent'
																: 'w-1.5 bg-foreground/25 hover:bg-foreground/40',
														)}
													/>
												))}
											</div>
										)}
									</div>

									{/* Bottom: 4-star icons (left) + countdown (right) */}
									<div className='flex items-end justify-between gap-4'>
										<div className='flex items-center gap-2 flex-wrap'>
											{featured4StarChars.map((char) => (
												<Link
													key={char.id}
													href={`/database/${char.id}`}
													className='flex items-center gap-1.5 group/four hover:opacity-90 transition-opacity'
												>
													<div className='w-8 h-8 rounded-full overflow-hidden border border-guild-border relative shrink-0'>
														<Image
															src={charIconUrl(char.id)}
															alt={char.name}
															fill
															className='object-cover'
															sizes='32px'
														/>
													</div>
													<span className='text-xs text-guild-muted hidden sm:inline group-hover/four:text-foreground transition-colors'>
														{char.name}
													</span>
												</Link>
											))}
										</div>

										{bannerEndDate && (
											<div className='space-y-1'>
												<Countdown target={bannerEndDate} label='Ends in' />
												<div className='text-[10px] text-guild-dim text-right'>
													{bannerEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
												</div>
											</div>
										)}
									</div>
								</div>
							</Card>
						) : (
							<Card className='overflow-hidden relative min-h-80 border-guild-border/50 p-0 gap-0'>
								<div className='absolute inset-0 bg-linear-to-br from-guild-accent/10 via-card to-guild-accent-2/10' />
								<div className='relative z-10 flex flex-col items-center justify-center h-full min-h-80 gap-3'>
									<PrimogemIcon className='text-guild-muted' size={40} />
									<p className='text-guild-muted font-medium'>
										No Active Character Banner
									</p>
									<p className='text-guild-dim text-sm'>
										Check back when a new banner drops
									</p>
								</div>
							</Card>
						)}

						{/* Weapon Banner Card */}
						{weaponBanner ? (
							<Card className='overflow-hidden relative min-h-96 border-guild-border/50 p-0 gap-0'>
								{/* Gradient background */}
								<div className='absolute inset-0 bg-linear-to-br from-guild-accent/10 via-card to-guild-accent-2/10' />

								{/* Large weapon splash art -- crossfade between featured weapons */}
								{featured5StarWeapons.length > 0 && (
									<div className='absolute inset-0 flex items-center justify-end pr-4 overflow-hidden'>
										{featured5StarWeapons.map((weapon, idx) => (
											<Image
												key={weapon.id}
												src={weaponIconUrl(weapon.id)}
												alt={weapon.name}
												width={180}
												height={360}
												className={cn(
													'absolute object-contain max-h-[85%] transition-opacity duration-700 drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]',
													idx === activeWeaponIdx
														? 'opacity-80'
														: 'opacity-0',
												)}
												sizes='180px'
												priority={idx === 0}
											/>
										))}
									</div>
								)}

								{/* Light gradient overlay for text readability */}
								<div className='absolute inset-0 bg-linear-to-r from-card via-card/60 to-transparent' />

								<div className='relative z-10 p-6 flex flex-col justify-between h-full min-h-96'>
									{/* Top label + version */}
									<div className='flex items-center justify-between'>
										<span className='text-sm text-guild-muted drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'>
											Epitome Invocation
										</span>
										{weaponBanner.version && (
											<Badge className='bg-guild-accent-2/20 text-guild-accent-2 border-guild-accent-2/30'>
												v{weaponBanner.version}
											</Badge>
										)}
									</div>

									{/* Featured 5-star weapons with icons + rarity */}
									<div className='space-y-3 my-auto py-6'>
										{featured5StarWeapons.length > 0
											? featured5StarWeapons.map((weapon, idx) => (
													<Link
														key={weapon.id}
														href={`/weapons/${weapon.id}`}
														className='flex items-center gap-4 group/wname hover:opacity-90 transition-opacity'
													>
														<Image
															src={weaponIconUrl(weapon.id)}
															alt={weapon.name}
															width={56}
															height={56}
															className={cn(
																'object-contain transition-opacity duration-500 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]',
																idx === activeWeaponIdx
																	? 'opacity-100'
																	: 'opacity-40',
															)}
															sizes='56px'
														/>
														<div>
															<h3
																className={cn(
																	'text-xl font-bold transition-all duration-500 group-hover/wname:text-guild-accent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]',
																	idx === activeWeaponIdx
																		? 'text-foreground'
																		: 'text-foreground/50',
																)}
															>
																{weapon.name}
															</h3>
															<RarityStars rarity={weapon.rarity} size='xs' />
														</div>
													</Link>
												))
											: weaponBanner.featured5Star.map((name) => (
													<h3
														key={name}
														className='text-xl font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'
													>
														{name}
													</h3>
												))}
										{/* Navigation dots */}
										{featured5StarWeapons.length > 1 && (
											<div className='flex items-center gap-1.5 pt-2'>
												{featured5StarWeapons.map((weapon, idx) => (
													<button
														key={weapon.id}
														onClick={() => setActiveWeaponIdx(idx)}
														className={cn(
															'h-1.5 rounded-full transition-all duration-300',
															idx === activeWeaponIdx
																? 'w-5 bg-guild-accent-2'
																: 'w-1.5 bg-foreground/25 hover:bg-foreground/40',
														)}
													/>
												))}
											</div>
										)}
									</div>

									{/* Bottom: label + countdown */}
									<div className='flex items-end justify-between'>
										<span className='text-sm text-guild-muted drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'>
											Weapon Event Wish
										</span>
										<div className='space-y-1'>
											<Countdown
												target={parseBannerDate(weaponBanner.end)}
												label='Ends in'
											/>
											<div className='text-[10px] text-guild-dim text-right'>
												{parseBannerDate(weaponBanner.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
											</div>
										</div>
									</div>
								</div>
							</Card>
						) : (
							<Card className='overflow-hidden relative min-h-80 border-guild-border/50 p-0 gap-0'>
								<div className='absolute inset-0 bg-linear-to-br from-guild-accent-2/10 via-card to-guild-accent/10' />
								<div className='relative z-10 flex flex-col items-center justify-center h-full min-h-80 gap-3'>
									<Swords className='text-guild-muted' size={40} />
									<p className='text-guild-muted font-medium'>
										No Active Weapon Banner
									</p>
									<p className='text-guild-dim text-sm'>
										Check back when a new banner drops
									</p>
								</div>
							</Card>
						)}
					</div>

					{/* Mobile layout - carousel with rotation */}
					<div className='md:hidden relative'>
						<div className='overflow-hidden rounded-xl'>
							{activeBannerIdx === 0 && charBanner ? (
								<Card className='overflow-hidden relative min-h-96 border-guild-border/50 p-0 gap-0'>
									{featured5StarChars.map((char, idx) => {
										const url = charGachaUrl(char.id);
										return (
											<Image
												key={char.id}
												src={url}
												alt={char.name}
												fill
												quality={100}
												className={cn(
													'object-cover object-top transition-opacity duration-700',
													idx === activeCharIdx ? 'opacity-80' : 'opacity-0',
												)}
												sizes='100vw'
											/>
										);
									})}
									<div className='absolute inset-0 bg-linear-to-t from-card via-card/40 to-transparent' />
									<div className='relative z-10 p-6 flex flex-col justify-between h-full min-h-96'>
										<div className='flex items-center justify-between'>
											<span className='text-sm text-guild-muted'>
												Character Event Wish
											</span>
											{charBanner.version && (
												<Badge className='bg-guild-accent/20 text-guild-accent border-guild-accent/30'>
													v{charBanner.version}
												</Badge>
											)}
										</div>
										<div className='space-y-2 my-auto py-6'>
											{featured5StarChars.map((char, idx) => (
												<Link
													key={char.id}
													href={`/database/${char.id}`}
													className='flex items-center gap-3'
												>
													<h3
														className={cn(
															'text-2xl font-bold transition-all duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]',
															idx === activeCharIdx
																? 'text-foreground scale-105 origin-left'
																: 'text-foreground/50',
														)}
													>
														{char.name}
													</h3>
													<ElementBadge element={char.element} />
												</Link>
											))}
											{featured5StarChars.length > 1 && (
												<div className='flex items-center gap-1.5 pt-2'>
													{featured5StarChars.map((char, idx) => (
														<button
															key={char.id}
															onClick={() => setActiveCharIdx(idx)}
															className={cn(
																'h-1.5 rounded-full transition-all duration-300',
																idx === activeCharIdx
																	? 'w-5 bg-guild-accent'
																	: 'w-1.5 bg-foreground/25 hover:bg-foreground/40',
															)}
														/>
													))}
												</div>
											)}
										</div>
										<div className='flex items-end justify-between gap-4'>
											<div className='flex items-center gap-2 flex-wrap'>
												{featured4StarChars.map((char) => (
													<Link
														key={char.id}
														href={`/database/${char.id}`}
														className='flex items-center gap-1.5'
													>
														<div className='w-8 h-8 rounded-full overflow-hidden border border-guild-border relative shrink-0'>
															<Image
																src={charIconUrl(char.id)}
																alt={char.name}
																fill
																className='object-cover'
																sizes='32px'
															/>
														</div>
													</Link>
												))}
											</div>
											{bannerEndDate && (
												<Countdown target={bannerEndDate} label='Ends in' />
											)}
										</div>
									</div>
								</Card>
							) : weaponBanner ? (
								<Card className='overflow-hidden relative min-h-96 border-guild-border/50 p-0 gap-0'>
									<div className='absolute inset-0 bg-linear-to-br from-guild-accent/10 via-card to-guild-accent-2/10' />
									{featured5StarWeapons.length > 0 && (
										<div className='absolute inset-0 flex items-center justify-end pr-2 overflow-hidden'>
											{featured5StarWeapons.map((weapon, idx) => (
												<Image
													key={weapon.id}
													src={weaponIconUrl(weapon.id)}
													alt={weapon.name}
													width={140}
													height={280}
													className={cn(
														'absolute object-contain max-h-[85%] transition-opacity duration-700 drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]',
														idx === activeWeaponIdx
															? 'opacity-80'
															: 'opacity-0',
													)}
													sizes='140px'
												/>
											))}
										</div>
									)}
									<div className='absolute inset-0 bg-linear-to-r from-card via-card/60 to-transparent' />
									<div className='relative z-10 p-6 flex flex-col justify-between h-full min-h-96'>
										<div className='flex items-center justify-between'>
											<span className='text-sm text-guild-muted drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'>
												Epitome Invocation
											</span>
											{weaponBanner.version && (
												<Badge className='bg-guild-accent-2/20 text-guild-accent-2 border-guild-accent-2/30'>
													v{weaponBanner.version}
												</Badge>
											)}
										</div>
										<div className='space-y-3 my-auto py-6'>
											{featured5StarWeapons.map((weapon, idx) => (
												<Link
													key={weapon.id}
													href={`/weapons/${weapon.id}`}
													className='flex items-center gap-4'
												>
													<Image
														src={weaponIconUrl(weapon.id)}
														alt={weapon.name}
														width={48}
														height={48}
														className={cn(
															'object-contain transition-opacity duration-500 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]',
															idx === activeWeaponIdx
																? 'opacity-100'
																: 'opacity-40',
														)}
														sizes='48px'
													/>
													<div>
														<h3
															className={cn(
																'text-lg font-bold transition-all duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]',
																idx === activeWeaponIdx
																	? 'text-foreground'
																	: 'text-foreground/50',
															)}
														>
															{weapon.name}
														</h3>
														<RarityStars rarity={weapon.rarity} size='xs' />
													</div>
												</Link>
											))}
											{featured5StarWeapons.length > 1 && (
												<div className='flex items-center gap-1.5 pt-2'>
													{featured5StarWeapons.map((weapon, idx) => (
														<button
															key={weapon.id}
															onClick={() => setActiveWeaponIdx(idx)}
															className={cn(
																'h-1.5 rounded-full transition-all duration-300',
																idx === activeWeaponIdx
																	? 'w-5 bg-guild-accent-2'
																	: 'w-1.5 bg-foreground/25 hover:bg-foreground/40',
															)}
														/>
													))}
												</div>
											)}
										</div>
										<div className='flex items-end justify-between'>
											<span className='text-sm text-guild-muted drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]'>
												Weapon Event Wish
											</span>
											<div className='space-y-1'>
												<Countdown
													target={parseBannerDate(weaponBanner.end)}
													label='Ends in'
												/>
												<div className='text-[10px] text-guild-dim text-right'>
													{parseBannerDate(weaponBanner.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
												</div>
											</div>
										</div>
									</div>
								</Card>
							) : null}
						</div>

						{/* Carousel dots + arrows */}
						{bannerCount > 1 && (
							<div className='flex items-center justify-center gap-3 mt-3'>
								<button
									onClick={() =>
										setActiveBannerIdx(
											(i) => (i - 1 + bannerCount) % bannerCount,
										)
									}
									className='p-1.5 rounded-full bg-guild-elevated/50 hover:bg-guild-elevated transition-colors'
								>
									<ChevronLeft className='h-4 w-4 text-guild-muted' />
								</button>
								<div className='flex gap-1.5'>
									{Array.from({ length: bannerCount }).map((_, i) => (
										<button
											key={i}
											onClick={() => setActiveBannerIdx(i)}
											className={cn(
												'w-2 h-2 rounded-full transition-all',
												activeBannerIdx === i
													? 'bg-guild-accent w-6'
													: 'bg-foreground/20 hover:bg-foreground/40',
											)}
										/>
									))}
								</div>
								<button
									onClick={nextBanner}
									className='p-1.5 rounded-full bg-guild-elevated/50 hover:bg-guild-elevated transition-colors'
								>
									<ChevronRight className='h-4 w-4 text-guild-muted' />
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
