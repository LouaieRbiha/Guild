import { TALENT_BOOK_SCHEDULE } from '@/data/farming-schedule';

export function parseBannerDate(dateStr: string): Date {
	return new Date(dateStr);
}

export function getNextAbyssReset(): Date {
	const now = new Date();
	const y = now.getUTCFullYear();
	const m = now.getUTCMonth();
	const d = now.getUTCDate();
	const h = now.getUTCHours();

	// Spiral Abyss resets on the 1st and 16th of each month at 04:00 UTC
	if (d < 1 || (d === 1 && h < 4)) {
		return new Date(Date.UTC(y, m, 1, 4, 0, 0));
	}
	if (d < 16 || (d === 16 && h < 4)) {
		return new Date(Date.UTC(y, m, 16, 4, 0, 0));
	}
	return new Date(Date.UTC(y, m + 1, 1, 4, 0, 0));
}

/** Return talent book names available for a given day (0=Sun..6=Sat). */
export function getTodaysTalentBooks(): string[] {
	const dayNames = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	];
	const todayName = dayNames[new Date().getDay()];
	if (todayName === 'Sunday') return Object.keys(TALENT_BOOK_SCHEDULE);
	return Object.entries(TALENT_BOOK_SCHEDULE)
		.filter(([, days]) => days.includes(todayName))
		.map(([name]) => name);
}
