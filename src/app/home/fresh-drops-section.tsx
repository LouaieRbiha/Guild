'use client';

import Image from 'next/image';
import Link from 'next/link';

import { ELEMENT_ICONS } from '@/components/icons/genshin-icons';
import { RarityStars } from '@/components/shared';
import { Card } from '@/components/ui/card';
import type { CharacterEntry } from '@/types';
import { charGachaUrl } from '@/lib/characters';
import { ELEMENT_COLORS } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Element-specific hover glow for character cards
const ELEMENT_GLOW: Record<string, string> = {
	Pyro: 'hover:border-red-500/50',
	Hydro: 'hover:border-blue-500/50',
	Anemo: 'hover:border-teal-500/50',
	Cryo: 'hover:border-cyan-500/50',
	Electro: 'hover:border-purple-500/50',
	Geo: 'hover:border-yellow-500/50',
	Dendro: 'hover:border-green-500/50',
};

interface FreshDropsSectionProps {
	newestCharacters: CharacterEntry[];
}

export function FreshDropsSection({ newestCharacters }: FreshDropsSectionProps) {
	return (
		<section className='px-6 pb-12'>
			<div className='max-w-6xl mx-auto space-y-4'>
				<div className='flex items-center justify-between'>
					<h2 className='text-xl font-bold'>Fresh Drops</h2>
					<span className='text-sm text-guild-muted'>Latest releases</span>
				</div>

				<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
					{newestCharacters.map((char) => {
						const Icon = ELEMENT_ICONS[char.element];
						const splashUrl = charGachaUrl(char.id);

						return (
							<Link
								key={char.id}
								href={`/database/${char.id}`}
								className='group'
							>
								<Card
									className={cn(
										'relative aspect-3/4 overflow-hidden p-0 gap-0 border-guild-border/50',
										'transition-all duration-300 hover:scale-105 hover:shadow-lg',
										ELEMENT_GLOW[char.element] ||
											'hover:border-guild-accent/50',
									)}
								>
									{/* Element background tint */}
									<div
										className={`absolute inset-0 ${ELEMENT_COLORS[char.element]?.bg || ''}`}
									/>

									{/* Character gacha art */}
									<Image
										src={splashUrl}
										alt={char.name}
										fill
										className='object-cover opacity-80 group-hover:scale-105 transition-transform duration-300'
										sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw'
									/>

									{/* Bottom gradient */}
									<div className='absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent' />

									{/* Element icon (top-right) */}
									{Icon && (
										<div className='absolute top-3 right-3'>
											<Icon size={20} />
										</div>
									)}

									{/* Name + rarity stars (bottom) */}
									<div className='absolute bottom-3 left-3 right-3'>
										<h3 className='font-bold text-base truncate'>
											{char.name}
										</h3>
										<RarityStars rarity={char.rarity} size='xs' />
									</div>
								</Card>
							</Link>
						);
					})}
				</div>
			</div>
		</section>
	);
}
