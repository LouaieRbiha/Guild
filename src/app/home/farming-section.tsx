'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { getTodaysTalentBooks } from './banner-helpers';

export function FarmingSection() {
	// Today's farmable talent books (deferred to client to avoid hydration mismatch)
	const [todaysBooks, setTodaysBooks] = useState<string[]>([]);
	const [todayName, setTodayName] = useState('');
	useEffect(() => {
		const dayNames = [
			'Sunday', 'Monday', 'Tuesday', 'Wednesday',
			'Thursday', 'Friday', 'Saturday',
		];
		setTodayName(dayNames[new Date().getDay()]);
		setTodaysBooks(getTodaysTalentBooks());
	}, []);

	return (
		<section className='px-6 pb-12'>
			<div className='max-w-6xl mx-auto'>
				<Card className='border-guild-border/50 p-0 gap-0'>
					<CardContent className='px-5 py-4'>
						<div className='flex flex-col sm:flex-row sm:items-center gap-3'>
							<div className='flex items-center gap-2 shrink-0'>
								<BookOpen size={18} className='text-guild-accent' />
								<span className='text-sm font-semibold'>
									Today&apos;s Talent Books
								</span>
								<Badge
									variant='outline'
									className='text-xs text-guild-muted border-guild-border'
								>
									{todayName}
								</Badge>
							</div>
							<div className='flex items-center gap-2 flex-wrap flex-1'>
								{todaysBooks.map((book) => (
									<Badge
										key={book}
										className='bg-guild-accent/10 text-guild-accent border-guild-accent/20 text-xs'
									>
										{book}
									</Badge>
								))}
							</div>
							<Link
								href='/calendar'
								className='text-xs text-guild-accent hover:text-guild-accent/80 transition-colors shrink-0'
							>
								Full schedule &rarr;
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
