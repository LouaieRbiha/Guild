'use client';

import { ALL_CHARACTERS, charIconUrl, ELEMENT_ICONS } from '@/lib/characters';
import type { CharacterEntry } from '@/lib/characters';
import { CHARACTER_META } from '@/data/character-meta';
import { cn } from '@/lib/utils';
import { RefreshCw, HelpCircle, X, Trophy, Target } from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// ── Types ─────────────────────────────────────────────────────────────

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

// ── Match colors ──────────────────────────────────────────────────────

const MATCH_BG: Record<MatchResult, string> = {
	correct: 'bg-emerald-500/80',
	partial: 'bg-amber-500/80',
	wrong: 'bg-red-500/30',
};

const MATCH_BORDER: Record<MatchResult, string> = {
	correct: 'border-emerald-400/60',
	partial: 'border-amber-400/60',
	wrong: 'border-white/5',
};

// ── Component ─────────────────────────────────────────────────────────

export default function WordlePage() {
	const [answer] = useState(() => getDailyCharacter());
	const [guesses, setGuesses] = useState<GuessResult[]>([]);
	const [inputValue, setInputValue] = useState('');
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [highlightIndex, setHighlightIndex] = useState(-1);
	const [gameOver, setGameOver] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const suggestionsRef = useRef<HTMLDivElement>(null);

	const guessedNames = useMemo(
		() => new Set(guesses.map((g) => g.character.name)),
		[guesses],
	);

	const won = guesses.some((g) => g.character.name === answer.name);

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

	const resetGame = () => {
		setGuesses([]);
		setGameOver(false);
		setInputValue('');
	};

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
		<div className="max-w-4xl mx-auto space-y-6">
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
						onClick={() => setShowHelp(true)}
						className="h-9 w-9 rounded-lg bg-guild-elevated hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
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
						<button
							onClick={resetGame}
							className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-guild-accent hover:bg-guild-accent/80 text-sm font-medium transition-colors cursor-pointer"
						>
							<RefreshCw className="h-3.5 w-3.5" />
							New Game
						</button>
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
						<span className="text-white font-semibold">
							{answer.name}
						</span>{' '}
						in {guesses.length} guess
						{guesses.length !== 1 ? 'es' : ''}
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
						<span className="text-white font-semibold">
							{answer.name}
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
						className="w-full h-12 px-4 rounded-xl bg-guild-card border border-white/10 text-white placeholder:text-guild-dim focus:outline-none focus:border-guild-accent/50 focus:ring-1 focus:ring-guild-accent/30 transition-all"
					/>

					{/* Suggestions dropdown */}
					{showSuggestions && suggestions.length > 0 && (
						<div
							ref={suggestionsRef}
							className="absolute z-30 top-full mt-1 left-0 right-0 bg-guild-card border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50"
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
												: 'hover:bg-white/5',
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
												: 'bg-guild-elevated border-white/5',
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
								className="p-1 hover:bg-white/5 rounded-lg cursor-pointer"
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
									<div className="w-8 h-8 rounded bg-red-500/30 border border-white/5" />
									<span>Wrong</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded bg-red-500/30 border border-white/5 flex items-center justify-center text-xs">
										▲
									</div>
									<span>
										Release year: answer is later (higher)
									</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded bg-red-500/30 border border-white/5 flex items-center justify-center text-xs">
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
					: 'bg-guild-elevated border-white/5 scale-90 opacity-0',
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
