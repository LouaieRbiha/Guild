'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMounted } from '@/hooks/use-mounted';
import { CalendarCheck, Check, Gift, Sparkles, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PrimogemIcon } from '@/components/icons/genshin-icons';

// ── Types ────────────────────────────────────────────────────────────────

interface DailyReward {
	day: number;
	item: string;
	amount: number;
	type: 'primogem' | 'mora' | 'exp' | 'ore' | 'wit';
	bonus?: string; // e.g. "weekly bonus"
}

interface DailyState {
	claimedDays: number[];
	currentDay: number;
	streak: number;
	lastClaimDate: string | null; // ISO date string
}

// ── Reward Data (28-day cycle) ──────────────────────────────────────────

const REWARDS: DailyReward[] = [
	{ day: 1, item: 'Primogems', amount: 100, type: 'primogem' },
	{ day: 2, item: 'Mora', amount: 10000, type: 'mora' },
	{ day: 3, item: "Adventurer's Experience", amount: 3, type: 'exp' },
	{ day: 4, item: 'Fine Enhancement Ore', amount: 5, type: 'ore' },
	{ day: 5, item: 'Primogems', amount: 100, type: 'primogem' },
	{ day: 6, item: 'Mora', amount: 10000, type: 'mora' },
	{ day: 7, item: 'Primogems', amount: 200, type: 'primogem', bonus: 'Weekly Bonus' },
	{ day: 8, item: "Hero's Wit", amount: 3, type: 'wit' },
	{ day: 9, item: 'Mora', amount: 10000, type: 'mora' },
	{ day: 10, item: 'Mystic Enhancement Ore', amount: 5, type: 'ore' },
	{ day: 11, item: 'Primogems', amount: 100, type: 'primogem' },
	{ day: 12, item: 'Mora', amount: 15000, type: 'mora' },
	{ day: 13, item: "Hero's Wit", amount: 3, type: 'wit' },
	{ day: 14, item: 'Primogems', amount: 300, type: 'primogem', bonus: 'Biweekly Bonus' },
	{ day: 15, item: 'Mora', amount: 20000, type: 'mora' },
	{ day: 16, item: "Hero's Wit", amount: 5, type: 'wit' },
	{ day: 17, item: 'Primogems', amount: 100, type: 'primogem' },
	{ day: 18, item: 'Mora', amount: 15000, type: 'mora' },
	{ day: 19, item: "Adventurer's Experience", amount: 3, type: 'exp' },
	{ day: 20, item: 'Mystic Enhancement Ore', amount: 5, type: 'ore' },
	{ day: 21, item: 'Primogems', amount: 400, type: 'primogem', bonus: 'Triweekly Bonus' },
	{ day: 22, item: 'Mora', amount: 20000, type: 'mora' },
	{ day: 23, item: "Hero's Wit", amount: 5, type: 'wit' },
	{ day: 24, item: 'Primogems', amount: 100, type: 'primogem' },
	{ day: 25, item: 'Mora', amount: 25000, type: 'mora' },
	{ day: 26, item: "Hero's Wit", amount: 5, type: 'wit' },
	{ day: 27, item: 'Primogems', amount: 100, type: 'primogem' },
	{ day: 28, item: 'Primogems', amount: 800, type: 'primogem', bonus: 'Monthly Grand Reward' },
];

// ── Reward Icons ─────────────────────────────────────────────────────────

const REWARD_COLORS: Record<DailyReward['type'], string> = {
	primogem: 'text-blue-400',
	mora: 'text-yellow-400',
	exp: 'text-green-400',
	ore: 'text-cyan-400',
	wit: 'text-purple-400',
};

function RewardIcon({ type, className }: { type: DailyReward['type']; className?: string }) {
	if (type === 'primogem') {
		return <PrimogemIcon className={cn('text-blue-400', className)} size={24} />;
	}

	const iconMap: Record<string, string> = {
		mora: '\u{1FA99}',   // coin
		exp: '\u{1F4D7}',   // green book
		ore: '\u{1F48E}',   // gem
		wit: '\u{1F4D5}',   // red book
	};

	return (
		<span className={cn('text-xl leading-none', REWARD_COLORS[type], className)}>
			{iconMap[type]}
		</span>
	);
}

