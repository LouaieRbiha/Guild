'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	CharacterDetail,
	cleanDescription,
	yattaIconUrl,
} from '@/lib/yatta/client';
import Image from 'next/image';
import { useState } from 'react';
import {
	type ElementColors,
	HighlightNumbers,
	TALENT_PRIORITY,
	TALENT_COLORS,
	TALENT_BADGE_STYLES,
} from './detail-helpers';

export function TalentsTab({
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
				<h2 className='text-2xl font-bold text-foreground flex items-center gap-3'>
					<span className={colors.text}>&#9876;</span> Combat Talents
				</h2>
				<div className={`h-0.5 rounded-full ${colors.bg}`} />
				<p className='text-base text-guild-muted'>
					Recommended priority: Level all to 8+, then focus on the most
					impactful talent first
				</p>
			</div>

			<div className='space-y-6'>
				{detail.talents.map((talent, i) => {
					const isExpanded = expanded === `talent-${i}`;
					const priorityLabel = TALENT_PRIORITY[talent.type] || talent.type;
					const borderColor = TALENT_COLORS[talent.type] || 'border-guild-border';
					const badgeStyle =
						TALENT_BADGE_STYLES[talent.type] ||
						`${colors.bg} ${colors.text} ${colors.border}`;

					return (
						<div
							key={i}
							className={`guild-card p-4 cursor-pointer transition-all hover:bg-foreground/5 border-l-4 ${borderColor}`}
							onClick={() => setExpanded(isExpanded ? null : `talent-${i}`)}
						>
							<div className='flex items-center gap-4'>
								{talent.icon && (
									<Image
										src={yattaIconUrl(talent.icon)}
										alt={talent.name}
										width={64}
										height={64}
										className='rounded-lg bg-guild-elevated/50'
										sizes='64px'
										fetchPriority='low'
									/>
								)}
								<div className='flex-1'>
									<div className='flex items-center gap-2 flex-wrap'>
										<span className='text-foreground font-semibold text-xl'>
											{talent.name}
										</span>
										<Badge className={badgeStyle}>{priorityLabel}</Badge>
									</div>
									<p className='text-base text-guild-muted'>{talent.type}</p>
								</div>
								<span className='text-guild-dim text-lg'>
									{isExpanded ? '\u25B2' : '\u25BC'}
								</span>
							</div>
							{isExpanded && (
								<div className='mt-4 pt-4 border-t border-guild-border'>
									<p className='text-base text-guild-muted whitespace-pre-line leading-relaxed'>
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

			<Separator className='my-2 bg-foreground/10' />

			{/* Section header: Passive Talents */}
			{detail.passives.length > 0 && (
				<div className='space-y-6'>
					<div className='space-y-2'>
						<h2 className='text-2xl font-bold text-foreground flex items-center gap-3'>
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
									className='guild-card p-4 cursor-pointer transition-all hover:bg-foreground/5 border-l-4 border-amber-600/50'
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
												className='rounded-lg bg-guild-elevated/50'
												sizes='64px'
											/>
										)}
										<div className='flex-1'>
											<span className='text-foreground font-semibold text-xl'>
												{passive.name}
											</span>
											<p className='text-base text-guild-muted'>{passive.type}</p>
										</div>
										<span className='text-guild-dim text-lg'>
											{isExpanded ? '\u25B2' : '\u25BC'}
										</span>
									</div>
									{isExpanded && (
										<div className='mt-4 pt-4 border-t border-guild-border'>
											<p className='text-base text-guild-muted whitespace-pre-line leading-relaxed'>
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
