'use client';

import { MaterialCard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { getDomainDays, isDomainOpenToday } from '@/data/farming-schedule';
import { cn } from '@/lib/utils';
import {
	CharacterDetail,
	MaterialGroup,
	MaterialItem,
} from '@/lib/yatta/client';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { useEffect, useState } from 'react';
import { type ElementColors } from './detail-helpers';

// Ascension level breakpoints -- phases map to these levels
const ASCENSION_LEVELS = [20, 40, 50, 60, 70, 80, 90];

function levelToPhaseIdx(lv: number): number {
	let idx = 0;
	for (const bp of ASCENSION_LEVELS) {
		if (lv <= bp) break;
		idx++;
	}
	return idx;
}

function aggregateMaterials(
	groups: MaterialGroup[],
	fromLv: number,
	toLv: number,
): MaterialItem[] {
	const fromPhase = levelToPhaseIdx(fromLv);
	const toPhase = levelToPhaseIdx(toLv);
	const merged: Record<string, MaterialItem> = {};
	for (let i = fromPhase; i < toPhase; i++) {
		if (!groups[i]) continue;
		for (const item of groups[i].items) {
			if (merged[item.id]) {
				merged[item.id] = {
					...merged[item.id],
					count: merged[item.id].count + item.count,
				};
			} else {
				merged[item.id] = { ...item };
			}
		}
	}
	return Object.values(merged).sort(
		(a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name),
	);
}

// Mora costs per ascension phase (Phase 1 through 6)
const ASCENSION_MORA = [20000, 40000, 60000, 80000, 100000, 120000];

function calcMora(fromLv: number, toLv: number): number {
	const fromPhase = levelToPhaseIdx(fromLv);
	const toPhase = levelToPhaseIdx(toLv);
	return ASCENSION_MORA.slice(fromPhase, toPhase).reduce((a, b) => a + b, 0);
}

// Dual-thumb range slider component
function RangeSlider({
	value,
	onChange,
	min,
	max,
	label,
}: {
	value: [number, number];
	onChange: (v: [number, number]) => void;
	min: number;
	max: number;
	label: string;
}) {
	return (
		<div className='space-y-4'>
			<div className='flex items-center justify-between'>
				<span className='text-base text-guild-muted'>{label}</span>
				<div className='flex items-center gap-3'>
					<div className='flex items-center gap-1.5'>
						<input
							type='number'
							min={min}
							max={value[1]}
							value={value[0]}
							onChange={(e) => {
								const v = Math.max(
									min,
									Math.min(value[1], Number(e.target.value) || min),
								);
								onChange([v, value[1]]);
							}}
							className='w-14 text-center text-sm font-bold bg-foreground/5 border border-guild-border rounded-md py-1 text-foreground focus:outline-none focus:border-guild-accent'
						/>
						<span className='text-guild-dim text-base'>&rarr;</span>
						<input
							type='number'
							min={value[0]}
							max={max}
							value={value[1]}
							onChange={(e) => {
								const v = Math.max(
									value[0],
									Math.min(max, Number(e.target.value) || max),
								);
								onChange([value[0], v]);
							}}
							className='w-14 text-center text-sm font-bold bg-foreground/5 border border-guild-border rounded-md py-1 text-foreground focus:outline-none focus:border-guild-accent'
						/>
					</div>
				</div>
			</div>

			<SliderPrimitive.Root
				className='relative flex items-center select-none touch-none w-full h-5'
				value={value}
				onValueChange={(v) => onChange(v as [number, number])}
				min={min}
				max={max}
				step={1}
				minStepsBetweenThumbs={1}
			>
				<SliderPrimitive.Track className='relative h-1.5 grow rounded-full bg-foreground/10'>
					<SliderPrimitive.Range className='absolute h-full rounded-full bg-guild-accent/60' />
				</SliderPrimitive.Track>
				<SliderPrimitive.Thumb
					className='block w-5 h-5 rounded-full bg-guild-accent border-2 border-white shadow-lg shadow-guild-accent/30
            hover:bg-guild-accent/90 focus:outline-none focus:ring-2 focus:ring-guild-accent/50 transition-colors cursor-grab active:cursor-grabbing'
					aria-label='From level'
				/>
				<SliderPrimitive.Thumb
					className='block w-5 h-5 rounded-full bg-guild-accent border-2 border-white shadow-lg shadow-guild-accent/30
            hover:bg-guild-accent/90 focus:outline-none focus:ring-2 focus:ring-guild-accent/50 transition-colors cursor-grab active:cursor-grabbing'
					aria-label='To level'
				/>
			</SliderPrimitive.Root>

			{/* Breakpoint markers */}
			<div className='relative h-4 -mt-2'>
				{[min, ...ASCENSION_LEVELS.filter((l) => l <= max)].map((lv) => {
					const pct = ((lv - min) / (max - min)) * 100;
					const isInRange = lv >= value[0] && lv <= value[1];
					return (
						<button
							key={lv}
							onClick={() => {
								const distFrom = Math.abs(lv - value[0]);
								const distTo = Math.abs(lv - value[1]);
								if (distFrom <= distTo && lv < value[1])
									onChange([lv, value[1]]);
								else if (lv > value[0]) onChange([value[0], lv]);
							}}
							className={`absolute text-[10px] -translate-x-1/2 transition-colors cursor-pointer
                ${isInRange ? 'text-foreground/70' : 'text-foreground/20'} hover:text-foreground`}
							style={{ left: `${pct}%` }}
						>
							{lv}
						</button>
					);
				})}
			</div>
		</div>
	);
}

export function MaterialsTab({
	detail,
	colors,
}: {
	detail: CharacterDetail;
	colors: ElementColors;
}) {
	const [ascRange, setAscRange] = useState<[number, number]>([1, 90]);
	const [talentRange, setTalentRange] = useState<[number, number]>([1, 10]);

	const ascMaterials = aggregateMaterials(
		detail.ascensionMaterials,
		ascRange[0],
		ascRange[1],
	);
	const ascMora = calcMora(ascRange[0], ascRange[1]);

	const talentFromIdx = talentRange[0] - 1;
	const talentToIdx = talentRange[1] - 1;
	const talentMaterials: MaterialItem[] = (() => {
		const merged: Record<string, MaterialItem> = {};
		for (let i = talentFromIdx; i < talentToIdx; i++) {
			if (!detail.talentMaterials[i]) continue;
			for (const item of detail.talentMaterials[i].items) {
				if (merged[item.id]) {
					merged[item.id] = {
						...merged[item.id],
						count: merged[item.id].count + item.count,
					};
				} else {
					merged[item.id] = { ...item };
				}
			}
		}
		return Object.values(merged).sort(
			(a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name),
		);
	})();

	// Find talent book domain schedule from talent materials
	const talentBookSchedule: { materialName: string; days: string[] }[] = [];
	for (const mat of talentMaterials) {
		const days = getDomainDays(mat.name);
		if (days && !talentBookSchedule.some((s) => s.materialName === mat.name)) {
			talentBookSchedule.push({ materialName: mat.name, days });
		}
	}

	const [todayName, setTodayName] = useState('');
	useEffect(() => {
		const dayNames = [
			'Sunday', 'Monday', 'Tuesday', 'Wednesday',
			'Thursday', 'Friday', 'Saturday',
		];
		setTodayName(dayNames[new Date().getDay()]);
	}, []);

	return (
		<div className='space-y-6'>
			{/* Ascension Materials */}
			<div className='space-y-4'>
				<div className='space-y-2'>
					<h2 className='text-2xl font-bold text-foreground flex items-center gap-3'>
						<span className={colors.text}>&#11014;</span> Ascension Materials
					</h2>
					<div className={`h-0.5 rounded-full ${colors.bg}`} />
				</div>

				<div className='guild-card p-5'>
					<RangeSlider
						value={ascRange}
						onChange={setAscRange}
						min={1}
						max={90}
						label='Character Level'
					/>
				</div>

				{ascRange[0] === ascRange[1] ? (
					<p className='text-guild-dim text-base'>
						Drag the slider to see materials needed.
					</p>
				) : ascMaterials.length > 0 ? (
					<div className='guild-card p-4'>
						<div className='flex items-center justify-between mb-4'>
							<p className='text-lg font-semibold text-foreground'>
								Lv {ascRange[0]} &rarr; {ascRange[1]}
							</p>
							{ascMora > 0 && (
								<span className='text-base text-yellow-400 font-medium'>
									{ascMora.toLocaleString()} Mora
								</span>
							)}
						</div>
						<div className='flex flex-wrap gap-4 justify-start'>
							{ascMaterials.map((item) => (
								<MaterialCard key={item.id} item={item} />
							))}
						</div>
					</div>
				) : (
					<p className='text-guild-dim text-base'>
						No ascension materials needed for this range.
					</p>
				)}
			</div>

			{/* Talent Materials */}
			<div className='space-y-4'>
				<div className='space-y-2'>
					<h2 className='text-2xl font-bold text-foreground flex items-center gap-3'>
						<span className={colors.text}>&#128214;</span> Talent Level-Up
						Materials
					</h2>
					<div className={`h-0.5 rounded-full ${colors.bg}`} />
				</div>
				<p className='text-base text-guild-muted'>
					Per talent &mdash; multiply by number of talents you&apos;re leveling
				</p>

				<div className='guild-card p-5'>
					<RangeSlider
						value={talentRange}
						onChange={setTalentRange}
						min={1}
						max={10}
						label='Talent Level'
					/>
				</div>

				{talentRange[0] === talentRange[1] ? (
					<p className='text-guild-dim text-base'>
						Drag the slider to see materials needed.
					</p>
				) : talentMaterials.length > 0 ? (
					<div className='guild-card p-4'>
						<p className='text-lg font-semibold text-foreground mb-4'>
							Talent Lv {talentRange[0]} &rarr; {talentRange[1]}
						</p>
						<div className='flex flex-wrap gap-4 justify-start'>
							{talentMaterials.map((item) => (
								<MaterialCard key={item.id} item={item} />
							))}
						</div>
					</div>
				) : (
					<p className='text-guild-dim text-base'>
						No talent materials needed for this range.
					</p>
				)}
			</div>

			{/* Farming Schedule */}
			{talentBookSchedule.length > 0 && (
				<div className='space-y-4'>
					<div className='space-y-2'>
						<h2 className='text-2xl font-bold text-foreground flex items-center gap-3'>
							<span className={colors.text}>&#128197;</span> Farming Schedule
						</h2>
						<div className={`h-0.5 rounded-full ${colors.bg}`} />
					</div>

					<div className='guild-card p-5 space-y-4'>
						{talentBookSchedule.map((schedule) => {
							const isOpenToday = isDomainOpenToday(schedule.materialName);
							return (
								<div key={schedule.materialName} className='space-y-3'>
									<div className='flex items-center justify-between'>
										<p className='text-base font-semibold text-foreground'>
											{schedule.materialName}
										</p>
										{isOpenToday ? (
											<Badge className='bg-green-500/20 text-green-400 border-green-500/30'>
												Available Today!
											</Badge>
										) : (
											<Badge className='bg-red-500/20 text-red-400 border-red-500/30'>
												Not available today
											</Badge>
										)}
									</div>
									<div className='flex gap-2 flex-wrap'>
										{[
											'Monday',
											'Tuesday',
											'Wednesday',
											'Thursday',
											'Friday',
											'Saturday',
											'Sunday',
										].map((day) => {
											const isScheduled = schedule.days.includes(day);
											const isToday = day === todayName;
											return (
												<Badge
													key={day}
													variant='outline'
													className={cn(
														'text-sm',
														isScheduled && isToday
															? 'bg-green-500/20 text-green-400 border-green-500/40 font-bold'
															: isScheduled
																? `${colors.bg} ${colors.text} ${colors.border}`
																: 'bg-guild-elevated/50 text-guild-dim border-guild-border/30',
													)}
												>
													{day.substring(0, 3)}
												</Badge>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
