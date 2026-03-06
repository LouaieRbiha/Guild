'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';
import {
	Award,
	ChevronRight,
	Dices,
	RotateCcw,
	Target,
	Trophy,
	Zap,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────

interface SubstatRoll {
	name: string;
	value: number;
	rolls: number;
}

interface RolledArtifact {
	substats: SubstatRoll[];
	cv: number;
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'insane';

interface ChallengeState {
	difficulty: Difficulty | null;
	targetCV: number;
	attempts: RolledArtifact[];
	maxAttempts: number;
	phase: 'select' | 'playing' | 'result';
	won: boolean;
}

interface ChallengeStats {
	gamesPlayed: number;
	gamesWon: number;
	highestCV: number;
	history: { difficulty: Difficulty; won: boolean; bestCV: number; date: string }[];
}

// ── Constants ────────────────────────────────────────────────────────────

const DIFFICULTY_PRESETS: {
	key: Difficulty;
	label: string;
	cv: number;
	color: string;
	description: string;
}[] = [
	{ key: 'easy', label: 'Easy', cv: 30, color: 'text-green-400', description: 'CV >= 30' },
	{ key: 'medium', label: 'Medium', cv: 35, color: 'text-yellow-400', description: 'CV >= 35' },
	{ key: 'hard', label: 'Hard', cv: 40, color: 'text-orange-400', description: 'CV >= 40' },
	{ key: 'insane', label: 'Insane', cv: 45, color: 'text-red-400', description: 'CV >= 45' },
];

const DIFFICULTY_BG: Record<Difficulty, string> = {
	easy: 'bg-green-500/10 border-green-500/20 hover:border-green-500/40',
	medium: 'bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/40',
	hard: 'bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40',
	insane: 'bg-red-500/10 border-red-500/20 hover:border-red-500/40',
};

const SUBSTATS = [
	'HP',
	'ATK',
	'DEF',
	'HP%',
	'ATK%',
	'DEF%',
	'CRIT Rate',
	'CRIT DMG',
	'Energy Recharge',
	'Elemental Mastery',
] as const;

type SubstatName = (typeof SUBSTATS)[number];

const SUB_RANGES: Record<SubstatName, number[]> = {
	HP: [209, 239, 269, 299],
	ATK: [14, 16, 18, 19],
	DEF: [16, 19, 21, 23],
	'HP%': [4.1, 4.7, 5.3, 5.8],
	'ATK%': [4.1, 4.7, 5.3, 5.8],
	'DEF%': [5.1, 5.8, 6.6, 7.3],
	'CRIT Rate': [2.7, 3.1, 3.5, 3.9],
	'CRIT DMG': [5.4, 6.2, 7.0, 7.8],
	'Energy Recharge': [4.5, 5.2, 5.8, 6.5],
	'Elemental Mastery': [16, 19, 21, 23],
};

const IS_PERCENT: Record<string, boolean> = {
	'HP%': true,
	'ATK%': true,
	'DEF%': true,
	'CRIT Rate': true,
	'CRIT DMG': true,
	'Energy Recharge': true,
};

const MAX_ATTEMPTS = 5;

// ── Artifact Roll Logic ──────────────────────────────────────────────────

function pickRandom<T>(arr: readonly T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

function rollSubstatValue(name: SubstatName): number {
	return pickRandom(SUB_RANGES[name]);
}

function rollArtifact(): RolledArtifact {
	// Pick 4 random unique substats
	const available = [...SUBSTATS];
	const picked: SubstatName[] = [];
	for (let i = 0; i < 4; i++) {
		const idx = Math.floor(Math.random() * available.length);
		picked.push(available[idx]);
		available.splice(idx, 1);
	}

	// Initialize substats with first roll
	const substats: Map<SubstatName, { value: number; rolls: number }> = new Map();
	for (const name of picked) {
		substats.set(name, { value: rollSubstatValue(name), rolls: 1 });
	}

	// 5 level-up upgrades, each into a random existing substat
	for (let i = 0; i < 5; i++) {
		const target = pickRandom(picked);
		const existing = substats.get(target)!;
		existing.value += rollSubstatValue(target);
		existing.rolls += 1;
	}

	// Build result
	const substatList: SubstatRoll[] = picked.map((name) => {
		const s = substats.get(name)!;
		return {
			name,
			value: Math.round(s.value * 10) / 10,
			rolls: s.rolls,
		};
	});

	// Calculate CV
	const critRate = substatList.find((s) => s.name === 'CRIT Rate')?.value ?? 0;
	const critDmg = substatList.find((s) => s.name === 'CRIT DMG')?.value ?? 0;
	const cv = Math.round((critRate * 2 + critDmg) * 10) / 10;

	return { substats: substatList, cv };
}

// ── LocalStorage ─────────────────────────────────────────────────────────

const STATS_KEY = 'guild-artifact-challenge-stats';

function loadStats(): ChallengeStats {
	if (typeof window === 'undefined') {
		return { gamesPlayed: 0, gamesWon: 0, highestCV: 0, history: [] };
	}
	try {
		const raw = localStorage.getItem(STATS_KEY);
		if (raw) return JSON.parse(raw) as ChallengeStats;
	} catch {
		// ignore
	}
	return { gamesPlayed: 0, gamesWon: 0, highestCV: 0, history: [] };
}

function saveStats(stats: ChallengeStats) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STATS_KEY, JSON.stringify(stats));
	} catch {
		// ignore
	}
}

