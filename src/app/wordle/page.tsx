'use client';

import { ALL_CHARACTERS, charIconUrl, ELEMENT_ICONS } from '@/lib/characters';
import type { CharacterEntry } from '@/lib/characters';
import { CHARACTER_META } from '@/data/character-meta';
import { cn } from '@/lib/utils';
import { Clock, HelpCircle, X, Trophy, Target, BarChart3, Share2, Check } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import GenshinWordle from './genshin-wordle';

// ── Types ─────────────────────────────────────────────────────────────

type GameTab = 'genshindle' | 'wordle';
type MatchResult = 'correct' | 'wrong' | 'partial';

interface GuessResult {
	character: CharacterEntry;
	matches: {
		gender: MatchResult;
		element: MatchResult;
		weapon: MatchResult;
		region: MatchResult;
		rarity: MatchResult;
		release: 'correct' | 'higher' | 'lower';
	};
}

// ── Helpers ───────────────────────────────────────────────────────────

function getDailyCharacter(): CharacterEntry {
	// Deterministic daily pick based on date
	const today = new Date();
	const seed =
		today.getFullYear() * 10000 +
		(today.getMonth() + 1) * 100 +
		today.getDate();
	const idx = seed % ALL_CHARACTERS.length;
	return ALL_CHARACTERS[idx];
}

function getDailyDateKey(): string {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	return `genshindle-${yyyy}-${mm}-${dd}`;
}

function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number } {
	const now = new Date();
	const midnight = new Date(now);
	midnight.setHours(24, 0, 0, 0);
	const diff = midnight.getTime() - now.getTime();
	return {
		hours: Math.floor(diff / 3600000),
		minutes: Math.floor((diff % 3600000) / 60000),
		seconds: Math.floor((diff % 60000) / 1000),
	};
}

function getReleaseYear(date: string): number {
	return new Date(date).getFullYear();
}

function compareGuess(
	guess: CharacterEntry,
	answer: CharacterEntry,
): GuessResult['matches'] {
	const guessMeta = CHARACTER_META[guess.name] ?? {
		gender: 'Female' as const,
		region: 'Other' as const,
	};
	const answerMeta = CHARACTER_META[answer.name] ?? {
		gender: 'Female' as const,
		region: 'Other' as const,
	};

	const guessYear = getReleaseYear(guess.release);
	const answerYear = getReleaseYear(answer.release);

	return {
		gender: guessMeta.gender === answerMeta.gender ? 'correct' : 'wrong',
		element: guess.element === answer.element ? 'correct' : 'wrong',
		weapon: guess.weapon === answer.weapon ? 'correct' : 'wrong',
		region: guessMeta.region === answerMeta.region ? 'correct' : 'wrong',
		rarity: guess.rarity === answer.rarity ? 'correct' : 'wrong',
		release:
			guessYear === answerYear
				? 'correct'
				: guessYear > answerYear
					? 'lower'
					: 'higher',
	};
}

// ── Stats ────────────────────────────────────────────────────────────

interface GenshindleStats {
	gamesPlayed: number;
	gamesWon: number;
	currentStreak: number;
	maxStreak: number;
	guessDistribution: number[];
	lastRecordedDate?: string;
}

const DEFAULT_STATS: GenshindleStats = {
	gamesPlayed: 0,
	gamesWon: 0,
	currentStreak: 0,
	maxStreak: 0,
	guessDistribution: [0, 0, 0, 0, 0, 0, 0, 0],
};

function loadStats(): GenshindleStats {
	try {
		const raw = localStorage.getItem('genshindle-stats');
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				...DEFAULT_STATS,
				...parsed,
				guessDistribution:
					Array.isArray(parsed.guessDistribution) &&
					parsed.guessDistribution.length === 8
						? parsed.guessDistribution
						: [...DEFAULT_STATS.guessDistribution],
			};
		}
	} catch {
		// Ignore
	}
	return { ...DEFAULT_STATS, guessDistribution: [...DEFAULT_STATS.guessDistribution] };
}

function saveStats(stats: GenshindleStats) {
	try {
		localStorage.setItem('genshindle-stats', JSON.stringify(stats));
	} catch {
		// Ignore
	}
}

// ── Match colors ──────────────────────────────────────────────────────

const MATCH_BG: Record<MatchResult, string> = {
	correct: 'bg-emerald-500/80',
	partial: 'bg-amber-500/80',
	wrong: 'bg-red-500/30',
};

