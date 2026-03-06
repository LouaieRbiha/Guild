import { ELEMENT_COLORS } from '@/lib/constants';

export type ElementColors = (typeof ELEMENT_COLORS)['Pyro'];

// Simpler version: highlight ALL numbers in text
export function HighlightNumbers({ text, color }: { text: string; color: string }) {
	if (!text) return null;
	const parts = text.split(/([\d]+\.?[\d]*%?)/g);
	return (
		<>
			{parts.map((part, i) => {
				if (/^\d/.test(part)) {
					return (
						<span key={i} className={`font-bold ${color}`}>
							{part}
						</span>
					);
				}
				return <span key={i}>{part}</span>;
			})}
		</>
	);
}

// Constellation damage impact estimates
export function estimateConstellationImpact(
	description: string,
	index: number,
): { label: string; color: string; detail: string } {
	const desc = description.toLowerCase();

	// C3/C5 are always talent level increases
	if (desc.includes('increases the level of') && (index === 3 || index === 5)) {
		return {
			label: '~15-20% DPS',
			color: 'text-blue-400',
			detail: '+3 talent levels = 15-20% more talent scaling damage',
		};
	}

	// Look for DEF ignore/shred
	if (desc.includes('ignore') && desc.includes('def')) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 0;
		return {
			label: `~${Math.round(val * 0.7)}-${val}% DPS`,
			color: 'text-red-400',
			detail: `${val}% DEF ignore is a massive DPS multiplier (one of the strongest constellation effects)`,
		};
	}
	if (desc.includes('def') && desc.includes('decrease')) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 0;
		return {
			label: `~${Math.round(val * 0.5)}-${Math.round(val * 0.7)}% DPS`,
			color: 'text-orange-400',
			detail: `${val}% DEF shred is a strong DPS multiplier`,
		};
	}
	// Look for res shred
	if (
		(desc.includes('res') && desc.includes('decrease')) ||
		desc.includes('res is reduced')
	) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 0;
		return {
			label: `~${Math.round(val * 0.4)}-${Math.round(val * 0.6)}% DPS`,
			color: 'text-orange-400',
			detail: `${val}% RES shred translates to significant damage increase`,
		};
	}

	// Look for damage multipliers
	if (desc.includes('crit rate') && desc.includes('100%')) {
		return {
			label: 'MASSIVE',
			color: 'text-red-400',
			detail:
				'100% CRIT Rate = guaranteed crits, effectively doubling DPS in many scenarios',
		};
	}
	if (desc.includes('crit rate') || desc.includes('crit dmg')) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 12;
		return {
			label: `~${Math.round(val * 0.8)}-${val}% DPS`,
			color: 'text-yellow-400',
			detail: `${val}% CRIT stat bonus translates to roughly ${Math.round(val * 0.8)}-${val}% more DPS`,
		};
	}
	if (desc.includes('dmg') && desc.includes('%')) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 0;
		if (val >= 50)
			return {
				label: 'HIGH',
				color: 'text-orange-400',
				detail: `${val}% DMG increase is a massive power spike`,
			};
		if (val >= 20)
			return {
				label: 'MODERATE',
				color: 'text-yellow-400',
				detail: `${val}% additional DMG is a solid increase`,
			};
		return {
			label: 'LOW-MED',
			color: 'text-green-400',
			detail: `${val}% DMG adds incremental value`,
		};
	}
	if (desc.includes('stamina') && desc.includes('not consume')) {
		return {
			label: 'QoL',
			color: 'text-teal-400',
			detail: 'Quality-of-life: more sustained DPS through stamina savings',
		};
	}
	if (desc.includes('atk') && desc.includes('%')) {
		const match = description.match(/(\d+)%/);
		const val = match ? parseInt(match[1]) : 0;
		return {
			label: `~${Math.round(val * 0.6)}-${val}% DPS`,
			color: 'text-yellow-400',
			detail: `${val}% ATK bonus (diminishing returns depend on existing ATK%)`,
		};
	}
	if (desc.includes('additional') || desc.includes('extra')) {
		return {
			label: 'MODERATE',
			color: 'text-yellow-400',
			detail: 'Adds extra instances of damage or effects',
		};
	}
	if (desc.includes('resistance') || desc.includes('res')) {
		return {
			label: 'DEFENSIVE',
			color: 'text-cyan-400',
			detail: 'Survivability increase rather than direct DPS gain',
		};
	}
	if (
		desc.includes('heal') ||
		(desc.includes('hp') && desc.includes('regenerat'))
	) {
		return {
			label: 'SUSTAIN',
			color: 'text-green-400',
			detail: 'Healing/sustain improvement for survivability',
		};
	}
	if (
		desc.includes('duration') ||
		desc.includes('cd') ||
		desc.includes('cooldown')
	) {
		return {
			label: 'UPTIME',
			color: 'text-blue-400',
			detail: 'Better skill uptime = more consistent DPS',
		};
	}

	return {
		label: 'UTILITY',
		color: 'text-guild-muted',
		detail: 'Utility or situational benefit',
	};
}

export const TALENT_PRIORITY: Record<string, string> = {
	'Normal Attack': 'Auto',
	'Elemental Skill': 'Skill',
	'Elemental Burst': 'Burst',
};

export const TALENT_COLORS: Record<string, string> = {
	'Normal Attack': 'border-gray-500',
	'Elemental Skill': 'border-blue-500',
	'Elemental Burst': 'border-purple-500',
};

export const TALENT_BADGE_STYLES: Record<string, string> = {
	'Normal Attack': 'bg-gray-500/20 text-guild-muted border-gray-500/30',
	'Elemental Skill': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
	'Elemental Burst': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

// Element-colored glow for constellation icons
export const ELEMENT_GLOW_SHADOW: Record<string, string> = {
	Pyro: '0 0 12px rgba(239, 68, 68, 0.5)',
	Hydro: '0 0 12px rgba(59, 130, 246, 0.5)',
	Anemo: '0 0 12px rgba(94, 234, 212, 0.5)',
	Cryo: '0 0 12px rgba(103, 232, 249, 0.5)',
	Electro: '0 0 12px rgba(168, 85, 247, 0.5)',
	Geo: '0 0 12px rgba(250, 204, 21, 0.5)',
	Dendro: '0 0 12px rgba(74, 222, 128, 0.5)',
};
