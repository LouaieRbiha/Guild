export type WeaponSource = 'Wish' | 'BP' | 'Craft' | 'Shop' | 'F2P' | 'Event' | 'Fish';

export interface CharacterGuide {
	characterName: string;
	role: string;
	bestWeapons: { name: string; weaponId: number; note: string; source?: WeaponSource }[];
	bestArtifacts: { setName: string; pieces: number; note: string }[];
	mainStats: { sands: string; goblet: string; circlet: string };
	substats: string[];
	erRequirement?: string;
	teams: { name: string; members: string[]; archetype: string; note?: string }[];
	talentPriority: string;
	tips: string[];
	playstyle: string;
}

export const CHARACTER_GUIDES: Record<string, CharacterGuide> = {
	'Raiden Shogun': {
		characterName: 'Raiden Shogun',
		role: 'Main DPS / Sub-DPS',
		bestWeapons: [
			{ name: 'Engulfing Lightning', weaponId: 13509, note: 'Best in Slot', source: 'Wish' },
			{ name: 'The Catch', weaponId: 13415, note: 'F2P Best -- free from fishing', source: 'Fish' },
			{ name: 'Staff of Homa', weaponId: 13501, note: 'Great stat stick', source: 'Wish' },
		],
		bestArtifacts: [
			{ setName: 'Emblem of Severed Fate', pieces: 4, note: 'Best set overall' },
		],
		mainStats: { sands: 'Energy Recharge / ATK%', goblet: 'Electro DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'ATK%', 'Energy Recharge'],
		erRequirement: '200-250% ER for comfortable Burst uptime',
		teams: [
			{
				name: 'Raiden National',
				members: ['Raiden Shogun', 'Xiangling', 'Bennett', 'Xingqiu'],
				archetype: 'Overloaded/Vaporize',
			},
			{
				name: 'Raiden Hypercarry',
				members: ['Raiden Shogun', 'Kujou Sara', 'Kaedehara Kazuha', 'Bennett'],
				archetype: 'Electro Hypercarry',
			},
		],
		talentPriority: 'Burst > Skill > Normal',
		tips: [
			'Stack Energy Recharge for higher burst damage via her A4 passive',
			'Use Skill before swapping to supports for coordinated attacks',
			'Burst duration is a long field time -- plan rotations accordingly',
		],
		playstyle:
			'Main DPS during Burst, off-field Sub-DPS with Skill. Build Energy Recharge and Crit.',
	},
	Neuvillette: {
		characterName: 'Neuvillette',
		role: 'On-Field DPS',
		bestWeapons: [
			{
				name: 'Tome of the Eternal Flow',
				weaponId: 14512,
				note: 'Best in Slot',
				source: 'Wish',
			},
			{
				name: 'Cashflow Supervision',
				weaponId: 14514,
				note: 'Excellent alternative',
				source: 'Wish',
			},
			{
				name: 'Prototype Amber',
				weaponId: 14401,
				note: 'F2P option -- provides healing',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{
				setName: 'Marechaussee Hunter',
				pieces: 4,
				note: 'Best with HP drain teams',
			},
			{ setName: 'Heart of Depth', pieces: 4, note: 'Solid alternative' },
		],
		mainStats: { sands: 'HP%', goblet: 'Hydro DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'HP%', 'ATK%'],
		teams: [
			{
				name: 'Neuvi Furina',
				members: ['Neuvillette', 'Furina', 'Kaedehara Kazuha', 'Zhongli'],
				archetype: 'Hydro Hypercarry',
			},
		],
		talentPriority: 'Normal > Skill > Burst',
		tips: [
			'Charged Attack (hold) is your main damage source',
			'Collect Sourcewater Droplets to heal and buff Charged Attack',
			'Pair with Furina for constant HP changes that trigger passives',
		],
		playstyle:
			'Charged Attack focused Hydro DPS. Hold Normal Attack to fire devastating beams.',
	},
	'Hu Tao': {
		characterName: 'Hu Tao',
		role: 'Main DPS',
		bestWeapons: [
			{ name: 'Staff of Homa', weaponId: 13501, note: 'Best in Slot', source: 'Wish' },
			{ name: "Dragon's Bane", weaponId: 13401, note: 'F2P Best for Vaporize', source: 'Wish' },
			{ name: 'Deathmatch', weaponId: 13404, note: 'Battle Pass option', source: 'BP' },
		],
		bestArtifacts: [
			{
				setName: 'Crimson Witch of Flames',
				pieces: 4,
				note: 'Best for Vaporize',
			},
			{
				setName: "Shimenawa's Reminiscence",
				pieces: 4,
				note: 'Higher CA damage but lose Burst',
			},
		],
		mainStats: { sands: 'HP%', goblet: 'Pyro DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'HP%', 'Elemental Mastery'],
		erRequirement: 'Not needed -- does not rely on Burst',
		teams: [
			{
				name: 'Hu Tao Double Hydro',
				members: ['Hu Tao', 'Xingqiu', 'Yelan', 'Zhongli'],
				archetype: 'Vaporize',
			},
			{
				name: 'Hu Tao VV Vape',
				members: ['Hu Tao', 'Xingqiu', 'Sucrose', 'Amber'],
				archetype: 'Vaporize',
			},
		],
		talentPriority: 'Normal > Skill > Burst',
		tips: [
			'Stay below 50% HP for 33% Pyro DMG bonus from passive',
			'Jump cancel / dash cancel charged attacks for faster combos',
			'Use Burst for healing when low (it heals based on enemies hit)',
		],
		playstyle:
			'Melee Pyro DPS who trades HP for damage. Strong Vaporize reactions with Hydro supports.',
	},
	Bennett: {
		characterName: 'Bennett',
		role: 'Support / Healer',
		bestWeapons: [
			{
				name: 'Mistsplitter Reforged',
				weaponId: 11509,
				note: 'Highest Base ATK 5-star',
				source: 'Wish',
			},
			{
				name: 'Aquila Favonia',
				weaponId: 11501,
				note: 'Highest Base ATK standard',
				source: 'Wish',
			},
			{
				name: 'Prototype Rancour',
				weaponId: 11406,
				note: 'Highest Base ATK 4-star (F2P)',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{ setName: 'Noblesse Oblige', pieces: 4, note: 'Team ATK buff on Burst' },
		],
		mainStats: { sands: 'Energy Recharge', goblet: 'Pyro DMG% / HP%', circlet: 'CRIT Rate / Healing Bonus' },
		substats: ['Energy Recharge', 'HP%', 'CRIT'],
		erRequirement: '180-200% ER for Burst uptime',
		teams: [
			{
				name: 'National Team',
				members: ['Xiangling', 'Bennett', 'Xingqiu', 'Sucrose'],
				archetype: 'Vaporize',
			},
		],
		talentPriority: 'Burst > Skill > Normal',
		tips: [
			"DO NOT activate C6 unless you know what you're doing (adds Pyro infusion)",
			'Burst ATK buff scales with BASE ATK only -- use high base ATK weapons',
			'Burst also heals -- no need for HP/healing artifacts',
		],
		playstyle:
			'The best support in the game. ATK buff + heal + Pyro application in one Burst.',
	},
	Xiangling: {
		characterName: 'Xiangling',
		role: 'Off-Field DPS',
		bestWeapons: [
			{ name: 'Staff of Homa', weaponId: 13501, note: 'Best in Slot', source: 'Wish' },
			{
				name: 'The Catch',
				weaponId: 13415,
				note: 'F2P Best -- free from fishing',
				source: 'Fish',
			},
			{ name: "Dragon's Bane", weaponId: 13401, note: 'Great for Vaporize', source: 'Wish' },
		],
		bestArtifacts: [
			{
				setName: 'Emblem of Severed Fate',
				pieces: 4,
				note: 'Best set for burst damage',
			},
		],
		mainStats: { sands: 'Energy Recharge / ATK%', goblet: 'Pyro DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'ATK%', 'Energy Recharge', 'Elemental Mastery'],
		erRequirement: '180-200% without Bennett, 160% with',
		teams: [
			{
				name: 'National Team',
				members: ['Xiangling', 'Bennett', 'Xingqiu', 'Sucrose'],
				archetype: 'Vaporize',
			},
		],
		talentPriority: 'Burst > Skill > Normal',
		tips: [
			'Guoba (Skill) snapshots ATK -- use after Bennett Burst',
			'Pyronado (Burst) lasts 14s and snapshots buffs',
			'Always funnel Energy Recharge through Bennett Skill particles',
		],
		playstyle:
			'Off-field Pyro Sub-DPS. Deploy Guoba and Pyronado, then swap to trigger reactions.',
	},
	Furina: {
		characterName: 'Furina',
		role: 'Off-Field Support / Sub-DPS',
		bestWeapons: [
			{
				name: 'Splendor of Tranquil Waters',
				weaponId: 11513,
				note: 'Best in Slot',
				source: 'Wish',
			},
			{ name: 'Festering Desire', weaponId: 11413, note: 'Good ER option', source: 'Event' },
			{ name: 'Favonius Sword', weaponId: 11401, note: 'F2P energy battery', source: 'Wish' },
		],
		bestArtifacts: [
			{
				setName: 'Golden Troupe',
				pieces: 4,
				note: 'Best for off-field damage',
			},
		],
		mainStats: { sands: 'HP%', goblet: 'HP%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'HP%', 'Energy Recharge'],
		erRequirement: '140-160% ER',
		teams: [
			{
				name: 'Neuvi Furina',
				members: ['Neuvillette', 'Furina', 'Kaedehara Kazuha', 'Zhongli'],
				archetype: 'Hydro Hypercarry',
			},
			{
				name: 'Furina Hyperbloom',
				members: ['Furina', 'Nahida', 'Kuki Shinobu', 'Baizhu'],
				archetype: 'Hyperbloom',
			},
		],
		talentPriority: 'Skill > Burst > Normal',
		tips: [
			'Her Burst provides a massive DMG% buff based on Fanfare stacks',
			'Pair with healers to maximize Fanfare stack generation',
			'Salon Members deal damage based on Max HP -- build HP%',
		],
		playstyle:
			'Off-field Hydro support. Summons Salon Members that drain/heal party HP for massive team DMG buff.',
	},
	'Kaedehara Kazuha': {
		characterName: 'Kaedehara Kazuha',
		role: 'Support / Sub-DPS',
		bestWeapons: [
			{
				name: 'Freedom-Sworn',
				weaponId: 11505,
				note: 'Best in Slot for support',
				source: 'Wish',
			},
			{
				name: 'Iron Sting',
				weaponId: 11407,
				note: 'F2P Best -- craftable EM weapon',
				source: 'Craft',
			},
			{
				name: 'Favonius Sword',
				weaponId: 11401,
				note: 'Energy battery option',
				source: 'Wish',
			},
		],
		bestArtifacts: [
			{
				setName: 'Viridescent Venerer',
				pieces: 4,
				note: 'Must-have for RES shred',
			},
		],
		mainStats: { sands: 'Elemental Mastery', goblet: 'Elemental Mastery', circlet: 'Elemental Mastery' },
		substats: ['Elemental Mastery', 'Energy Recharge', 'CRIT'],
		erRequirement: '160-180% ER',
		teams: [
			{
				name: 'Raiden Hypercarry',
				members: ['Raiden Shogun', 'Kujou Sara', 'Kaedehara Kazuha', 'Bennett'],
				archetype: 'Electro Hypercarry',
			},
			{
				name: 'International',
				members: ['Tartaglia', 'Xiangling', 'Kaedehara Kazuha', 'Bennett'],
				archetype: 'Vaporize',
			},
		],
		talentPriority: 'Skill > Burst > Normal',
		tips: [
			'Stack Elemental Mastery for his A4 passive elemental DMG buff',
			'Swirl the element you want to buff before using Burst',
			'Double-tap Skill in midair for plunge attack combos',
		],
		playstyle:
			'Premium Anemo support. Provides elemental DMG buff, VV shred, and crowd control.',
	},
	Mavuika: {
		characterName: 'Mavuika',
		role: 'Main DPS',
		bestWeapons: [
			{
				name: 'A Thousand Blazing Suns',
				weaponId: 12512,
				note: 'Best in Slot',
				source: 'Wish',
			},
			{ name: 'Verdict', weaponId: 12510, note: 'Strong alternative', source: 'Wish' },
			{ name: 'Serpent Spine', weaponId: 12410, note: 'Battle Pass option', source: 'BP' },
		],
		bestArtifacts: [
			{
				setName: 'Obsidian Codex',
				pieces: 4,
				note: 'Best set for Nightsoul builds',
			},
		],
		mainStats: { sands: 'ATK%', goblet: 'Pyro DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'ATK%', 'Energy Recharge'],
		teams: [
			{
				name: 'Mavuika Vaporize',
				members: ['Mavuika', 'Xilonen', 'Furina', 'Bennett'],
				archetype: 'Vaporize',
			},
			{
				name: 'Mono Pyro',
				members: ['Mavuika', 'Xilonen', 'Bennett', 'Dehya'],
				archetype: 'Mono Pyro',
			},
		],
		talentPriority: 'Burst > Skill > Normal',
		tips: [
			'Build Fighting Spirit gauge before unleashing Burst for maximum damage',
			'Nightsoul state enables powerful motorcycle attacks',
			'Pair with Nightsoul characters for faster gauge building',
		],
		playstyle:
			'Pyro DPS who builds Fighting Spirit for devastating Burst. Transforms with Nightsoul mechanics.',
	},
	Nahida: {
		characterName: 'Nahida',
		role: 'Off-Field Sub-DPS',
		bestWeapons: [
			{
				name: 'A Thousand Floating Dreams',
				weaponId: 14509,
				note: 'Best in Slot',
				source: 'Wish',
			},
			{
				name: 'Sacrificial Fragments',
				weaponId: 14402,
				note: 'Good EM stat stick with utility',
				source: 'Wish',
			},
			{ name: 'Mappa Mare', weaponId: 14407, note: 'F2P craftable option', source: 'Craft' },
		],
		bestArtifacts: [
			{
				setName: 'Deepwood Memories',
				pieces: 4,
				note: 'Best if no other Deepwood holder',
			},
			{
				setName: 'Gilded Dreams',
				pieces: 4,
				note: 'Best if another character holds Deepwood',
			},
		],
		mainStats: { sands: 'Elemental Mastery', goblet: 'Elemental Mastery / Dendro DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'Elemental Mastery', 'ATK%'],
		erRequirement: 'Not needed in most teams',
		teams: [
			{
				name: 'Nahida Nilou Bloom',
				members: ['Nahida', 'Nilou', 'Sangonomiya Kokomi', 'Yelan'],
				archetype: 'Bloom',
			},
			{
				name: 'Nahida Quicken',
				members: ['Nahida', 'Raiden Shogun', 'Kamisato Ayaka', 'Zhongli'],
				archetype: 'Quicken',
			},
		],
		talentPriority: 'Skill > Burst > Normal',
		tips: [
			'Off-field Dendro application is her main role',
			'Tri-Karma Purification deals great damage based on EM',
			'Build full EM for reaction-focused teams',
		],
		playstyle:
			'Off-field Dendro Sub-DPS and reaction enabler. Marks enemies with Skill for continuous Dendro damage.',
	},
	Zhongli: {
		characterName: 'Zhongli',
		role: 'Shielder / Support',
		bestWeapons: [
			{
				name: 'Staff of Homa',
				weaponId: 13501,
				note: 'Best in Slot for hybrid builds',
				source: 'Wish',
			},
			{
				name: 'Favonius Lance',
				weaponId: 13407,
				note: 'Energy battery support',
				source: 'Wish',
			},
			{
				name: 'Black Tassel',
				weaponId: 13301,
				note: 'F2P Best -- HP% for shields',
				source: 'F2P',
			},
		],
		bestArtifacts: [
			{
				setName: 'Tenacity of the Millelith',
				pieces: 4,
				note: 'Best support set -- ATK buff on Skill',
			},
		],
		mainStats: { sands: 'HP%', goblet: 'HP%', circlet: 'HP%' },
		substats: ['HP%', 'Energy Recharge', 'CRIT'],
		erRequirement: 'Not needed for shield builds',
		teams: [
			{
				name: 'Hu Tao Double Hydro',
				members: ['Hu Tao', 'Xingqiu', 'Yelan', 'Zhongli'],
				archetype: 'Vaporize',
			},
		],
		talentPriority: 'Skill > Burst > Normal',
		tips: [
			'Hold Skill for the strongest shield in the game',
			'Shield shreds ALL elemental and physical RES by 20%',
			'Burst petrifies enemies for crowd control',
		],
		playstyle:
			'Premiere shielder and all-round support. Nearly unbreakable shield + universal RES shred.',
	},
	Yelan: {
		characterName: 'Yelan',
		role: 'Off-Field Sub-DPS',
		bestWeapons: [
			{ name: 'Aqua Simulacra', weaponId: 15503, note: 'Best in Slot', source: 'Wish' },
			{
				name: 'Favonius Warbow',
				weaponId: 15401,
				note: 'Energy battery option',
				source: 'Wish',
			},
			{ name: 'Recurve Bow', weaponId: 15301, note: 'Budget HP% option', source: 'F2P' },
		],
		bestArtifacts: [
			{
				setName: 'Emblem of Severed Fate',
				pieces: 4,
				note: 'Best set for burst damage',
			},
		],
		mainStats: { sands: 'HP%', goblet: 'Hydro DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'HP%', 'Energy Recharge'],
		erRequirement: '140-160% with Sac Bow, 180% without',
		teams: [
			{
				name: 'Hu Tao Double Hydro',
				members: ['Hu Tao', 'Xingqiu', 'Yelan', 'Zhongli'],
				archetype: 'Vaporize',
			},
			{
				name: 'Rational Yelan',
				members: ['Raiden Shogun', 'Yelan', 'Xiangling', 'Bennett'],
				archetype: 'Overloaded/Vaporize',
			},
		],
		talentPriority: 'Burst > Skill > Normal',
		tips: [
			'Off-field Hydro application like Xingqiu but scales on HP',
			'Ramping DMG bonus from A4 passive benefits the whole team',
			'Great battery with C1 -- extra charge of Skill',
		],
		playstyle:
			'Off-field Hydro Sub-DPS with ramping team DMG bonus. HP scaling alternative to Xingqiu.',
	},
	'Kamisato Ayaka': {
		characterName: 'Kamisato Ayaka',
		role: 'Burst DPS',
		bestWeapons: [
			{ name: 'Mistsplitter Reforged', weaponId: 11509, note: 'Best in Slot', source: 'Wish' },
			{
				name: 'Amenoma Kageuchi',
				weaponId: 11414,
				note: 'F2P Best -- craftable with energy refund',
				source: 'Craft',
			},
			{ name: 'The Black Sword', weaponId: 11408, note: 'Battle Pass option', source: 'BP' },
		],
		bestArtifacts: [
			{
				setName: 'Blizzard Strayer',
				pieces: 4,
				note: 'Best set -- massive Crit Rate in freeze',
			},
		],
		mainStats: { sands: 'ATK%', goblet: 'Cryo DMG%', circlet: 'CRIT DMG' },
		substats: ['CRIT DMG', 'ATK%', 'Energy Recharge'],
		erRequirement: '120-140% ER',
		teams: [
			{
				name: 'Ayaka Freeze',
				members: [
					'Kamisato Ayaka',
					'Shenhe',
					'Kaedehara Kazuha',
					'Sangonomiya Kokomi',
				],
				archetype: 'Freeze',
			},
			{
				name: 'Ayaka Mono Cryo',
				members: ['Kamisato Ayaka', 'Ganyu', 'Kaedehara Kazuha', 'Diona'],
				archetype: 'Mono Cryo',
			},
		],
		talentPriority: 'Burst > Normal > Skill',
		tips: [
			'Dash gives Cryo infusion for 5s -- weave Normal Attacks after dashing',
			'Burst does massive AoE damage when enemies are frozen in place',
			'Pair with Hydro + Anemo for freeze comps',
		],
		playstyle:
			'Cryo burst DPS. Sprint through enemies and unleash devastating Burst on frozen targets.',
	},
	Ganyu: {
		characterName: 'Ganyu',
		role: 'Main DPS / Sub-DPS',
		bestWeapons: [
			{
				name: "Amos' Bow",
				weaponId: 15502,
				note: 'Best in Slot for charged shots',
				source: 'Wish',
			},
			{
				name: 'Prototype Crescent',
				weaponId: 15405,
				note: 'F2P Best -- craftable',
				source: 'Craft',
			},
			{
				name: 'Hamayumi',
				weaponId: 15410,
				note: 'F2P alternative from Inazuma',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{ setName: 'Blizzard Strayer', pieces: 4, note: 'Best for Freeze teams' },
			{ setName: "Wanderer's Troupe", pieces: 4, note: 'Best for Melt teams' },
		],
		mainStats: { sands: 'ATK%', goblet: 'Cryo DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'ATK%', 'Elemental Mastery'],
		teams: [
			{
				name: 'Ganyu Melt',
				members: ['Ganyu', 'Xiangling', 'Bennett', 'Zhongli'],
				archetype: 'Melt',
			},
			{
				name: 'Morgana',
				members: ['Ganyu', 'Mona', 'Venti', 'Diona'],
				archetype: 'Freeze',
			},
		],
		talentPriority: 'Normal > Burst > Skill',
		tips: [
			'Fully charged Frostflake Arrows are your main damage source',
			'Bloom damage hits in an AoE -- group enemies for maximum value',
			'Burst provides Cryo application + Cryo DMG bonus at C4',
		],
		playstyle:
			'Charged shot Cryo DPS. Deals massive AoE Cryo damage with Frostflake Arrows.',
	},
	Xingqiu: {
		characterName: 'Xingqiu',
		role: 'Off-Field Sub-DPS',
		bestWeapons: [
			{
				name: 'Sacrificial Sword',
				weaponId: 11402,
				note: 'Best in Slot -- Skill reset',
				source: 'Wish',
			},
			{
				name: 'Favonius Sword',
				weaponId: 11401,
				note: 'Energy battery alternative',
				source: 'Wish',
			},
			{
				name: 'Harbinger of Dawn',
				weaponId: 11302,
				note: 'Budget Crit option',
				source: 'F2P',
			},
		],
		bestArtifacts: [
			{
				setName: 'Emblem of Severed Fate',
				pieces: 4,
				note: 'Best set for burst damage',
			},
		],
		mainStats: { sands: 'ATK% / Energy Recharge', goblet: 'Hydro DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'ATK%', 'Energy Recharge'],
		erRequirement: '180-200% without Sac Sword, 140% with',
		teams: [
			{
				name: 'National Team',
				members: ['Xiangling', 'Bennett', 'Xingqiu', 'Sucrose'],
				archetype: 'Vaporize',
			},
		],
		talentPriority: 'Burst > Skill > Normal',
		tips: [
			'Rain Swords provide damage reduction + healing',
			'Best Hydro applicator for many teams -- triggers on Normal Attacks',
			'Get C6 for maximum damage and Hydro application',
		],
		playstyle:
			'Off-field Hydro Sub-DPS. Rain Swords apply Hydro on every Normal Attack.',
	},
	Alhaitham: {
		characterName: 'Alhaitham',
		role: 'On-Field DPS',
		bestWeapons: [
			{
				name: 'Light of Foliar Incision',
				weaponId: 11510,
				note: 'Best in Slot',
				source: 'Wish',
			},
			{
				name: 'Iron Sting',
				weaponId: 11407,
				note: 'F2P Best -- craftable EM weapon',
				source: 'Craft',
			},
			{
				name: 'Harbinger of Dawn',
				weaponId: 11302,
				note: 'Budget Crit option',
				source: 'F2P',
			},
		],
		bestArtifacts: [
			{
				setName: 'Gilded Dreams',
				pieces: 4,
				note: 'Best for Quicken/Spread teams',
			},
			{
				setName: 'Deepwood Memories',
				pieces: 4,
				note: 'Use if no other Deepwood holder',
			},
		],
		mainStats: { sands: 'Elemental Mastery / ATK%', goblet: 'Dendro DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'Elemental Mastery', 'ATK%'],
		teams: [
			{
				name: 'Alhaitham Quicken',
				members: ['Alhaitham', 'Nahida', 'Fischl', 'Zhongli'],
				archetype: 'Quicken/Spread',
			},
			{
				name: 'Alhaitham Hyperbloom',
				members: ['Alhaitham', 'Xingqiu', 'Kuki Shinobu', 'Nahida'],
				archetype: 'Hyperbloom',
			},
		],
		talentPriority: 'Skill > Normal > Burst',
		tips: [
			'Stacking Chisel-Light mirrors increases Normal and Charged Attack damage',
			'Spread reactions are huge with EM investment',
			'Pair with Electro for Quicken/Aggravate synergy',
		],
		playstyle:
			'On-field Dendro DPS using Chisel-Light mirrors for powerful Spread reactions.',
	},
	Clorinde: {
		characterName: 'Clorinde',
		role: 'On-Field DPS',
		bestWeapons: [
			{ name: 'Absolution', weaponId: 11514, note: 'Best in Slot', source: 'Wish' },
			{ name: 'The Black Sword', weaponId: 11408, note: 'Battle Pass option', source: 'BP' },
			{
				name: 'Finale of the Deep',
				weaponId: 11412,
				note: 'Craftable alternative',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{
				setName: 'Fragment of Harmonic Whimsy',
				pieces: 4,
				note: 'Best set for Bond of Life builds',
			},
		],
		mainStats: { sands: 'ATK%', goblet: 'Electro DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'ATK%', 'Elemental Mastery'],
		teams: [
			{
				name: 'Clorinde Overloaded',
				members: ['Clorinde', 'Fischl', 'Xiangling', 'Bennett'],
				archetype: 'Overloaded',
			},
			{
				name: 'Clorinde Quicken',
				members: ['Clorinde', 'Nahida', 'Fischl', 'Zhongli'],
				archetype: 'Quicken/Aggravate',
			},
		],
		talentPriority: 'Normal > Skill > Burst',
		tips: [
			'Bond of Life mechanic powers her damage -- maintain it for max DPS',
			'Alternate between Skill and Normal Attack for best damage output',
			'Overloaded and Aggravate both work well as reaction strategies',
		],
		playstyle:
			'On-field Electro DPS who uses Bond of Life for devastating pistol attacks.',
	},
	Xilonen: {
		characterName: 'Xilonen',
		role: 'Support',
		bestWeapons: [
			{ name: 'Peak Patrol Song', weaponId: 11515, note: 'Best in Slot', source: 'Wish' },
			{
				name: 'Favonius Sword',
				weaponId: 11401,
				note: 'Energy battery option',
				source: 'Wish',
			},
			{ name: 'Festering Desire', weaponId: 11413, note: 'Good ER stat stick', source: 'Event' },
		],
		bestArtifacts: [
			{
				setName: 'Scroll of the Hero of Cinder City',
				pieces: 4,
				note: 'Best support set for RES shred',
			},
		],
		mainStats: { sands: 'DEF%', goblet: 'DEF%', circlet: 'DEF%' },
		substats: ['DEF%', 'Energy Recharge', 'CRIT'],
		erRequirement: '140-160% ER',
		teams: [
			{
				name: 'Mavuika Xilonen',
				members: ['Mavuika', 'Xilonen', 'Furina', 'Bennett'],
				archetype: 'Vaporize',
			},
			{
				name: 'Xilonen Hyperbloom',
				members: ['Alhaitham', 'Xilonen', 'Xingqiu', 'Nahida'],
				archetype: 'Hyperbloom',
			},
		],
		talentPriority: 'Skill > Burst > Normal',
		tips: [
			'Nightsoul state provides universal elemental RES shred',
			'Works like a Viridescent Venerer alternative for non-Anemo teams',
			'Pair with Nightsoul characters for extra synergy',
		],
		playstyle:
			'Nightsoul support who shreds elemental RES and buffs the team while rollerblading through enemies.',
	},
	Sucrose: {
		characterName: 'Sucrose',
		role: 'Support / Sub-DPS',
		bestWeapons: [
			{
				name: 'Sacrificial Fragments',
				weaponId: 14402,
				note: 'Best in Slot -- EM + Skill reset',
				source: 'Wish',
			},
			{
				name: 'Thrilling Tales of Dragon Slayers',
				weaponId: 14302,
				note: '48% ATK buff to next character',
				source: 'F2P',
			},
			{
				name: 'Hakushin Ring',
				weaponId: 14414,
				note: 'Craftable option for reaction teams',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{
				setName: 'Viridescent Venerer',
				pieces: 4,
				note: 'Must-have for RES shred',
			},
		],
		mainStats: { sands: 'Elemental Mastery', goblet: 'Elemental Mastery', circlet: 'Elemental Mastery' },
		substats: ['Elemental Mastery', 'Energy Recharge', 'CRIT'],
		erRequirement: '160% ER',
		teams: [
			{
				name: 'National Team',
				members: ['Xiangling', 'Bennett', 'Xingqiu', 'Sucrose'],
				archetype: 'Vaporize',
			},
			{
				name: 'Taser',
				members: ['Sucrose', 'Fischl', 'Beidou', 'Xingqiu'],
				archetype: 'Electro-Charged',
			},
		],
		talentPriority: 'Skill > Burst > Normal',
		tips: [
			'Shares EM with team via A1 and A4 passives',
			'VV shred is the main reason to use any Anemo support',
			'TTDS provides 48% ATK buff to the next character swapped in',
		],
		playstyle:
			'EM-sharing Anemo support. Budget Kazuha with more EM transfer to the team.',
	},
	Fischl: {
		characterName: 'Fischl',
		role: 'Off-Field Sub-DPS',
		bestWeapons: [
			{ name: 'Polar Star', weaponId: 15507, note: 'Best in Slot for damage', source: 'Wish' },
			{
				name: 'The Stringless',
				weaponId: 15402,
				note: 'Great for Skill/Burst damage',
				source: 'Wish',
			},
			{ name: 'Slingshot', weaponId: 15304, note: 'Budget Crit Rate option', source: 'F2P' },
		],
		bestArtifacts: [
			{
				setName: 'Golden Troupe',
				pieces: 4,
				note: 'Best for off-field Oz damage',
			},
			{
				setName: 'Thundering Fury',
				pieces: 4,
				note: 'Alternative for reaction teams',
			},
		],
		mainStats: { sands: 'ATK%', goblet: 'Electro DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'ATK%', 'Elemental Mastery'],
		teams: [
			{
				name: 'Taser',
				members: ['Sucrose', 'Fischl', 'Beidou', 'Xingqiu'],
				archetype: 'Electro-Charged',
			},
			{
				name: 'Aggravate',
				members: ['Alhaitham', 'Nahida', 'Fischl', 'Zhongli'],
				archetype: 'Quicken/Aggravate',
			},
		],
		talentPriority: 'Skill > Burst > Normal',
		tips: [
			'Oz deals continuous Electro damage while off-field',
			'A4 passive triggers extra hits when reactions occur near Oz',
			'Burst resummons Oz at full duration -- use it to refresh',
		],
		playstyle:
			'Off-field Electro Sub-DPS. Oz does the work while Fischl is off-field.',
	},
	Citlali: {
		characterName: 'Citlali',
		role: 'Off-Field Support / Sub-DPS',
		bestWeapons: [
			{ name: 'Cashflow Supervision', weaponId: 14514, note: 'Best in Slot', source: 'Wish' },
			{
				name: 'Sacrificial Fragments',
				weaponId: 14402,
				note: 'Good EM + Skill reset',
				source: 'Wish',
			},
			{
				name: 'Prototype Amber',
				weaponId: 14401,
				note: 'F2P option -- provides healing',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{
				setName: 'Blizzard Strayer',
				pieces: 4,
				note: 'Best for Cryo damage and freeze teams',
			},
		],
		mainStats: { sands: 'Elemental Mastery / ATK%', goblet: 'Cryo DMG%', circlet: 'CRIT Rate / CRIT DMG' },
		substats: ['CRIT', 'Elemental Mastery', 'ATK%'],
		teams: [
			{
				name: 'Citlali Melt',
				members: ['Citlali', 'Xiangling', 'Bennett', 'Kaedehara Kazuha'],
				archetype: 'Melt',
			},
			{
				name: 'Citlali Freeze',
				members: ['Citlali', 'Neuvillette', 'Furina', 'Kaedehara Kazuha'],
				archetype: 'Freeze',
			},
		],
		talentPriority: 'Skill > Burst > Normal',
		tips: [
			'Off-field Cryo application with strong shields',
			'Nightsoul state enhances abilities for more damage',
			'Pairs well with Pyro for Melt reactions',
		],
		playstyle:
			'Off-field Cryo support with shields and powerful Cryo application.',
	},
};
