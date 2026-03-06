'use client';

import {
	ELEMENT_ICONS,
} from '@/components/icons/genshin-icons';
import { ElementBadge, RarityStars } from '@/components/shared';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	CharacterEntry,
	charGachaUrl,
	charIconUrl,
} from '@/lib/characters';
import { ELEMENT_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
	CharacterDetail,
} from '@/lib/yatta/client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
	TalentsTab,
	ConstellationsTab,
	MaterialsTab,
	LoreTab,
	GuidesTab,
	RecommendedBuildSection,
} from './tabs';

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
				className='inline-flex items-center gap-2 text-sm text-guild-muted hover:text-foreground transition-colors'
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
						<div className='absolute inset-0 bg-linear-to-r from-transparent to-background hidden md:block' />
						<div className='absolute inset-0 bg-linear-to-t from-background to-transparent md:hidden' />
					</div>

					{/* Info */}
					<div className='relative flex-1 p-6 space-y-4'>
						<div className='flex items-center gap-3'>
							{VisionComp && <VisionComp className='w-8 h-8' />}
							<div>
								<h1 className='text-3xl font-bold text-foreground'>{detail.name}</h1>
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
								className='text-guild-muted border-guild-border'
							>
								{detail.weapon}
							</Badge>
							<RarityStars rarity={detail.rarity} size='md' />
						</div>

						{/* Quick stats grid */}
						<div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
							<Card
								className={cn(
									'bg-guild-elevated/50 border-guild-border/30 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>Region</p>
									<p className='font-medium text-foreground'>{detail.region}</p>
								</CardContent>
							</Card>
							<Card
								className={cn(
									'bg-guild-elevated/50 border-guild-border/30 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>Affiliation</p>
									<p className='font-medium text-foreground'>
										{detail.affiliation || '\u2014'}
									</p>
								</CardContent>
							</Card>
							<Card
								className={cn(
									'bg-guild-elevated/50 border-guild-border/30 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>Birthday</p>
									<p className='font-medium text-foreground'>{detail.birthday}</p>
								</CardContent>
							</Card>
							<Card
								className={cn(
									'bg-guild-elevated/50 border-guild-border/30 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>Constellation</p>
									<p className='font-medium text-foreground'>
										{detail.constellation || '\u2014'}
									</p>
								</CardContent>
							</Card>
							<Card
								className={cn(
									'bg-guild-elevated/50 border-guild-border/30 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>
										Ascension Stat
									</p>
									<p className='font-medium text-foreground'>
										{detail.ascensionStat}
									</p>
								</CardContent>
							</Card>
							<Card
								className={cn(
									'bg-guild-elevated/50 border-guild-border/30 border-l-2',
									colors.border,
								)}
							>
								<CardContent className='p-3'>
									<p className='text-xs text-muted-foreground'>Released</p>
									<p className='font-medium text-foreground'>{detail.release}</p>
								</CardContent>
							</Card>
						</div>

						{/* Voice actors */}
						{detail.cv.EN && (
							<div className='text-sm text-guild-dim space-x-4'>
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
				<TabsList className='w-full bg-guild-card'>
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
