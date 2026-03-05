'use client';

import {
	ConstellationIcon,
	ELEMENT_ICONS,
	SLOT_ICONS,
} from '@/components/icons/genshin-icons';
import { ElementBadge, MaterialCard, RarityStars } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CHARACTER_BUILDS } from '@/data/character-builds';
import { CHARACTER_GUIDES } from '@/data/character-guides';
import { getDomainDays, isDomainOpenToday } from '@/data/farming-schedule';
import { ALL_WEAPONS } from '@/lib/weapons';
import {
	ALL_CHARACTERS,
	CharacterEntry,
	charGachaUrl,
	charIconUrl,
} from '@/lib/characters';
import { ELEMENT_COLORS, weaponIconUrl } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
	CharacterDetail,
	cleanDescription,
	MaterialGroup,
	MaterialItem,
	yattaIconUrl,
} from '@/lib/yatta/client';
import * as SliderPrimitive from '@radix-ui/react-slider';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
			detail: '+3 talent levels = 15-20% more talent scaling damage',
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

const TALENT_BADGE_STYLES: Record<string, string> = {
	'Normal Attack': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
	'Elemental Skill': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
	'Elemental Burst': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

// Element-colored glow for constellation icons
const ELEMENT_GLOW_SHADOW: Record<string, string> = {
	Pyro: '0 0 12px rgba(239, 68, 68, 0.5)',
	Hydro: '0 0 12px rgba(59, 130, 246, 0.5)',
	Anemo: '0 0 12px rgba(94, 234, 212, 0.5)',
	Cryo: '0 0 12px rgba(103, 232, 249, 0.5)',
	Electro: '0 0 12px rgba(168, 85, 247, 0.5)',
	Geo: '0 0 12px rgba(250, 204, 21, 0.5)',
	Dendro: '0 0 12px rgba(74, 222, 128, 0.5)',
};

interface Props {
	detail: CharacterDetail;
	entry: CharacterEntry;
}

export function CharacterDetailClient({ detail, entry }: Props) {
	const colors = ELEMENT_COLORS[detail.element] || ELEMENT_COLORS.Pyro;
	const VisionComp = ELEMENT_ICONS[detail.element];
	const gachaUrl = charGachaUrl(entry.id);

	const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

	function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
		const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
		setMousePos({ x, y });
	}

	return (
		<div className='space-y-6 pb-12'>
			{/* Back nav */}
			<Link
				href='/database'
				className='inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors'
			>
				&larr; Back to Characters
			</Link>

			{/* Hero section */}
			<div className='guild-card p-0 overflow-hidden'>
				<div className='relative flex flex-col md:flex-row'>
					{/* Character art */}
					<div
						className={`relative w-full md:w-80 h-96 md:h-auto ${colors.bg} shrink-0 overflow-hidden`}
						onMouseMove={handleMouseMove}
					>
						<Image
							src={gachaUrl}
							alt={detail.name}
							fill
							className='object-cover object-top'
							priority={true}
							quality={100}
							sizes='(max-width: 768px) 100vw, 320px'
							style={{
								transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -8}px) scale(1.05)`,
								transition: 'transform 0.15s ease-out',
							}}
							onLoad={() => {
								// Hero art loaded
							}}
							onError={(e) => {
								(e.target as HTMLImageElement).src = charIconUrl(entry.id);
							}}
						/>
						<div className='absolute inset-0 bg-linear-to-r from-transparent to-[#111827] hidden md:block' />
						<div className='absolute inset-0 bg-linear-to-t from-[#111827] to-transparent md:hidden' />
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

			{/* Recommended Build section (only shown if data exists) */}
			<RecommendedBuildSection detail={detail} colors={colors} />

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
					<TabsTrigger value='guides' className='flex-1'>
						Guides
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
				<TabsContent value='guides'>
					<GuidesTab detail={detail} colors={colors} />
				</TabsContent>
				<TabsContent value='lore'>
					<LoreTab detail={detail} />
				</TabsContent>
			</Tabs>
		</div>
	);
}

// ── Sub-components ─────────────────────────────────────────────────────

type ElementColors = (typeof ELEMENT_COLORS)['Pyro'];

function TalentsTab({
	detail,
	colors,
}: {
	detail: CharacterDetail;
	colors: ElementColors;
}) {
	const [expanded, setExpanded] = useState<string | null>('talent-0');

	return (
		<div className='space-y-8'>
			{/* Section header: Combat Talents */}
			<div className='space-y-2'>
				<h2 className='text-2xl font-bold text-white flex items-center gap-3'>
					<span className={colors.text}>&#9876;</span> Combat Talents
				</h2>
				<div className={`h-0.5 rounded-full ${colors.bg}`} />
				<p className='text-base text-gray-400'>
					Recommended priority: Level all to 8+, then focus on the most
					impactful talent first
				</p>
			</div>

			<div className='space-y-6'>
				{detail.talents.map((talent, i) => {
					const isExpanded = expanded === `talent-${i}`;
					const priorityLabel = TALENT_PRIORITY[talent.type] || talent.type;
					const borderColor = TALENT_COLORS[talent.type] || 'border-gray-600';
					const badgeStyle =
						TALENT_BADGE_STYLES[talent.type] ||
						`${colors.bg} ${colors.text} ${colors.border}`;

					return (
						<div
							key={i}
							className={`guild-card p-4 cursor-pointer transition-all hover:bg-white/5 border-l-4 ${borderColor}`}
							onClick={() => setExpanded(isExpanded ? null : `talent-${i}`)}
						>
							<div className='flex items-center gap-4'>
								{talent.icon && (
									<Image
										src={yattaIconUrl(talent.icon)}
										alt={talent.name}
										width={64}
										height={64}
										className='rounded-lg bg-black/30'
										sizes='64px'
										fetchPriority='low'
									/>
								)}
								<div className='flex-1'>
									<div className='flex items-center gap-2 flex-wrap'>
										<span className='text-white font-semibold text-xl'>
											{talent.name}
										</span>
										<Badge className={badgeStyle}>{priorityLabel}</Badge>
									</div>
									<p className='text-base text-gray-400'>{talent.type}</p>
								</div>
								<span className='text-gray-500 text-lg'>
									{isExpanded ? '\u25B2' : '\u25BC'}
								</span>
							</div>
							{isExpanded && (
								<div className='mt-4 pt-4 border-t border-white/10'>
									<p className='text-base text-gray-300 whitespace-pre-line leading-relaxed'>
										<HighlightNumbers
											text={cleanDescription(talent.description)}
											color={colors.text}
										/>
									</p>
								</div>
							)}
						</div>
					);
				})}
			</div>

			<Separator className='my-2 bg-white/10' />

			{/* Section header: Passive Talents */}
			{detail.passives.length > 0 && (
				<div className='space-y-6'>
					<div className='space-y-2'>
						<h2 className='text-2xl font-bold text-white flex items-center gap-3'>
							<span className='text-amber-400'>&#10022;</span> Passive Talents
						</h2>
						<div className='h-0.5 rounded-full bg-amber-500/20' />
					</div>

					<div className='space-y-6'>
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
									<div className='flex items-center gap-4'>
										{passive.icon && (
											<Image
												src={yattaIconUrl(passive.icon)}
												alt={passive.name}
												width={64}
												height={64}
												className='rounded-lg bg-black/30'
												sizes='64px'
											/>
										)}
										<div className='flex-1'>
											<span className='text-white font-semibold text-xl'>
												{passive.name}
											</span>
											<p className='text-base text-gray-400'>{passive.type}</p>
										</div>
										<span className='text-gray-500 text-lg'>
											{isExpanded ? '\u25B2' : '\u25BC'}
										</span>
									</div>
									{isExpanded && (
										<div className='mt-4 pt-4 border-t border-white/10'>
											<p className='text-base text-gray-300 whitespace-pre-line leading-relaxed'>
												<HighlightNumbers
													text={cleanDescription(passive.description)}
													color='text-amber-400'
												/>
											</p>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

function ConstellationsTab({
	detail,
	colors,
}: {
	detail: CharacterDetail;
	colors: ElementColors;
}) {
	const glowShadow =
		ELEMENT_GLOW_SHADOW[detail.element] || '0 0 12px rgba(168, 85, 247, 0.5)';

	return (
		<div className='space-y-6'>
			<div className='space-y-2'>
				<h2 className='text-2xl font-bold text-white flex items-center gap-3'>
					<ConstellationIcon className={`w-7 h-7 ${colors.text}`} />
					Constellations &mdash; {detail.constellation}
				</h2>
				<div className={`h-0.5 rounded-full ${colors.bg}`} />
			</div>

			{/* Full-width card layout -- all expanded by default */}
			<div className='space-y-4'>
				{detail.constellations.map((c) => {
					const impact = estimateConstellationImpact(c.description, c.index);

					return (
						<Card key={c.index} className='bg-black/20 border-white/5'>
							<CardContent className='p-5'>
								<div className='flex gap-5'>
									{/* Left: C# number + icon */}
									<div className='flex flex-col items-center gap-2 shrink-0'>
										<span className={`text-2xl font-black ${colors.text}`}>
											C{c.index}
										</span>
										<div
											className={cn(
												'w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden',
												colors.bg,
												colors.border,
											)}
											style={{ boxShadow: glowShadow }}
										>
											{c.icon ? (
												<Image
													src={yattaIconUrl(c.icon)}
													alt={c.name}
													width={52}
													height={52}
													className='rounded-full'
													sizes='52px'
													fetchPriority='low'
												/>
											) : (
												<span className={`text-lg font-bold ${colors.text}`}>
													C{c.index}
												</span>
											)}
										</div>
									</div>

									{/* Middle: Name + description */}
									<div className='flex-1 min-w-0'>
										<div className='flex items-center gap-3 flex-wrap mb-2'>
											<h3 className='text-lg font-bold text-white'>{c.name}</h3>
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
										<p className='text-base text-gray-300 whitespace-pre-line leading-relaxed mb-3'>
											<HighlightNumbers
												text={cleanDescription(c.description)}
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
											<span className='text-base font-semibold text-white'>
												Impact:
											</span>
											<span className={`text-base font-bold ${impact.color}`}>
												{impact.label}
											</span>
											<span className='text-base text-gray-400'>
												&mdash; {impact.detail}
											</span>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>
		</div>
	);
}

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
				<span className='text-base text-gray-400'>{label}</span>
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
						<span className='text-gray-500 text-base'>&rarr;</span>
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

	const today = new Date();
	const dayNames = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	];
	const todayName = dayNames[today.getDay()];

	return (
		<div className='space-y-6'>
			{/* Ascension Materials */}
			<div className='space-y-4'>
				<div className='space-y-2'>
					<h2 className='text-2xl font-bold text-white flex items-center gap-3'>
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
					<p className='text-gray-500 text-base'>
						Drag the slider to see materials needed.
					</p>
				) : ascMaterials.length > 0 ? (
					<div className='guild-card p-4'>
						<div className='flex items-center justify-between mb-4'>
							<p className='text-lg font-semibold text-white'>
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
					<p className='text-gray-500 text-base'>
						No ascension materials needed for this range.
					</p>
				)}
			</div>

			{/* Talent Materials */}
			<div className='space-y-4'>
				<div className='space-y-2'>
					<h2 className='text-2xl font-bold text-white flex items-center gap-3'>
						<span className={colors.text}>&#128214;</span> Talent Level-Up
						Materials
					</h2>
					<div className={`h-0.5 rounded-full ${colors.bg}`} />
				</div>
				<p className='text-base text-gray-400'>
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
					<p className='text-gray-500 text-base'>
						Drag the slider to see materials needed.
					</p>
				) : talentMaterials.length > 0 ? (
					<div className='guild-card p-4'>
						<p className='text-lg font-semibold text-white mb-4'>
							Talent Lv {talentRange[0]} &rarr; {talentRange[1]}
						</p>
						<div className='flex flex-wrap gap-4 justify-start'>
							{talentMaterials.map((item) => (
								<MaterialCard key={item.id} item={item} />
							))}
						</div>
					</div>
				) : (
					<p className='text-gray-500 text-base'>
						No talent materials needed for this range.
					</p>
				)}
			</div>

			{/* Farming Schedule */}
			{talentBookSchedule.length > 0 && (
				<div className='space-y-4'>
					<div className='space-y-2'>
						<h2 className='text-2xl font-bold text-white flex items-center gap-3'>
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
										<p className='text-base font-semibold text-white'>
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
																: 'bg-black/20 text-gray-600 border-white/5',
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

function LoreTab({ detail }: { detail: CharacterDetail }) {
	return (
		<div className='space-y-6'>
			{/* Story */}
			<div className='guild-card p-6 space-y-4'>
				<h2 className='text-2xl font-bold text-white'>Story</h2>
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
				<h2 className='text-2xl font-bold text-white mb-4'>Character Info</h2>
				<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
					<DetailCard label='Real Name' value={detail.name} />
					<DetailCard label='Title' value={detail.title || '\u2014'} />
					<DetailCard label='Region' value={detail.region} />
					<DetailCard
						label='Affiliation'
						value={detail.affiliation || '\u2014'}
					/>
					<DetailCard label='Birthday' value={detail.birthday} />
					<DetailCard
						label='Constellation'
						value={detail.constellation || '\u2014'}
					/>
					<DetailCard label='Ascension Stat' value={detail.ascensionStat} />
					<DetailCard label='Weapon Type' value={detail.weapon} />
					<DetailCard label='Release Date' value={detail.release} />
				</div>
			</div>

			{/* Voice actors -- more prominent */}
			{detail.cv.EN && (
				<div className='guild-card p-6'>
					<h2 className='text-2xl font-bold text-white mb-4'>Voice Actors</h2>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<Card className='bg-black/20 border-white/5'>
							<CardContent className='p-4'>
								<p className='text-sm text-gray-500 mb-1'>English (EN)</p>
								<p className='text-lg font-semibold text-white'>
									{detail.cv.EN}
								</p>
							</CardContent>
						</Card>
						<Card className='bg-black/20 border-white/5'>
							<CardContent className='p-4'>
								<p className='text-sm text-gray-500 mb-1'>Japanese (JP)</p>
								<p className='text-lg font-semibold text-white'>
									{detail.cv.JP || '\u2014'}
								</p>
							</CardContent>
						</Card>
						<Card className='bg-black/20 border-white/5'>
							<CardContent className='p-4'>
								<p className='text-sm text-gray-500 mb-1'>Chinese (CN)</p>
								<p className='text-lg font-semibold text-white'>
									{detail.cv.CHS || '\u2014'}
								</p>
							</CardContent>
						</Card>
						<Card className='bg-black/20 border-white/5'>
							<CardContent className='p-4'>
								<p className='text-sm text-gray-500 mb-1'>Korean (KR)</p>
								<p className='text-lg font-semibold text-white'>
									{detail.cv.KR || '\u2014'}
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			)}

			{/* Character Quote */}
			{detail.description && (
				<div className='guild-card p-6'>
					<h2 className='text-2xl font-bold text-white mb-4'>Introduction</h2>
					<blockquote className='border-l-4 border-white/20 pl-4 italic text-base text-gray-400 leading-relaxed'>
						{detail.description}
					</blockquote>
				</div>
			)}
		</div>
	);
}

function GuidesTab({ detail, colors }: { detail: CharacterDetail; colors: ElementColors }) {
	const guide = CHARACTER_GUIDES[detail.name];
	const [kqmGuide, setKqmGuide] = useState<any>(null);

	useEffect(() => {
		const slug = detail.name.toLowerCase().replace(/\s+/g, '-');
		fetch(`/api/guides/${slug}`)
			.then(res => res.json())
			.then(data => { if (data) setKqmGuide(data); })
			.catch(() => {});
	}, [detail.name]);

	const findCharEntry = (name: string): CharacterEntry | undefined =>
		ALL_CHARACTERS.find(c => c.name === name);

	if (!guide && !kqmGuide) {
		return (
			<div className="guild-card p-8 text-center space-y-4">
				<h2 className="text-xl font-semibold text-white mb-2">No Guide Available Yet</h2>
				<p className="text-gray-400">Community guide for {detail.name} hasn&apos;t been added yet.</p>
				<div className="flex items-center justify-center gap-3">
					<a href={`https://kqm.gg/${detail.name.toLowerCase().replace(/\s+/g, '-')}`} target="_blank" rel="noopener noreferrer"
						className="px-4 py-2 rounded-lg bg-guild-accent/20 text-guild-accent hover:bg-guild-accent/30 transition-colors text-sm">
						Check KQM Guide
					</a>
					<a href={`https://genshin-impact.fandom.com/wiki/${detail.name.replace(/\s+/g, '_')}`} target="_blank" rel="noopener noreferrer"
						className="px-4 py-2 rounded-lg bg-guild-elevated text-guild-muted hover:bg-white/10 transition-colors text-sm">
						View on Wiki
					</a>
				</div>
			</div>
		);
	}

	// Source badge colors
	const SOURCE_COLORS: Record<string, string> = {
		Wish: 'bg-purple-500/20 text-purple-300',
		BP: 'bg-amber-500/20 text-amber-300',
		Craft: 'bg-teal-500/20 text-teal-300',
		Shop: 'bg-blue-500/20 text-blue-300',
		F2P: 'bg-green-500/20 text-green-300',
		Event: 'bg-pink-500/20 text-pink-300',
		Fish: 'bg-cyan-500/20 text-cyan-300',
	};

	// Section header component
	const SectionHeader = ({ title }: { title: string }) => (
		<div className={cn("px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide", colors.bg, colors.text)}>
			{title}
		</div>
	);

	const weapons = guide?.bestWeapons || (kqmGuide?.weapons?.map((w: any) => ({ name: w.name, weaponId: 0, note: w.note || '', source: undefined })) || []);
	const artifacts = guide?.bestArtifacts || (kqmGuide?.artifacts?.map((a: any) => ({ setName: a.set, pieces: a.pieces || 4, note: a.note || '' })) || []);
	const talentStr = guide?.talentPriority || (kqmGuide?.talentPriority?.join(' > ') || '');
	const teams = guide?.teams || (kqmGuide?.teams?.map((t: any) => ({ name: t.name || 'Team', members: t.members || [], archetype: t.archetype || '' })) || []);

	return (
		<div className="space-y-4">
			{/* Role + KQM link */}
			<div className="flex items-center justify-between flex-wrap gap-3">
				{guide?.role && (
					<div className="flex items-center gap-2">
						<span className={cn("text-sm font-semibold", colors.text)}>{guide.role}</span>
					</div>
				)}
				<a href={`https://kqm.gg/${detail.name.toLowerCase().replace(/\s+/g, '-')}`}
					target="_blank" rel="noopener noreferrer"
					className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors text-xs font-medium">
					Full KQM Guide &rarr;
				</a>
			</div>

			{/* TL;DR */}
			{guide?.tldr && (
				<div className={cn("guild-card p-4 border-l-4", colors.border)}>
					<p className="text-sm text-foreground/90 italic leading-relaxed">{guide.tldr}</p>
				</div>
			)}

			{/* Weapons Section */}
			<div className="guild-card overflow-hidden p-0">
				<SectionHeader title="Weapons" />
				<div className="p-4">
					<div className="flex flex-wrap gap-3">
						{weapons.map((w: any, i: number) => (
							<div key={i} className="flex flex-col items-center gap-1.5 w-20">
								<div className="relative">
									{w.weaponId > 0 && (
										<Image src={weaponIconUrl(w.weaponId)} alt={w.name} width={56} height={56}
											className="rounded-lg bg-guild-elevated border border-white/10" />
									)}
									{!w.weaponId && (
										<div className="w-14 h-14 rounded-lg bg-guild-elevated border border-white/10 flex items-center justify-center text-guild-muted text-xs">?</div>
									)}
									{i === 0 && <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-guild-gold flex items-center justify-center text-[8px] font-bold text-black">1</div>}
									{w.source && (
										<span className={cn("absolute -top-1 -right-1 text-[8px] font-bold px-1 rounded", SOURCE_COLORS[w.source] || 'bg-white/10 text-white/60')}>
											{w.source}
										</span>
									)}
								</div>
								<span className="text-[10px] text-center leading-tight text-guild-muted truncate w-full">{w.name}</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Artifact Sets + Talent Priority side by side */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* Artifact Sets */}
				<div className="guild-card overflow-hidden p-0">
					<SectionHeader title="Artifact Sets" />
					<div className="p-4">
						<div className="flex items-center gap-2 flex-wrap">
							{artifacts.map((a: any, i: number) => (
								<div key={i} className="flex items-center gap-2">
									{i > 0 && <span className="text-guild-dim text-lg font-bold">&gt;</span>}
									<div className="flex flex-col items-center">
										<span className={cn("text-[10px] font-bold px-1.5 rounded", colors.bg, colors.text)}>{a.pieces}pc</span>
										<span className="text-xs text-center mt-1 max-w-24 leading-tight">{a.setName}</span>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Talent Priority */}
				<div className="guild-card overflow-hidden p-0">
					<SectionHeader title="Talent Priority" />
					<div className="p-4">
						<p className="text-base font-bold text-white">
							{talentStr.split(' > ').map((part: string, i: number, arr: string[]) => (
								<span key={i}>
									<span className={colors.text}>{part.trim()}</span>
									{i < arr.length - 1 && <span className="text-guild-dim mx-1.5">&gt;</span>}
								</span>
							))}
						</p>
					</div>
				</div>
			</div>

			{/* Main Stats + Substats side by side */}
			{guide?.mainStats && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Main Stats */}
					<div className="guild-card overflow-hidden p-0">
						<SectionHeader title="Main Stats" />
						<div className="p-4 space-y-2">
							{([
								{ slot: 'Sands' as const, value: guide.mainStats.sands },
								{ slot: 'Goblet' as const, value: guide.mainStats.goblet },
								{ slot: 'Circlet' as const, value: guide.mainStats.circlet },
							]).map(({ slot, value }) => {
								const SI = SLOT_ICONS[slot];
								return (
									<div key={slot} className="flex items-center gap-2">
										{SI && <SI size={16} className="text-guild-muted shrink-0" />}
										<span className="text-xs text-guild-muted w-14">{slot}</span>
										<span className="text-sm font-medium">{value}</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* Substats */}
					<div className="guild-card overflow-hidden p-0">
						<SectionHeader title="Substats" />
						<div className="p-4">
							<div className="space-y-1.5">
								{guide.substats.map((sub, i) => (
									<div key={i} className="flex items-center gap-2">
										<span className={cn("text-xs font-bold w-5", colors.text)}>{i + 1}.</span>
										<span className="text-sm">{sub}</span>
									</div>
								))}
							</div>
							{guide.erRequirement && (
								<div className="mt-3 pt-3 border-t border-white/5">
									<p className="text-xs text-guild-muted"><span className="font-semibold text-guild-accent">ER:</span> {guide.erRequirement}</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Teams Section */}
			<div className="guild-card overflow-hidden p-0">
				<SectionHeader title="Teams" />
				<div className="p-4 space-y-4">
					{teams.map((team: any, i: number) => (
						<div key={i} className="flex items-center gap-4">
							<div className="flex items-center gap-1">
								{team.members.map((member: string, j: number) => {
									const entry = findCharEntry(member);
									return entry ? (
										<Link key={j} href={`/database/${entry.id}`}>
											<div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-guild-elevated hover:border-guild-accent/50 transition-colors">
												<Image src={charIconUrl(entry.id)} alt={member} width={40} height={40} className="object-cover" sizes="40px" />
											</div>
										</Link>
									) : (
										<div key={j} className="w-10 h-10 rounded-lg bg-guild-elevated border border-white/10 flex items-center justify-center text-[10px] text-guild-muted">
											{member.slice(0, 2)}
										</div>
									);
								})}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-xs text-white font-medium truncate">{team.name}</p>
								{(team.archetype || team.note) && (
									<p className="text-[10px] text-guild-muted truncate">{team.note || team.archetype}</p>
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Tips */}
			{guide?.tips && guide.tips.length > 0 && (
				<div className="guild-card overflow-hidden p-0">
					<SectionHeader title="Tips" />
					<div className="p-4">
						<ul className="space-y-2">
							{guide.tips.map((tip, i) => (
								<li key={i} className="flex gap-2 text-sm text-gray-300">
									<span className={cn("font-bold shrink-0", colors.text)}>&bull;</span>
									{tip}
								</li>
							))}
						</ul>
					</div>
				</div>
			)}

			{/* Playstyle */}
			{guide?.playstyle && (
				<div className="guild-card p-4">
					<p className="text-sm text-gray-300 italic">&quot;{guide.playstyle}&quot;</p>
				</div>
			)}
		</div>
	);
}

function RecommendedBuildSection({
	detail,
	colors,
}: {
	detail: CharacterDetail;
	colors: ElementColors;
}) {
	const build = CHARACTER_BUILDS[detail.name];
	if (!build) return null;

	const findCharEntry = (name: string): CharacterEntry | undefined =>
		ALL_CHARACTERS.find((c) => c.name === name);

	const weapons = build.weaponIds
		.map((id) => ALL_WEAPONS.find((w) => w.id === id))
		.filter(Boolean);

	return (
		<div className='space-y-4'>
			<div className='space-y-2'>
				<h2 className='text-2xl font-bold text-white flex items-center gap-3'>
					<span className={colors.text}>&#9733;</span> Recommended Build
				</h2>
				<div className={`h-0.5 rounded-full ${colors.bg}`} />
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
				{/* Best Weapons */}
				<div className='guild-card overflow-hidden p-0'>
					<div
						className={cn(
							'px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide',
							colors.bg,
							colors.text,
						)}
					>
						Best Weapons
					</div>
					<div className='p-4'>
						<div className='space-y-3'>
							{weapons.map((w, i) => {
								if (!w) return null;
								return (
									<Link
										key={w.id}
										href={`/weapons/${w.id}`}
										className='flex items-center gap-3 group'
									>
										<div className='relative'>
											<Image
												src={weaponIconUrl(w.id)}
												alt={w.name}
												width={48}
												height={48}
												className='rounded-lg bg-guild-elevated border border-white/10 group-hover:border-guild-accent/50 transition-colors'
												sizes='48px'
											/>
											{i === 0 && (
												<div className='absolute -top-1 -left-1 w-4 h-4 rounded-full bg-guild-gold flex items-center justify-center text-[8px] font-bold text-black'>
													1
												</div>
											)}
										</div>
										<div className='flex-1 min-w-0'>
											<p className='text-sm font-medium text-white group-hover:text-guild-accent transition-colors truncate'>
												{w.name}
											</p>
											<p className='text-xs text-guild-muted'>
												{w.rarity}&#9733; {w.type} &middot;{' '}
												{w.substat}
											</p>
										</div>
										{i === 0 && (
											<Badge
												className={cn(
													'text-[10px] shrink-0',
													colors.bg,
													colors.text,
												)}
											>
												Best
											</Badge>
										)}
									</Link>
								);
							})}
						</div>
					</div>
				</div>

				{/* Artifact Sets */}
				<div className='guild-card overflow-hidden p-0'>
					<div
						className={cn(
							'px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide',
							colors.bg,
							colors.text,
						)}
					>
						Artifact Sets
					</div>
					<div className='p-4'>
						<div className='space-y-2'>
							{build.artifactSets.map((set, i) => (
								<div key={i} className='flex items-center gap-2'>
									<span
										className={cn(
											'text-xs font-bold w-5',
											colors.text,
										)}
									>
										{i + 1}.
									</span>
									<span className='text-sm text-white'>{set}</span>
									{i === 0 && (
										<Badge
											className={cn(
												'text-[10px] ml-auto',
												colors.bg,
												colors.text,
											)}
										>
											Best
										</Badge>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Main Stats + Substats side by side */}
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{/* Main Stats */}
				<div className='guild-card overflow-hidden p-0'>
					<div
						className={cn(
							'px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide',
							colors.bg,
							colors.text,
						)}
					>
						Main Stats
					</div>
					<div className='p-4 space-y-2'>
						{(
							[
								{
									slot: 'Sands' as const,
									value: build.mainStats.sands,
								},
								{
									slot: 'Goblet' as const,
									value: build.mainStats.goblet,
								},
								{
									slot: 'Circlet' as const,
									value: build.mainStats.circlet,
								},
							] as const
						).map(({ slot, value }) => {
							const SI = SLOT_ICONS[slot];
							return (
								<div key={slot} className='flex items-center gap-2'>
									{SI && (
										<SI
											size={16}
											className='text-guild-muted shrink-0'
										/>
									)}
									<span className='text-xs text-guild-muted w-14'>
										{slot}
									</span>
									<span className='text-sm font-medium text-white'>
										{value}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* Substats */}
				<div className='guild-card overflow-hidden p-0'>
					<div
						className={cn(
							'px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide',
							colors.bg,
							colors.text,
						)}
					>
						Substat Priority
					</div>
					<div className='p-4'>
						<div className='space-y-1.5'>
							{build.substats.map((sub, i) => (
								<div key={i} className='flex items-center gap-2'>
									<span
										className={cn(
											'text-xs font-bold w-5',
											colors.text,
										)}
									>
										{i + 1}.
									</span>
									<span className='text-sm text-white'>{sub}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Team Comps */}
			<div className='guild-card overflow-hidden p-0'>
				<div
					className={cn(
						'px-3 py-1.5 rounded-t-lg text-sm font-bold tracking-wide',
						colors.bg,
						colors.text,
					)}
				>
					Example Teams
				</div>
				<div className='p-4 space-y-4'>
					{build.teams.map((team, i) => (
						<div key={i} className='flex items-center gap-4'>
							<div className='flex items-center gap-1'>
								{team.map((member, j) => {
									const entry = findCharEntry(member);
									return entry ? (
										<Link
											key={j}
											href={`/database/${entry.id}`}
										>
											<div className='w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-guild-elevated hover:border-guild-accent/50 transition-colors'>
												<Image
													src={charIconUrl(entry.id)}
													alt={member}
													width={40}
													height={40}
													className='object-cover'
													sizes='40px'
												/>
											</div>
										</Link>
									) : (
										<div
											key={j}
											className='w-10 h-10 rounded-lg bg-guild-elevated border border-white/10 flex items-center justify-center text-[10px] text-guild-muted'
										>
											{member.slice(0, 2)}
										</div>
									);
								})}
							</div>
							<div className='flex-1 min-w-0'>
								<p className='text-xs text-white font-medium truncate'>
									{team.join(' / ')}
								</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Notes */}
			{build.notes && (
				<div
					className={cn(
						'guild-card p-4 border-l-4',
						colors.border,
					)}
				>
					<p className='text-sm text-foreground/90 italic leading-relaxed'>
						{build.notes}
					</p>
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
				className={`font-medium text-base ${value === '\u2014' ? 'text-gray-600' : 'text-white'}`}
			>
				{value}
			</p>
		</div>
	);
}