// ── UI Helpers ───────────────────────────────────────────────────────────

function getCVColor(cv: number): string {
	if (cv >= 45) return 'text-red-400';
	if (cv >= 40) return 'text-amber-400';
	if (cv >= 35) return 'text-yellow-400';
	if (cv >= 30) return 'text-green-400';
	if (cv >= 20) return 'text-blue-400';
	return 'text-guild-dim';
}

function getCVGrade(cv: number): { grade: string; color: string } {
	if (cv >= 50) return { grade: 'SSS', color: 'text-red-400' };
	if (cv >= 45) return { grade: 'SS+', color: 'text-amber-400' };
	if (cv >= 40) return { grade: 'SS', color: 'text-amber-400' };
	if (cv >= 35) return { grade: 'S', color: 'text-yellow-400' };
	if (cv >= 30) return { grade: 'A', color: 'text-green-400' };
	if (cv >= 20) return { grade: 'B', color: 'text-blue-400' };
	if (cv >= 10) return { grade: 'C', color: 'text-guild-muted' };
	return { grade: 'D', color: 'text-guild-dim' };
}

const QUIPS = {
	win: [
		'The RNG gods smiled upon you... this time.',
		'You beat the odds. Most Genshin players never will.',
		'Artifact farming IRL speedrun: complete.',
		'Save some luck for the rest of us.',
	],
	lose: [
		"Welcome to the artifact grind. You'll never escape.",
		'DEF% sends its regards. Again.',
		'Maybe next time. Or the next. Or the next...',
		'The domain heard your prayers and chose violence.',
		'At least this is free. Real resin costs fragiles.',
	],
};

// ── Main Component ───────────────────────────────────────────────────────

