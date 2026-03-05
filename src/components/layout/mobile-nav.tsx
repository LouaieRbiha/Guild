'use client';

import {
	BuildIcon,
	CompassIcon,
	FateIcon,
	FlowerIcon,
	PrimogemIcon,
	VisionIcon,
	WeaponIcon,
} from '@/components/icons/genshin-icons';
import { cn } from '@/lib/utils';
import { Calendar, MoreHorizontal, Shield, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// ── Nav Items ─────────────────────────────────────────────────────────────

interface MobileNavItem {
	href: string;
	icon: React.FC<{ className?: string; size?: number }>;
	label: string;
}

// Primary tabs shown in the bottom bar (max 5 for mobile)
const PRIMARY_TABS: MobileNavItem[] = [
	{ href: '/', icon: PrimogemIcon, label: 'Home' },
	{ href: '/database', icon: VisionIcon, label: 'Chars' },
	{ href: '/weapons', icon: WeaponIcon, label: 'Weapons' },
	{ href: '/profile', icon: BuildIcon, label: 'Builds' },
];

// Overflow items in the "More" menu
const MORE_ITEMS: MobileNavItem[] = [
	{ href: '/artifacts', icon: FlowerIcon, label: 'Artifacts' },
	{ href: '/calendar', icon: Calendar, label: 'Calendar' },
	{ href: '/abyss', icon: Shield, label: 'Abyss' },
	{ href: '/map', icon: CompassIcon, label: 'Map' },
	{ href: '/simulator', icon: FateIcon, label: 'Simulator' },
];

// ── Component ─────────────────────────────────────────────────────────────

export function MobileNav() {
	const pathname = usePathname();
	const [moreOpen, setMoreOpen] = useState(false);

	const isActive = (href: string) =>
		pathname === href || (href !== '/' && pathname.startsWith(href));

	// Check if any "More" item is active
	const moreActive = MORE_ITEMS.some((item) => isActive(item.href));

	return (
		<>
			{/* Overlay for "More" menu */}
			{moreOpen && (
				<div
					className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden'
					onClick={() => setMoreOpen(false)}
				/>
			)}

			{/* More menu popup */}
			{moreOpen && (
				<div className='fixed bottom-16 left-0 right-0 z-50 md:hidden px-3 pb-2'>
					<div className='bg-guild-card border border-white/10 rounded-2xl p-3 shadow-2xl shadow-black/50'>
						<div className='flex items-center justify-between mb-3 px-1'>
							<span className='text-sm font-semibold text-guild-muted'>
								More
							</span>
							<button
								onClick={() => setMoreOpen(false)}
								className='p-1 rounded-lg hover:bg-white/5 cursor-pointer'
							>
								<X size={16} className='text-guild-dim' />
							</button>
						</div>
						<div className='grid grid-cols-3 gap-2'>
							{MORE_ITEMS.map((item) => {
								const active = isActive(item.href);
								return (
									<Link
										key={item.href}
										href={item.href}
										onClick={() => setMoreOpen(false)}
										className={cn(
											'flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors',
											active
												? 'bg-guild-accent/15 text-guild-accent'
												: 'text-guild-muted hover:bg-white/5 hover:text-foreground',
										)}
									>
										<item.icon size={22} />
										<span className='text-[11px] font-medium'>
											{item.label}
										</span>
									</Link>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Bottom tab bar */}
			<nav className='fixed bottom-0 left-0 right-0 z-40 md:hidden bg-guild-card/95 backdrop-blur-lg border-t border-white/5'>
				<div className='flex items-center justify-around h-16 px-2'>
					{PRIMARY_TABS.map((item) => {
						const active = isActive(item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 min-h-[44px]',
									active ? 'text-guild-accent' : 'text-guild-dim',
								)}
							>
								<div className='relative'>
									<item.icon size={22} />
									{active && (
										<div className='absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-guild-accent' />
									)}
								</div>
								<span
									className={cn(
										'text-[10px] font-medium truncate',
										active && 'text-guild-accent',
									)}
								>
									{item.label}
								</span>
							</Link>
						);
					})}

					{/* More button */}
					<button
						onClick={() => setMoreOpen((prev) => !prev)}
						className={cn(
							'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-0 min-h-[44px] cursor-pointer',
							moreOpen || moreActive ? 'text-guild-accent' : 'text-guild-dim',
						)}
					>
						<div className='relative'>
							<MoreHorizontal size={22} />
							{moreActive && !moreOpen && (
								<div className='absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-guild-accent' />
							)}
						</div>
						<span
							className={cn(
								'text-[10px] font-medium',
								(moreOpen || moreActive) && 'text-guild-accent',
							)}
						>
							More
						</span>
					</button>
				</div>

				{/* Safe area for devices with home indicator */}
				<div className='h-[env(safe-area-inset-bottom)]' />
			</nav>
		</>
	);
}
