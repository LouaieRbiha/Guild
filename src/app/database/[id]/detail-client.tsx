'use client';

import {
	ConstellationIcon,
	ELEMENT_ICONS,
} from '@/components/icons/genshin-icons';
import { ElementBadge, RarityStars, MaterialCard } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent,
} from '@/components/ui/tabs';
import { CharacterEntry, charIconUrl, charGachaUrl } from '@/lib/characters';
import { ELEMENT_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
	CharacterDetail,
	MaterialGroup,
	MaterialItem,
	yattaIconUrl,
} from '@/lib/yatta/client';
import * as SliderPrimitive from '@radix-ui/react-slider';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// Simpler version: highlight ALL numbers in text
function HighlightNumbers({ text, color }: { text: string; color: string }) {
	if (!text) return null;
	const parts = text.split(/([\d]+\.?[\d]*%?)/g);
	return (
		<>
			{parts.map((part, i) => {
				if (/^\d/.test(part)) {
					return (
						<span key={i} className={`font-bold ${color}`}>
							{part}
						</span>
					);
				}
				return <span key={i}>{part}</span>;
			})}
		</>
	);
}

// Constellation damage impact estimates
function estimateConstellationImpact(
	description: string,
	index: number,
): { label: string; color: string; detail: string } {
	const desc = description.toLowerCase();

	// C3/C5 are always talent level increases
	if (desc.includes('increases the level of') && (index === 3 || index === 5)) {
		return {
			label: '~15-20% DPS',
			color: 'text-blue-400',
			detail: '+3 talent levels ≈ 15-20% more talent scaling damage',
		};
	}

	// Look for DEF ignore/shred
	if (desc.includes('ignore') && desc.includes('def')) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 0;
		return {
			label: `~${Math.round(val * 0.7)}-${val}% DPS`,
			color: 'text-red-400',
			detail: `${val}% DEF ignore is a massive DPS multiplier (one of the strongest constellation effects)`,
		};
	}
	if (desc.includes('def') && desc.includes('decrease')) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 0;
		return {
			label: `~${Math.round(val * 0.5)}-${Math.round(val * 0.7)}% DPS`,
			color: 'text-orange-400',
			detail: `${val}% DEF shred is a strong DPS multiplier`,
		};
	}
	// Look for res shred
	if (
		(desc.includes('res') && desc.includes('decrease')) ||
		desc.includes('res is reduced')
	) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 0;
		return {
			label: `~${Math.round(val * 0.4)}-${Math.round(val * 0.6)}% DPS`,
			color: 'text-orange-400',
			detail: `${val}% RES shred translates to significant damage increase`,
		};
	}

	// Look for damage multipliers
	if (desc.includes('crit rate') && desc.includes('100%')) {
		return {
			label: 'MASSIVE',
			color: 'text-red-400',
			detail:
				'100% CRIT Rate = guaranteed crits, effectively doubling DPS in many scenarios',
		};
	}
	if (desc.includes('crit rate') || desc.includes('crit dmg')) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 12;
		return {
			label: `~${Math.round(val * 0.8)}-${val}% DPS`,
			color: 'text-yellow-400',
			detail: `${val}% CRIT stat bonus translates to roughly ${Math.round(val * 0.8)}-${val}% more DPS`,
		};
	}
	if (desc.includes('dmg') && desc.includes('%')) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 0;
		if (val >= 50)
			return {
				label: 'HIGH',
				color: 'text-orange-400',
				detail: `${val}% DMG increase is a massive power spike`,
			};
		if (val >= 20)
			return {
				label: 'MODERATE',
				color: 'text-yellow-400',
				detail: `${val}% additional DMG is a solid increase`,
			};
		return {
			label: 'LOW-MED',
			color: 'text-green-400',
			detail: `${val}% DMG adds incremental value`,
		};
	}
	if (desc.includes('stamina') && desc.includes('not consume')) {
		return {
			label: 'QoL',
			color: 'text-teal-400',
			detail: 'Quality-of-life: more sustained DPS through stamina savings',
		};
	}
	if (desc.includes('atk') && desc.includes('%')) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 0;
		return {
			label: `~${Math.round(val * 0.6)}-${val}% DPS`,
			color: 'text-yellow-400',
			detail: `${val}% ATK bonus (diminishing returns depend on existing ATK%)`,
		};
	}
	if (desc.includes('additional') || desc.includes('extra')) {
		return {
			label: 'MODERATE',
			color: 'text-yellow-400',
			detail: 'Adds extra instances of damage or effects',
		};
	}
	if (desc.includes('resistance') || desc.includes('res')) {
		return {
			label: 'DEFENSIVE',
			color: 'text-cyan-400',
			detail: 'Survivability increase rather than direct DPS gain',
		};
	}
	if (
		desc.includes('heal') ||
		(desc.includes('hp') && desc.includes('regenerat'))
	) {
		return {
			label: 'SUSTAIN',
			color: 'text-green-400',
			detail: 'Healing/sustain improvement for survivability',
		};
	}
	if (
		desc.includes('duration') ||
		desc.includes('cd') ||
		desc.includes('cooldown')
	) {
		return {
			label: 'UPTIME',
			color: 'text-blue-400',
			detail: 'Better skill uptime = more consistent DPS',
		};
	}

	return {
		label: 'UTILITY',
		color: 'text-gray-400',
		detail: 'Utility or situational benefit',
	};
}

