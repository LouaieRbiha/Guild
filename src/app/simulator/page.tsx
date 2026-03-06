'use client';

import {
	ARTIFACT_DOMAINS,
	getArtifactPieceIcon,
	MAIN_STAT_VALUES,
	rollArtifact,
	SLOT_META,
} from '@/lib/artifact-roller';
import type { RolledArtifact } from '@/lib/artifact-roller';
import { YATTA_ASSETS } from '@/lib/constants';
import { calculateCV } from '@/lib/scoring';
import { cn } from '@/lib/utils';
import {
	BANNER_CONFIG,
	get5StarRate,
	getResolvedBanner,
	performSingleWish,
	STARTING_PRIMOGEMS,
	WISH_COST,
} from '@/lib/wish-engine';
import type { BannerPity, BannerType, WishResult } from '@/lib/wish-engine';
import dynamic from 'next/dynamic';

const WishAnimation = dynamic(
	() =>
		import('@/components/simulator/wish-animation').then(
			(m) => m.WishAnimation,
		),
	{
		ssr: false,
		loading: () => (
			<div className='h-64 flex items-center justify-center'>
				<span className='text-guild-dim'>Loading...</span>
			</div>
		),
	},
);
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
	ChevronDown,
	Crosshair,
	Dices,
	Gem,
	History,
	RotateCcw,
	Sparkles,
	Star,
} from 'lucide-react';
import Image from 'next/image';
import { useCallback, useMemo, useState } from 'react';

// ── UI Constants ──────────────────────────────────────────────────────

const ARTIFACT_QUIPS = [
	'Another day, another trash artifact. Welcome to Genshin.',
	'DEF% sends its regards.',
	'You could farm for a year and not see a good goblet.',
	'Copium levels: critical.',
	'The domain heard you wanted CRIT and chose violence.',
];

// ── UI Helpers ────────────────────────────────────────────────────────

function getCVColorClass(cv: number): string {
	if (cv >= 30) return 'text-green-400';
	if (cv >= 20) return 'text-yellow-400';
	return 'text-guild-dim';
}

function getScoreGrade(cv: number): { grade: string; color: string } {
	if (cv >= 40) return { grade: 'SS', color: 'text-amber-400' };
	if (cv >= 30) return { grade: 'S', color: 'text-green-400' };
	if (cv >= 20) return { grade: 'A', color: 'text-yellow-400' };
	if (cv >= 10) return { grade: 'B', color: 'text-blue-400' };
	return { grade: 'C', color: 'text-guild-dim' };
}

const RARITY_COLORS = {
	text: { 5: 'text-amber-400', 4: 'text-purple-400', 3: 'text-blue-400' },
	bg: {
		5: 'bg-amber-500/10',
		4: 'bg-purple-500/10',
		3: 'bg-blue-500/10',
	},
	border: {
		5: 'border-amber-500/20',
		4: 'border-purple-500/20',
		3: 'border-blue-500/20',
	},
	borderStrong: {
		5: 'border-amber-500/30',
		4: 'border-purple-500/30',
		3: 'border-blue-500/30',
	},
} as const;

function RarityStarsRow({
	count,
	rarity,
	size = 'h-3 w-3',
}: {
	count: number;
	rarity: 3 | 4 | 5;
	size?: string;
}) {
	return (
		<span className='inline-flex gap-0.5'>
			{Array.from({ length: count }, (_, i) => (
				<Star
					key={i}
					className={cn(size, 'fill-current', RARITY_COLORS.text[rarity])}
				/>
			))}
		</span>
	);
}

// ── Main Component ────────────────────────────────────────────────────

