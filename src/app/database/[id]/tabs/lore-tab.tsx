'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CharacterDetail } from '@/lib/yatta/client';

function DetailCard({ label, value }: { label: string; value: string }) {
	return (
		<div className='bg-guild-elevated/50 rounded-lg p-3'>
			<p className='text-sm text-guild-dim'>{label}</p>
			<p
				className={`font-medium text-base ${value === '\u2014' ? 'text-guild-dim' : 'text-foreground'}`}
			>
				{value}
			</p>
		</div>
	);
}

export function LoreTab({ detail }: { detail: CharacterDetail }) {
	return (
		<div className='space-y-6'>
			{/* Story */}
			<div className='guild-card p-6 space-y-4'>
				<h2 className='text-2xl font-bold text-foreground'>Story</h2>
				{detail.description ? (
					<p className='text-base text-guild-muted leading-relaxed'>
						{detail.description}
					</p>
				) : (
					<p className='text-base text-guild-dim italic'>
						No story data available for this character yet.
					</p>
				)}
			</div>

			{/* Character info card */}
			<div className='guild-card p-6'>
				<h2 className='text-2xl font-bold text-foreground mb-4'>Character Info</h2>
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
					<h2 className='text-2xl font-bold text-foreground mb-4'>Voice Actors</h2>
					<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
						<Card className='bg-guild-elevated/50 border-guild-border/30'>
							<CardContent className='p-4'>
								<p className='text-sm text-guild-dim mb-1'>English (EN)</p>
								<p className='text-lg font-semibold text-foreground'>
									{detail.cv.EN}
								</p>
							</CardContent>
						</Card>
						<Card className='bg-guild-elevated/50 border-guild-border/30'>
							<CardContent className='p-4'>
								<p className='text-sm text-guild-dim mb-1'>Japanese (JP)</p>
								<p className='text-lg font-semibold text-foreground'>
									{detail.cv.JP || '\u2014'}
								</p>
							</CardContent>
						</Card>
						<Card className='bg-guild-elevated/50 border-guild-border/30'>
							<CardContent className='p-4'>
								<p className='text-sm text-guild-dim mb-1'>Chinese (CN)</p>
								<p className='text-lg font-semibold text-foreground'>
									{detail.cv.CHS || '\u2014'}
								</p>
							</CardContent>
						</Card>
						<Card className='bg-guild-elevated/50 border-guild-border/30'>
							<CardContent className='p-4'>
								<p className='text-sm text-guild-dim mb-1'>Korean (KR)</p>
								<p className='text-lg font-semibold text-foreground'>
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
					<h2 className='text-2xl font-bold text-foreground mb-4'>Introduction</h2>
					<blockquote className='border-l-4 border-guild-border pl-4 italic text-base text-guild-muted leading-relaxed'>
						{detail.description}
					</blockquote>
				</div>
			)}
		</div>
	);
}
