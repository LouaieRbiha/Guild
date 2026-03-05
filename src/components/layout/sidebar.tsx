'use client';

import {
	BuildIcon,
	CompassIcon,
	FateIcon,
	FlowerIcon,
	KameraIcon,
	LeakIcon,
	PrimogemIcon,
	VisionIcon,
	WeaponIcon,
} from '@/components/icons/genshin-icons';
import { cn } from '@/lib/utils';
import { Calendar, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface NavItem {
	href: string;
	icon: React.FC<{ className?: string; size?: number }>;
	label: string;
	requiresSetting?: string;
}

const navItems: NavItem[] = [
	{ href: '/', icon: PrimogemIcon, label: 'Home' },
	{ href: '/profile', icon: BuildIcon, label: 'Builds' },
	{ href: '/database', icon: VisionIcon, label: 'Characters' },
	{ href: '/weapons', icon: WeaponIcon, label: 'Weapons' },
	{ href: '/artifacts', icon: FlowerIcon, label: 'Artifacts' },
	{ href: '/calendar', icon: Calendar, label: 'Calendar' },
	{ href: '/abyss', icon: Shield, label: 'Abyss' },
	{ href: '/map', icon: CompassIcon, label: 'Map' },
	{ href: '/simulator', icon: FateIcon, label: 'Simulator' },
	{ href: '/streamers', icon: KameraIcon, label: 'Live' },
	{
		href: '/leaks',
		icon: LeakIcon,
		label: 'Leaks',
		requiresSetting: 'showLeaks',
	},
];

export function Sidebar() {
	const pathname = usePathname();
	const [showLeaks, setShowLeaks] = useState(false);
	const [hasNewLeaks, setHasNewLeaks] = useState(false);

	useEffect(() => {
		// Load initial setting
		try {
			const stored = localStorage.getItem('guild-settings');
			if (stored) {
				const parsed = JSON.parse(stored);
				setShowLeaks(parsed.showLeaks ?? false);
			}
		} catch {
			// ignore
		}

		// Listen for settings changes
		function handleSettingsChange(e: Event) {
			const detail = (e as CustomEvent).detail;
			if (detail && typeof detail.showLeaks === 'boolean') {
				setShowLeaks(detail.showLeaks);
			}
		}
		window.addEventListener('guild-settings-change', handleSettingsChange);
		return () =>
			window.removeEventListener('guild-settings-change', handleSettingsChange);
	}, []);

	// Poll for new leaks periodically
	useEffect(() => {
		let mounted = true;

		async function checkLeaks() {
			try {
				const res = await fetch('/api/leaks');
				const data = await res.json();
				const leaks = data?.leaks || data || [];
				const count = Array.isArray(leaks) ? leaks.length : 0;
				const lastSeen = parseInt(
					localStorage.getItem('guild-leaks-seen') || '0',
					10,
				);
				if (mounted && count > lastSeen) {
					setHasNewLeaks(true);
				}
			} catch {
				// ignore fetch errors
			}
		}

		if (showLeaks) {
			checkLeaks();
			const interval = setInterval(checkLeaks, 3600000); // 1 hour
			return () => {
				mounted = false;
				clearInterval(interval);
			};
		}
		return () => {
			mounted = false;
		};
	}, [showLeaks]);

	// Mark leaks as seen when visiting /leaks
	useEffect(() => {
		if (pathname === '/leaks') {
			fetch('/api/leaks')
				.then((res) => res.json())
				.then((data) => {
					const leaks = data?.leaks || data || [];
					const count = Array.isArray(leaks) ? leaks.length : 0;
					localStorage.setItem('guild-leaks-seen', String(count));
					setHasNewLeaks(false);
				})
				.catch(() => {});
		}
	}, [pathname]);

	const visibleItems = navItems.filter((item) => {
		if (item.requiresSetting === 'showLeaks' && !showLeaks) return false;
		return true;
	});

	return (
		<aside className='hidden md:flex w-16 hover:w-48 transition-all duration-300 flex-col bg-guild-card/50 border-r border-white/5 group overflow-hidden'>
			<div className='flex items-center h-16 px-4 border-b border-white/5'>
				<PrimogemIcon className='text-guild-accent shrink-0' size={24} />
				<span className='ml-2 text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap'>
					Guild
				</span>
			</div>

			<nav className='flex-1 py-4 space-y-1'>
				{visibleItems.map((item) => {
					const isActive =
						pathname === item.href ||
						(item.href !== '/' && pathname.startsWith(item.href));
					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								'flex items-center h-10 px-4 mx-2 rounded-md transition-colors',
								isActive
									? 'bg-guild-accent/20 text-guild-accent'
									: 'text-guild-muted hover:text-foreground hover:bg-white/5',
							)}
						>
							<span className='relative shrink-0'>
								<item.icon size={20} />
								{item.label === 'Live' && (
									<span className='absolute -top-0.5 -right-0.5 flex h-2 w-2'>
										<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75' />
										<span className='relative inline-flex rounded-full h-2 w-2 bg-red-500' />
									</span>
								)}
								{item.label === 'Leaks' && hasNewLeaks && (
									<span className='absolute -top-0.5 -right-0.5 flex h-2 w-2'>
										<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75' />
										<span className='relative inline-flex rounded-full h-2 w-2 bg-amber-500' />
									</span>
								)}
							</span>
							<span className='ml-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap'>
								{item.label}
							</span>
						</Link>
					);
				})}
			</nav>

			<div className='p-4 border-t border-white/5'>
				<div className='text-xs text-guild-dim opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
					Not affiliated with HoYoverse
				</div>
			</div>
		</aside>
	);
}