// ── LocalStorage helpers ─────────────────────────────────────────────────

const STORAGE_KEY = 'guild-daily-checkin';

function loadState(): DailyState {
	if (typeof window === 'undefined') {
		return { claimedDays: [], currentDay: 1, streak: 0, lastClaimDate: null };
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as DailyState;
			return parsed;
		}
	} catch {
		// ignore
	}
	return { claimedDays: [], currentDay: 1, streak: 0, lastClaimDate: null };
}

function saveState(state: DailyState) {
	if (typeof window === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// ignore
	}
}

// ── Main Component ───────────────────────────────────────────────────────

export default function DailyCheckInPage() {
	const [state, setState] = useState<DailyState>({
		claimedDays: [],
		currentDay: 1,
		streak: 0,
		lastClaimDate: null,
	});
	const [claimAnim, setClaimAnim] = useState<number | null>(null);
	const mounted = useMounted();

	// Load from localStorage on mount
	useEffect(() => {
		const loaded = loadState();
		const today = new Date().toISOString().slice(0, 10);

		// If last claim was more than 1 day ago, the streak may continue
		// but the current day advances only when claimed
		if (loaded.lastClaimDate) {
			const lastDate = new Date(loaded.lastClaimDate);
			const todayDate = new Date(today);
			const diffDays = Math.floor(
				(todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
			);

			if (diffDays > 1) {
				// Streak broken -- reset streak but keep history
				loaded.streak = 0;
			}
		}

		setState(loaded);
	}, []);

	// Persist whenever state changes (after mount)
	useEffect(() => {
		if (mounted) {
			saveState(state);
		}
	}, [state, mounted]);

	// Check if today already claimed
	const [todayStr, setTodayStr] = useState<string>('');
	useEffect(() => {
		setTodayStr(new Date().toISOString().slice(0, 10));
	}, []);
	const isTodayClaimed = mounted && state.lastClaimDate === todayStr;

	// Claim handler
	const claimReward = useCallback(() => {
		if (isTodayClaimed) return;
		const today = new Date().toISOString().slice(0, 10);
		const nextDay = state.currentDay > 28 ? 1 : state.currentDay;

		setClaimAnim(nextDay);
		setTimeout(() => setClaimAnim(null), 600);

		setState((prev) => ({
			claimedDays: [...prev.claimedDays, nextDay],
			currentDay: nextDay >= 28 ? 1 : nextDay + 1,
			streak: prev.streak + 1,
			lastClaimDate: today,
		}));
	}, [isTodayClaimed, state.currentDay]);

	// Stats
	const stats = useMemo(() => {
		const totalPrimogems = state.claimedDays.reduce((sum, day) => {
			const reward = REWARDS.find((r) => r.day === day);
			if (reward && reward.type === 'primogem') return sum + reward.amount;
			return sum;
		}, 0);
		const daysRemaining = 28 - ((state.currentDay - 1) % 28);
		return { totalPrimogems, daysRemaining };
	}, [state.claimedDays, state.currentDay]);

	const currentDayIndex = state.currentDay > 28 ? 1 : state.currentDay;
	const todayReward = REWARDS.find((r) => r.day === currentDayIndex);

	if (!mounted) {
		return (
			<div className='max-w-4xl mx-auto flex items-center justify-center min-h-[50vh]'>
				<span className='text-guild-dim'>Loading...</span>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto space-y-6'>
			{/* ═══ Page Header ═══ */}
			<div className='flex items-center gap-3'>
				<CalendarCheck className='h-6 w-6 text-guild-accent' />
				<div>
					<h1 className='text-2xl font-bold'>Daily Check-In</h1>
					<p className='text-sm text-guild-muted'>
						Claim your daily rewards! Day {currentDayIndex} of 28
					</p>
				</div>
			</div>

			{/* ═══ Stats Summary ═══ */}
			<div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
				<StatCard
					label='Current Streak'
					value={`${state.streak}`}
					subtext='days'
					icon={<Sparkles className='h-4 w-4 text-amber-400' />}
					accent='amber'
				/>
				<StatCard
					label='Total Primogems'
					value={stats.totalPrimogems.toLocaleString()}
					subtext='earned'
					icon={<PrimogemIcon className='text-blue-400' size={16} />}
					accent='blue'
				/>
				<StatCard
					label='Days Claimed'
					value={`${state.claimedDays.length}`}
					subtext='total'
					icon={<Check className='h-4 w-4 text-green-400' />}
					accent='green'
				/>
				<StatCard
					label='Days Remaining'
					value={`${stats.daysRemaining}`}
					subtext='this cycle'
					icon={<CalendarCheck className='h-4 w-4 text-purple-400' />}
					accent='purple'
				/>
			</div>

			{/* ═══ Today's Reward + Claim Button ═══ */}
			{todayReward && (
				<div
					className={cn(
						'rounded-xl border-2 p-5 transition-all',
						isTodayClaimed
							? 'bg-green-500/5 border-green-500/20'
							: 'bg-guild-accent/5 border-guild-accent/30 guild-glow',
					)}
				>
					<div className='flex flex-col sm:flex-row items-center gap-4'>
						<div className='flex items-center gap-3 flex-1'>
							<div
								className={cn(
									'w-14 h-14 rounded-xl flex items-center justify-center',
									isTodayClaimed
										? 'bg-green-500/10'
										: 'bg-guild-accent/10',
								)}
							>
								{isTodayClaimed ? (
									<Check className='h-7 w-7 text-green-400' />
								) : (
									<Gift className='h-7 w-7 text-guild-accent' />
								)}
							</div>
							<div>
								<div className='text-sm text-guild-muted'>
									{isTodayClaimed
										? "Today's reward claimed!"
										: `Today's Reward - Day ${currentDayIndex}`}
								</div>
								<div className='text-lg font-bold flex items-center gap-2'>
									<RewardIcon type={todayReward.type} className='shrink-0' />
									<span>
										{todayReward.amount.toLocaleString()} {todayReward.item}
									</span>
								</div>
								{todayReward.bonus && (
									<span className='text-xs text-amber-400 font-medium'>
										{todayReward.bonus}
									</span>
								)}
							</div>
						</div>
						<button
							onClick={claimReward}
							disabled={isTodayClaimed}
							className={cn(
								'h-12 px-8 rounded-xl text-sm font-bold transition-all cursor-pointer shrink-0',
								isTodayClaimed
									? 'bg-green-500/10 text-green-400 border border-green-500/20 cursor-not-allowed'
									: 'bg-guild-accent hover:bg-guild-accent/80 text-white guild-glow',
							)}
						>
							{isTodayClaimed ? 'Claimed' : 'Claim Reward'}
						</button>
					</div>
				</div>
			)}

			{/* ═══ 7x4 Reward Grid ═══ */}
			<div className='space-y-3'>
				<h2 className='text-sm font-semibold flex items-center gap-2'>
					<Star className='h-4 w-4 text-guild-gold fill-guild-gold' />
					Monthly Rewards
				</h2>
				<div className='grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3'>
					{REWARDS.map((reward) => {
						const isClaimed = state.claimedDays.includes(reward.day);
						const isToday = reward.day === currentDayIndex && !isTodayClaimed;
						const isFuture = reward.day > currentDayIndex && !isClaimed;
						const isAnimating = claimAnim === reward.day;

						return (
							<div
								key={reward.day}
								className={cn(
									'relative rounded-xl border p-2 sm:p-3 flex flex-col items-center gap-1 transition-all min-h-[90px] sm:min-h-[110px]',
									isClaimed && 'bg-green-500/5 border-green-500/20',
									isToday &&
										'bg-guild-accent/5 border-guild-accent/40 ring-2 ring-guild-accent/20 animate-pulse',
									isFuture && 'bg-guild-card border-white/5 opacity-50',
									!isClaimed && !isToday && !isFuture && 'bg-guild-card border-white/5',
									isAnimating && 'scale-110',
									reward.bonus && !isClaimed && !isFuture && 'border-amber-500/30 bg-amber-500/5',
								)}
							>
								{/* Day number */}
								<div
									className={cn(
										'text-[10px] font-mono font-bold',
										isToday ? 'text-guild-accent' : 'text-guild-dim',
									)}
								>
									Day {reward.day}
								</div>

								{/* Reward icon */}
								<div className='flex items-center justify-center h-7'>
									<RewardIcon type={reward.type} />
								</div>

								{/* Amount */}
								<div
									className={cn(
										'text-xs font-bold tabular-nums',
										reward.type === 'primogem' ? 'text-blue-400' : 'text-white/80',
									)}
								>
									{reward.amount >= 1000
										? `${(reward.amount / 1000).toFixed(0)}k`
										: reward.amount}
								</div>

								{/* Item name (compact) */}
								<div className='text-[8px] sm:text-[9px] text-guild-dim text-center leading-tight'>
									{reward.type === 'primogem'
										? 'Primo'
										: reward.type === 'mora'
											? 'Mora'
											: reward.type === 'wit'
												? "Hero's Wit"
												: reward.type === 'exp'
													? 'EXP'
													: 'Ore'}
								</div>

								{/* Bonus badge */}
								{reward.bonus && (
									<div className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center'>
										<Star className='h-2 w-2 text-white fill-white' />
									</div>
								)}

								{/* Claimed overlay */}
								{isClaimed && (
									<div className='absolute inset-0 rounded-xl bg-green-500/10 flex items-center justify-center'>
										<div className='w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center'>
											<Check className='h-4 w-4 text-green-400' />
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* ═══ Primogem Breakdown ═══ */}
			<div className='rounded-xl bg-guild-card border border-white/5 p-4 space-y-3'>
				<h3 className='text-sm font-semibold flex items-center gap-2'>
					<Trophy className='h-4 w-4 text-guild-gold' />
					Cycle Summary
				</h3>
				<div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
					{[
						{
							label: 'Total Primogems in Cycle',
							value: REWARDS.filter((r) => r.type === 'primogem')
								.reduce((s, r) => s + r.amount, 0)
								.toLocaleString(),
							color: 'text-blue-400',
						},
						{
							label: 'Total Mora in Cycle',
							value: REWARDS.filter((r) => r.type === 'mora')
								.reduce((s, r) => s + r.amount, 0)
								.toLocaleString(),
							color: 'text-yellow-400',
						},
						{
							label: "Total Hero's Wit",
							value: REWARDS.filter((r) => r.type === 'wit')
								.reduce((s, r) => s + r.amount, 0)
								.toString(),
							color: 'text-purple-400',
						},
					].map((stat) => (
						<div
							key={stat.label}
							className='rounded-lg bg-guild-elevated p-3 border border-white/5'
						>
							<div className='text-[10px] text-guild-dim uppercase tracking-wider'>
								{stat.label}
							</div>
							<div className={cn('text-lg font-mono font-bold mt-1', stat.color)}>
								{stat.value}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* ═══ Reset Button ═══ */}
			<div className='flex justify-center'>
				<button
					onClick={() => {
						if (confirm('Reset all check-in progress? This cannot be undone.')) {
							const fresh: DailyState = {
								claimedDays: [],
								currentDay: 1,
								streak: 0,
								lastClaimDate: null,
							};
							setState(fresh);
						}
					}}
					className='px-4 py-2 rounded-lg bg-guild-elevated hover:bg-white/10 text-sm text-guild-muted transition-colors cursor-pointer'
				>
					Reset Progress
				</button>
			</div>
		</div>
	);
}

// ── Stat Card Helper ─────────────────────────────────────────────────────

function StatCard({
	label,
	value,
	subtext,
	icon,
	accent,
}: {
	label: string;
	value: string;
	subtext: string;
	icon: React.ReactNode;
	accent: 'amber' | 'blue' | 'green' | 'purple';
}) {
	const bgMap = {
		amber: 'bg-amber-500/5 border-amber-500/10',
		blue: 'bg-blue-500/5 border-blue-500/10',
		green: 'bg-green-500/5 border-green-500/10',
		purple: 'bg-purple-500/5 border-purple-500/10',
	};

	return (
		<div className={cn('rounded-xl border p-3 sm:p-4', bgMap[accent])}>
			<div className='flex items-center gap-2 mb-1'>
				{icon}
				<span className='text-[10px] text-guild-dim uppercase tracking-wider'>
					{label}
				</span>
			</div>
			<div className='text-xl font-mono font-bold'>{value}</div>
			<div className='text-[10px] text-guild-dim'>{subtext}</div>
		</div>
	);
}