export default function SimulatorPage() {
	const [mode, setMode] = useState<'wish' | 'artifact'>('wish');

	// ── Wish Simulator State ──────────────────────────────────────────
	const [bannerType, setBannerType] = useState<BannerType>('character');
	const [pityStates, setPityStates] = useState<Record<BannerType, BannerPity>>({
		character: {
			pity5: 0,
			pity4: 0,
			guaranteed5: false,
			guaranteed4: false,
			capturingRadianceActive: false,
			fatePoints: 0,
			epitomizedTarget: 0,
		},
		weapon: {
			pity5: 0,
			pity4: 0,
			guaranteed5: false,
			guaranteed4: false,
			capturingRadianceActive: false,
			fatePoints: 0,
			epitomizedTarget: 0,
		},
		standard: {
			pity5: 0,
			pity4: 0,
			guaranteed5: false,
			guaranteed4: false,
			capturingRadianceActive: false,
			fatePoints: 0,
			epitomizedTarget: 0,
		},
	});
	const [primogems, setPrimogems] = useState(STARTING_PRIMOGEMS);
	const [wishResults, setWishResults] = useState<WishResult[]>([]);
	const [lastPull, setLastPull] = useState<WishResult[]>([]);
	const [totalWishes, setTotalWishes] = useState(0);
	const [showHistory, setShowHistory] = useState(false);
	const [animState, setAnimState] = useState<'idle' | 'animating'>('idle');

	// ── Artifact Roller State ─────────────────────────────────────────
	const [selectedDomainIdx, setSelectedDomainIdx] = useState(0);
	const [artifacts, setArtifacts] = useState<RolledArtifact[]>([]);
	const [resin, setResin] = useState(0);

	// ── Wish Logic ────────────────────────────────────────────────────
	const doWish = useCallback(
		(count: 1 | 10) => {
			const cost = WISH_COST * count;
			if (primogems < cost) return;

			setPrimogems((p) => p - cost);

			const results: WishResult[] = [];
			let currentPity = { ...pityStates[bannerType] };

			for (let i = 0; i < count; i++) {
				const { result, newPity } = performSingleWish(
					bannerType,
					currentPity,
					totalWishes + i + 1,
				);
				results.push(result);
				currentPity = newPity;
			}

			setPityStates((prev) => ({ ...prev, [bannerType]: currentPity }));
			setLastPull(results);
			setWishResults((prev) => [...[...results].reverse(), ...prev]);
			setTotalWishes((prev) => prev + count);
			setAnimState('animating');
		},
		[bannerType, pityStates, primogems, totalWishes],
	);

	const resetWish = useCallback(() => {
		setPityStates({
			character: {
				pity5: 0, pity4: 0, guaranteed5: false, guaranteed4: false,
				capturingRadianceActive: false, fatePoints: 0, epitomizedTarget: 0,
			},
			weapon: {
				pity5: 0, pity4: 0, guaranteed5: false, guaranteed4: false,
				capturingRadianceActive: false, fatePoints: 0, epitomizedTarget: 0,
			},
			standard: {
				pity5: 0, pity4: 0, guaranteed5: false, guaranteed4: false,
				capturingRadianceActive: false, fatePoints: 0, epitomizedTarget: 0,
			},
		});
		setPrimogems(STARTING_PRIMOGEMS);
		setWishResults([]);
		setLastPull([]);
		setTotalWishes(0);
		setShowHistory(false);
	}, []);

	// ── Wish Statistics ───────────────────────────────────────────────
	const wishStats = useMemo(() => {
		const fiveStars = wishResults.filter((r) => r.rarity === 5);
		const fourStars = wishResults.filter((r) => r.rarity === 4);
		const avgPity =
			fiveStars.length > 0
				? fiveStars.reduce((sum, r) => sum + r.pityCount, 0) / fiveStars.length
				: 0;

		const eventFiveStars = fiveStars.filter(
			(r) => r.banner === 'character' || r.banner === 'weapon',
		);
		const won5050 = eventFiveStars.filter(
			(r) => r.fiftyFiftyOutcome === 'won',
		).length;
		const lost5050 = eventFiveStars.filter(
			(r) => r.fiftyFiftyOutcome === 'lost',
		).length;
		const radianceWins = eventFiveStars.filter(
			(r) => r.fiftyFiftyOutcome === 'radiance',
		).length;

		return {
			total: totalWishes,
			primogemsSpent: totalWishes * WISH_COST,
			fiveStarCount: fiveStars.length,
			fourStarCount: fourStars.length,
			fiveStars,
			avgPity: avgPity.toFixed(1),
			won5050,
			lost5050,
			radianceWins,
		};
	}, [wishResults, totalWishes]);

	// ── Artifact Logic ────────────────────────────────────────────────
	const doArtRoll = useCallback(() => {
		const domain = ARTIFACT_DOMAINS[selectedDomainIdx];
		const randomSet =
			domain.sets[Math.floor(Math.random() * domain.sets.length)];
		setArtifacts((p) => [rollArtifact(randomSet.name), ...p]);
		setResin((p) => p + 20);
	}, [selectedDomainIdx]);

	const resetArtifacts = useCallback(() => {
		setArtifacts([]);
		setResin(0);
	}, []);

	const goodArtCount = useMemo(
		() =>
			artifacts.filter((a) =>
				a.substats.some((s) => s.name === 'CRIT Rate' || s.name === 'CRIT DMG'),
			).length,
		[artifacts],
	);

	const quipIndex = useMemo(
		() => Math.floor(Math.random() * ARTIFACT_QUIPS.length),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[artifacts.length],
	);

	// ── Derived values ────────────────────────────────────────────────
	const currentPity = pityStates[bannerType];
	const currentConfig = BANNER_CONFIG[bannerType];
	const currentRate = get5StarRate(currentPity.pity5, bannerType);
	const inSoftPity = currentPity.pity5 >= currentConfig.softPityStart;
	const isEventBanner = bannerType !== 'standard';

	// ── Render ────────────────────────────────────────────────────────
	return (
		<div className='max-w-6xl mx-auto space-y-6'>
			{/* ═══ Wish Animation Overlay ═══ */}
			{animState === 'animating' && lastPull.length > 0 && (
				<WishAnimation
					results={lastPull}
					onComplete={() => setAnimState('idle')}
				/>
			)}
			{/* ═══ Page Header ═══ */}
			<div className='flex items-center gap-3'>
				<Dices className='h-6 w-6 text-guild-accent' />
				<h1 className='text-2xl font-bold'>Simulator</h1>
			</div>

			{/* ═══ Mode Toggle ═══ */}
			<div className='flex gap-1 p-1 rounded-lg bg-guild-card border border-white/5 w-fit'>
				<button
					onClick={() => setMode('wish')}
					className={cn(
						'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer',
						mode === 'wish'
							? 'bg-guild-accent text-white'
							: 'text-guild-muted hover:text-white hover:bg-white/5',
					)}
				>
					<Sparkles className='h-4 w-4' />
					Wish Simulator
				</button>
				<button
					onClick={() => setMode('artifact')}
					className={cn(
						'px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer',
						mode === 'artifact'
							? 'bg-guild-accent text-white'
							: 'text-guild-muted hover:text-white hover:bg-white/5',
					)}
				>
					<Dices className='h-4 w-4' />
					Artifact Roller
				</button>
			</div>

			{/* ═══════════════════════════════════════════════════════════════
           WISH SIMULATOR
         ═══════════════════════════════════════════════════════════════ */}
			{mode === 'wish' && (
				<div className='space-y-5'>
					{/* ── Banner Selection + Primogem Display ── */}
					<Card className='bg-guild-card border-white/5 py-0'>
						<CardContent className='flex flex-wrap items-center gap-4 py-4'>
							<div className='flex gap-1 p-1 rounded-lg bg-guild-elevated'>
								{(['character', 'weapon', 'standard'] as BannerType[]).map(
									(bt) => (
										<button
											key={bt}
											onClick={() => setBannerType(bt)}
											className={cn(
												'px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
												bannerType === bt
													? 'bg-guild-accent text-white'
													: 'text-guild-muted hover:text-white',
											)}
										>
											{BANNER_CONFIG[bt].label}
										</button>
									),
								)}
							</div>

							<div className='sm:ml-auto flex items-center gap-2 flex-wrap'>
								<Gem className='h-4 w-4 text-blue-400' />
								<span className='font-mono text-sm text-guild-gold'>
									{primogems.toLocaleString()}
								</span>
								<span className='text-xs text-guild-dim'>Primogems</span>
								<button
									onClick={() => setPrimogems((p) => p + 1600)}
									className='ml-2 px-2 py-0.5 text-xs rounded bg-guild-accent/20 text-guild-accent hover:bg-guild-accent/30 transition-colors cursor-pointer'
								>
									+1600
								</button>
								<button
									onClick={() => setPrimogems((p) => p + 28800)}
									className='px-2 py-0.5 text-xs rounded bg-guild-gold/20 text-guild-gold hover:bg-guild-gold/30 transition-colors cursor-pointer'
								>
									+180 pulls
								</button>
							</div>
						</CardContent>
					</Card>

					{/* ── Banner Info + Stats (side by side) ── */}
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
						{/* Banner panel */}
						<Card
							className={cn(
								'lg:col-span-2 border-white/5 overflow-hidden py-0',
								bannerType === 'character'
									? 'bg-linear-to-br from-amber-500/5 to-guild-card'
									: bannerType === 'weapon'
										? 'bg-linear-to-br from-purple-500/5 to-guild-card'
										: 'bg-linear-to-br from-blue-500/5 to-guild-card',
							)}
						>
							<CardContent className='space-y-4 py-5'>
								{/* Banner header */}
								<div className='flex items-start justify-between'>
									<div>
										<h2 className='text-lg font-bold'>{currentConfig.label}</h2>
										<p className='text-sm text-guild-muted mt-1'>
											{currentConfig.description}
										</p>
									</div>
									<Badge
										className={cn(
											'text-xs shrink-0',
											isEventBanner
												? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
												: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
										)}
									>
										{isEventBanner ? 'Limited' : 'Permanent'}
									</Badge>
								</div>

								{/* Rate info cards */}
								<div className='grid grid-cols-3 gap-3'>
									<div className='rounded-lg bg-guild-elevated p-3 border border-white/5'>
										<div className='text-[10px] text-guild-dim uppercase tracking-wider'>
											Base 5★ Rate
										</div>
										<div className='text-sm font-mono text-amber-400 mt-1'>
											0.6%
										</div>
									</div>
									<div className='rounded-lg bg-guild-elevated p-3 border border-white/5'>
										<div className='text-[10px] text-guild-dim uppercase tracking-wider'>
											Current Rate
										</div>
										<div
											className={cn(
												'text-sm font-mono mt-1',
												inSoftPity ? 'text-amber-400' : 'text-guild-muted',
											)}
										>
											{(currentRate * 100).toFixed(1)}%
										</div>
									</div>
									<div className='rounded-lg bg-guild-elevated p-3 border border-white/5'>
										<div className='text-[10px] text-guild-dim uppercase tracking-wider'>
											Soft Pity At
										</div>
										<div className='text-sm font-mono text-guild-muted mt-1'>
											{currentConfig.softPityStart + 1}+
										</div>
									</div>
								</div>

								{/* Pull buttons */}
								<div className='flex flex-wrap gap-3'>
									<button
										onClick={() => doWish(1)}
										disabled={primogems < WISH_COST}
										className={cn(
											'h-11 px-6 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer',
											primogems >= WISH_COST
												? 'bg-guild-accent hover:bg-guild-accent/80 text-white guild-glow'
												: 'bg-guild-elevated text-guild-dim cursor-not-allowed',
										)}
									>
										<Sparkles className='h-4 w-4' />
										Wish x1
										<span className='text-xs opacity-70 ml-1'>160</span>
										<Gem className='h-3 w-3 opacity-70' />
									</button>
									<button
										onClick={() => doWish(10)}
										disabled={primogems < WISH_COST * 10}
										className={cn(
											'h-11 px-6 rounded-lg text-sm font-medium flex items-center gap-2 transition-all cursor-pointer',
											primogems >= WISH_COST * 10
												? 'bg-linear-to-r from-guild-accent to-guild-accent-2 hover:opacity-90 text-white guild-glow'
												: 'bg-guild-elevated text-guild-dim cursor-not-allowed',
										)}
									>
										<Sparkles className='h-4 w-4' />
										Wish x10
										<span className='text-xs opacity-70 ml-1'>1,600</span>
										<Gem className='h-3 w-3 opacity-70' />
									</button>
									<button
										onClick={resetWish}
										className='h-11 px-4 rounded-lg bg-guild-elevated hover:bg-white/10 text-sm text-guild-muted flex items-center gap-2 transition-colors cursor-pointer ml-auto'
									>
										<RotateCcw className='h-4 w-4' />
										Reset
									</button>
								</div>
							</CardContent>
						</Card>

						{/* Statistics panel */}
						<Card className='bg-guild-card border-white/5 py-0'>
							<CardContent className='space-y-3 py-5'>
								<h3 className='text-sm font-semibold flex items-center gap-2'>
									<Star className='h-4 w-4 text-guild-gold fill-guild-gold' />
									Statistics
								</h3>

								<div className='space-y-2'>
									<StatRow label='Total Wishes' value={wishStats.total} />
									<StatRow
										label='Primogems Spent'
										value={wishStats.primogemsSpent.toLocaleString()}
										valueClass='text-blue-400'
									/>

									<div className='h-px bg-white/5' />

									<StatRow
										label='5★ Obtained'
										value={wishStats.fiveStarCount}
										labelClass='text-amber-400'
										valueClass='text-amber-400'
									/>
									<StatRow
										label='4★ Obtained'
										value={wishStats.fourStarCount}
										labelClass='text-purple-400'
										valueClass='text-purple-400'
									/>
									<StatRow
										label='Avg 5★ Pity'
										value={
											wishStats.fiveStarCount > 0 ? wishStats.avgPity : '\u2014'
										}
									/>

									<div className='h-px bg-white/5' />

									{/* Pity counter */}
									<StatRow
										label='Current Pity'
										value={`${currentPity.pity5} / ${currentConfig.hardPity}`}
										valueClass={inSoftPity ? 'text-amber-400' : ''}
									/>

									{/* Pity bar */}
									<div className='w-full h-2 rounded-full bg-guild-elevated overflow-hidden'>
										<div
											className={cn(
												'h-full rounded-full transition-all duration-300',
												inSoftPity
													? 'bg-linear-to-r from-amber-500 to-amber-300'
													: 'bg-guild-accent',
											)}
											style={{
												width: `${(currentPity.pity5 / currentConfig.hardPity) * 100}%`,
											}}
										/>
									</div>

									{/* 50/50 status (event banners only) */}
									{isEventBanner && (
										<>
											<StatRow
												label='50/50 Status'
												value={currentPity.guaranteed5 ? 'Guaranteed' : '50/50'}
												valueClass={
													currentPity.guaranteed5
														? 'text-guild-success'
														: 'text-guild-muted'
												}
											/>
											<div className='flex items-center justify-between text-sm'>
												<span className='text-guild-muted'>
													Capturing Radiance
												</span>
												<span
													className={cn(
														'font-medium',
														currentPity.capturingRadianceActive
															? 'text-amber-400'
															: 'text-guild-muted',
													)}
												>
													{currentPity.capturingRadianceActive
														? 'Active'
														: 'Inactive'}
												</span>
											</div>
											{(wishStats.won5050 > 0 ||
												wishStats.lost5050 > 0 ||
												wishStats.radianceWins > 0) && (
												<div className='flex justify-between text-sm'>
													<span className='text-guild-muted'>Won / Lost</span>
													<span className='font-mono text-xs'>
														<span className='text-guild-success'>
															{wishStats.won5050}W
														</span>
														{' / '}
														<span className='text-guild-danger'>
															{wishStats.lost5050}L
														</span>
														{wishStats.radianceWins > 0 && (
															<>
																{' / '}
																<span className='text-amber-400'>
																	{wishStats.radianceWins}R
																</span>
															</>
														)}
													</span>
												</div>
											)}
											{/* Epitomized Path (weapon banner only) */}
											{bannerType === 'weapon' && (
												<EpitomizedPathSection
													pity={currentPity}
													onTargetChange={(idx) =>
														setPityStates((prev) => ({
															...prev,
															weapon: { ...prev.weapon, epitomizedTarget: idx },
														}))
													}
												/>
											)}
										</>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* ── Latest Pull Results ── */}
					{lastPull.length > 0 && (
						<Card className='bg-guild-card border-white/5 py-0'>
							<CardContent className='space-y-3 py-5'>
								<h3 className='text-sm font-semibold flex items-center gap-2'>
									<Sparkles className='h-4 w-4 text-guild-accent' />
									Latest Results
								</h3>
								<div className='flex flex-wrap gap-2'>
									{lastPull.map((r, i) => (
										<div
											key={i}
											className={cn(
												'rounded-lg p-2 border text-center min-w-[90px] max-w-[110px] transition-all',
												RARITY_COLORS.bg[r.rarity],
												RARITY_COLORS.border[r.rarity],
												r.rarity === 5 && 'gold-glow',
											)}
										>
											{r.icon && (
												<div className='flex justify-center mb-1'>
													<Image
														src={r.icon}
														alt={r.name}
														width={48}
														height={48}
														className='rounded'
														unoptimized
													/>
												</div>
											)}
											<div className='flex justify-center mb-0.5'>
												<RarityStarsRow count={r.rarity} rarity={r.rarity} size='h-2.5 w-2.5' />
											</div>
											<div
												className={cn(
													'text-[10px] font-medium leading-tight',
													RARITY_COLORS.text[r.rarity],
												)}
											>
												{r.name}
											</div>
											{r.rarity === 5 && r.fiftyFiftyOutcome && (
												<div className={cn(
													'text-[9px] mt-0.5 font-medium',
													r.fiftyFiftyOutcome === 'won' ? 'text-guild-success' :
													r.fiftyFiftyOutcome === 'lost' ? 'text-guild-danger' :
													r.fiftyFiftyOutcome === 'radiance' ? 'text-amber-400' :
													'text-guild-muted',
												)}>
													{r.fiftyFiftyOutcome === 'won' ? 'Won 50/50' :
													 r.fiftyFiftyOutcome === 'lost' ? 'Lost 50/50' :
													 r.fiftyFiftyOutcome === 'radiance' ? 'Radiance!' :
													 'Guaranteed'}
												</div>
											)}
											{r.rarity === 5 && (
												<div className='text-[9px] text-guild-dim mt-0.5'>
													Pity: {r.pityCount}
												</div>
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}

					{/* ── Pull History ── */}
					{wishResults.length > 0 && (
						<Card className='bg-guild-card border-white/5 py-0'>
							<CardContent className='space-y-3 py-5'>
								<button
									onClick={() => setShowHistory((h) => !h)}
									className='w-full flex items-center justify-between text-sm font-semibold cursor-pointer'
								>
									<span className='flex items-center gap-2'>
										<History className='h-4 w-4 text-guild-muted' />
										Pull History ({wishResults.length} total)
									</span>
									<ChevronDown
										className={cn(
											'h-4 w-4 text-guild-muted transition-transform',
											showHistory && 'rotate-180',
										)}
									/>
								</button>

								{showHistory && (
									<>
										{/* Compact grid of last 30 */}
										<div className='flex flex-wrap gap-1.5'>
											{wishResults.slice(0, 30).map((r, i) => (
												<div
													key={i}
													className={cn(
														'w-8 h-8 rounded border flex items-center justify-center text-[10px] font-mono shrink-0',
														RARITY_COLORS.bg[r.rarity],
														RARITY_COLORS.borderStrong[r.rarity],
														RARITY_COLORS.text[r.rarity],
													)}
													title={`#${r.pullNumber}: ${r.name} (${r.rarity}\u2605)`}
												>
													{r.rarity}\u2605
												</div>
											))}
										</div>

										{/* 5-star log */}
										{wishStats.fiveStarCount > 0 && (
											<div className='space-y-1.5 pt-2'>
												<div className='text-xs text-guild-dim font-medium uppercase tracking-wider'>
													5★ Log
												</div>
												<div className='flex flex-wrap gap-2'>
													{wishStats.fiveStars.map((r, i) => (
														<Badge
															key={i}
															className='bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs'
														>
															#{r.pullNumber} &ndash; {r.name} (Pity{' '}
															{r.pityCount})
														</Badge>
													))}
												</div>
											</div>
										)}
									</>
								)}
							</CardContent>
						</Card>
					)}
				</div>
			)}

			{/* ═══════════════════════════════════════════════════════════════
           ARTIFACT ROLLER
         ═══════════════════════════════════════════════════════════════ */}
			{mode === 'artifact' && (
				<div className='space-y-5'>
					{/* ── Domain Grid Selector ── */}
					<div>
						<h3 className='text-sm font-semibold mb-3 flex items-center gap-2'>
							<Dices className='h-4 w-4 text-guild-accent' />
							Select Domain
						</h3>
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
							{ARTIFACT_DOMAINS.map((domain, idx) => (
								<button
									key={domain.name}
									onClick={() => setSelectedDomainIdx(idx)}
									className={cn(
										'rounded-lg p-3 border text-left transition-all cursor-pointer',
										selectedDomainIdx === idx
											? 'bg-guild-accent/10 border-guild-accent ring-1 ring-guild-accent/30'
											: 'bg-guild-card border-white/5 hover:border-white/20',
									)}
								>
									<div className='font-medium text-sm'>{domain.name}</div>
									<div className='text-[11px] text-guild-muted mb-2'>
										{domain.location}
									</div>
									<div className='flex items-center gap-2'>
										{domain.sets.map((set) => (
											<div key={set.name} className='flex items-center gap-1.5'>
												<Image
													src={`${YATTA_ASSETS}/reliquary/${set.icon}.png`}
													alt={set.name}
													width={32}
													height={32}
													className='rounded'
													unoptimized
												/>
												<span className='text-[10px] text-guild-dim leading-tight max-w-[70px] truncate'>
													{set.name}
												</span>
											</div>
										))}
									</div>
								</button>
							))}
						</div>
					</div>

					{/* ── Roll Controls + Stats ── */}
					<Card className='bg-guild-card border-white/5 py-0'>
						<CardContent className='flex flex-wrap items-center gap-4 py-4'>
							<button
								onClick={doArtRoll}
								className='h-10 px-6 rounded-lg bg-guild-accent hover:bg-guild-accent/80 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer guild-glow'
							>
								<Dices className='h-4 w-4' /> Roll (20 Resin)
							</button>
							<button
								onClick={resetArtifacts}
								className='h-10 px-4 rounded-lg bg-guild-elevated hover:bg-white/10 text-sm flex items-center gap-2 transition-colors cursor-pointer'
							>
								<RotateCcw className='h-4 w-4' /> Reset
							</button>
							<div className='ml-auto flex gap-6 text-sm'>
								<span className='text-guild-muted'>
									Resin:{' '}
									<span className='font-mono text-guild-gold'>{resin}</span>
								</span>
								<span className='text-guild-muted'>
									Rolled: <span className='font-mono'>{artifacts.length}</span>
								</span>
								<span className='text-guild-muted'>
									Good:{' '}
									<span className='font-mono text-guild-success'>
										{goodArtCount} (
										{artifacts.length
											? ((goodArtCount / artifacts.length) * 100).toFixed(1)
											: 0}
										%)
									</span>
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Quip */}
					{artifacts.length > 0 && artifacts.length % 5 === 0 && (
						<Card className='bg-guild-card border-orange-500/20 py-0'>
							<CardContent className='py-4'>
								<p className='text-sm italic text-orange-400'>
									&quot;{ARTIFACT_QUIPS[quipIndex]}&quot;
								</p>
							</CardContent>
						</Card>
					)}

					{/* ── Artifact Grid ── */}
					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3'>
						{artifacts.slice(0, 20).map((a, i) => {
							const cv = calculateCV(a.substats);
							const cvColor = getCVColorClass(cv);
							const pieceIcon = getArtifactPieceIcon(a.set, a.slot);
							const grade = getScoreGrade(cv);
							return (
								<Card
									key={i}
									className={cn(
										'bg-guild-card py-0',
										a.rarity === 5
											? 'border-amber-500/20'
											: 'border-purple-500/20',
									)}
								>
									<CardContent className='space-y-2 p-3'>
										{/* Header: piece icon + type + rarity */}
										<div className='flex items-center gap-2'>
											{pieceIcon && (
												<Image
													src={pieceIcon}
													alt={SLOT_META[a.slot]?.label ?? a.slot}
													width={36}
													height={36}
													className='rounded shrink-0'
													unoptimized
												/>
											)}
											<div className='flex-1 min-w-0'>
												<div className='text-xs font-medium truncate'>
													{SLOT_META[a.slot]?.label ?? a.slot}
												</div>
												<div className='flex items-center gap-1.5'>
													<span
														className={cn(
															'text-[10px]',
															a.rarity === 5
																? 'text-amber-400'
																: 'text-purple-400',
														)}
													>
														{'\u2605'.repeat(a.rarity)}
													</span>
													<span className={cn(
														'text-[9px] font-medium px-1 rounded',
														a.baseSubCount === 4
															? 'bg-amber-500/15 text-amber-400'
															: 'bg-guild-elevated text-guild-dim',
													)}>
														{a.baseSubCount === 4 ? '4L' : '3L'}
													</span>
												</div>
											</div>
										</div>

										{/* Main stat */}
										<div className='flex items-center justify-between bg-guild-elevated rounded px-2 py-1'>
											<span className='text-xs font-medium text-guild-gold'>
												{a.mainStat}
											</span>
											<span className='text-xs font-mono text-guild-gold'>
												{MAIN_STAT_VALUES[a.mainStat] ?? ''}
											</span>
										</div>

										{/* Substats */}
										<div className='space-y-0.5'>
											{a.substats.map((s) => (
												<div
													key={s.name}
													className={cn(
														'text-[10px] flex items-center justify-between',
														s.name === 'CRIT Rate' || s.name === 'CRIT DMG'
															? 'text-white/80'
															: 'text-guild-muted',
													)}
												>
													<span className='flex items-center gap-1'>
														{s.name}
														{s.rolls > 1 && (
															<span className='text-guild-accent/70 font-mono text-[8px]'>
																+{s.rolls - 1}
															</span>
														)}
													</span>
													<span className='font-mono'>{s.value}</span>
												</div>
											))}
										</div>

										{/* Set name + CV + grade */}
										<div className='flex items-center justify-between pt-1 border-t border-white/5'>
											<span className='text-[9px] text-guild-dim truncate mr-2'>
												{a.set}
											</span>
											<div className='flex items-center gap-1.5 shrink-0'>
												{cv > 0 && (
													<span
														className={cn(
															'text-[10px] font-mono font-medium',
															cvColor,
														)}
														title='Crit Value = (CRIT Rate x 2) + CRIT DMG'
													>
														CV {cv.toFixed(1)}
													</span>
												)}
												<span
													className={cn(
														'text-[10px] font-mono font-bold',
														grade.color,
													)}
												>
													{grade.grade}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>

					{artifacts.length > 20 && (
						<p className='text-sm text-guild-muted text-center'>
							Showing last 20 of {artifacts.length}
						</p>
					)}
				</div>
			)}
		</div>
	);
}

// ── Epitomized Path Section ───────────────────────────────────────────

function EpitomizedPathSection({
	pity,
	onTargetChange,
}: {
	pity: BannerPity;
	onTargetChange: (idx: number) => void;
}) {
	const resolved = getResolvedBanner();
	const weapons = resolved.featured5Weapons;

	if (weapons.length === 0) return null;

	return (
		<>
			<div className='h-px bg-white/5' />
			<div className='space-y-2'>
				<div className='flex items-center gap-1.5 text-xs font-medium'>
					<Crosshair className='h-3.5 w-3.5 text-purple-400' />
					<span className='text-purple-400'>Epitomized Path</span>
				</div>
				{/* Target weapon selector */}
				<div className='flex gap-2'>
					{weapons.map((wpn, idx) => (
						<button
							key={wpn.name}
							onClick={() => onTargetChange(idx)}
							className={cn(
								'flex-1 rounded-md p-1.5 border text-[10px] font-medium transition-all cursor-pointer text-center',
								pity.epitomizedTarget === idx
									? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
									: 'bg-guild-elevated border-white/5 text-guild-dim hover:border-white/20',
							)}
						>
							{wpn.name}
						</button>
					))}
				</div>
				{/* Fate points display */}
				<div className='flex items-center justify-between'>
					<span className='text-xs text-guild-muted'>Fate Points</span>
					<div className='flex items-center gap-1.5'>
						{[0, 1].map((point) => (
							<div
								key={point}
								className={cn(
									'w-4 h-4 rounded-full border-2 transition-colors',
									pity.fatePoints > point
										? 'bg-purple-400 border-purple-400'
										: 'bg-transparent border-white/20',
								)}
							/>
						))}
						<span className='text-xs font-mono text-guild-muted ml-1'>
							{pity.fatePoints} / 2
						</span>
					</div>
				</div>
			</div>
		</>
	);
}

// ── Stat Row helper ───────────────────────────────────────────────────

function StatRow({
	label,
	value,
	labelClass,
	valueClass,
}: {
	label: string;
	value: string | number;
	labelClass?: string;
	valueClass?: string;
}) {
	return (
		<div className='flex justify-between text-sm'>
			<span className={cn('text-guild-muted', labelClass)}>{label}</span>
			<span className={cn('font-mono', valueClass)}>{value}</span>
		</div>
	);
}