const TALENT_PRIORITY: Record<string, string> = {
	'Normal Attack': 'Auto',
	'Elemental Skill': 'Skill',
	'Elemental Burst': 'Burst',
};

const TALENT_COLORS: Record<string, string> = {
	'Normal Attack': 'border-gray-500',
	'Elemental Skill': 'border-blue-500',
	'Elemental Burst': 'border-purple-500',
};

interface Props {
	detail: CharacterDetail;
	entry: CharacterEntry;
}

export function CharacterDetailClient({ detail, entry }: Props) {
	const colors = ELEMENT_COLORS[detail.element] || ELEMENT_COLORS.Pyro;
	const VisionComp = ELEMENT_ICONS[detail.element];
	const gachaUrl = charGachaUrl(entry.id);

	return (
		<div className='space-y-6 pb-12'>
			{/* Back nav */}
			<Link
				href='/database'
				className='inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors'
			>
				← Back to Characters
			</Link>

			{/* Hero section */}
			<div className='guild-card p-0 overflow-hidden'>
				<div className='relative flex flex-col md:flex-row'>
					{/* Character art */}
					<div
						className={`relative w-full md:w-80 h-80 md:h-auto ${colors.bg} flex-shrink-0`}
					>
						<Image
							src={gachaUrl}
							alt={detail.name}
							fill
							className='object-cover object-top'
							priority={true}
							quality={95}
							sizes='(max-width: 768px) 100vw, 320px'
							onLoad={() => {
								// Hero art loaded - optional analytics/logic here
							}}
							onError={(e) => {
								(e.target as HTMLImageElement).src = charIconUrl(entry.id);
							}}
						/>
						<div className='absolute inset-0 bg-gradient-to-r from-transparent to-[#111827] hidden md:block' />
						<div className='absolute inset-0 bg-gradient-to-t from-[#111827] to-transparent md:hidden' />
					</div>

					{/* Info */}
					<div className='relative flex-1 p-6 space-y-4'>
						<div className='flex items-center gap-3'>
							{VisionComp && <VisionComp className='w-8 h-8' />}
							<div>
								<h1 className='text-3xl font-bold text-white'>{detail.name}</h1>
								{detail.title && (
									<p className={`text-sm ${colors.text} italic`}>
										{detail.title}
									</p>
								)}
							</div>
						</div>

						{/* Element badge, weapon badge, rarity stars */}
						<div className='flex items-center gap-2 flex-wrap'>
							<ElementBadge element={detail.element} />
							<Badge
								variant='outline'
								className='text-gray-300 border-gray-600'
							>
								{detail.weapon}
							</Badge>
							<RarityStars rarity={detail.rarity} size='md' />
						</div>

						{/* Quick stats grid */}
						<div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
							<Card
								className={cn(
									'bg-black/20 border-white/5 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>Region</p>
									<p className='font-medium text-white'>{detail.region}</p>
								</CardContent>
							</Card>
							<Card
								className={cn(
									'bg-black/20 border-white/5 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>Affiliation</p>
									<p className='font-medium text-white'>
										{detail.affiliation || '\u2014'}
									</p>
								</CardContent>
							</Card>
							<Card
								className={cn(
									'bg-black/20 border-white/5 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>Birthday</p>
									<p className='font-medium text-white'>{detail.birthday}</p>
								</CardContent>
							</Card>
							<Card
								className={cn(
									'bg-black/20 border-white/5 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>Constellation</p>
									<p className='font-medium text-white'>
										{detail.constellation || '\u2014'}
									</p>
								</CardContent>
							</Card>
							<Card
								className={cn(
									'bg-black/20 border-white/5 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>
										Ascension Stat
									</p>
									<p className='font-medium text-white'>
										{detail.ascensionStat}
									</p>
								</CardContent>
							</Card>
							<Card
								className={cn(
									'bg-black/20 border-white/5 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>Released</p>
									<p className='font-medium text-white'>{detail.release}</p>
								</CardContent>
							</Card>
						</div>

						{/* Voice actors */}
						{detail.cv.EN && (
							<div className='text-sm text-gray-500 space-x-4'>
								<span>EN: {detail.cv.EN}</span>
								{detail.cv.JP && <span>JP: {detail.cv.JP}</span>}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Tab navigation */}
			<Tabs defaultValue='talents' className='w-full'>
				<TabsList className='w-full bg-[#0D1117]'>
					<TabsTrigger value='talents' className='flex-1'>
						Talents
					</TabsTrigger>
					<TabsTrigger value='constellations' className='flex-1'>
						Constellations
					</TabsTrigger>
					<TabsTrigger value='materials' className='flex-1'>
						Materials
					</TabsTrigger>
					<TabsTrigger value='lore' className='flex-1'>
						Lore
					</TabsTrigger>
				</TabsList>
				<TabsContent value='talents'>
					<TalentsTab detail={detail} colors={colors} />
				</TabsContent>
				<TabsContent value='constellations'>
					<ConstellationsTab detail={detail} colors={colors} />
				</TabsContent>
				<TabsContent value='materials'>
					<MaterialsTab detail={detail} colors={colors} />
				</TabsContent>
				<TabsContent value='lore'>
					<LoreTab detail={detail} />
				</TabsContent>
			</Tabs>
		</div>
	);
}

// ── Sub-components ─────────────────────────────────────────────────────

function TalentsTab({
	detail,
	colors,
}: {
	detail: CharacterDetail;
	colors: (typeof ELEMENT_COLORS)['Pyro'];
}) {
	const [expanded, setExpanded] = useState<string | null>(null);

	return (
		<div className='space-y-4'>
			<h2 className='text-xl font-semibold text-white flex items-center gap-2'>
				<span className={colors.text}>⚔</span> Active Talents
			</h2>
			<p className='text-sm text-gray-400 mb-2'>
				Recommended priority: Level all to 8+, then focus on the most impactful
				talent first
			</p>
			<div className='space-y-3'>
				{detail.talents.map((talent, i) => {
					const isExpanded = expanded === `talent-${i}`;
					const priorityLabel = TALENT_PRIORITY[talent.type] || talent.type;
					const borderColor = TALENT_COLORS[talent.type] || 'border-gray-600';

					return (
						<div
							key={i}
							className={`guild-card p-4 cursor-pointer transition-all hover:bg-white/5 border-l-4 ${borderColor}`}
							onClick={() => setExpanded(isExpanded ? null : `talent-${i}`)}
						>
							<div className='flex items-center gap-3'>
								{talent.icon && (
									<Image
										src={yattaIconUrl(talent.icon)}
										alt={talent.name}
										width={48}
										height={48}
										className='rounded-lg bg-black/30'
										sizes='48px'
										fetchPriority='low'
									/>
								)}
								<div className='flex-1'>
									<div className='flex items-center gap-2'>
										<span className='text-white font-semibold text-base'>
											{talent.name}
										</span>
										<Badge
											className={cn(
												colors.bg,
												colors.text,
												colors.border,
											)}
										>
											{priorityLabel}
										</Badge>
									</div>
									<p className='text-sm text-gray-400'>{talent.type}</p>
								</div>
								<span className='text-gray-500'>{isExpanded ? '▲' : '▼'}</span>
							</div>
							{isExpanded && (
								<div className='mt-3 pt-3 border-t border-white/10'>
									<p className='text-sm text-gray-300 whitespace-pre-line leading-relaxed'>
										<HighlightNumbers
											text={talent.description}
											color={colors.text}
										/>
									</p>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Passive talents */}
			{detail.passives.length > 0 && (
				<>
					<h2 className='text-xl font-semibold text-white flex items-center gap-2 mt-6'>
						<span className={colors.text}>✦</span> Passive Talents
					</h2>
					<div className='space-y-3'>
						{detail.passives.map((passive, i) => {
							const isExpanded = expanded === `passive-${i}`;
							return (
								<div
									key={i}
									className='guild-card p-4 cursor-pointer transition-all hover:bg-white/5 border-l-4 border-amber-600/50'
									onClick={() =>
										setExpanded(isExpanded ? null : `passive-${i}`)
									}
								>
									<div className='flex items-center gap-3'>
										{passive.icon && (
											<Image
												src={yattaIconUrl(passive.icon)}
												alt={passive.name}
												width={48}
												height={48}
												className='rounded-lg bg-black/30'
												sizes='48px'
											/>
										)}
										<div className='flex-1'>
											<span className='text-white font-semibold text-base'>
												{passive.name}
											</span>
											<p className='text-sm text-gray-400'>{passive.type}</p>
										</div>
										<span className='text-gray-500'>
											{isExpanded ? '▲' : '▼'}
										</span>
									</div>
									{isExpanded && (
										<div className='mt-3 pt-3 border-t border-white/10'>
											<p className='text-sm text-gray-300 whitespace-pre-line leading-relaxed'>
												<HighlightNumbers
													text={passive.description}
													color='text-amber-400'
												/>
											</p>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</>
			)}
		</div>
	);
}

function ConstellationsTab({
	detail,
	colors,
}: {
	detail: CharacterDetail;
	colors: (typeof ELEMENT_COLORS)['Pyro'];
}) {
	const [expanded, setExpanded] = useState<number | null>(null);

	return (
		<div className='space-y-4'>
			<h2 className='text-xl font-semibold text-white flex items-center gap-2'>
				<ConstellationIcon className={`w-6 h-6 ${colors.text}`} />{' '}
				Constellations — {detail.constellation}
			</h2>

			{/* Vertical timeline */}
			<div className='relative space-y-4 pl-16'>
				{/* Vertical line */}
				<div className='absolute left-6 top-0 bottom-0 w-px bg-white/10' />

				{detail.constellations.map((c) => {
					const isExpanded = expanded === c.index;
					const impact = estimateConstellationImpact(c.description, c.index);

					return (
						<div key={c.index} className='relative'>
							{/* Circle on the line */}
							<div
								className={cn(
									'absolute -left-10 w-12 h-12 rounded-full border flex items-center justify-center flex-shrink-0',
									colors.bg,
									colors.border,
								)}
							>
								{c.icon ? (
									<Image
										src={yattaIconUrl(c.icon)}
										alt={c.name}
										width={36}
										height={36}
										className='rounded-full'
										sizes='36px'
										fetchPriority='low'
									/>
								) : (
									<span className={`text-base font-bold ${colors.text}`}>
										C{c.index}
									</span>
								)}
							</div>

							{/* Content card */}
							<Card
								className='bg-black/20 border-white/5 cursor-pointer transition-all hover:bg-white/5'
								onClick={() => setExpanded(isExpanded ? null : c.index)}
							>
								<CardContent className='p-4'>
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-2 flex-wrap'>
											<span className={`text-sm font-bold ${colors.text}`}>
												C{c.index}
											</span>
											<span className='text-white font-semibold text-base'>
												{c.name}
											</span>
											<Badge
												variant='outline'
												className={cn(
													impact.color,
													'bg-white/5 border-white/10 font-bold',
												)}
											>
												{impact.label}
											</Badge>
										</div>
										<span className='text-gray-500'>
											{isExpanded ? '▲' : '▼'}
										</span>
									</div>
									<p className='text-sm text-gray-400 mt-0.5'>
										{impact.detail}
									</p>
									{isExpanded && (
										<div className='mt-3 pt-3 border-t border-white/10 space-y-3'>
											<p className='text-sm text-gray-300 whitespace-pre-line leading-relaxed'>
												<HighlightNumbers
													text={c.description}
													color={colors.text}
												/>
											</p>
											{/* Impact breakdown */}
											<div
												className={cn(
													'flex items-center gap-2 p-3 rounded-lg border',
													colors.bg,
													colors.border,
												)}
											>
												<span className='text-sm font-semibold text-white'>
													Estimated Impact:
												</span>
												<span
													className={`text-sm font-bold ${impact.color}`}
												>
													{impact.label}
												</span>
												<span className='text-sm text-gray-400'>
													— {impact.detail}
												</span>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					);
				})}
			</div>

			{/* Summary bar */}
			<div className='guild-card p-4'>
				<h3 className='text-sm font-semibold text-white mb-3'>
					Constellation Priority
				</h3>
				<div className='flex gap-2 flex-wrap'>
					{detail.constellations.map((c) => {
						const impact = estimateConstellationImpact(c.description, c.index);
						return (
							<div
								key={c.index}
								className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/20 border border-white/5'
							>
								<span className={`text-xs font-bold ${colors.text}`}>
									C{c.index}
								</span>
								<span className={`text-xs font-bold ${impact.color}`}>
									{impact.label}
								</span>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}

// Ascension level breakpoints — phases map to these levels
const ASCENSION_LEVELS = [20, 40, 50, 60, 70, 80, 90];

function levelToPhaseIdx(lv: number): number {
	// Phase 0 = Lv 20→40 materials, Phase 1 = Lv 40→50, etc.
	// Returns how many ascension phases are completed at this level
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

// Mora costs per ascension phase (Phase 1→6)
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
				<span className='text-sm text-gray-400'>{label}</span>
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
							className='w-14 text-center text-sm font-bold bg-white/5 border border-white/10 rounded-md py-1 text-white focus:outline-none focus:border-guild-accent'
						/>
						<span className='text-gray-500 text-sm'>→</span>
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
							className='w-14 text-center text-sm font-bold bg-white/5 border border-white/10 rounded-md py-1 text-white focus:outline-none focus:border-guild-accent'
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
				<SliderPrimitive.Track className='relative h-1.5 grow rounded-full bg-white/10'>
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
								// Snap nearest thumb to this breakpoint
								const distFrom = Math.abs(lv - value[0]);
								const distTo = Math.abs(lv - value[1]);
								if (distFrom <= distTo && lv < value[1])
									onChange([lv, value[1]]);
								else if (lv > value[0]) onChange([value[0], lv]);
							}}
							className={`absolute text-[10px] -translate-x-1/2 transition-colors cursor-pointer
                ${isInRange ? 'text-white/70' : 'text-white/20'} hover:text-white`}
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

function MaterialsTab({
	detail,
	colors,
}: {
	detail: CharacterDetail;
	colors: (typeof ELEMENT_COLORS)['Pyro'];
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

	return (
		<div className='space-y-6'>
			{/* Ascension Materials */}
			<div className='space-y-4'>
				<h2 className='text-xl font-semibold text-white flex items-center gap-2'>
					<span className={colors.text}>⬆</span> Ascension Materials
				</h2>

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
					<p className='text-gray-500 text-sm'>
						Drag the slider to see materials needed.
					</p>
				) : ascMaterials.length > 0 ? (
					<div className='guild-card p-4'>
						<div className='flex items-center justify-between mb-4'>
							<p className='text-base font-semibold text-white'>
								Lv {ascRange[0]} → {ascRange[1]}
							</p>
							{ascMora > 0 && (
								<span className='text-sm text-yellow-400 font-medium'>
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
					<p className='text-gray-500 text-sm'>
						No ascension materials needed for this range.
					</p>
				)}
			</div>

			{/* Talent Materials */}
			<div className='space-y-4'>
				<h2 className='text-xl font-semibold text-white flex items-center gap-2'>
					<span className={colors.text}>📖</span> Talent Level-Up Materials
				</h2>
				<p className='text-sm text-gray-400'>
					Per talent — multiply by number of talents you&apos;re leveling
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
					<p className='text-gray-500 text-sm'>
						Drag the slider to see materials needed.
					</p>
				) : talentMaterials.length > 0 ? (
					<div className='guild-card p-4'>
						<p className='text-base font-semibold text-white mb-4'>
							Talent Lv {talentRange[0]} → {talentRange[1]}
						</p>
						<div className='flex flex-wrap gap-4 justify-start'>
							{talentMaterials.map((item) => (
								<MaterialCard key={item.id} item={item} />
							))}
						</div>
					</div>
				) : (
					<p className='text-gray-500 text-sm'>
						No talent materials needed for this range.
					</p>
				)}
			</div>
		</div>
	);
}

function LoreTab({
	detail,
}: {
	detail: CharacterDetail;
}) {
	return (
		<div className='space-y-6'>
			{/* Story */}
			<div className='guild-card p-6 space-y-4'>
				<h2 className='text-xl font-semibold text-white'>Story</h2>
				{detail.description ? (
					<p className='text-base text-gray-300 leading-relaxed'>
						{detail.description}
					</p>
				) : (
					<p className='text-base text-gray-500 italic'>
						No story data available for this character yet.
					</p>
				)}
			</div>

			{/* Character info card */}
			<div className='guild-card p-6'>
				<h2 className='text-xl font-semibold text-white mb-4'>
					Character Info
				</h2>
				<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
					<DetailCard label='Real Name' value={detail.name} />
					<DetailCard label='Title' value={detail.title || '\u2014'} />
					<DetailCard label='Region' value={detail.region} />
					<DetailCard label='Affiliation' value={detail.affiliation || '\u2014'} />
					<DetailCard label='Birthday' value={detail.birthday} />
					<DetailCard
						label='Constellation'
						value={detail.constellation || '\u2014'}
					/>
				</div>
			</div>

			{/* Voice actors */}
			{detail.cv.EN && (
				<div className='guild-card p-6'>
					<h2 className='text-xl font-semibold text-white mb-4'>
						Voice Actors
					</h2>
					<div className='grid grid-cols-2 gap-4'>
						<DetailCard label='English' value={detail.cv.EN} />
						<DetailCard label='Japanese' value={detail.cv.JP || '\u2014'} />
						<DetailCard label='Chinese' value={detail.cv.CHS || '\u2014'} />
						<DetailCard label='Korean' value={detail.cv.KR || '\u2014'} />
					</div>
				</div>
			)}
		</div>
	);
}

function DetailCard({ label, value }: { label: string; value: string }) {
	return (
		<div className='bg-black/20 rounded-lg p-3'>
			<p className='text-sm text-gray-500'>{label}</p>
			<p
				className={`font-medium ${value === '\u2014' ? 'text-gray-600' : 'text-white'}`}
			>
				{value}
			</p>
		</div>
	);
}
