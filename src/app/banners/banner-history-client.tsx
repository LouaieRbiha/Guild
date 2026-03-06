'use client';

import type { BannerHistoryEntry } from '@/app/api/banners/history/route';
import { ALL_CHARACTERS, charGachaUrl, charIconUrl } from '@/lib/characters';
import { weaponIconUrl } from '@/lib/constants';
import { ALL_WEAPONS } from '@/lib/weapons';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RarityStars } from '@/components/shared';
import { ChevronDown, History, Loader2, Search, Sparkles, Swords, X } from 'lucide-react';
import { ELEMENT_ICONS } from '@/components/icons/genshin-icons';

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

function isActive(start: string, end: string, now: Date): boolean {
	const s = new Date(start.replace(' ', 'T') + 'Z');
	const e = new Date(end.replace(' ', 'T') + 'Z');
	return now >= s && now <= e;
}

const ELEMENT_ACCENT: Record<string, string> = {
	Pyro: 'from-red-500/20 to-orange-500/10',
	Hydro: 'from-blue-500/20 to-cyan-500/10',
	Anemo: 'from-teal-500/20 to-emerald-500/10',
	Electro: 'from-purple-500/20 to-violet-500/10',
	Cryo: 'from-cyan-400/20 to-blue-400/10',
	Geo: 'from-yellow-500/20 to-amber-500/10',
	Dendro: 'from-green-500/20 to-lime-500/10',
};

// ── Autocomplete data ───────────────────────────────────────────────

interface SuggestionItem {
	type: 'character' | 'weapon';
	id: string | number;
	name: string;
	rarity: number;
	element?: string;
	weaponType?: string;
}

function buildSuggestions(): SuggestionItem[] {
	const items: SuggestionItem[] = [];
	for (const c of ALL_CHARACTERS) {
		items.push({ type: 'character', id: c.id, name: c.name, rarity: c.rarity, element: c.element });
	}
	for (const w of ALL_WEAPONS) {
		if (w.rarity >= 4) {
			items.push({ type: 'weapon', id: w.id, name: w.name, rarity: w.rarity, weaponType: w.type });
		}
	}
	return items;
}