export default function ArtifactChallengePage() {
	const [challenge, setChallenge] = useState<ChallengeState>({
		difficulty: null,
		targetCV: 30,
		attempts: [],
		maxAttempts: MAX_ATTEMPTS,
		phase: 'select',
		won: false,
	});
	const [stats, setStats] = useState<ChallengeStats>({
		gamesPlayed: 0,
		gamesWon: 0,
		highestCV: 0,
		history: [],
	});
	const mounted = useMounted();
	const [rollAnim, setRollAnim] = useState(false);

	// Load stats on mount
	useEffect(() => {
		setStats(loadStats());
	}, []);

	// Save stats when changed
	useEffect(() => {
		if (mounted) saveStats(stats);
	}, [stats, mounted]);

	// Select difficulty
	const selectDifficulty = useCallback((d: Difficulty) => {
		const preset = DIFFICULTY_PRESETS.find((p) => p.key === d)!;
		setChallenge({
			difficulty: d,
			targetCV: preset.cv,
			attempts: [],
			maxAttempts: MAX_ATTEMPTS,
			phase: 'playing',
			won: false,
		});
	}, []);

	// Roll artifact
	const doRoll = useCallback(() => {
		if (challenge.phase !== 'playing') return;
		if (challenge.attempts.length >= challenge.maxAttempts) return;

		setRollAnim(true);
		setTimeout(() => setRollAnim(false), 300);

		const artifact = rollArtifact();
		const newAttempts = [...challenge.attempts, artifact];
		const won = artifact.cv >= challenge.targetCV;
		const isLastAttempt = newAttempts.length >= challenge.maxAttempts;
		const gameOver = won || isLastAttempt;

		if (gameOver) {
			const bestCV = Math.max(...newAttempts.map((a) => a.cv));
			setChallenge((prev) => ({
				...prev,
				attempts: newAttempts,
				phase: 'result',
				won,
			}));

			setStats((prev) => ({
				gamesPlayed: prev.gamesPlayed + 1,
				gamesWon: prev.gamesWon + (won ? 1 : 0),
				highestCV: Math.max(prev.highestCV, bestCV),
				history: [
					{
						difficulty: challenge.difficulty!,
						won,
						bestCV,
						date: new Date().toISOString().slice(0, 10),
					},
					...prev.history.slice(0, 49), // keep last 50
				],
			}));
		} else {
			setChallenge((prev) => ({
				...prev,
				attempts: newAttempts,
			}));
		}
	}, [challenge]);

	// Play again
	const playAgain = useCallback(() => {
		setChallenge({
			difficulty: null,
			targetCV: 30,
			attempts: [],
			maxAttempts: MAX_ATTEMPTS,
			phase: 'select',
			won: false,
		});
	}, []);

	// Derived values
	const currentAttempt = challenge.attempts.length;
	const bestCVThisRun = useMemo(
		() =>
			challenge.attempts.length > 0
				? Math.max(...challenge.attempts.map((a) => a.cv))
				: 0,
		[challenge.attempts],
	);
	const winRate = stats.gamesPlayed > 0
		? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
		: '0.0';

	if (!mounted) {
		return (
			<div className='max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]'>
				<span className='text-guild-dim'>Loading...</span>
			</div>
		);
	}

	return (
		<div className='max-w-5xl mx-auto space-y-6'>
			{/* ═══ Page Header ═══ */}
			<div className='flex items-center gap-3'>
				<Target className='h-6 w-6 text-guild-accent' />
				<div>
					<h1 className='text-2xl font-bold'>Artifact Challenge</h1>
					<p className='text-sm text-guild-muted'>
						Beat the CV target in {MAX_ATTEMPTS} rolls or less
					</p>
				</div>
			</div>

			{/* ═══ Stats Panel ═══ */}
			<div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
				<MiniStat
					label='Games Played'
					value={stats.gamesPlayed}
					icon={<Dices className='h-4 w-4 text-guild-accent' />}
				/>
				<MiniStat
					label='Win Rate'
					value={`${winRate}%`}
					icon={<Trophy className='h-4 w-4 text-amber-400' />}
				/>
				<MiniStat
					label='Highest CV'
					value={stats.highestCV.toFixed(1)}
					icon={<Award className='h-4 w-4 text-green-400' />}
					valueClass={getCVColor(stats.highestCV)}
				/>
				<MiniStat
					label='Games Won'
					value={stats.gamesWon}
					icon={<Zap className='h-4 w-4 text-yellow-400' />}
				/>
			</div>

			{/* ═══ Difficulty Selection ═══ */}
			{challenge.phase === 'select' && (
				<div className='space-y-4'>
					<h2 className='text-sm font-semibold flex items-center gap-2'>
						<Target className='h-4 w-4 text-guild-accent' />
						Select Difficulty
					</h2>
					<div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
						{DIFFICULTY_PRESETS.map((preset) => (
							<button
								key={preset.key}
								onClick={() => selectDifficulty(preset.key)}
								className={cn(
									'rounded-xl border p-4 sm:p-5 text-left transition-all cursor-pointer',
									DIFFICULTY_BG[preset.key],
								)}
							>
								<div className={cn('text-lg font-bold', preset.color)}>
									{preset.label}
								</div>
								<div className='text-2xl font-mono font-bold mt-1'>
									CV {preset.cv}+
								</div>
								<div className='text-xs text-guild-dim mt-2'>
									{preset.key === 'easy' && '~35% chance per roll'}
									{preset.key === 'medium' && '~15% chance per roll'}
									{preset.key === 'hard' && '~5% chance per roll'}
									{preset.key === 'insane' && '~1% chance per roll'}
								</div>
								<div className='flex items-center gap-1 text-xs text-guild-muted mt-2'>
									<span>Start</span>
									<ChevronRight className='h-3 w-3' />
								</div>
							</button>
						))}
					</div>
				</div>
			)}

			{/* ═══ Playing Phase ═══ */}
			{(challenge.phase === 'playing' || challenge.phase === 'result') && (
				<div className='space-y-5'>
					{/* Target + Attempt Tracker */}
					<div className='rounded-xl bg-guild-card border border-white/5 p-4 flex flex-col sm:flex-row items-center gap-4'>
						<div className='flex items-center gap-3 flex-1'>
							<div
								className={cn(
									'w-12 h-12 rounded-xl flex items-center justify-center',
									challenge.difficulty &&
										DIFFICULTY_BG[challenge.difficulty].split(' ')[0],
								)}
							>
								<Target
									className={cn(
										'h-6 w-6',
										DIFFICULTY_PRESETS.find(
											(p) => p.key === challenge.difficulty,
										)?.color,
									)}
								/>
							</div>
							<div>
								<div className='text-xs text-guild-dim uppercase tracking-wider'>
									Target CV
								</div>
								<div className='text-2xl font-mono font-bold'>
									{challenge.targetCV}
								</div>
							</div>
						</div>

						{/* Attempt dots */}
						<div className='flex items-center gap-2'>
							{Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
								const attempt = challenge.attempts[i];
								const isActive = i === currentAttempt && challenge.phase === 'playing';
								const passed = attempt && attempt.cv >= challenge.targetCV;
								return (
									<div
										key={i}
										className={cn(
											'w-10 h-10 rounded-lg border-2 flex items-center justify-center text-xs font-mono font-bold transition-all',
											attempt
												? passed
													? 'bg-green-500/15 border-green-500/40 text-green-400'
													: 'bg-red-500/10 border-red-500/30 text-red-400'
												: isActive
													? 'border-guild-accent/50 text-guild-accent animate-pulse'
													: 'border-white/10 text-guild-dim',
										)}
										title={
											attempt
												? `CV ${attempt.cv.toFixed(1)}`
												: `Attempt ${i + 1}`
										}
									>
										{attempt ? attempt.cv.toFixed(0) : i + 1}
									</div>
								);
							})}
						</div>

						<div className='text-sm text-guild-muted font-mono'>
							Best: <span className={getCVColor(bestCVThisRun)}>{bestCVThisRun.toFixed(1)}</span>
						</div>
					</div>

					{/* Roll Button */}
					{challenge.phase === 'playing' && (
						<div className='flex justify-center'>
							<button
								onClick={doRoll}
								disabled={rollAnim}
								className={cn(
									'h-14 px-10 rounded-xl text-lg font-bold flex items-center gap-3 transition-all cursor-pointer',
									'bg-linear-to-r from-guild-accent to-guild-accent-2 hover:opacity-90 text-white guild-glow',
									rollAnim && 'scale-95 opacity-80',
								)}
							>
								<Dices className={cn('h-6 w-6', rollAnim && 'animate-spin')} />
								Roll Artifact ({currentAttempt + 1}/{MAX_ATTEMPTS})
							</button>
						</div>
					)}

					{/* Result Screen */}
					{challenge.phase === 'result' && (
						<div
							className={cn(
								'rounded-xl border-2 p-6 text-center space-y-4',
								challenge.won
									? 'bg-green-500/5 border-green-500/20'
									: 'bg-red-500/5 border-red-500/20',
							)}
						>
							<div
								className={cn(
									'text-4xl font-black',
									challenge.won ? 'text-green-400' : 'text-red-400',
								)}
							>
								{challenge.won ? 'VICTORY!' : 'DEFEAT'}
							</div>
							<div className='text-sm text-guild-muted'>
								Best CV this run:{' '}
								<span
									className={cn(
										'font-mono font-bold text-lg',
										getCVColor(bestCVThisRun),
									)}
								>
									{bestCVThisRun.toFixed(1)}
								</span>
								<span className='mx-2 text-guild-dim'>/</span>
								<span className='font-mono'>Target {challenge.targetCV}</span>
							</div>
							<p className='text-sm italic text-guild-muted'>
								&quot;
								{pickRandom(challenge.won ? QUIPS.win : QUIPS.lose)}
								&quot;
							</p>
							<button
								onClick={playAgain}
								className='h-11 px-6 rounded-lg bg-guild-accent hover:bg-guild-accent/80 text-sm font-medium text-white transition-colors cursor-pointer inline-flex items-center gap-2'
							>
								<RotateCcw className='h-4 w-4' />
								Play Again
							</button>
						</div>
					)}

					{/* Rolled Artifacts */}
					{challenge.attempts.length > 0 && (
						<div className='space-y-3'>
							<h3 className='text-sm font-semibold flex items-center gap-2'>
								<Dices className='h-4 w-4 text-guild-accent' />
								Rolled Artifacts
							</h3>
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3'>
								{challenge.attempts.map((artifact, i) => {
									const passed = artifact.cv >= challenge.targetCV;
									const grade = getCVGrade(artifact.cv);
									const isLatest =
										i === challenge.attempts.length - 1 &&
										challenge.phase === 'playing';
									return (
										<div
											key={i}
											className={cn(
												'rounded-xl border p-3 sm:p-4 space-y-2 transition-all',
												passed
													? 'bg-green-500/5 border-green-500/20'
													: 'bg-guild-card border-white/5',
												isLatest && 'ring-2 ring-guild-accent/30',
											)}
										>
											{/* Header */}
											<div className='flex items-center justify-between'>
												<span className='text-xs font-medium text-guild-dim'>
													Attempt {i + 1}
												</span>
												<div className='flex items-center gap-2'>
													<span
														className={cn(
															'text-xs font-mono font-bold px-2 py-0.5 rounded',
															passed
																? 'bg-green-500/15 text-green-400'
																: 'bg-red-500/10 text-red-400',
														)}
													>
														{passed ? 'PASS' : 'FAIL'}
													</span>
												</div>
											</div>

											{/* Substats */}
											<div className='space-y-1'>
												{artifact.substats.map((s) => (
													<div
														key={s.name}
														className={cn(
															'text-xs flex items-center justify-between',
															s.name === 'CRIT Rate' ||
																s.name === 'CRIT DMG'
																? 'text-white/90'
																: 'text-guild-muted',
														)}
													>
														<span className='flex items-center gap-1'>
															{s.name}
															{s.rolls > 1 && (
																<span className='text-guild-accent/60 font-mono text-[9px]'>
																	+{s.rolls - 1}
																</span>
															)}
														</span>
														<span className='font-mono'>
															{IS_PERCENT[s.name]
																? `${s.value.toFixed(1)}%`
																: Math.round(s.value)}
														</span>
													</div>
												))}
											</div>

											{/* CV + Grade */}
											<div className='flex items-center justify-between pt-2 border-t border-white/5'>
												<span
													className={cn(
														'text-sm font-mono font-bold',
														getCVColor(artifact.cv),
													)}
												>
													CV {artifact.cv.toFixed(1)}
												</span>
												<span
													className={cn(
														'text-sm font-mono font-black',
														grade.color,
													)}
												>
													{grade.grade}
												</span>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>
			)}

			{/* ═══ Leaderboard / History ═══ */}
			{stats.history.length > 0 && (
				<div className='rounded-xl bg-guild-card border border-white/5 p-4 space-y-3'>
					<h3 className='text-sm font-semibold flex items-center gap-2'>
						<Trophy className='h-4 w-4 text-guild-gold' />
						Recent Games
					</h3>
					<div className='overflow-x-auto'>
						<table className='w-full text-sm'>
							<thead>
								<tr className='text-[10px] text-guild-dim uppercase tracking-wider'>
									<th className='text-left py-2 pr-4'>#</th>
									<th className='text-left py-2 pr-4'>Date</th>
									<th className='text-left py-2 pr-4'>Difficulty</th>
									<th className='text-left py-2 pr-4'>Best CV</th>
									<th className='text-left py-2'>Result</th>
								</tr>
							</thead>
							<tbody>
								{stats.history.slice(0, 10).map((game, i) => {
									const preset = DIFFICULTY_PRESETS.find(
										(p) => p.key === game.difficulty,
									);
									return (
										<tr
											key={i}
											className='border-t border-white/5'
										>
											<td className='py-2 pr-4 font-mono text-guild-dim'>
												{i + 1}
											</td>
											<td className='py-2 pr-4 text-guild-muted'>
												{game.date}
											</td>
											<td className='py-2 pr-4'>
												<span
													className={cn(
														'text-xs font-medium',
														preset?.color,
													)}
												>
													{preset?.label}
												</span>
											</td>
											<td className='py-2 pr-4'>
												<span
													className={cn(
														'font-mono font-bold',
														getCVColor(game.bestCV),
													)}
												>
													{game.bestCV.toFixed(1)}
												</span>
											</td>
											<td className='py-2'>
												<span
													className={cn(
														'text-xs font-bold px-2 py-0.5 rounded',
														game.won
															? 'bg-green-500/15 text-green-400'
															: 'bg-red-500/10 text-red-400',
													)}
												>
													{game.won ? 'WIN' : 'LOSS'}
												</span>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* ═══ Highest CV Leaderboard ═══ */}
			{stats.history.length > 0 && (
				<div className='rounded-xl bg-guild-card border border-white/5 p-4 space-y-3'>
					<h3 className='text-sm font-semibold flex items-center gap-2'>
						<Award className='h-4 w-4 text-amber-400' />
						Top Rolls (All Time)
					</h3>
					<div className='flex flex-wrap gap-2'>
						{[...stats.history]
							.sort((a, b) => b.bestCV - a.bestCV)
							.slice(0, 10)
							.map((game, i) => {
								const grade = getCVGrade(game.bestCV);
								return (
									<div
										key={i}
										className={cn(
											'rounded-lg border px-3 py-2 flex items-center gap-2',
											i === 0
												? 'bg-amber-500/10 border-amber-500/20'
												: i === 1
													? 'bg-slate-300/5 border-slate-300/10'
													: i === 2
														? 'bg-orange-800/10 border-orange-800/20'
														: 'bg-guild-elevated border-white/5',
										)}
									>
										<span className='text-xs text-guild-dim font-mono'>
											#{i + 1}
										</span>
										<span
											className={cn(
												'font-mono font-bold',
												getCVColor(game.bestCV),
											)}
										>
											{game.bestCV.toFixed(1)}
										</span>
										<span className={cn('text-xs font-bold', grade.color)}>
											{grade.grade}
										</span>
										<span className='text-[10px] text-guild-dim'>
											{DIFFICULTY_PRESETS.find(
												(p) => p.key === game.difficulty,
											)?.label}
										</span>
									</div>
								);
							})}
					</div>
				</div>
			)}

			{/* ═══ Reset Stats ═══ */}
			{stats.gamesPlayed > 0 && (
				<div className='flex justify-center'>
					<button
						onClick={() => {
							if (
								confirm(
									'Reset all challenge stats and history? This cannot be undone.',
								)
							) {
								setStats({
									gamesPlayed: 0,
									gamesWon: 0,
									highestCV: 0,
									history: [],
								});
							}
						}}
						className='px-4 py-2 rounded-lg bg-guild-elevated hover:bg-white/10 text-sm text-guild-muted transition-colors cursor-pointer'
					>
						Reset All Stats
					</button>
				</div>
			)}
		</div>
	);
}

// ── Mini Stat Card ───────────────────────────────────────────────────────

function MiniStat({
	label,
	value,
	icon,
	valueClass,
}: {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	valueClass?: string;
}) {
	return (
		<div className='rounded-xl bg-guild-card border border-white/5 p-3 sm:p-4'>
			<div className='flex items-center gap-2 mb-1'>
				{icon}
				<span className='text-[10px] text-guild-dim uppercase tracking-wider'>
					{label}
				</span>
			</div>
			<div className={cn('text-xl font-mono font-bold', valueClass)}>
				{value}
			</div>
		</div>
	);
}
