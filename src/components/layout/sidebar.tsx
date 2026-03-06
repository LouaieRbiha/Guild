'use client';

import {
	AbyssIcon,
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
import {
	ArrowLeftRight,
	Award,
	Brain,
	Calendar,
	CalendarCheck,
	Calculator,
	ChevronDown,
	Clock,
	Gamepad2,
	GitCompare,
	History,
	LayoutGrid,
	Target,
	Trophy,
	Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// ── Types ────────────────────────────────────────────────────────────────

interface NavItem {
	href: string;
	icon: React.FC<{ className?: string; size?: number }>;
	label: string;
	requiresSetting?: string;
	badge?: 'live';
}

interface NavSection {
	id: string;
	title: string;
	items: NavItem[];
	collapsible: boolean;
}

// ── Data ─────────────────────────────────────────────────────────────────

const NAV_SECTIONS: NavSection[] = [
	{
		id: 'core',
		title: '',
		collapsible: false,
		items: [
			{ href: '/', icon: PrimogemIcon, label: 'Home' },
			{ href: '/profile', icon: BuildIcon, label: 'Builds' },
		],
	},
	{
		id: 'database',
		title: 'Database',
		collapsible: true,
		items: [
			{ href: '/database', icon: VisionIcon, label: 'Characters' },
			{ href: '/weapons', icon: WeaponIcon, label: 'Weapons' },
			{ href: '/artifacts', icon: FlowerIcon, label: 'Artifacts' },
			{ href: '/tierlist', icon: Trophy, label: 'Tier List' },
		],
	},
	{
		id: 'guide',
		title: 'Guide',
		collapsible: true,
		items: [
			{ href: '/calendar', icon: Calendar, label: 'Calendar' },
			{ href: '/banners', icon: History, label: 'Banners' },
			{ href: '/teams', icon: Users, label: 'Teams' },
			{ href: '/team-builder', icon: LayoutGrid, label: 'Team Builder' },
			{ href: '/compare', icon: GitCompare, label: 'Compare' },
			{ href: '/build-compare', icon: ArrowLeftRight, label: 'Build Compare' },
			{ href: '/abyss', icon: AbyssIcon, label: 'Endgame' },
			{ href: '/achievements', icon: Award, label: 'Achievements' },
		],
	},
	{
		id: 'tools',
		title: 'Tools',
		collapsible: true,
		items: [
			{ href: '/calculator', icon: Calculator, label: 'Calculator' },
			{ href: '/planner', icon: Clock, label: 'Planner' },
			{ href: '/map', icon: CompassIcon, label: 'Map' },
		],
	},
	{
		id: 'games',
		title: 'Games',
		collapsible: true,
		items: [
			{ href: '/simulator', icon: FateIcon, label: 'Simulator' },
			{ href: '/wordle', icon: Gamepad2, label: 'Genshindle' },
			{ href: '/quiz', icon: Brain, label: 'Quiz' },
			{ href: '/daily', icon: CalendarCheck, label: 'Check-In' },
			{ href: '/artifact-challenge', icon: Target, label: 'CV Challenge' },
		],
	},
	{
		id: 'social',
		title: 'Social',
		collapsible: true,
		items: [
			{ href: '/streamers', icon: KameraIcon, label: 'Live', badge: 'live' },
			{
				href: '/leaks',
				icon: LeakIcon,
				label: 'Leaks',
				requiresSetting: 'showLeaks',
			},
		],
	},
];

const STORAGE_KEY = 'guild-sidebar-collapsed';

// ── Component ────────────────────────────────────────────────────────────

export function Sidebar() {
	const pathname = usePathname();
	const [showLeaks, setShowLeaks] = useState(false);
	const [hasNewLeaks, setHasNewLeaks] = useState(false);
	const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

	// Load collapsed state & leaks setting
	useEffect(() => {
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) setCollapsed(JSON.parse(stored));
		} catch {}
		try {
			const stored = localStorage.getItem('guild-settings');
			if (stored) {
				const parsed = JSON.parse(stored);
				setShowLeaks(parsed.showLeaks ?? false);
			}
		} catch {}

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

	// Leaks polling
	useEffect(() => {
		let alive = true;
		async function checkLeaks() {
			try {
				const res = await fetch('/api/leaks');
				const data = await res.json();
				const leaks = data?.leaks || data || [];
				const count = Array.isArray(leaks) ? leaks.length : 0;
				const lastSeen = parseInt(localStorage.getItem('guild-leaks-seen') || '0', 10);
				if (alive && count > lastSeen) setHasNewLeaks(true);
			} catch {}
		}
		if (showLeaks) {
			checkLeaks();
			const iv = setInterval(checkLeaks, 3600000);
			return () => { alive = false; clearInterval(iv); };
		}
		return () => { alive = false; };
	}, [showLeaks]);

	// Mark leaks seen
	useEffect(() => {
		if (pathname === '/leaks') {
			fetch('/api/leaks')
				.then((r) => r.json())
				.then((data) => {
					const leaks = data?.leaks || data || [];
					localStorage.setItem('guild-leaks-seen', String(Array.isArray(leaks) ? leaks.length : 0));
					setHasNewLeaks(false);
				})
				.catch(() => {});
		}
	}, [pathname]);

	const toggleSection = useCallback((id: string) => {
		setCollapsed((prev) => {
			const next = { ...prev, [id]: !prev[id] };
			try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
			return next;
		});
	}, []);

	// Auto-expand section containing active page
	const activeSectionId = NAV_SECTIONS.find((s) =>
		s.items.some((item) =>
			pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)),
		),
	)?.id;

	function isSectionOpen(section: NavSection): boolean {
		if (!section.collapsible) return true;
		// If section contains active page, always open
		if (section.id === activeSectionId) return true;
		// Otherwise respect collapsed state (default open if not set)
		return !collapsed[section.id];
	}

	function isItemVisible(item: NavItem) {
		if (item.requiresSetting === 'showLeaks' && !showLeaks) return false;
		return true;
	}

	return (
		<aside className='hidden md:flex w-16 hover:w-48 transition-all duration-300 flex-col bg-guild-card/50 border-r border-guild-border/30 group overflow-hidden'>
			{/* Logo */}
			<div className='flex items-center h-14 px-4 border-b border-guild-border/30'>
				<PrimogemIcon className='text-guild-accent shrink-0' size={22} />
				<span className='ml-2 text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap'>
					Guild
				</span>
			</div>

			{/* Nav */}
			<nav className='flex-1 py-2 overflow-y-auto overflow-x-hidden sidebar-scroll'>
				{NAV_SECTIONS.map((section) => {
					const visibleItems = section.items.filter(isItemVisible);
					if (visibleItems.length === 0) return null;
					const open = isSectionOpen(section);
					const hasActive = section.id === activeSectionId;

					return (
						<div key={section.id} className={cn(section.collapsible && 'mt-1')}>
							{/* Section header */}
							{section.collapsible && (
								<button
									onClick={() => toggleSection(section.id)}
									className={cn(
										'w-full flex items-center h-7 px-4 mx-0 transition-colors cursor-pointer',
										'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
									)}
								>
									<ChevronDown
										size={10}
										className={cn(
											'text-guild-dim transition-transform duration-200 shrink-0',
											!open && '-rotate-90',
										)}
									/>
									<span className={cn(
										'ml-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap',
										hasActive ? 'text-guild-accent/70' : 'text-guild-dim',
									)}>
										{section.title}
									</span>
									{!open && hasActive && (
										<span className='ml-auto w-1.5 h-1.5 rounded-full bg-guild-accent shrink-0' />
									)}
								</button>
							)}

							{/* Collapsed: divider dot in icon-only mode */}
							{section.collapsible && !open && (
								<div className='flex justify-center py-1 group-hover:hidden'>
									<div className={cn(
										'w-1 h-1 rounded-full',
										hasActive ? 'bg-guild-accent' : 'bg-guild-border/50',
									)} />
								</div>
							)}

							{/* Items */}
							<div
								className={cn(
									'overflow-hidden transition-all duration-200 ease-in-out',
									open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
								)}
							>
								{visibleItems.map((item) => {
									const active =
										pathname === item.href ||
										(item.href !== '/' && pathname.startsWith(item.href));
									return (
										<Link
											key={item.href}
											href={item.href}
											className={cn(
												'flex items-center h-8 px-4 mx-2 rounded-md transition-colors',
												active
													? 'bg-guild-accent/15 text-guild-accent'
													: 'text-guild-muted hover:text-foreground hover:bg-white/[0.04]',
											)}
										>
											<span className='relative shrink-0'>
												<item.icon size={16} />
												{item.badge === 'live' && (
													<span className='absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5'>
														<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75' />
														<span className='relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500' />
													</span>
												)}
												{item.label === 'Leaks' && hasNewLeaks && (
													<span className='absolute -top-0.5 -right-0.5 flex h-1.5 w-1.5'>
														<span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75' />
														<span className='relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500' />
													</span>
												)}
											</span>
											<span className='ml-3 text-[13px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap'>
												{item.label}
											</span>
										</Link>
									);
								})}
							</div>
						</div>
					);
				})}
			</nav>

			{/* Footer */}
			<div className='px-4 py-3 border-t border-guild-border/30'>
				<div className='text-[10px] text-guild-dim/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap'>
					Not affiliated with HoYoverse
				</div>
			</div>
		</aside>
	);
}
