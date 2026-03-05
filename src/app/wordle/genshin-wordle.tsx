'use client';

import { cn } from '@/lib/utils';
import { Clock, HelpCircle, X, Trophy, Share2, Check, Delete, RefreshCw } from 'lucide-react';
import { useState, useCallback, useMemo, useEffect } from 'react';

// ── Word Pool ────────────────────────────────────────────────────────

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const VALID_WORDS: string[] = [
	'ABOUT', 'ABOVE', 'AFTER', 'AGAIN', 'APPLE', 'BEACH', 'BEGIN', 'BIBLE', 'BLACK', 'BLANK',
	'BLAST', 'BLAZE', 'BLEED', 'BLEND', 'BLIND', 'BLOCK', 'BLOOD', 'BLOWN', 'BOARD', 'BOOST',
	'BRAIN', 'BRAND', 'BRAVE', 'BREAD', 'BREAK', 'BREED', 'BRICK', 'BRIEF', 'BRING', 'BROAD',
	'BROKE', 'BROWN', 'BRUSH', 'BUILD', 'BURST', 'BUYER', 'CABIN', 'CANDY', 'CARGO', 'CARRY',
	'CATCH', 'CAUSE', 'CHAIN', 'CHAIR', 'CHAOS', 'CHARM', 'CHASE', 'CHEAP', 'CHECK', 'CHESS',
	'CHIEF', 'CHILD', 'CHINA', 'CHOSE', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLIMB',
	'CLOCK', 'CLONE', 'CLOSE', 'CLOUD', 'COACH', 'COAST', 'CORAL', 'COULD', 'COUNT', 'COURT',
	'COVER', 'CRAFT', 'CRANE', 'CRASH', 'CRAZY', 'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CROWN',
	'CRUSH', 'CURVE', 'CYCLE', 'DAILY', 'DANCE', 'DEATH', 'DELAY', 'DEMON', 'DEPTH', 'DEVIL',
	'DIRTY', 'DOUBT', 'DRAFT', 'DRAIN', 'DRAMA', 'DRANK', 'DRAWN', 'DREAM', 'DRESS', 'DRIED',
	'DRILL', 'DRINK', 'DRIVE', 'DYING', 'EAGER', 'EARLY', 'EARTH', 'EIGHT', 'ELECT', 'ELITE',
	'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'EQUAL', 'EVENT', 'EVERY', 'EXACT', 'EXIST', 'EXTRA',
	'FAINT', 'FAIRY', 'FAITH', 'FALSE', 'FEAST', 'FENCE', 'FEWER', 'FIBER', 'FIELD', 'FIFTH',
	'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLAME', 'FLASH', 'FLESH', 'FLOAT', 'FLOOD',
	'FLOOR', 'FLOUR', 'FLUID', 'FLUTE', 'FOCUS', 'FORCE', 'FORGE', 'FORTH', 'FOUND', 'FRAME',
	'FRANK', 'FRAUD', 'FRESH', 'FRONT', 'FROST', 'FRUIT', 'FULLY', 'GHOST', 'GIANT', 'GIVEN',
	'GLASS', 'GLOBE', 'GLORY', 'GOING', 'GRACE', 'GRADE', 'GRAIN', 'GRAND', 'GRANT', 'GRASS',
	'GRAVE', 'GREAT', 'GREEN', 'GRIND', 'GROSS', 'GROUP', 'GROWN', 'GUARD', 'GUESS', 'GUIDE',
	'GUILT', 'HAPPY', 'HARSH', 'HAVEN', 'HEART', 'HEAVY', 'HENCE', 'HORSE', 'HOTEL', 'HOUSE',
	'HUMAN', 'HUMOR', 'IDEAL', 'IMAGE', 'INDEX', 'INNER', 'INPUT', 'IRONY', 'ISSUE', 'IVORY',
	'JEWEL', 'JOINT', 'JUDGE', 'JUICE', 'KNOCK', 'KNOWN', 'LABEL', 'LARGE', 'LASER', 'LATER',
	'LAUGH', 'LAYER', 'LEARN', 'LEAST', 'LEAVE', 'LEGAL', 'LEVEL', 'LIGHT', 'LIMIT', 'LINEN',
	'LIVER', 'LOBBY', 'LOCAL', 'LOGIC', 'LOOSE', 'LOVER', 'LOWER', 'LUCKY', 'LUNCH', 'MAGIC',
	'MAJOR', 'MAKER', 'MANOR', 'MARCH', 'MARRY', 'MATCH', 'MAYOR', 'MEDIA', 'MERCY', 'METAL',
	'MIGHT', 'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY', 'MONTH', 'MORAL', 'MOTOR', 'MOUNT',
	'MOUTH', 'MOVIE', 'MUSIC', 'NAIVE', 'NERVE', 'NEVER', 'NIGHT', 'NOBLE', 'NOISE', 'NORTH',
	'NOTED', 'NOVEL', 'NURSE', 'OCEAN', 'OFFER', 'OFTEN', 'ORBIT', 'ORDER', 'OTHER', 'OUTER',
	'OWNED', 'OWNER', 'OXIDE', 'PAINT', 'PANEL', 'PANIC', 'PAPER', 'PARTY', 'PATCH', 'PAUSE',
	'PEACE', 'PEARL', 'PENNY', 'PHASE', 'PHONE', 'PHOTO', 'PIANO', 'PIECE', 'PILOT', 'PITCH',
	'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'PLAZA', 'PLEAD', 'POINT', 'POUND', 'POWER',
	'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE', 'PROOF', 'PROUD', 'PROVE',
	'PROXY', 'PULSE', 'PUNCH', 'PURSE', 'QUEEN', 'QUEST', 'QUICK', 'QUIET', 'QUOTA', 'QUOTE',
	'RADAR', 'RADIO', 'RAISE', 'RALLY', 'RANGE', 'RAPID', 'RATIO', 'REACH', 'REACT', 'READY',
	'REALM', 'REBEL', 'REFER', 'REIGN', 'RELAX', 'REPLY', 'RIGHT', 'RIGID', 'RISKY', 'RIVAL',
	'RIVER', 'ROBIN', 'ROBOT', 'ROCKY', 'ROGER', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL',
	'SAINT', 'SALAD', 'SAUCE', 'SCALE', 'SCENE', 'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SEVEN',
	'SHALL', 'SHAME', 'SHAPE', 'SHARE', 'SHARP', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIRT',
	'SHOCK', 'SHOOT', 'SHORT', 'SHOUT', 'SIGHT', 'SILLY', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED',
	'SKILL', 'SLASH', 'SLAVE', 'SLEEP', 'SLICE', 'SLIDE', 'SLOPE', 'SMALL', 'SMART', 'SMELL',
	'SMILE', 'SMOKE', 'SNAKE', 'SOLAR', 'SOLID', 'SOLVE', 'SORRY', 'SOUND', 'SOUTH', 'SPACE',
	'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPILL', 'SPINE', 'SPLIT', 'SPOKE', 'SPRAY', 'SQUAD',
	'STACK', 'STAFF', 'STAGE', 'STAIN', 'STAKE', 'STALE', 'STALL', 'STAMP', 'STAND', 'STARK',
	'START', 'STATE', 'STAYS', 'STEAM', 'STEEL', 'STEEP', 'STEER', 'STERN', 'STICK', 'STILL',
	'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STOVE', 'STRIP', 'STUCK', 'STUDY',
	'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUNNY', 'SUPER', 'SURGE', 'SWAMP', 'SWEAR', 'SWEET',
	'SWEPT', 'SWIFT', 'SWING', 'SWORD', 'SWORE', 'SWUNG', 'TABLE', 'TASTE', 'TEACH', 'TEETH',
	'THEME', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW', 'TIGER',
	'TIGHT', 'TIMER', 'TIRED', 'TITLE', 'TODAY', 'TOTAL', 'TOUCH', 'TOUGH', 'TOWER', 'TOXIC',
	'TRACE', 'TRACK', 'TRADE', 'TRAIL', 'TRAIN', 'TRAIT', 'TRASH', 'TREAT', 'TREND', 'TRIAL',
	'TRIBE', 'TRICK', 'TRIED', 'TROOP', 'TRUCK', 'TRULY', 'TRUMP', 'TRUNK', 'TRUST', 'TRUTH',
	'TUMOR', 'TWICE', 'TWIST', 'ULTRA', 'UNCLE', 'UNDER', 'UNION', 'UNITE', 'UNITY', 'UNTIL',
	'UPPER', 'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALID', 'VALUE', 'VIDEO', 'VIGOR', 'VIRUS',
	'VISIT', 'VITAL', 'VIVID', 'VOCAL', 'VOICE', 'VOTER', 'WAGES', 'WASTE', 'WATCH', 'WATER',
	'WEIGH', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHITE', 'WHOLE', 'WHOSE', 'WOMAN', 'WORLD',
	'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WOUND', 'WRIST', 'WRITE', 'WROTE', 'YACHT',
	'YIELD', 'YOUNG', 'YOUTH', 'ZONES',
];

