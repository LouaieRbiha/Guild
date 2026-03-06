'use client';

import { ConstellationIcon } from '@/components/icons/genshin-icons';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
	CharacterDetail,
	cleanDescription,
	yattaIconUrl,
} from '@/lib/yatta/client';
import Image from 'next/image';
import {
	type ElementColors,
	HighlightNumbers,
	estimateConstellationImpact,
	ELEMENT_GLOW_SHADOW,
} from './detail-helpers';

export function ConstellationsTab({
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
				<h2 className='text-2xl font-bold text-foreground flex items-center gap-3'>
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
						<Card key={c.index} className='bg-guild-elevated/50 border-guild-border/30'>
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
											<h3 className='text-lg font-bold text-foreground'>{c.name}</h3>
											<Badge
												variant='outline'
												className={cn(
													impact.color,
													'bg-foreground/5 border-guild-border font-bold',
												)}
											>
												{impact.label}
											</Badge>
										</div>
										<p className='text-base text-guild-muted whitespace-pre-line leading-relaxed mb-3'>
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
											<span className='text-base font-semibold text-foreground'>
												Impact:
											</span>
											<span className={`text-base font-bold ${impact.color}`}>
												{impact.label}
											</span>
											<span className='text-base text-guild-muted'>
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
