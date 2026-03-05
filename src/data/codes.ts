export interface RedemptionCode {
	code: string;
	rewards: string[];
	source: string;
	addedAt: string; // ISO date
	expiresAt?: string; // ISO date, optional
}

export const ACTIVE_CODES: RedemptionCode[] = [
	{
		code: 'GENSHINGIFT',
		rewards: ['Primogems x50', "Hero's Wit x3"],
		source: 'Permanent',
		addedAt: '2020-09-28',
	},
];

export function getActiveCodes(): RedemptionCode[] {
	const now = Date.now();
	return ACTIVE_CODES.filter((c) => {
		if (!c.expiresAt) return true;
		return new Date(c.expiresAt).getTime() > now;
	});
}
