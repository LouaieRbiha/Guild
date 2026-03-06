'use client';

import { useEffect, useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';

import {
	AbyssIcon,
	PrimogemIcon,
} from '@/components/icons/genshin-icons';
import { Countdown } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ActiveBanners, BannerWeaponInfo } from '@/lib/banners/types';
import type { CharacterEntry } from '@/types';

import { BannerSection } from './home/banner-section';
import { parseBannerDate, getNextAbyssReset } from './home/banner-helpers';

const LazyRedeemCodesSection = lazy(() =>
	import('./home/redeem-codes-section').then((m) => ({ default: m.RedeemCodesSection }))
);

const LazyFarmingSection = lazy(() =>
	import('./home/farming-section').then((m) => ({ default: m.FarmingSection }))
);

const LazyFreshDropsSection = lazy(() =>
	import('./home/fresh-drops-section').then((m) => ({ default: m.FreshDropsSection }))
);

// ── Props ────────────────────────────────────────────────────────────────

interface HomeClientProps {
	banners: ActiveBanners;
	newestCharacters: CharacterEntry[];
	featured5StarChars: CharacterEntry[];
	featured4StarChars: CharacterEntry[];
	featured5StarWeapons: BannerWeaponInfo[];
}

// ── Component ────────────────────────────────────────────────────────────

export function HomeClient({
	banners,
	newestCharacters,
	featured5StarChars,
	featured4StarChars,
	featured5StarWeapons,
}: HomeClientProps) {
	const [uid, setUid] = useState('');
	const [uidError, setUidError] = useState('');
	const router = useRouter();

	const go = () => {
		if (uid.trim().length < 9) {
			setUidError('UID must be 9 digits');
			return;
		}
		router.push(`/profile/${uid.trim()}`);
	};

	const charBanner = banners.character;
	const bannerEndDate = charBanner ? parseBannerDate(charBanner.end) : null;
	const [abyssResetDate, setAbyssResetDate] = useState<Date | null>(null);
	useEffect(() => {
		setAbyssResetDate(getNextAbyssReset());
	}, []);

	return (
		<div className='min-h-screen text-foreground'>
			{/* ── 1. Hero Section ─────────────────────────────────────────── */}
			<section className='pt-8 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-6'>
				<div className='max-w-6xl mx-auto text-center space-y-8'>
					<h1 className='text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight'>
						<span className='bg-clip-text text-transparent bg-linear-to-r from-guild-accent to-guild-accent-2'>
							GUILD
						</span>
					</h1>
					<p className='text-base sm:text-xl text-guild-muted max-w-lg mx-auto leading-relaxed'>
						Builds, banners, databases, and tools &mdash; everything a Traveler
						needs in one place.
					</p>

					{/* UID Lookup */}
					<div className='max-w-md mx-auto'>
						<div className='relative'>
							<div className='absolute -inset-1 rounded-2xl bg-linear-to-r from-guild-accent/30 via-guild-accent-2/20 to-guild-accent/30 blur-lg animate-pulse-glow' />
							<Card className='relative border-guild-border p-0 gap-0'>
								<CardContent className='p-4'>
									<div className='flex items-center gap-3'>
										<Input
											type='text'
											placeholder='Enter your UID'
											value={uid}
											onChange={(e) => {
												setUid(e.target.value);
												if (uidError) setUidError('');
											}}
											onKeyDown={(e) => e.key === 'Enter' && go()}
											className='h-12 font-mono text-lg bg-background/50'
										/>
										<Button
											onClick={go}
											size='lg'
											className='h-12 px-6 bg-guild-accent hover:bg-guild-accent/80'
										>
											Lookup
										</Button>
									</div>
									{uidError && (
										<p className='text-sm text-red-400 mt-2'>{uidError}</p>
									)}
								</CardContent>
							</Card>
						</div>
						<p className='text-sm text-guild-muted mt-3'>
							Paste a Genshin UID to view builds, stats, and more
						</p>
					</div>
				</div>
			</section>

			{/* ── 2. Active Banners ───────────────────────────────────────── */}
			<BannerSection
				banners={banners}
				featured5StarChars={featured5StarChars}
				featured4StarChars={featured4StarChars}
				featured5StarWeapons={featured5StarWeapons}
			/>

			{/* ── Redeem Codes ──────────────────────────────────────────── */}
			<Suspense fallback={null}>
				<LazyRedeemCodesSection />
			</Suspense>

			{/* ── Today's Farming ────────────────────────────────────────── */}
			<Suspense fallback={null}>
				<LazyFarmingSection />
			</Suspense>

			{/* ── 4. Fresh Drops ──────────────────────────────────────────── */}
			<Suspense fallback={null}>
				<LazyFreshDropsSection newestCharacters={newestCharacters} />
			</Suspense>

			{/* ── 5. Quick Stats Row ──────────────────────────────────────── */}
			<section className='px-6 pb-12'>
				<div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4'>
					{/* Banner Ends */}
					<Card>
						<CardContent className='space-y-3'>
							<div className='flex items-center gap-2 text-sm font-medium text-guild-muted'>
								<PrimogemIcon className='text-guild-gold' size={18} />
								Banner Ends
							</div>
							{bannerEndDate ? (
								<Countdown target={bannerEndDate} className='text-3xl' />
							) : (
								<div className='text-guild-muted'>No active banner</div>
							)}
						</CardContent>
					</Card>

					{/* Spiral Abyss */}
					<Card>
						<CardContent className='space-y-3'>
							<div className='flex items-center gap-2 text-sm font-medium text-guild-muted'>
								<AbyssIcon className='text-guild-accent' size={18} />
								Spiral Abyss
							</div>
							{abyssResetDate && (
								<Countdown
									target={abyssResetDate}
									label='Until reset'
									className='text-3xl'
								/>
							)}
						</CardContent>
					</Card>

					{/* Featured Characters */}
					<Card>
						<CardContent className='space-y-3'>
							<div className='flex items-center gap-2 text-sm font-medium text-guild-muted'>
								<PrimogemIcon className='text-guild-accent-2' size={18} />
								Featured Characters
							</div>
							<div className='text-3xl font-bold font-mono'>
								{featured5StarChars.length}
								<span className='text-sm font-normal text-guild-muted ml-2'>
									5-star{featured5StarChars.length !== 1 ? 's' : ''} on banner
								</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
