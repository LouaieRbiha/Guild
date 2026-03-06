'use client';

import type { BannerHistoryEntry } from '@/app/api/banners/history/route';
import { charGachaUrl, charIconUrl } from '@/lib/characters';
import { weaponIconUrl } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RarityStars } from '@/components/shared';
import { ChevronDown, History, Loader2, Sparkles, Swords } from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────

interface ResolvedChar {
	id: string;
	name: string;
	element: string;
	rarity: number;
}

interface ResolvedWeapon {
	id: number;
	name: string;
	rarity: number;
	type: string;
}

interface ResolvedPhase {
	start: string;
	end: string;
	characters: {
		banner: BannerHistoryEntry;
		featured5: ResolvedChar[];
		featured4: ResolvedChar[];
	} | null;
	weapons: {
		banner: BannerHistoryEntry;
		featured5: ResolvedWeapon[];
		featured4: ResolvedWeapon[];
	} | null;
}

export interface ResolvedVersionGroup {
	version: string;
	phases: ResolvedPhase[];
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatDateShort(dateStr: string): string {
	const d = new Date(dateStr.replace(' ', 'T') + 'Z');
	return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isActive(start: string, end: string): boolean {
	const now = new Date();
	const s = new Date(start.replace(' ', 'T') + 'Z');
	const e = new Date(end.replace(' ', 'T') + 'Z');
	return now >= s && now <= e;
}

// ── Main Client Component ───────────────────────────────────────────

const INITIAL_COUNT = 5;
const LOAD_MORE_COUNT = 5;

export function BannerHistoryClient({
	groups,
	totalCharBanners,
	totalWeaponBanners,
}: {
	groups: ResolvedVersionGroup[];
	totalCharBanners: number;
	totalWeaponBanners: number;
}) {
	const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
	const sentinelRef = useRef<HTMLDivElement>(null);
	const versionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

	const visibleGroups = groups.slice(0, visibleCount);
	const hasMore = visibleCount < groups.length;

	// Intersection Observer for infinite scroll
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel || !hasMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, groups.length));
				}
			},
			{ rootMargin: '400px' },
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [hasMore, groups.length]);

	const handleVersionSelect = useCallback((version: string) => {
		if (!version) return;
		// Ensure the selected version is visible
		const idx = groups.findIndex((g) => g.version === version);
		if (idx === -1) return;
		setVisibleCount((prev) => Math.max(prev, idx + 1));
		// Scroll after state update
		requestAnimationFrame(() => {
			const el = versionRefs.current.get(version);
			if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}, [groups]);

	return (
		<div className='max-w-5xl mx-auto space-y-8'>
			{/* Header */}
			<div className='flex items-center justify-between gap-3'>
				<div className='flex items-center gap-3'>
					<History className='h-6 w-6 text-guild-accent' />
					<div>
						<h1 className='text-2xl font-bold'>Banner History</h1>
						<p className='text-sm text-guild-muted mt-0.5'>
							{totalCharBanners} character banners &middot; {totalWeaponBanners} weapon banners
						</p>
					</div>
				</div>

				{/* Version dropdown */}
				{groups.length > 0 && (
					<div className='relative'>
						<select
							onChange={(e) => handleVersionSelect(e.target.value)}
							defaultValue=''
							className='appearance-none bg-guild-card border border-guild-border/30 rounded-lg px-3 py-1.5 pr-8 text-sm text-guild-muted hover:border-guild-accent/50 focus:border-guild-accent focus:outline-none cursor-pointer'
						>
							<option value='' disabled>Jump to version</option>
							{groups.map((g) => (
								<option key={g.version} value={g.version}>v{g.version}</option>
							))}
						</select>
						<ChevronDown className='absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-guild-muted pointer-events-none' />
					</div>
				)}
			</div>

			{/* Timeline */}
			<div className='space-y-10'>
				{visibleGroups.map((group) => (
					<div
						key={group.version}
						ref={(el) => {
							if (el) versionRefs.current.set(group.version, el);
						}}
						className='relative'
					>
						{/* Version header */}
						<div className='flex items-center gap-3 mb-4'>
							<Badge className='bg-guild-accent/15 text-guild-accent border-guild-accent/30 text-sm px-3 py-1'>
								v{group.version}
							</Badge>
							<div className='h-px flex-1 bg-guild-border/30' />
						</div>

						{/* Phases */}
						<div className='space-y-4 ml-2 pl-4 border-l border-guild-border/20'>
							{group.phases.map((phase, phaseIdx) => {
								const active = isActive(phase.start, phase.end);
								return (
									<div key={phase.start} className='relative'>
										{/* Timeline dot */}
										<div className={cn(
											'absolute -left-[calc(1rem+5px)] top-3 w-2.5 h-2.5 rounded-full border-2',
											active
												? 'bg-guild-accent border-guild-accent animate-pulse'
												: 'bg-guild-card border-guild-border/50',
										)} />

										{/* Phase header */}
										<div className='flex items-center gap-2 mb-3'>
											<span className='text-xs font-medium text-guild-muted'>
												Phase {phaseIdx + 1}
											</span>
											<span className='text-xs text-guild-dim'>
												{formatDateShort(phase.start)} &mdash; {formatDateShort(phase.end)}
											</span>
											{active && (
												<Badge className='bg-green-500/15 text-green-400 border-green-500/30 text-[10px] px-1.5 py-0'>
													Live
												</Badge>
											)}
										</div>

										{/* Banner cards */}
										<div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
											{phase.characters && (
												<CharacterBannerCard data={phase.characters} active={active} />
											)}
											{phase.weapons && (
												<WeaponBannerCard data={phase.weapons} active={active} />
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>

			{/* Infinite scroll sentinel */}
			{hasMore && (
				<div ref={sentinelRef} className='flex items-center justify-center py-8'>
					<Loader2 className='h-5 w-5 text-guild-muted animate-spin' />
					<span className='text-sm text-guild-muted ml-2'>Loading more banners...</span>
				</div>
			)}

			{groups.length === 0 && (
				<div className='text-center py-20 text-guild-muted'>
					Failed to load banner history. Try again later.
				</div>
			)}
		</div>
	);
}

// ── Character Banner Card (with splash art rotation) ────────────────

function CharacterBannerCard({
	data,
	active,
}: {
	data: {
		banner: BannerHistoryEntry;
		featured5: ResolvedChar[];
		featured4: ResolvedChar[];
	};
	active: boolean;
}) {
	const { banner, featured5, featured4 } = data;
	const [activeIdx, setActiveIdx] = useState(0);

	// Auto-rotate splash art every 5 seconds when there are multiple 5-stars
	useEffect(() => {
		if (featured5.length <= 1) return;
		const timer = setInterval(() => {
			setActiveIdx((prev) => (prev + 1) % featured5.length);
		}, 5000);
		return () => clearInterval(timer);
	}, [featured5.length]);

	return (
		<Card className={cn(
			'overflow-hidden p-0 gap-0',
			active ? 'border-guild-accent/40 ring-1 ring-guild-accent/20' : 'border-guild-border/30',
		)}>
			{/* Splash art area with crossfade */}
			<div className='relative h-36 overflow-hidden bg-guild-card'>
				{featured5.length > 0 ? (
					<>
						{featured5.map((char, idx) => (
							<Link key={char.id} href={`/database/${char.id}`}>
								<Image
									src={charGachaUrl(char.id)}
									alt={char.name}
									fill
									className={cn(
										'object-cover object-top transition-opacity duration-700',
										idx === activeIdx ? 'opacity-70' : 'opacity-0',
									)}
									sizes='(max-width: 1024px) 100vw, 50vw'
									unoptimized
								/>
							</Link>
						))}
						<div className='absolute inset-0 bg-gradient-to-t from-guild-card via-guild-card/30 to-transparent' />
					</>
				) : (
					<div className='absolute inset-0 bg-gradient-to-br from-guild-accent/10 to-guild-card' />
				)}

				{/* Banner type badge */}
				<div className='absolute top-2 left-2'>
					<Badge className='bg-black/50 backdrop-blur-sm text-white/80 border-white/10 text-[10px] gap-1'>
						<Sparkles className='h-3 w-3' />
						Character
					</Badge>
				</div>

				{/* Navigation dots for multiple chars */}
				{featured5.length > 1 && (
					<div className='absolute top-2 right-2 flex items-center gap-1'>
						{featured5.map((_, idx) => (
							<button
								key={idx}
								onClick={() => setActiveIdx(idx)}
								className={cn(
									'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
									idx === activeIdx
										? 'w-4 bg-guild-accent'
										: 'w-1.5 bg-white/30 hover:bg-white/50',
								)}
							/>
						))}
					</div>
				)}

				{/* Featured 5-star names */}
				<div className='absolute bottom-2 left-3 right-3'>
					<div className='flex items-end gap-2 flex-wrap'>
						{featured5.length > 0 ? (
							featured5.map((char, idx) => (
								<Link key={char.id} href={`/database/${char.id}`} className='hover:opacity-80'>
									<span className={cn(
										'font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] transition-all duration-500',
										idx === activeIdx ? 'text-lg' : 'text-sm opacity-60',
									)}>
										{char.name}
									</span>
								</Link>
							))
						) : (
							banner.featured.map((id) => (
								<span key={id} className='text-lg font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]'>
									{id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
								</span>
							))
						)}
					</div>
				</div>
			</div>

			{/* 4-star row */}
			<CardContent className='px-3 py-2'>
				<div className='flex items-center gap-2 flex-wrap'>
					<span className='text-xs text-guild-dim font-medium shrink-0'>4&#9733;</span>
					{featured4.length > 0 ? (
						featured4.map((char) => (
							<Link key={char.id} href={`/database/${char.id}`} className='flex items-center gap-1.5 group/fc'>
								<div className='w-7 h-7 rounded-full overflow-hidden border border-guild-border/50 relative shrink-0'>
									<Image
										src={charIconUrl(char.id)}
										alt={char.name}
										fill
										className='object-cover'
										sizes='28px'
										unoptimized
									/>
								</div>
								<span className='text-xs text-guild-muted group-hover/fc:text-white transition-colors'>
									{char.name}
								</span>
							</Link>
						))
					) : (
						banner.featuredRare.map((id) => (
							<span key={id} className='text-xs text-guild-muted'>
								{id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
							</span>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}

// ── Weapon Banner Card ──────────────────────────────────────────────

function WeaponBannerCard({
	data,
	active,
}: {
	data: {
		banner: BannerHistoryEntry;
		featured5: ResolvedWeapon[];
		featured4: ResolvedWeapon[];
	};
	active: boolean;
}) {
	const { banner, featured5, featured4 } = data;

	return (
		<Card className={cn(
			'overflow-hidden p-0 gap-0',
			active ? 'border-purple-400/40 ring-1 ring-purple-400/20' : 'border-guild-border/30',
		)}>
			<div className='relative h-36 overflow-hidden bg-guild-card'>
				<div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 via-guild-card to-guild-accent-2/5' />

				{/* Weapon icons */}
				<div className='absolute inset-0 flex items-center justify-center gap-6'>
					{featured5.length > 0 ? (
						featured5.map((wpn) => (
							<Link key={wpn.id} href={`/weapons/${wpn.id}`} className='hover:scale-110 transition-transform'>
								<Image
									src={weaponIconUrl(wpn.id)}
									alt={wpn.name}
									width={80}
									height={80}
									className='object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]'
									sizes='80px'
									unoptimized
								/>
							</Link>
						))
					) : (
						<Swords className='h-12 w-12 text-guild-dim' />
					)}
				</div>

				{/* Badge */}
				<div className='absolute top-2 left-2'>
					<Badge className='bg-black/50 backdrop-blur-sm text-white/80 border-white/10 text-[10px] gap-1'>
						<Swords className='h-3 w-3' />
						Weapon
					</Badge>
				</div>

				{/* Weapon names */}
				<div className='absolute bottom-2 left-3 right-3'>
					<div className='flex flex-col gap-0.5'>
						{featured5.length > 0 ? (
							featured5.map((wpn) => (
								<Link key={wpn.id} href={`/weapons/${wpn.id}`} className='hover:opacity-80'>
									<div className='flex items-center gap-1.5'>
										<span className='text-sm font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]'>
											{wpn.name}
										</span>
										<RarityStars rarity={wpn.rarity} size='xs' />
									</div>
								</Link>
							))
						) : (
							banner.featured.map((id) => (
								<span key={id} className='text-sm font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]'>
									{id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
								</span>
							))
						)}
					</div>
				</div>
			</div>

			{/* 4-star weapons */}
			<CardContent className='px-3 py-2'>
				<div className='flex items-center gap-2 flex-wrap'>
					<span className='text-xs text-guild-dim font-medium shrink-0'>4&#9733;</span>
					{featured4.length > 0 ? (
						featured4.map((wpn) => (
							<Link key={wpn.id} href={`/weapons/${wpn.id}`} className='flex items-center gap-1.5 group/fw'>
								<Image
									src={weaponIconUrl(wpn.id)}
									alt={wpn.name}
									width={22}
									height={22}
									className='object-contain shrink-0'
									sizes='22px'
									unoptimized
								/>
								<span className='text-xs text-guild-muted group-hover/fw:text-white transition-colors'>
									{wpn.name}
								</span>
							</Link>
						))
					) : (
						banner.featuredRare.map((id) => (
							<span key={id} className='text-xs text-guild-muted'>
								{id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
							</span>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}
