'use client';

import { ExternalLink, Gift } from 'lucide-react';
import { useState } from 'react';

import { getActiveCodes } from '@/data/codes';

export function RedeemCodesSection() {
	const codes = getActiveCodes();
	const [copied, setCopied] = useState<string | null>(null);

	const copyCode = (code: string) => {
		navigator.clipboard.writeText(code);
		setCopied(code);
		setTimeout(() => setCopied(null), 2000);
	};

	if (codes.length === 0) return null;

	return (
		<section className='px-6 pb-12'>
			<div className='max-w-6xl mx-auto space-y-3'>
				<h2 className='text-lg font-bold flex items-center gap-2'>
					<Gift className='h-5 w-5 text-guild-gold' />
					Active Codes
				</h2>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
					{codes.map((c) => (
						<button
							key={c.code}
							onClick={() => copyCode(c.code)}
							className='guild-card p-4 text-left cursor-pointer hover:border-guild-accent/30 transition-all group'
						>
							<div className='flex items-center justify-between mb-2'>
								<code className='text-sm font-bold font-mono text-guild-accent'>
									{c.code}
								</code>
								<span className='text-[10px] text-guild-dim'>
									{copied === c.code ? 'Copied!' : 'Click to copy'}
								</span>
							</div>
							<div className='flex flex-wrap gap-1'>
								{c.rewards.map((r) => (
									<span
										key={r}
										className='text-[10px] px-1.5 py-0.5 rounded bg-guild-gold/10 text-guild-gold font-medium'
									>
										{r}
									</span>
								))}
							</div>
							<p className='text-[10px] text-guild-dim mt-2'>{c.source}</p>
						</button>
					))}
				</div>
				<a
					href='https://genshin-impact.fandom.com/wiki/Promotional_Code'
					target='_blank'
					rel='noopener noreferrer'
					className='inline-flex items-center gap-1 text-xs text-guild-muted hover:text-guild-accent transition-colors'
				>
					View all codes on Wiki
					<ExternalLink className='h-3 w-3' />
				</a>
			</div>
		</section>
	);
}
