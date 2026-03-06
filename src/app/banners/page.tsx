import type { Metadata } from 'next';
import type { BannerHistoryEntry } from '@/app/api/banners/history/route';
import { ALL_CHARACTERS, charGachaUrl, charIconUrl } from '@/lib/characters';
import type { CharacterEntry } from '@/lib/characters';
import { ALL_WEAPONS, type WeaponEntry } from '@/lib/weapons';
import { weaponIconUrl } from '@/lib/constants';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { RarityStars } from '@/components/shared';
import { History, Sparkles, Swords } from 'lucide-react';

export const metadata: Metadata = {
	title: 'Banner History - Guild',
	description: 'Complete Genshin Impact wish banner history from v1.0 to present. Browse all character and weapon event banners with featured 5-star and 4-star items.',
};

// ── ID Mapping ──────────────────────────────────────────────────────

// Build lookup maps for fast matching
const charByNormalizedName = new Map<string, CharacterEntry>();
for (const c of ALL_CHARACTERS) {
	charByNormalizedName.set(c.name.toLowerCase().replace(/[^a-z0-9]/g, ''), c);
}

const weaponByNormalizedName = new Map<string, WeaponEntry>();
for (const w of ALL_WEAPONS) {
	weaponByNormalizedName.set(w.name.toLowerCase().replace(/[^a-z0-9]/g, ''), w);
}

// Special mappings for names that don't match snake_case → title case conversion
const CHAR_ID_OVERRIDES: Record<string, string> = {
	hu_tao: 'hutao',
	raiden_shogun: 'raidenshogun',
	kamisato_ayaka: 'kamisatoayaka',
	kamisato_ayato: 'kamisatoayato',
	kaedehara_kazuha: 'kaedeharakazuha',
	arataki_itto: 'aratakiitto',
	yae_miko: 'yaemiko',
	shikanoin_heizou: 'shikanoinheizou',
	sangonomiya_kokomi: 'sangonomiyakokomi',
	kuki_shinobu: 'kukishinobu',
	yun_jin: 'yunjin',
};

function snakeToNormalized(snakeId: string): string {
	if (CHAR_ID_OVERRIDES[snakeId]) return CHAR_ID_OVERRIDES[snakeId];
	return snakeId.replace(/[_-]/g, '');
}

function resolveCharacter(snakeId: string): CharacterEntry | undefined {
	const normalized = snakeToNormalized(snakeId);
	return charByNormalizedName.get(normalized);
}

function resolveWeapon(snakeId: string): WeaponEntry | undefined {
	const normalized = snakeToNormalized(snakeId);
	return weaponByNormalizedName.get(normalized);
}

// ── Data Fetching ───────────────────────────────────────────────────

interface VersionGroup {
	version: string;
	phases: PhaseGroup[];
}

interface PhaseGroup {
	start: string;
	end: string;
	characters: BannerHistoryEntry | null;
	weapons: BannerHistoryEntry | null;
}

async function fetchBannerHistory(): Promise<{ characters: BannerHistoryEntry[]; weapons: BannerHistoryEntry[] }> {
	const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL
		? `https://${process.env.VERCEL_URL}`
		: 'http://localhost:3000';

	try {
		const res = await fetch(`${baseUrl}/api/banners/history`, {
			next: { revalidate: 3600 },
		});
		if (!res.ok) return { characters: [], weapons: [] };
		return res.json();
	} catch {
		return { characters: [], weapons: [] };
	}
}