const ALL_SUGGESTIONS = buildSuggestions();

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
	const [search, setSearch] = useState('');
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [clientNow, setClientNow] = useState<Date | null>(null);
	const searchRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setClientNow(new Date());
	}, []);
	const versionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

	// Close dropdown on outside click
	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
				setShowSuggestions(false);
			}
		}
		document.addEventListener('mousedown', handleClick);
		return () => document.removeEventListener('mousedown', handleClick);
	}, []);

	// Filter autocomplete suggestions
	const suggestions = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q || q.length < 1) return [];
		return ALL_SUGGESTIONS
			.filter((s) => s.name.toLowerCase().includes(q))
			.slice(0, 8);
	}, [search]);

	// Filter groups by character/weapon search
	const filteredGroups = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return groups;
		return groups
			.map((group) => {
				const matchingPhases = group.phases.filter((phase) => {
					const charNames = [
						...(phase.characters?.featured5 ?? []),
						...(phase.characters?.featured4 ?? []),
					].map((c) => c.name.toLowerCase());
					const weaponNames = [
						...(phase.weapons?.featured5 ?? []),
						...(phase.weapons?.featured4 ?? []),
					].map((w) => w.name.toLowerCase());
					return [...charNames, ...weaponNames].some((n) => n.includes(q));
				});
				if (matchingPhases.length === 0) return null;
				return { ...group, phases: matchingPhases };
			})
			.filter(Boolean) as ResolvedVersionGroup[];
	}, [groups, search]);

	const visibleGroups = search ? filteredGroups : filteredGroups.slice(0, visibleCount);
	const hasMore = !search && visibleCount < filteredGroups.length;

	// Intersection Observer for infinite scroll
	useEffect(() => {
		const sentinel = sentinelRef.current;
		if (!sentinel || !hasMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, filteredGroups.length));
				}
			},
			{ rootMargin: '400px' },
		);

		observer.observe(sentinel);
		return () => observer.disconnect();
	}, [hasMore, filteredGroups.length]);

	const handleVersionSelect = useCallback((version: string) => {
		if (!version) return;
		const idx = groups.findIndex((g) => g.version === version);
		if (idx === -1) return;
		setVisibleCount((prev) => Math.max(prev, idx + 1));
		requestAnimationFrame(() => {
			const el = versionRefs.current.get(version);
			if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}, [groups]);

	const selectSuggestion = useCallback((name: string) => {
		setSearch(name);
		setShowSuggestions(false);
	}, []);

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

			{/* Search with autocomplete */}
			<div ref={searchRef} className='relative'>
				<Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-guild-dim z-10' />
				<input
					ref={inputRef}
					value={search}
					onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true); }}
					onFocus={() => setShowSuggestions(true)}
					placeholder='Search character or weapon...'
					className='w-full pl-9 pr-20 bg-guild-card border border-guild-border/30 rounded-lg text-sm h-10 text-foreground placeholder:text-guild-dim focus:border-guild-accent focus:outline-none transition-colors'
				/>
				{search && (
					<div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2'>
						<span className='text-xs text-guild-muted'>
							{filteredGroups.reduce((sum, g) => sum + g.phases.length, 0)} results
						</span>
						<button onClick={() => { setSearch(''); setShowSuggestions(false); }} className='p-0.5 hover:bg-guild-elevated rounded cursor-pointer'>
							<X className='h-3.5 w-3.5 text-guild-dim' />
						</button>
					</div>
				)}

				{/* Autocomplete dropdown */}
				{showSuggestions && suggestions.length > 0 && (
					<div className='absolute top-full mt-1 left-0 right-0 bg-guild-card border border-guild-border/30 rounded-lg shadow-xl shadow-black/30 overflow-hidden z-50'>
						{suggestions.map((s) => {
							const EI = s.element ? ELEMENT_ICONS[s.element] : null;
							return (
								<button
									key={`${s.type}-${s.id}`}
									onClick={() => selectSuggestion(s.name)}
									className='w-full flex items-center gap-3 px-3 py-2 hover:bg-guild-elevated/60 transition-colors cursor-pointer text-left'
								>
									{s.type === 'character' ? (
										<div className={cn(
											'w-8 h-8 rounded-full overflow-hidden relative shrink-0 ring-1',
											s.rarity === 5 ? 'ring-amber-400/50' : 'ring-purple-400/50',
										)}>
											<Image
												src={charIconUrl(s.id as string)}
												alt={s.name}
												fill
												className='object-cover'
												sizes='32px'
												unoptimized
											/>
										</div>
									) : (
										<div className={cn(
											'w-8 h-8 flex items-center justify-center rounded-lg shrink-0 ring-1',
											s.rarity === 5 ? 'ring-amber-400/50 bg-amber-500/10' : 'ring-purple-400/50 bg-purple-500/10',
										)}>
											<Image
												src={weaponIconUrl(s.id as number)}
												alt={s.name}
												width={24}
												height={24}
												className='object-contain'
												sizes='24px'
												unoptimized
											/>
										</div>
									)}
									<div className='flex-1 min-w-0'>
										<div className='flex items-center gap-1.5'>
											<span className='text-sm font-medium truncate'>{s.name}</span>
											{EI && <EI size={14} />}
										</div>
										<span className='text-[10px] text-guild-dim'>
											{s.type === 'character' ? 'Character' : 'Weapon'}
											{' · '}
											{s.rarity === 5 ? '★★★★★' : '★★★★'}
										</span>
									</div>
								</button>
							);
						})}
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
								const active = clientNow ? isActive(phase.start, phase.end, clientNow) : false;
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

	const primaryElement = featured5[activeIdx]?.element ?? featured5[0]?.element;
	const gradientClass = primaryElement ? ELEMENT_ACCENT[primaryElement] : 'from-guild-accent/10 to-guild-card';

	return (
		<Card className={cn(
			'overflow-hidden p-0 gap-0 transition-all duration-500',
			active
				? 'border-guild-accent/40 ring-1 ring-guild-accent/20 shadow-lg shadow-guild-accent/5'
				: 'border-guild-border/30 hover:border-guild-border/50',
		)}>
			{/* Splash art area with crossfade */}
			<div className='relative h-48 overflow-hidden bg-guild-card'>
				{featured5.length > 0 ? (
					<>
						{featured5.map((char, idx) => (
							<Link key={char.id} href={`/database/${char.id}`}>
								<Image
									src={charGachaUrl(char.id)}
									alt={char.name}
									fill
									className={cn(
										'object-cover object-[50%_20%] transition-opacity duration-700',
										idx === activeIdx ? 'opacity-80' : 'opacity-0',
									)}
									sizes='(max-width: 1024px) 100vw, 50vw'
									unoptimized
								/>
							</Link>
						))}
						{/* Element-tinted gradient overlay */}
						<div className={cn('absolute inset-0 bg-gradient-to-t', gradientClass)} />
						<div className='absolute inset-0 bg-gradient-to-t from-guild-card via-guild-card/40 to-transparent' />
					</>
				) : (
					<div className={cn('absolute inset-0 bg-gradient-to-br', gradientClass)} />
				)}

				{/* Banner type badge */}
				<div className='absolute top-2.5 left-2.5'>
					<Badge className='bg-black/50 backdrop-blur-sm text-white/90 border-white/10 text-[11px] gap-1 px-2 py-0.5'>
						<Sparkles className='h-3 w-3' />
						Character
					</Badge>
				</div>

				{/* Navigation dots for multiple chars */}
				{featured5.length > 1 && (
					<div className='absolute top-2.5 right-2.5 flex items-center gap-1'>
						{featured5.map((_, idx) => (
							<button
								key={idx}
								onClick={() => setActiveIdx(idx)}
								className={cn(
									'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
									idx === activeIdx
										? 'w-5 bg-guild-accent'
										: 'w-1.5 bg-white/30 hover:bg-white/50',
								)}
							/>
						))}
					</div>
				)}

				{/* Featured 5-star names */}
				<div className='absolute bottom-2.5 left-3 right-3'>
					<div className='flex items-end gap-2 flex-wrap'>
						{featured5.length > 0 ? (
							featured5.map((char, idx) => {
								const EI = ELEMENT_ICONS[char.element];
								return (
									<Link key={char.id} href={`/database/${char.id}`} className='hover:opacity-80'>
										<span className={cn(
											'font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] transition-all duration-500 flex items-center gap-1.5',
											idx === activeIdx ? 'text-xl' : 'text-sm opacity-50',
										)}>
											{char.name}
											{idx === activeIdx && EI && <EI size={16} />}
										</span>
									</Link>
								);
							})
						) : (
							banner.featured.map((id) => (
								<span key={id} className='text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'>
									{id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
								</span>
							))
						)}
					</div>
				</div>
			</div>

			{/* 4-star row */}
			<CardContent className='px-3 py-3'>
				<div className='flex items-center gap-2.5 flex-wrap'>
					<span className='text-sm text-amber-400/80 font-semibold shrink-0'>4★</span>
					{featured4.length > 0 ? (
						featured4.map((char) => (
							<Link key={char.id} href={`/database/${char.id}`} className='flex items-center gap-1.5 group/fc'>
								<div className='w-8 h-8 rounded-full overflow-hidden border border-purple-400/30 relative shrink-0'>
									<Image
										src={charIconUrl(char.id)}
										alt={char.name}
										fill
										className='object-cover'
										sizes='32px'
										unoptimized
									/>
								</div>
								<span className='text-sm text-guild-muted group-hover/fc:text-white transition-colors'>
									{char.name}
								</span>
							</Link>
						))
					) : (
						banner.featuredRare.map((id) => (
							<span key={id} className='text-sm text-guild-muted'>
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
			'overflow-hidden p-0 gap-0 transition-all duration-500',
			active
				? 'border-purple-400/40 ring-1 ring-purple-400/20 shadow-lg shadow-purple-500/5'
				: 'border-guild-border/30 hover:border-guild-border/50',
		)}>
			<div className='relative h-48 overflow-hidden bg-guild-card'>
				<div className='absolute inset-0 bg-gradient-to-br from-purple-500/8 via-guild-card to-amber-500/5' />

				{/* Weapon icons */}
				<div className='absolute inset-0 flex items-center justify-center gap-8'>
					{featured5.length > 0 ? (
						featured5.map((wpn) => (
							<Link key={wpn.id} href={`/weapons/${wpn.id}`} className='hover:scale-110 transition-transform duration-300'>
								<div className='relative'>
									<Image
										src={weaponIconUrl(wpn.id)}
										alt={wpn.name}
										width={100}
										height={100}
										className='object-contain drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]'
										sizes='100px'
										unoptimized
									/>
									<div className='absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent rounded-lg' />
								</div>
							</Link>
						))
					) : (
						<Swords className='h-12 w-12 text-guild-dim' />
					)}
				</div>

				{/* Badge */}
				<div className='absolute top-2.5 left-2.5'>
					<Badge className='bg-black/50 backdrop-blur-sm text-white/90 border-white/10 text-[11px] gap-1 px-2 py-0.5'>
						<Swords className='h-3 w-3' />
						Weapon
					</Badge>
				</div>

				{/* Weapon names */}
				<div className='absolute bottom-2.5 left-3 right-3'>
					<div className='flex flex-col gap-1'>
						{featured5.length > 0 ? (
							featured5.map((wpn) => (
								<Link key={wpn.id} href={`/weapons/${wpn.id}`} className='hover:opacity-80'>
									<div className='flex items-center gap-1.5'>
										<span className='text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'>
											{wpn.name}
										</span>
										<RarityStars rarity={wpn.rarity} size='xs' />
									</div>
								</Link>
							))
						) : (
							banner.featured.map((id) => (
								<span key={id} className='text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]'>
									{id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
								</span>
							))
						)}
					</div>
				</div>
			</div>

			{/* 4-star weapons */}
			<CardContent className='px-3 py-3'>
				<div className='flex items-center gap-2.5 flex-wrap'>
					<span className='text-sm text-purple-400/80 font-semibold shrink-0'>4★</span>
					{featured4.length > 0 ? (
						featured4.map((wpn) => (
							<Link key={wpn.id} href={`/weapons/${wpn.id}`} className='flex items-center gap-1.5 group/fw'>
								<Image
									src={weaponIconUrl(wpn.id)}
									alt={wpn.name}
									width={24}
									height={24}
									className='object-contain shrink-0'
									sizes='24px'
									unoptimized
								/>
								<span className='text-sm text-guild-muted group-hover/fw:text-white transition-colors'>
									{wpn.name}
								</span>
							</Link>
						))
					) : (
						banner.featuredRare.map((id) => (
							<span key={id} className='text-sm text-guild-muted'>
								{id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
							</span>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}