const MATCH_BORDER: Record<MatchResult, string> = {
	correct: 'border-emerald-400/60',
	partial: 'border-amber-400/60',
	wrong: 'border-guild-border',
};

// ── Page with Tabs ────────────────────────────────────────────────────

export default function WordlePage() {
	const [activeTab, setActiveTab] = useState<GameTab>('genshindle');

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Tab Navigation */}
			<div className="flex gap-2">
				<button
					onClick={() => setActiveTab('genshindle')}
					className={cn(
						'px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
						activeTab === 'genshindle'
							? 'bg-guild-accent text-white'
							: 'bg-guild-elevated text-guild-muted hover:bg-foreground/10',
					)}
				>
					Genshindle
				</button>
				<button
					onClick={() => setActiveTab('wordle')}
					className={cn(
						'px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer',
						activeTab === 'wordle'
							? 'bg-guild-accent text-white'
							: 'bg-guild-elevated text-guild-muted hover:bg-foreground/10',
					)}
				>
					Wordle
				</button>
			</div>

			{/* Tab Content */}
			{activeTab === 'genshindle' ? <GenshindleGame /> : <GenshinWordle />}
		</div>
	);
}

// ── Genshindle Game ───────────────────────────────────────────────────

function GenshindleGame() {
	const [answer] = useState(() => getDailyCharacter());
	const [guesses, setGuesses] = useState<GuessResult[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [highlightIndex, setHighlightIndex] = useState(-1);
	const [gameOver, setGameOver] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [showStats, setShowStats] = useState(false);
	const [showCopied, setShowCopied] = useState(false);
	const [stats, setStats] = useState<GenshindleStats>(() => ({ ...DEFAULT_STATS, guessDistribution: [...DEFAULT_STATS.guessDistribution] }));
	const inputRef = useRef<HTMLInputElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);
	const [countdown, setCountdown] = useState(() => getTimeUntilMidnight());

	// Load saved game state from localStorage on mount
	useEffect(() => {
		try {
			const key = getDailyDateKey();
			const saved = localStorage.getItem(key);
			if (saved) {
				const names: string[] = JSON.parse(saved);
				const restored: GuessResult[] = [];
				for (const name of names) {
					const char = ALL_CHARACTERS.find((c) => c.name === name);
					if (char) {
						restored.push({
							character: char,
							matches: compareGuess(char, answer),
						});
					}
				}
				if (restored.length > 0) {
					setGuesses(restored);
					const didWin = restored.some(
						(g) => g.character.name === answer.name,
					);
					if (!didWin && restored.length >= 8) {
						setGameOver(true);
					}
				}
			}
		} catch {
			// Ignore localStorage errors (SSR, private browsing, etc.)
		}
	}, [answer]);

	// Save guesses to localStorage whenever they change
	useEffect(() => {
		try {
			const key = getDailyDateKey();
			const names = guesses.map((g) => g.character.name);
			localStorage.setItem(key, JSON.stringify(names));
		} catch {
			// Ignore localStorage errors
		}
	}, [guesses]);

	const guessedNames = useMemo(
		() => new Set(guesses.map((g) => g.character.name)),
		[guesses],
	);

	const won = guesses.some((g) => g.character.name === answer.name);

	// Load stats from localStorage on mount
	useEffect(() => {
		setStats(loadStats());
	}, []);

	// Record stats when game finishes (win or loss)
	useEffect(() => {
		if (!won && !gameOver) return;

		const dateKey = getDailyDateKey();
		const currentStats = loadStats();
		if (currentStats.lastRecordedDate === dateKey) {
			// Already recorded today, just sync state
			setStats(currentStats);
			return;
		}

		const updated = { ...currentStats, guessDistribution: [...currentStats.guessDistribution] };
		updated.gamesPlayed += 1;
		updated.lastRecordedDate = dateKey;

		if (won) {
			updated.gamesWon += 1;
			updated.currentStreak += 1;
			updated.maxStreak = Math.max(updated.maxStreak, updated.currentStreak);
			const idx = guesses.length - 1;
			if (idx >= 0 && idx < 8) {
				updated.guessDistribution[idx] += 1;
			}
		} else {
			updated.currentStreak = 0;
		}

		saveStats(updated);
		setStats(updated);
	}, [won, gameOver, guesses.length]);

	const suggestions = useMemo(() => {
		if (!inputValue.trim()) return [];
		const q = inputValue.toLowerCase();
		return ALL_CHARACTERS.filter(
			(c) =>
				c.name.toLowerCase().includes(q) && !guessedNames.has(c.name),
		).slice(0, 8);
	}, [inputValue, guessedNames]);

	const submitGuess = useCallback(
		(character: CharacterEntry) => {
			if (gameOver || won || guessedNames.has(character.name)) return;

			const matches = compareGuess(character, answer);
			const result: GuessResult = { character, matches };
			setGuesses((prev) => [...prev, result]);
			setInputValue('');
			setShowSuggestions(false);
			setHighlightIndex(-1);

			if (character.name === answer.name) {
				// Won!
			} else if (guesses.length >= 7) {
				// 8 guesses max, game over
				setGameOver(true);
			}
		},
		[answer, gameOver, won, guessedNames, guesses.length],
	);

	const handleShare = useCallback(async () => {
		const lines: string[] = [];
		const result = won ? `${guesses.length}/8` : 'X/8';
		lines.push(`Genshindle ${result}`);
		lines.push('');

		for (const guess of guesses) {
			const m = guess.matches;
			const row = [
				m.gender === 'correct' ? '\u{1F7E9}' : '\u{1F7E5}',
				m.element === 'correct' ? '\u{1F7E9}' : '\u{1F7E5}',
				m.weapon === 'correct' ? '\u{1F7E9}' : '\u{1F7E5}',
				m.region === 'correct' ? '\u{1F7E9}' : '\u{1F7E5}',
				m.rarity === 'correct' ? '\u{1F7E9}' : '\u{1F7E5}',
				m.release === 'correct' ? '\u{1F7E9}' : '\u{1F7E5}',
			].join('');
			lines.push(row);
		}

		lines.push('');
		lines.push('guild.app/wordle');

		try {
			await navigator.clipboard.writeText(lines.join('\n'));
			setShowCopied(true);
			setTimeout(() => setShowCopied(false), 2000);
		} catch {
			// Clipboard API not available
		}
	}, [guesses, won]);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			setHighlightIndex((prev) =>
				Math.min(prev + 1, suggestions.length - 1),
			);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			setHighlightIndex((prev) => Math.max(prev - 1, 0));
		} else if (e.key === 'Enter') {
			e.preventDefault();
			if (highlightIndex >= 0 && suggestions[highlightIndex]) {
				submitGuess(suggestions[highlightIndex]);
			} else if (suggestions.length === 1) {
				submitGuess(suggestions[0]);
			}
		} else if (e.key === 'Escape') {
			setShowSuggestions(false);
		}
	};

	// Close suggestions on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (
				suggestionsRef.current &&
				!suggestionsRef.current.contains(e.target as Node) &&
				inputRef.current &&
				!inputRef.current.contains(e.target as Node)
			) {
				setShowSuggestions(false);
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, []);

	// Countdown timer - ticks every second when game is finished
	useEffect(() => {
		if (!won && !gameOver) return;
		const interval = setInterval(() => {
			setCountdown(getTimeUntilMidnight());
		}, 1000);
		return () => clearInterval(interval);
	}, [won, gameOver]);

	const columns = [
		{ key: 'character', label: 'Character' },
		{ key: 'gender', label: 'Gender' },
		{ key: 'element', label: 'Element' },
		{ key: 'weapon', label: 'Weapon' },
		{ key: 'region', label: 'Region' },
		{ key: 'rarity', label: 'Rarity' },
		{ key: 'release', label: 'Release' },
	] as const;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Genshindle</h1>
					<p className="text-sm text-guild-muted mt-1">
						Guess the Genshin Impact character
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={() => setShowStats(true)}
						className="h-9 w-9 rounded-lg bg-guild-elevated hover:bg-foreground/10 flex items-center justify-center transition-colors cursor-pointer"
					>
						<BarChart3 className="h-4 w-4 text-guild-muted" />
					</button>
					<button
						onClick={() => setShowHelp(true)}
						className="h-9 w-9 rounded-lg bg-guild-elevated hover:bg-foreground/10 flex items-center justify-center transition-colors cursor-pointer"
					>
						<HelpCircle className="h-4 w-4 text-guild-muted" />
					</button>
				</div>
			</div>

			{/* Score card */}
			<div className="guild-card p-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 text-sm">
							<Target className="h-4 w-4 text-guild-accent" />
							<span className="text-guild-muted">Guesses:</span>
							<span className="font-mono font-bold">
								{guesses.length}/8
							</span>
						</div>
					</div>
					{(won || gameOver) && (
						<div className="flex items-center gap-2 text-sm text-guild-muted">
							<Clock className="h-3.5 w-3.5" />
							<span>Next in</span>
							<span className="font-mono font-bold text-foreground">
								{String(countdown.hours).padStart(2, '0')}:
								{String(countdown.minutes).padStart(2, '0')}:
								{String(countdown.seconds).padStart(2, '0')}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Win / Lose banner */}
			{won && (
				<div className="guild-card p-6 text-center guild-glow border-emerald-500/30">
					<Trophy className="h-8 w-8 text-guild-gold mx-auto mb-2" />
					<h2 className="text-xl font-bold text-emerald-400">
						Correct!
					</h2>
					<p className="text-sm text-guild-muted mt-1">
						You found{' '}
						<span className="text-foreground font-semibold">
							{answer.name}
						</span>{' '}
						in {guesses.length} guess
						{guesses.length !== 1 ? 'es' : ''}
					</p>
					<div className="flex items-center justify-center gap-3 mt-4">
						<button
							onClick={handleShare}
							className="flex items-center gap-2 px-4 py-2 rounded-lg bg-guild-accent hover:bg-guild-accent/80 text-white text-sm font-medium transition-colors cursor-pointer"
						>
							<Share2 className="h-4 w-4" />
							Share
						</button>
						<button
							onClick={() => setShowStats(true)}
							className="flex items-center gap-2 px-4 py-2 rounded-lg bg-guild-elevated hover:bg-foreground/10 text-sm font-medium transition-colors cursor-pointer"
						>
							<BarChart3 className="h-4 w-4" />
							Stats
						</button>
					</div>
					<p className="text-xs text-guild-dim mt-3">
						Next character in{' '}
						<span className="font-mono text-guild-muted">
							{String(countdown.hours).padStart(2, '0')}:
							{String(countdown.minutes).padStart(2, '0')}:
							{String(countdown.seconds).padStart(2, '0')}
						</span>
					</p>
				</div>
			)}
			{gameOver && !won && (
				<div className="guild-card p-6 text-center border-red-500/30">
					<h2 className="text-xl font-bold text-red-400">
						Game Over
					</h2>
					<p className="text-sm text-guild-muted mt-1">
						The answer was{' '}
						<span className="text-foreground font-semibold">
							{answer.name}
						</span>
					</p>
					<div className="flex items-center justify-center gap-3 mt-4">
						<button
							onClick={handleShare}
							className="flex items-center gap-2 px-4 py-2 rounded-lg bg-guild-accent hover:bg-guild-accent/80 text-white text-sm font-medium transition-colors cursor-pointer"
						>
							<Share2 className="h-4 w-4" />
							Share
						</button>
						<button
							onClick={() => setShowStats(true)}
							className="flex items-center gap-2 px-4 py-2 rounded-lg bg-guild-elevated hover:bg-foreground/10 text-sm font-medium transition-colors cursor-pointer"
						>
							<BarChart3 className="h-4 w-4" />
							Stats
						</button>
					</div>
					<p className="text-xs text-guild-dim mt-3">
						Next character in{' '}
						<span className="font-mono text-guild-muted">
							{String(countdown.hours).padStart(2, '0')}:
							{String(countdown.minutes).padStart(2, '0')}:
							{String(countdown.seconds).padStart(2, '0')}
						</span>
					</p>
				</div>
			)}

			{/* Input */}
			{!won && !gameOver && (
				<div className="relative">
					<input
						ref={inputRef}
						type="text"
						value={inputValue}
						onChange={(e) => {
							setInputValue(e.target.value);
							setShowSuggestions(true);
							setHighlightIndex(-1);
						}}
						onFocus={() => setShowSuggestions(true)}
						onKeyDown={handleKeyDown}
						placeholder="Type a character name..."
						className="w-full h-12 px-4 rounded-xl bg-guild-card border border-guild-border text-foreground placeholder:text-guild-dim focus:outline-none focus:border-guild-accent/50 focus:ring-1 focus:ring-guild-accent/30 transition-all"
					/>

					{/* Suggestions dropdown */}
					{showSuggestions && suggestions.length > 0 && (
						<div
							ref={suggestionsRef}
							className="absolute z-30 top-full mt-1 left-0 right-0 bg-guild-card border border-guild-border rounded-xl overflow-hidden shadow-2xl shadow-black/50"
						>
							{suggestions.map((char, i) => {
								const meta = CHARACTER_META[char.name];
								const EI = ELEMENT_ICONS[char.element];
								return (
									<button
										key={char.name}
										onClick={() => submitGuess(char)}
										className={cn(
											'w-full flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer text-left',
											i === highlightIndex
												? 'bg-guild-accent/20'
												: 'hover:bg-foreground/5',
										)}
									>
										<div className="w-8 h-8 rounded-full overflow-hidden bg-guild-elevated shrink-0">
											<Image
												src={charIconUrl(char.id)}
												alt={char.name}
												width={32}
												height={32}
												className="object-cover"
											/>
										</div>
										<div className="flex-1 min-w-0">
											<span className="text-sm font-medium truncate block">
												{char.name}
											</span>
											<span className="text-[10px] text-guild-muted">
												{char.element} ·{' '}
												{char.weapon} ·{' '}
												{meta?.region ?? '???'} ·{' '}
												{char.rarity}★
											</span>
										</div>
										{EI && (
											<EI
												size={16}
												className="shrink-0"
											/>
										)}
									</button>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* Guess table */}
			{guesses.length > 0 && (
				<div className="overflow-x-auto -mx-2 px-2">
					{/* Column headers */}
					<div className="grid grid-cols-7 gap-1.5 mb-2 px-1">
						{columns.map((col) => (
							<div
								key={col.key}
								className="text-[10px] font-medium text-guild-muted uppercase tracking-wider text-center"
							>
								{col.label}
							</div>
						))}
					</div>

					{/* Guess rows */}
					<div className="space-y-1.5">
						{guesses.map((guess, rowIdx) => {
							const meta = CHARACTER_META[guess.character.name];
							const EI =
								ELEMENT_ICONS[guess.character.element];
							const guessYear = getReleaseYear(
								guess.character.release,
							);

							return (
								<div
									key={guess.character.name}
									className="grid grid-cols-7 gap-1.5"
								>
									{/* Character icon + name */}
									<div
										className={cn(
											'flex items-center gap-2 p-2 rounded-lg border transition-all',
											guess.character.name ===
												answer.name
												? 'bg-emerald-500/80 border-emerald-400/60'
												: 'bg-guild-elevated border-guild-border',
										)}
										style={{
											animationDelay: `${rowIdx * 50}ms`,
										}}
									>
										<div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-guild-card">
											<Image
												src={charIconUrl(
													guess.character.id,
												)}
												alt={guess.character.name}
												width={28}
												height={28}
												className="object-cover"
											/>
										</div>
										<span className="text-xs font-medium truncate">
											{guess.character.name}
										</span>
									</div>

									{/* Gender */}
									<GuessCell
										value={meta?.gender ?? '?'}
										match={guess.matches.gender}
										delay={rowIdx * 50 + 80}
									/>

									{/* Element */}
									<GuessCell
										value={guess.character.element}
										match={guess.matches.element}
										delay={rowIdx * 50 + 160}
										icon={
											EI ? (
												<EI size={16} />
											) : undefined
										}
									/>

									{/* Weapon */}
									<GuessCell
										value={guess.character.weapon}
										match={guess.matches.weapon}
										delay={rowIdx * 50 + 240}
									/>

									{/* Region */}
									<GuessCell
										value={meta?.region ?? '?'}
										match={guess.matches.region}
										delay={rowIdx * 50 + 320}
									/>

									{/* Rarity */}
									<GuessCell
										value={`${guess.character.rarity}★`}
										match={guess.matches.rarity}
										delay={rowIdx * 50 + 400}
									/>

									{/* Release year */}
									<GuessCell
										value={String(guessYear)}
										match={
											guess.matches.release ===
											'correct'
												? 'correct'
												: 'wrong'
										}
										delay={rowIdx * 50 + 480}
										arrow={
											guess.matches.release !== 'correct'
												? guess.matches.release
												: undefined
										}
									/>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Stats modal */}
			{showStats && (
				<>
					<div
						className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
						onClick={() => setShowStats(false)}
					/>
					<div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto guild-card p-6 space-y-5">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold">Statistics</h3>
							<button
								onClick={() => setShowStats(false)}
								className="p-1 hover:bg-foreground/5 rounded-lg cursor-pointer"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						{/* Summary stats */}
						<div className="grid grid-cols-4 gap-3 text-center">
							<div>
								<div className="text-2xl font-bold">{stats.gamesPlayed}</div>
								<div className="text-[10px] text-guild-muted uppercase tracking-wider">Played</div>
							</div>
							<div>
								<div className="text-2xl font-bold">
									{stats.gamesPlayed > 0
										? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
										: 0}
								</div>
								<div className="text-[10px] text-guild-muted uppercase tracking-wider">Win %</div>
							</div>
							<div>
								<div className="text-2xl font-bold">{stats.currentStreak}</div>
								<div className="text-[10px] text-guild-muted uppercase tracking-wider">Streak</div>
							</div>
							<div>
								<div className="text-2xl font-bold">{stats.maxStreak}</div>
								<div className="text-[10px] text-guild-muted uppercase tracking-wider">Max Streak</div>
							</div>
						</div>

						{/* Guess distribution */}
						<div className="space-y-2">
							<h4 className="text-sm font-semibold text-guild-muted">Guess Distribution</h4>
							<div className="space-y-1.5">
								{stats.guessDistribution.map((count, i) => {
									const maxCount = Math.max(...stats.guessDistribution, 1);
									const pct = (count / maxCount) * 100;
									const isCurrentGuess = won && guesses.length === i + 1;
									return (
										<div key={i} className="flex items-center gap-2">
											<span className="text-xs font-mono text-guild-muted w-3 text-right shrink-0">
												{i + 1}
											</span>
											<div className="flex-1 h-5 relative">
												<div
													className={cn(
														'h-full rounded-sm flex items-center justify-end px-1.5 transition-all duration-500',
														isCurrentGuess
															? 'bg-emerald-500/80'
															: 'bg-guild-elevated',
													)}
													style={{
														width: `${Math.max(pct, 8)}%`,
													}}
												>
													<span className="text-[10px] font-bold">
														{count}
													</span>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				</>
			)}

			{/* Copied toast */}
			{showCopied && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/90 text-white text-sm font-medium shadow-lg shadow-black/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
					<Check className="h-4 w-4" />
					Copied to clipboard!
				</div>
			)}

			{/* Help modal */}
			{showHelp && (
				<>
					<div
						className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
						onClick={() => setShowHelp(false)}
					/>
					<div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto guild-card p-6 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold">How to Play</h3>
							<button
								onClick={() => setShowHelp(false)}
								className="p-1 hover:bg-foreground/5 rounded-lg cursor-pointer"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
						<div className="space-y-3 text-sm text-guild-muted">
							<p>
								Guess the mystery Genshin Impact character in 8
								tries or less.
							</p>
							<p>
								After each guess, the columns will show how your
								guess compares:
							</p>
							<div className="space-y-2">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded bg-emerald-500/80 border border-emerald-400/60" />
									<span>Correct match</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded bg-red-500/30 border border-guild-border" />
									<span>Wrong</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded bg-red-500/30 border border-guild-border flex items-center justify-center text-xs">
										▲
									</div>
									<span>
										Release year: answer is later (higher)
									</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded bg-red-500/30 border border-guild-border flex items-center justify-center text-xs">
										▼
									</div>
									<span>
										Release year: answer is earlier (lower)
									</span>
								</div>
							</div>
							<p className="text-guild-dim text-xs">
								Categories: Gender, Element, Weapon, Region,
								Rarity, Release Year
							</p>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

// ── Guess Cell ────────────────────────────────────────────────────────

function GuessCell({
	value,
	match,
	delay,
	icon,
	arrow,
}: {
	value: string;
	match: MatchResult;
	delay: number;
	icon?: React.ReactNode;
	arrow?: 'higher' | 'lower';
}) {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setVisible(true), delay);
		return () => clearTimeout(t);
	}, [delay]);

	return (
		<div
			className={cn(
				'flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all duration-300',
				visible
					? cn(MATCH_BG[match], MATCH_BORDER[match])
					: 'bg-guild-elevated border-guild-border scale-90 opacity-0',
			)}
		>
			{visible && (
				<>
					{icon && <div className="mb-0.5">{icon}</div>}
					<span className="text-[11px] font-medium leading-tight">
						{value}
					</span>
					{arrow && (
						<span className="text-[10px] mt-0.5">
							{arrow === 'higher' ? '▲' : '▼'}
						</span>
					)}
				</>
			)}
		</div>
	);
}
