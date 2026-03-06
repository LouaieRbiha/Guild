'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const STORAGE_KEY = 'guild-analytics';

interface PageViewEntry {
	path: string;
	count: number;
	lastVisit: number;
}

function trackPageView(path: string) {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		const data: Record<string, PageViewEntry> = stored ? JSON.parse(stored) : {};
		if (!data[path]) {
			data[path] = { path, count: 0, lastVisit: 0 };
		}
		data[path].count += 1;
		data[path].lastVisit = Date.now();
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch {
		// localStorage unavailable
	}
}

export function Analytics() {
	const pathname = usePathname();

	useEffect(() => {
		trackPageView(pathname);
	}, [pathname]);

	return null;
}

export function getAnalytics(): PageViewEntry[] {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		const data: Record<string, PageViewEntry> = JSON.parse(stored);
		return Object.values(data).sort((a, b) => b.count - a.count);
	} catch {
		return [];
	}
}
