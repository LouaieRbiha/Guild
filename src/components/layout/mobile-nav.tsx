'use client';

import {
	AbyssIcon,
	BuildIcon,
	CompassIcon,
	FateIcon,
	FlowerIcon,
	KameraIcon,
	PrimogemIcon,
	VisionIcon,
	WeaponIcon,
} from '@/components/icons/genshin-icons';
import { cn } from '@/lib/utils';
import {
	ArrowLeftRight,
	Award,
	Brain,
	Calendar,
	CalendarCheck,
	Calculator,
	Clock,
	Gamepad2,
	GitCompare,
	History,
	LayoutGrid,
	MoreHorizontal,
	Target,
	Trophy,
	Users,
	X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

// ── Nav Items ─────────────────────────────────────────────────────────────

interface MobileNavItem {
	href: string;
	icon: React.FC<{ className?: string; size?: number }>;
	label: string;
}

interface MoreSection {
	title: string;
	items: MobileNavItem[];
}

// Primary tabs shown in the bottom bar (max 5 for mobile)
const PRIMARY_TABS: MobileNavItem[] = [
	{ href: '/', icon: PrimogemIcon, label: 'Home' },
	{ href: '/database', icon: VisionIcon, label: 'Chars' },
	{ href: '/weapons', icon: WeaponIcon, label: 'Weapons' },
	{ href: '/profile', icon: BuildIcon, label: 'Builds' },
];

// Grouped overflow items in the "More" menu
const MORE_SECTIONS: MoreSection[] = [
	{
		title: 'Database',
		items: [
			{ href: '/tierlist', icon: Trophy, label: 'Tier List' },
			{ href: '/artifacts', icon: FlowerIcon, label: 'Artifacts' },
		],
	},
	{
		title: 'Guide',
		items: [
			{ href: '/calendar', icon: Calendar, label: 'Calendar' },
			{ href: '/banners', icon: History, label: 'Banners' },
			{ href: '/teams', icon: Users, label: 'Teams' },
			{ href: '/team-builder', icon: LayoutGrid, label: 'Builder' },
			{ href: '/compare', icon: GitCompare, label: 'Compare' },
			{ href: '/build-compare', icon: ArrowLeftRight, label: 'Build Cmp' },
			{ href: '/abyss', icon: AbyssIcon, label: 'Endgame' },
			{ href: '/achievements', icon: Award, label: 'Achieve.' },
			{ href: '/map', icon: CompassIcon, label: 'Map' },
		],
	},
	{
		title: 'Tools',
		items: [
			{ href: '/calculator', icon: Calculator, label: 'Calculator' },
			{ href: '/planner', icon: Clock, label: 'Planner' },
		],
	},
	{
		title: 'Games',
		items: [
			{ href: '/simulator', icon: FateIcon, label: 'Simulator' },
			{ href: '/wordle', icon: Gamepad2, label: 'Genshindle' },
			{ href: '/quiz', icon: Brain, label: 'Quiz' },
			{ href: '/daily', icon: CalendarCheck, label: 'Check-In' },
			{ href: '/artifact-challenge', icon: Target, label: 'CV Challenge' },
			{ href: '/streamers', icon: KameraIcon, label: 'Live' },
		],
	},
];

// Flatten for "more active" check
const ALL_MORE_ITEMS = MORE_SECTIONS.flatMap((s) => s.items);

// ── Component ─────────────────────────────────────────────────────────────

export function MobileNav() {
	const pathname = usePathname();
	const [moreOpen, setMoreOpen] = useState(false);

	const isActive = (href: string) =>
		pathname === href || (href !== '/' && pathname.startsWith(href));

	const moreActive = ALL_MORE_ITEMS.some((item) => isActive(item.href));

	return (
		<>
			{/* Overlay */}
			{moreOpen && (
				<div
					className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden'
					onClick={() => setMoreOpen(false)}
				/>
			)}

			{/* More menu popup */}
			{moreOpen && (
				<div className='fixed bottom-16 left-0 right-0 z-50 md:hidden px-3 pb-2'>
					<div className='bg-guild-card border border-guild-border rounded-2xl p-3 shadow-2xl shadow-black/50 max-h-[70vh] overflow-y-auto'>
						<div className='flex items-center justify-between mb-2 px-1'>
							<span className='text-sm font-semibold text-guild-muted'>
								More
							</span>
							<button
								onClick={() => setMoreOpen(false)}
								className='p-1 rounded-lg hover:bg-guild-elevated/50 cursor-pointer'
							>
								<X size={16} className='text-guild-dim' />
							</button>
						</div>

						<div className='space-y-3'>
							{MORE_SECTIONS.map((section) => (
								<div key={section.title}>
									<div className='px-1 mb-1.5'>
										<span className='text-[10px] font-bold uppercase tracking-[0.12em] text-guild-dim'>
											{section.title}
										</span>
									</div>
									<div className='grid grid-cols-3 gap-1.5'>
										{section.items.map((item) => {
											const active = isActive(item.href);
											return (
												<Link
													key={item.href}
													href={item.href}
													onClick={() => setMoreOpen(false)}
													className={cn(
														'flex flex-col items-center gap-1 py-2.5 rounded-xl transition-colors',
														active
															? 'bg-guild-accent/15 text-guild-accent'
															: 'text-guild-muted hover:bg-guild-elevated/50 hover:text-foreground',
													)}
												>
													<div className='relative'>
														<item.icon size={20} />
														{item.label === 'Live' && (
															<span className='absolute -top-0.5 -right-0.5 flex h-2 w-2'>
																<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75' />
																<span className='relative inline-flex rounded-full h-2 w-2 bg-red-500' />
															</span>
														)}
													</div>
													<span className='text-[10px] font-medium'>
														{item.label}
													</span>
												</Link>
											);
										})}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Bottom tab bar */}
			<nav className='fixed bottom-0 left-0 right-0 z-40 md:hidden bg-guild-card/95 backdrop-blur-lg border-t border-guild-border/30'>
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
