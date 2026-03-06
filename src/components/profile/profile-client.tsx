'use client';

import {
	ELEMENT_ICONS,
} from '@/components/icons/genshin-icons';
import { FallbackImage } from '@/components/shared';
import { ShareBuildButton } from '@/components/profile/share-button';
import type { AkashaCalculation } from '@/lib/akasha/types';
import { charGachaUrl } from '@/lib/characters';
import { ENKA_UI } from '@/lib/constants';
import type { EnkaProfile } from '@/lib/enka/client';
import {
	elBg,
	elColor,
	estimateResin,
	getRoast,
	getTier,
	scoreArtifact,
	scoreCharacterBuild,
} from '@/lib/scoring';
import { cn } from '@/lib/utils';
import { Download, RefreshCw, Share2, Trophy } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { getImportantSubs } from './artifact-analysis';
import { CharacterSelector } from './character-selector';
import { StatsSection } from './stats-section';
import { ArtifactDisplay } from './artifact-display';
import { BuildEvaluation } from './build-evaluation';

interface ProfileClientProps {
	profile: EnkaProfile;
	rankings?: Record<string, AkashaCalculation>;
	source?: 'akasha' | 'enka';
}

export function ProfileClient({
	profile,
	rankings = {},
	source = 'enka',
}: ProfileClientProps) {
	const router = useRouter();
	const [selectedIdx, setSelectedIdx] = useState(0);
	const selected = profile.characters[selectedIdx];

	// Refresh cooldown (60 seconds to match Enka cache)
	const REFRESH_COOLDOWN = 60;
	const [refreshCooldown, setRefreshCooldown] = useState(0);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		if (refreshCooldown <= 0) return;
		const timer = setInterval(() => {
			setRefreshCooldown((prev) => Math.max(0, prev - 1));
		}, 1000);
		return () => clearInterval(timer);
	}, [refreshCooldown]);

	const handleRefresh = useCallback(() => {
		if (refreshCooldown > 0 || refreshing) return;
		setRefreshing(true);
		setRefreshCooldown(REFRESH_COOLDOWN);
		router.refresh();
		// Give the server time to re-fetch, then mark done
		setTimeout(() => setRefreshing(false), 3000);
	}, [refreshCooldown, refreshing, router]);

	// Keyboard shortcuts: arrow keys to navigate characters
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			// Don't capture when typing in an input
			if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
			if (e.key === 'ArrowLeft') {
				setSelectedIdx((prev) => (prev > 0 ? prev - 1 : profile.characters.length - 1));
			} else if (e.key === 'ArrowRight') {
				setSelectedIdx((prev) => (prev < profile.characters.length - 1 ? prev + 1 : 0));
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [profile.characters.length]);

	// Score artifacts
	const artifactScores = selected.artifacts.map(scoreArtifact);
	const overallScore = scoreCharacterBuild(selected);
	const avgScore =
		artifactScores.length > 0
			? artifactScores.reduce((a, b) => a + b, 0) / artifactScores.length
			: 0;
	const resin = estimateResin(avgScore);
	const tier = getTier(overallScore);
	// Deterministic seed: uid + character name -> same roast on server and client
	const roast = getRoast(tier, `${profile.uid}-${selected.name}`);

	// Akasha leaderboard ranking for the selected character (if available)
	const ranking = rankings[selected.name];

	const importantSubs = getImportantSubs(selected.name);

	return (
		<div className='max-w-5xl mx-auto space-y-6'>
			{/* Player Header */}
			<div className='guild-card p-6 space-y-3'>
				<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
					<div>
						<div className='flex items-center gap-3'>
							<h1 className='text-2xl sm:text-3xl font-bold'>
								{profile.player.nickname}
							</h1>
							{source === 'akasha' && (
								<span className='px-2 py-0.5 rounded text-[10px] font-semibold bg-guild-gold/15 text-guild-gold uppercase tracking-wider'>
									Akasha
								</span>
							)}
						</div>
						{profile.player.signature && (
							<p className='text-sm text-guild-muted mt-1 italic'>
								&quot;{profile.player.signature}&quot;
							</p>
						)}
					</div>
					<div className='flex gap-2'>
						<button
							onClick={handleRefresh}
							disabled={refreshCooldown > 0 || refreshing}
							className={cn(
								'h-9 px-4 rounded-md text-sm flex items-center gap-2 transition-colors cursor-pointer',
								refreshCooldown > 0 || refreshing
									? 'bg-white/5 text-guild-dim cursor-not-allowed'
									: 'bg-guild-elevated hover:bg-white/10',
							)}
						>
							<RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
							{refreshing
								? 'Refreshing...'
								: refreshCooldown > 0
									? `${refreshCooldown}s`
									: 'Refresh'}
						</button>
						<button className='h-9 px-4 rounded-md bg-guild-elevated hover:bg-white/10 text-sm flex items-center gap-2 transition-colors cursor-pointer'>
							<Share2 className='h-4 w-4' /> Share
						</button>
						<button className='h-9 px-4 rounded-md bg-guild-accent hover:bg-guild-accent/80 text-sm flex items-center gap-2 transition-colors cursor-pointer'>
							<Download className='h-4 w-4' /> Card
						</button>
					</div>
				</div>
				<div className='flex items-center gap-3 flex-wrap text-sm'>
					<span className='px-2.5 py-1 rounded-md bg-guild-elevated text-guild-accent font-semibold'>
						AR {profile.player.level}
					</span>
					<span className='px-2.5 py-1 rounded-md bg-guild-elevated text-guild-muted'>
						WL {profile.player.worldLevel}
					</span>
					<span className='px-2.5 py-1 rounded-md bg-guild-elevated font-mono text-guild-muted'>
						{profile.uid}
					</span>
					{profile.player.achievements && (
						<span className='px-2.5 py-1 rounded-md bg-guild-gold/10 text-guild-gold flex items-center gap-1.5 font-medium'>
							<Trophy size={14} /> {profile.player.achievements}
						</span>
					)}
					{profile.player.abyssFloor && (
						<span className='px-2.5 py-1 rounded-md bg-guild-elevated text-guild-muted'>
							Abyss {profile.player.abyssFloor}-{profile.player.abyssChamber}
						</span>
					)}
				</div>
			</div>

			{/* Character Selector */}
			<CharacterSelector
				characters={profile.characters}
				selectedIdx={selectedIdx}
				setSelectedIdx={setSelectedIdx}
				rankings={rankings}
			/>

			{/* Character Detail Card */}
			<div className='guild-card overflow-hidden'>
				<div className='flex flex-col lg:flex-row'>
					{/* Left: Character splash art */}
					<div
						className={cn(
							'relative lg:w-2/5 min-h-64 lg:min-h-[28rem] overflow-hidden',
							'bg-linear-to-br to-transparent',
							elBg[selected.element] || elBg.Unknown,
						)}
					>
						<Image
							src={charGachaUrl(selected.id)}
							alt={selected.name}
							fill
							className='object-cover object-[50%_15%]'
							sizes='(max-width: 1024px) 100vw, 40vw'
							unoptimized
						/>
						{/* Element-tinted overlay */}
						<div className={cn(
							'absolute inset-0 bg-linear-to-br opacity-40',
							elBg[selected.element] || elBg.Unknown,
						)} />
						<div className='absolute bottom-0 inset-x-0 p-5 bg-linear-to-t from-guild-card via-guild-card/60 to-transparent'>
							<div className='flex items-center gap-2'>
								<h2
									className={cn(
										'text-2xl font-bold drop-shadow-lg',
										elColor[selected.element] || elColor.Unknown,
									)}
								>
									{selected.name}
								</h2>
								{(() => {
									const EI = ELEMENT_ICONS[selected.element];
									return EI ? <EI size={22} /> : null;
								})()}
							</div>
							<p className='text-sm text-white/70 mt-0.5'>
								Lv.{selected.level} · C{selected.constellation} ·{' '}
								{selected.talents.join('/')}
							</p>
							<div className='text-sm text-guild-gold mt-1'>
								{'★'.repeat(selected.rarity)}
							</div>
							<ShareBuildButton
								uid={profile.uid}
								characterId={String(selected.id)}
								className='mt-2'
							/>
						</div>
					</div>

					{/* Right: Stats panel */}
					<div className='flex-1 p-5 space-y-5'>
						<StatsSection
							selected={selected}
							ranking={ranking}
						/>
						<ArtifactDisplay
							selected={selected}
							artifactScores={artifactScores}
							uid={profile.uid}
							importantSubs={importantSubs}
						/>
					</div>
				</div>
			</div>

			{/* Build Evaluation (Roll Analysis + Improvement + Verdict) */}
			<BuildEvaluation
				selected={selected}
				artifactScores={artifactScores}
				overallScore={overallScore}
				tier={tier}
				roast={roast}
				resin={resin}
				uid={profile.uid}
				importantSubs={importantSubs}
			/>
		</div>
	);
}
