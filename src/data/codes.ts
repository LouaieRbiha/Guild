export interface RedemptionCode {
	code: string;
	rewards: string[];
	source: string;
	addedAt: string; // ISO date
	expiresAt?: string; // ISO date, optional
}

import codesJson from "./json/codes.json";

export const ACTIVE_CODES: RedemptionCode[] = codesJson;

export function getActiveCodes(): RedemptionCode[] {
	const now = Date.now();
	return ACTIVE_CODES.filter((c) => {
		if (!c.expiresAt) return true;
		return new Date(c.expiresAt).getTime() > now;
	});
}
