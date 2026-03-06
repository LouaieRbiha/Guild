'use client';

import { useState, useCallback } from 'react';
import { Share2, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareBuildButtonProps {
	uid: string;
	characterId: string;
	className?: string;
}

export function ShareBuildButton({ uid, characterId, className }: ShareBuildButtonProps) {
	const [copied, setCopied] = useState(false);

	const buildCardUrl = `/api/build-card/${uid}/${characterId}`;

	const handleShare = useCallback(async () => {
		try {
			const fullUrl = `${window.location.origin}${buildCardUrl}`;
			await navigator.clipboard.writeText(fullUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback: open in new tab if clipboard fails
			window.open(buildCardUrl, '_blank');
		}
	}, [buildCardUrl]);

	const handleOpenPreview = useCallback(() => {
		window.open(buildCardUrl, '_blank');
	}, [buildCardUrl]);

	return (
		<div className={cn('flex items-center gap-1', className)}>
			<button
				onClick={handleShare}
				className={cn(
					'h-9 px-4 rounded-md text-sm flex items-center gap-2 transition-all cursor-pointer',
					copied
						? 'bg-emerald-500/20 text-emerald-400'
						: 'bg-guild-elevated hover:bg-white/10 text-[#F8FAFC]',
				)}
			>
				{copied ? (
					<>
						<Check className="h-4 w-4" />
						Link copied!
					</>
				) : (
					<>
						<Share2 className="h-4 w-4" />
						Share Build
					</>
				)}
			</button>
			<button
				onClick={handleOpenPreview}
				className="h-9 w-9 rounded-md bg-guild-elevated hover:bg-white/10 text-[#94A3B8] hover:text-[#F8FAFC] flex items-center justify-center transition-colors cursor-pointer"
				title="Open build card preview"
			>
				<ExternalLink className="h-3.5 w-3.5" />
			</button>
		</div>
	);
}