function groupByVersion(
	characters: BannerHistoryEntry[],
	weapons: BannerHistoryEntry[],
): VersionGroup[] {
	// Pair character and weapon banners by matching start dates
	const weaponsByStart = new Map<string, BannerHistoryEntry>();
	for (const w of weapons) {
		weaponsByStart.set(w.start, w);
	}

	// Group by version, phases determined by unique start dates within a version
	const versionMap = new Map<string, Map<string, PhaseGroup>>();

	for (const c of characters) {
		if (!versionMap.has(c.version)) versionMap.set(c.version, new Map());
		const phases = versionMap.get(c.version)!;
		if (!phases.has(c.start)) {
			phases.set(c.start, {
				start: c.start,
				end: c.end,
				characters: c,
				weapons: weaponsByStart.get(c.start) || null,
			});
		}
	}

	// Add weapon-only banners (if any weapon has no matching character banner)
	for (const w of weapons) {
		if (!versionMap.has(w.version)) versionMap.set(w.version, new Map());
		const phases = versionMap.get(w.version)!;
		if (!phases.has(w.start)) {
			phases.set(w.start, {
				start: w.start,
				end: w.end,
				characters: null,
				weapons: w,
			});
		}
	}

	// Convert to sorted array (newest first)
	const groups: VersionGroup[] = [];
	for (const [version, phases] of versionMap) {
		const sortedPhases = Array.from(phases.values()).sort(
			(a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
		);
		groups.push({ version, phases: sortedPhases });
	}

	groups.sort((a, b) => {
		const [aMaj, aMin] = a.version.split('.').map(Number);
		const [bMaj, bMin] = b.version.split('.').map(Number);
		return bMaj - aMaj || bMin - aMin;
	});

	return groups;
}

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

// ── Page ────────────────────────────────────────────────────────────

export default async function BannersPage() {
	const { characters, weapons } = await fetchBannerHistory();
	const groups = groupByVersion(characters, weapons);

	return (
		<div className='max-w-5xl mx-auto space-y-8'>
			{/* Header */}
			<div className='flex items-center gap-3'>
				<History className='h-6 w-6 text-guild-accent' />
				<div>
					<h1 className='text-2xl font-bold'>Banner History</h1>
					<p className='text-sm text-guild-muted mt-0.5'>
						{characters.length} character banners &middot; {weapons.length} weapon banners
					</p>
				</div>
			</div>

			{/* Timeline */}
			<div className='space-y-10'>
				{groups.map((group) => (
					<div key={group.version} className='relative'>
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
										<div className={`absolute -left-[calc(1rem+5px)] top-3 w-2.5 h-2.5 rounded-full border-2 ${
											active
												? 'bg-guild-accent border-guild-accent animate-pulse'
												: 'bg-guild-card border-guild-border/50'
										}`} />

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
											{/* Character banner */}
											{phase.characters && (
												<CharacterBannerCard banner={phase.characters} active={active} />
											)}
											{/* Weapon banner */}
											{phase.weapons && (
												<WeaponBannerCard banner={phase.weapons} active={active} />
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>

			{groups.length === 0 && (
				<div className='text-center py-20 text-guild-muted'>
					Failed to load banner history. Try again later.
				</div>
			)}
		</div>
	);
}

// ── Banner Cards ────────────────────────────────────────────────────

function CharacterBannerCard({ banner, active }: { banner: BannerHistoryEntry; active: boolean }) {
	const featured5 = banner.featured.map(resolveCharacter).filter(Boolean) as CharacterEntry[];
	const featured4 = banner.featuredRare.map(resolveCharacter).filter(Boolean) as CharacterEntry[];

	return (
		<Card className={`overflow-hidden p-0 gap-0 ${active ? 'border-guild-accent/40 ring-1 ring-guild-accent/20' : 'border-guild-border/30'}`}>
			{/* Splash art area */}
			<div className='relative h-36 overflow-hidden bg-guild-card'>
				{featured5.length > 0 ? (
					<>
						{featured5.map((char, idx) => (
							<Link key={char.id} href={`/database/${char.id}`}>
								<Image
									src={charGachaUrl(char.id)}
									alt={char.name}
									fill
									className='object-cover object-top opacity-70 hover:opacity-90 transition-opacity'
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

				{/* Featured 5-star names overlay */}
				<div className='absolute bottom-2 left-3 right-3'>
					<div className='flex items-end gap-2 flex-wrap'>
						{featured5.length > 0 ? (
							featured5.map((char) => (
								<Link key={char.id} href={`/database/${char.id}`} className='hover:opacity-80'>
									<span className='text-lg font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]'>
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
					<span className='text-[10px] text-guild-dim font-medium shrink-0'>4&#9733;</span>
					{featured4.length > 0 ? (
						featured4.map((char) => (
							<Link key={char.id} href={`/database/${char.id}`} className='flex items-center gap-1 group/fc'>
								<div className='w-6 h-6 rounded-full overflow-hidden border border-guild-border/50 relative shrink-0'>
									<Image
										src={charIconUrl(char.id)}
										alt={char.name}
										fill
										className='object-cover'
										sizes='24px'
										unoptimized
									/>
								</div>
								<span className='text-[10px] text-guild-muted group-hover/fc:text-white transition-colors'>
									{char.name}
								</span>
							</Link>
						))
					) : (
						banner.featuredRare.map((id) => (
							<span key={id} className='text-[10px] text-guild-muted'>
								{id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
							</span>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function WeaponBannerCard({ banner, active }: { banner: BannerHistoryEntry; active: boolean }) {
	const featured5 = banner.featured.map(resolveWeapon).filter(Boolean) as WeaponEntry[];
	const featured4 = banner.featuredRare.map(resolveWeapon).filter(Boolean) as WeaponEntry[];

	return (
		<Card className={`overflow-hidden p-0 gap-0 ${active ? 'border-purple-400/40 ring-1 ring-purple-400/20' : 'border-guild-border/30'}`}>
			{/* Weapon display area */}
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

				{/* Banner type badge */}
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

			{/* 4-star weapons row */}
			<CardContent className='px-3 py-2'>
				<div className='flex items-center gap-2 flex-wrap'>
					<span className='text-[10px] text-guild-dim font-medium shrink-0'>4&#9733;</span>
					{featured4.length > 0 ? (
						featured4.map((wpn) => (
							<Link key={wpn.id} href={`/weapons/${wpn.id}`} className='flex items-center gap-1 group/fw'>
								<Image
									src={weaponIconUrl(wpn.id)}
									alt={wpn.name}
									width={18}
									height={18}
									className='object-contain shrink-0'
									sizes='18px'
									unoptimized
								/>
								<span className='text-[10px] text-guild-muted group-hover/fw:text-white transition-colors'>
									{wpn.name}
								</span>
							</Link>
						))
					) : (
						banner.featuredRare.map((id) => (
							<span key={id} className='text-[10px] text-guild-muted'>
								{id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
							</span>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}