// ── Types ────────────────────────────────────────────────────────────

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

interface LetterResult {
	letter: string;
	status: LetterStatus;
}

interface SavedState {
	guesses: string[];
	won: boolean;
	lost: boolean;
	shuffle?: number;
}

// ── Helpers ──────────────────────────────────────────────────────────

function getDailyWord(shuffle: number = 0): string {
	const today = new Date();
	const seed =
		today.getFullYear() * 10000 +
		(today.getMonth() + 1) * 100 +
		today.getDate() +
		shuffle * 7919; // prime offset per shuffle
	// Deterministic daily word via better hash mixing
	let h = seed;
	h = ((h >>> 16) ^ h) * 0x45d9f3b;
	h = ((h >>> 16) ^ h) * 0x45d9f3b;
	h = (h >>> 16) ^ h;
	const idx = Math.abs(h) % VALID_WORDS.length;
	return VALID_WORDS[idx];
}

function getDailyDateKey(): string {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const dd = String(today.getDate()).padStart(2, '0');
	return `wordle-${yyyy}-${mm}-${dd}`;
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

function evaluateGuess(guess: string, answer: string): LetterResult[] {
	const results: LetterResult[] = Array.from({ length: WORD_LENGTH }, (_, i) => ({
		letter: guess[i],
		status: 'absent' as LetterStatus,
	}));

	const answerLetters = answer.split('');
	const used = new Array(WORD_LENGTH).fill(false);

	// First pass: mark correct letters (green)
	for (let i = 0; i < WORD_LENGTH; i++) {
		if (guess[i] === answer[i]) {
			results[i].status = 'correct';
			used[i] = true;
		}
	}

	// Second pass: mark present letters (yellow)
	for (let i = 0; i < WORD_LENGTH; i++) {
		if (results[i].status === 'correct') continue;
		for (let j = 0; j < WORD_LENGTH; j++) {
			if (!used[j] && guess[i] === answerLetters[j]) {
				results[i].status = 'present';
				used[j] = true;
				break;
			}
		}
	}

	return results;
}

// ── Keyboard Layout ──────────────────────────────────────────────────

const KEYBOARD_ROWS = [
	['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
	['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
	['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

// ── Component ────────────────────────────────────────────────────────

export default function GenshinWordle() {
	const [shuffle, setShuffle] = useState(0);
	const [answer, setAnswer] = useState(() => getDailyWord(0));
	const [guesses, setGuesses] = useState<string[]>([]);
	const [currentGuess, setCurrentGuess] = useState('');
	const [won, setWon] = useState(false);
	const [lost, setLost] = useState(false);
	const [showHelp, setShowHelp] = useState(false);
	const [showCopied, setShowCopied] = useState(false);
	const [shakeRow, setShakeRow] = useState(false);
	const [invalidMessage, setInvalidMessage] = useState('');
	const [countdown, setCountdown] = useState(() => getTimeUntilMidnight());
	const [revealRow, setRevealRow] = useState(-1);
	const [loaded, setLoaded] = useState(false);

	// Load saved state
	useEffect(() => {
		try {
			const key = getDailyDateKey();
			const saved = localStorage.getItem(key);
			if (saved) {
				const state: SavedState = JSON.parse(saved);
				if (state.guesses && Array.isArray(state.guesses)) {
					const s = state.shuffle || 0;
					setShuffle(s);
					setAnswer(getDailyWord(s));
					setGuesses(state.guesses);
					setWon(state.won || false);
					setLost(state.lost || false);
					setRevealRow(state.guesses.length - 1);
				}
			}
		} catch {
			// Ignore
		}
		setLoaded(true);
	}, []);

	// Save state on change
	useEffect(() => {
		if (!loaded) return;
		try {
			const key = getDailyDateKey();
			const state: SavedState = { guesses, won, lost, shuffle };
			localStorage.setItem(key, JSON.stringify(state));
		} catch {
			// Ignore
		}
	}, [guesses, won, lost, shuffle, loaded]);

	// Countdown timer
	useEffect(() => {
		if (!won && !lost) return;
		const interval = setInterval(() => {
			setCountdown(getTimeUntilMidnight());
		}, 1000);
		return () => clearInterval(interval);
	}, [won, lost]);

	// Evaluate all guessed rows
	const evaluatedGuesses: LetterResult[][] = useMemo(
		() => guesses.map((g) => evaluateGuess(g, answer)),
		[guesses, answer],
	);

	// Build keyboard letter statuses
	const keyboardStatuses = useMemo(() => {
		const statuses: Record<string, LetterStatus> = {};
		for (const results of evaluatedGuesses) {
			for (const { letter, status } of results) {
				const existing = statuses[letter];
				if (!existing || statusPriority(status) > statusPriority(existing)) {
					statuses[letter] = status;
				}
			}
		}
		return statuses;
	}, [evaluatedGuesses]);

	const gameFinished = won || lost;

	const handleNewWord = useCallback(() => {
		const next = shuffle + 1;
		setShuffle(next);
		setAnswer(getDailyWord(next));
		setGuesses([]);
		setCurrentGuess('');
		setWon(false);
		setLost(false);
		setRevealRow(-1);
		setShakeRow(false);
		setInvalidMessage('');
	}, [shuffle]);

	const showInvalid = useCallback((msg: string) => {
		setInvalidMessage(msg);
		setShakeRow(true);
		setTimeout(() => {
			setShakeRow(false);
			setInvalidMessage('');
		}, 1200);
	}, []);

	const submitGuess = useCallback(() => {
		if (gameFinished) return;
		if (currentGuess.length !== WORD_LENGTH) {
			showInvalid('Not enough letters');
			return;
		}
		if (!/^[A-Z]+$/.test(currentGuess)) {
			showInvalid('Only letters A-Z allowed');
			return;
		}
		if (guesses.includes(currentGuess)) {
			showInvalid('Already guessed');
			return;
		}

		const newGuesses = [...guesses, currentGuess];
		setGuesses(newGuesses);
		setCurrentGuess('');
		setRevealRow(newGuesses.length - 1);

		if (currentGuess === answer) {
			setTimeout(() => setWon(true), WORD_LENGTH * 150 + 300);
		} else if (newGuesses.length >= MAX_GUESSES) {
			setTimeout(() => setLost(true), WORD_LENGTH * 150 + 300);
		}
	}, [currentGuess, guesses, answer, gameFinished, showInvalid]);

	const handleKey = useCallback(
		(key: string) => {
			if (gameFinished) return;
			if (key === 'ENTER') {
				submitGuess();
				return;
			}
			if (key === 'BACK' || key === 'BACKSPACE') {
				setCurrentGuess((prev) => prev.slice(0, -1));
				return;
			}
			if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
				setCurrentGuess((prev) => prev + key);
			}
		},
		[gameFinished, submitGuess, currentGuess.length],
	);

	// Physical keyboard handler
	useEffect(() => {
		const handler = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey || e.altKey) return;
			const key = e.key.toUpperCase();
			if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
				e.preventDefault();
				handleKey(key);
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [handleKey]);

	const handleShare = useCallback(async () => {
		const lines: string[] = [];
		const result = won ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
		lines.push(`Wordle ${result}`);
		lines.push('');

		for (const results of evaluatedGuesses) {
			const row = results
				.map((r) => {
					switch (r.status) {
						case 'correct':
							return '\u{1F7E9}';
						case 'present':
							return '\u{1F7E8}';
						default:
							return '\u{2B1B}';
					}
				})
				.join('');
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
	}, [evaluatedGuesses, guesses.length, won]);

	// Build the grid rows
	const gridRows: (LetterResult[] | null)[] = [];
	for (let i = 0; i < MAX_GUESSES; i++) {
		if (i < guesses.length) {
			gridRows.push(evaluatedGuesses[i]);
		} else if (i === guesses.length && !gameFinished) {
			// Current input row
			gridRows.push(null);
		} else {
			gridRows.push(null);
		}
	}

	return (
		<div className="max-w-lg mx-auto space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold">Wordle</h2>
					<p className="text-xs text-guild-muted mt-0.5">
						Guess the 5-letter word
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						onClick={handleNewWord}
						title="New word"
						className="h-9 w-9 rounded-lg bg-guild-elevated hover:bg-foreground/10 flex items-center justify-center transition-colors cursor-pointer"
					>
						<RefreshCw className="h-4 w-4 text-guild-muted" />
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
			<div className="guild-card p-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2 text-sm">
						<span className="text-guild-muted">Guesses:</span>
						<span className="font-mono font-bold">
							{guesses.length}/{MAX_GUESSES}
						</span>
						<span className="text-guild-dim text-xs">
							({VALID_WORDS.length} words)
						</span>
					</div>
					{gameFinished && (
						<div className="flex items-center gap-2 text-sm text-guild-muted">
							<Clock className="h-3.5 w-3.5" />
							<span className="font-mono font-bold text-foreground">
								{String(countdown.hours).padStart(2, '0')}:
								{String(countdown.minutes).padStart(2, '0')}:
								{String(countdown.seconds).padStart(2, '0')}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Invalid guess toast */}
			{invalidMessage && (
				<div className="flex justify-center">
					<div className="px-4 py-2 rounded-lg bg-guild-elevated border border-guild-border text-sm font-medium animate-in fade-in duration-200">
						{invalidMessage}
					</div>
				</div>
			)}

			{/* Win banner */}
			{won && (
				<div className="guild-card p-5 text-center guild-glow border-emerald-500/30 animate-wordle-win">
					<Trophy className="h-7 w-7 text-guild-gold mx-auto mb-2" />
					<h2 className="text-lg font-bold text-emerald-400">Correct!</h2>
					<p className="text-sm text-guild-muted mt-1">
						You found{' '}
						<span className="text-foreground font-semibold">{answer}</span> in{' '}
						{guesses.length} guess{guesses.length !== 1 ? 'es' : ''}
					</p>
					<div className="flex items-center justify-center gap-3 mt-3">
						<button
							onClick={handleShare}
							className="flex items-center gap-2 px-4 py-2 rounded-lg bg-guild-accent hover:bg-guild-accent/80 text-white text-sm font-medium transition-colors cursor-pointer"
						>
							<Share2 className="h-4 w-4" />
							Share
						</button>
					</div>
					<p className="text-xs text-guild-dim mt-3">
						Next word in{' '}
						<span className="font-mono text-guild-muted">
							{String(countdown.hours).padStart(2, '0')}:
							{String(countdown.minutes).padStart(2, '0')}:
							{String(countdown.seconds).padStart(2, '0')}
						</span>
					</p>
				</div>
			)}

			{/* Lose banner */}
			{lost && !won && (
				<div className="guild-card p-5 text-center border-red-500/30 animate-wordle-lose">
					<h2 className="text-lg font-bold text-red-400">Game Over</h2>
					<p className="text-sm text-guild-muted mt-1">
						The answer was{' '}
						<span className="text-foreground font-semibold">{answer}</span>
					</p>
					<div className="flex items-center justify-center gap-3 mt-3">
						<button
							onClick={handleShare}
							className="flex items-center gap-2 px-4 py-2 rounded-lg bg-guild-accent hover:bg-guild-accent/80 text-white text-sm font-medium transition-colors cursor-pointer"
						>
							<Share2 className="h-4 w-4" />
							Share
						</button>
					</div>
					<p className="text-xs text-guild-dim mt-3">
						Next word in{' '}
						<span className="font-mono text-guild-muted">
							{String(countdown.hours).padStart(2, '0')}:
							{String(countdown.minutes).padStart(2, '0')}:
							{String(countdown.seconds).padStart(2, '0')}
						</span>
					</p>
				</div>
			)}

			{/* Letter Grid */}
			<div className="flex flex-col items-center gap-1.5">
				{gridRows.map((row, rowIdx) => {
					const isCurrentRow = rowIdx === guesses.length && !gameFinished;
					const isRevealing = rowIdx === revealRow && rowIdx === guesses.length - 1;
					const isShaking = isCurrentRow && shakeRow;

					return (
						<div
							key={rowIdx}
							className={cn(
								'flex gap-1.5',
								isShaking && 'animate-shake',
							)}
						>
							{Array.from({ length: WORD_LENGTH }, (_, colIdx) => {
								if (row && !isCurrentRow) {
									// Completed guess row
									const cell = row[colIdx];
									const delay = isRevealing ? colIdx * 150 : 0;
									return (
										<LetterTile
											key={colIdx}
											letter={cell.letter}
											status={cell.status}
											delay={delay}
											revealed={!isRevealing || revealRow < rowIdx}
										/>
									);
								}

								// Current input row or empty row
								const letter = isCurrentRow ? (currentGuess[colIdx] || '') : '';
								return (
									<LetterTile
										key={colIdx}
										letter={letter}
										status="empty"
										delay={0}
										revealed
									/>
								);
							})}
						</div>
					);
				})}
			</div>

			{/* On-screen Keyboard */}
			{!gameFinished && (
				<div className="flex flex-col items-center gap-1.5 mt-2">
					{KEYBOARD_ROWS.map((row, rowIdx) => (
						<div key={rowIdx} className="flex gap-1">
							{row.map((key) => {
								const isSpecial = key === 'ENTER' || key === 'BACK';
								const status = keyboardStatuses[key];

								return (
									<button
										key={key}
										onClick={() => handleKey(key)}
										className={cn(
											'flex items-center justify-center rounded-md font-bold transition-colors cursor-pointer select-none',
											isSpecial
												? 'px-2.5 sm:px-3 h-12 text-[11px] sm:text-xs'
												: 'w-8 sm:w-9 h-12 text-sm',
											status === 'correct'
												? 'bg-emerald-500/80 text-white'
												: status === 'present'
													? 'bg-amber-500/80 text-white'
													: status === 'absent'
														? 'bg-guild-elevated/50 text-guild-dim'
														: 'bg-guild-elevated text-foreground hover:bg-foreground/10',
										)}
									>
										{key === 'BACK' ? (
											<Delete className="h-4 w-4" />
										) : (
											key
										)}
									</button>
								);
							})}
						</div>
					))}
				</div>
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
								Guess any 5-letter English word in {MAX_GUESSES} tries.
							</p>
							<p>
								After each guess, the tiles will change color to show how close
								your guess was:
							</p>
							<div className="space-y-2">
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-md bg-emerald-500/80 border border-emerald-400/60 flex items-center justify-center text-sm font-bold text-white">
										A
									</div>
									<span>Green = correct letter and position</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-md bg-amber-500/80 border border-amber-400/60 flex items-center justify-center text-sm font-bold text-white">
										B
									</div>
									<span>Yellow = letter is in the word but wrong position</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-9 h-9 rounded-md bg-guild-elevated border border-guild-border flex items-center justify-center text-sm font-bold text-guild-dim">
										C
									</div>
									<span>Gray = letter is not in the word</span>
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

// ── Letter Tile ──────────────────────────────────────────────────────

function LetterTile({
	letter,
	status,
	delay,
	revealed,
}: {
	letter: string;
	status: LetterStatus;
	delay: number;
	revealed: boolean;
}) {
	const [flipped, setFlipped] = useState(revealed);

	useEffect(() => {
		if (revealed) {
			setFlipped(true);
			return;
		}
		const t = setTimeout(() => setFlipped(true), delay);
		return () => clearTimeout(t);
	}, [revealed, delay]);

	const hasLetter = letter !== '';

	return (
		<div
			className={cn(
				'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-md border-2 text-lg sm:text-xl font-bold uppercase transition-all duration-300',
				!flipped && status !== 'empty'
					? 'bg-guild-elevated border-guild-border scale-y-0'
					: '',
				flipped && status === 'correct'
					? 'bg-emerald-500/80 border-emerald-400/60 text-white'
					: '',
				flipped && status === 'present'
					? 'bg-amber-500/80 border-amber-400/60 text-white'
					: '',
				flipped && status === 'absent'
					? 'bg-guild-elevated border-guild-border text-guild-dim'
					: '',
				status === 'empty' && hasLetter
					? 'bg-guild-card border-guild-muted/40 text-foreground scale-105'
					: '',
				status === 'empty' && !hasLetter
					? 'bg-guild-card border-guild-border/50'
					: '',
			)}
		>
			{letter}
		</div>
	);
}

// ── Utility ──────────────────────────────────────────────────────────

function statusPriority(status: LetterStatus): number {
	switch (status) {
		case 'correct':
			return 3;
		case 'present':
			return 2;
		case 'absent':
			return 1;
		default:
			return 0;
	}
}
