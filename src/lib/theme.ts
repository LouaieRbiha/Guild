'use client';

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'guild-theme';

function getStoredTheme(): Theme | null {
	if (typeof window === 'undefined') return null;
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === 'dark' || stored === 'light') return stored;
	} catch {
		// ignore storage errors
	}
	return null;
}

function getSystemTheme(): Theme {
	if (typeof window === 'undefined') return 'dark';
	return window.matchMedia('(prefers-color-scheme: light)').matches
		? 'light'
		: 'dark';
}

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.classList.remove('dark', 'light');
	root.classList.add(theme);
}

export function useTheme() {
	const [theme, setTheme] = useState<Theme>('dark');

	// Initialize theme from storage or system preference
	useEffect(() => {
		const stored = getStoredTheme();
		const initial = stored ?? getSystemTheme();
		setTheme(initial);
		applyTheme(initial);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => {
			const next: Theme = prev === 'dark' ? 'light' : 'dark';

			// Persist preference
			try {
				localStorage.setItem(STORAGE_KEY, next);
			} catch {
				// ignore storage errors
			}

			// Enable smooth transition, then apply theme
			document.documentElement.classList.add('theme-transition');
			applyTheme(next);

			// Remove transition class after animation completes
			setTimeout(() => {
				document.documentElement.classList.remove('theme-transition');
			}, 350);

			return next;
		});
	}, []);

	return { theme, toggleTheme } as const;
}
