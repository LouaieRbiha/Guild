export type WeaponSource = 'Wish' | 'BP' | 'Craft' | 'Shop' | 'F2P' | 'Event' | 'Fish';

export interface CharacterGuide {
	characterName: string;
	role: string;
	tldr: string;
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
		tldr: "The Electro Archon who turns Energy Recharge into raw damage. Stack ER, press Q, watch everything evaporate.",
		bestWeapons: [
			{ name: 'Engulfing Lightning', weaponId: 13509, note: 'Her signature weapon and it shows -- made for her kit', source: 'Wish' },
			{ name: 'The Catch', weaponId: 13415, note: 'The GOAT F2P option, literally free from fishing. No excuses not to R5 this.', source: 'Fish' },
			{ name: 'Staff of Homa', weaponId: 13501, note: 'Stat stick extraordinaire -- works on everyone, Raiden included', source: 'Wish' },
		],
		bestArtifacts: [
			{ setName: 'Emblem of Severed Fate', pieces: 4, note: 'Tailor-made for her. Don\'t overthink it.' },
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
			'Her A4 passive turns Energy Recharge into damage. More ER = bigger numbers. It\'s literally free real estate.',
			'Always drop her Skill before switching -- it\'s basically free off-field damage that you\'d be throwing away otherwise.',
			'Her Burst hogs the field for a while, so plan your rotations around it. She\'s not a quick-swap character -- she\'s the main event.',
		],
		playstyle:
			'Drop Skill, rotate through your supports buffing everything up, then go Super Saiyan with her Burst. During the Burst window she\'s dealing absurd damage -- make every second count because the clock is ticking.',
	},
	Neuvillette: {
		characterName: 'Neuvillette',
		role: 'On-Field DPS',
		tldr: "Point and hold. That's it. That's the guide. The water dragon lawyer makes everything else look like a skill issue.",
		bestWeapons: [
			{
				name: 'Tome of the Eternal Flow',
				weaponId: 14512,
				note: 'His signature and it\'s disgusting. Built different for his kit.',
				source: 'Wish',
			},
			{
				name: 'Cashflow Supervision',
				weaponId: 14514,
				note: 'Almost as cracked -- you won\'t notice much difference in practice',
				source: 'Wish',
			},
			{
				name: 'Prototype Amber',
				weaponId: 14401,
				note: 'The budget pick that also heals your team. Neuvillette doesn\'t care, he\'ll still delete everything.',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{
				setName: 'Marechaussee Hunter',
				pieces: 4,
				note: 'Absolutely nuts with Furina constantly draining HP. Free crit = happy dragon.',
			},
			{ setName: 'Heart of Depth', pieces: 4, note: 'Solid backup if you can\'t get good Marechaussee pieces' },
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
			'Hold Normal Attack and spin to win. His Charged Attack beam is the entire character -- everything else is a bonus.',
			'Sourcewater Droplets heal him AND supercharge his beam. Pick them up like your life depends on it (because your DPS does).',
			'Furina is his best friend in the entire game. Her HP drain triggers Marechaussee Hunter for free crit while stacking Fanfare. It\'s disgusting.',
		],
		playstyle:
			'Hold left click. Spin in a circle. Everything dies. Occasionally press Skill or Burst to pretend the game has depth. Pair with Furina and a shielder and you\'ve basically turned Genshin into a water laser simulator.',
	},
	'Hu Tao': {
		characterName: 'Hu Tao',
		role: 'Main DPS',
		tldr: "The pyro pogo stick. Keep her below 50% HP for maximum damage, and pray your dodging skills are as good as your damage.",
		bestWeapons: [
			{ name: 'Staff of Homa', weaponId: 13501, note: 'Literally made for her. The below-50% HP bonus is chef\'s kiss.', source: 'Wish' },
			{ name: "Dragon's Bane", weaponId: 13401, note: 'A 4-star that punches way above its weight in Vaporize teams', source: 'Wish' },
			{ name: 'Deathmatch', weaponId: 13404, note: 'Consistent and reliable from Battle Pass. Not flashy, but gets the job done.', source: 'BP' },
		],
		bestArtifacts: [
			{
				setName: 'Crimson Witch of Flames',
				pieces: 4,
				note: 'The Vaporize queen deserves her Vaporize crown. Best overall.',
			},
			{
				setName: "Shimenawa's Reminiscence",
				pieces: 4,
				note: 'More Charged Attack damage but you lose your Burst heal. Living dangerously.',
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
			'Below 50% HP she gets 33% Pyro DMG Bonus. Healers are the enemy -- don\'t you dare heal her to full.',
			'Jump cancel or dash cancel after Charged Attacks. Mastering this is the difference between "meh" and "oh my god" damage.',
			'Her Burst heals based on enemies hit. Use it as an emergency lifeline when you\'ve been living on the edge a little too hard.',
		],
		playstyle:
			'Activate Skill, watch your HP drop, and start doing terrifying Charged Attack damage. She\'s a melee Pyro maniac who lives in the danger zone. Pair with Xingqiu for Vaporize and a shielder to keep her alive but not too alive.',
	},
	Bennett: {
		characterName: 'Bennett',
		role: 'Support / Healer',
		tldr: "The 6-star character disguised as a 4-star. ATK buff, healing, Pyro application -- he does it all and he does it from one Burst.",
		bestWeapons: [
			{
				name: 'Mistsplitter Reforged',
				weaponId: 11509,
				note: 'Highest Base ATK 5-star in the game. On Bennett, that\'s all that matters.',
				source: 'Wish',
			},
			{
				name: 'Aquila Favonia',
				weaponId: 11501,
				note: 'Sky-high Base ATK from the standard banner. The passive is wasted but who cares.',
				source: 'Wish',
			},
			{
				name: 'Prototype Rancour',
				weaponId: 11406,
				note: 'Highest Base ATK among craftable 4-stars. Free and effective -- just like Bennett.',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{ setName: 'Noblesse Oblige', pieces: 4, note: 'Slap 4pc NO on him and never think about it again. 20% ATK to the whole team on Burst.' },
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
			'DO NOT activate C6 unless you truly understand what you\'re doing. The Pyro infusion will ruin physical and non-Pyro DPS characters. This has been a public service announcement.',
			'His ATK buff scales off BASE ATK only (character + weapon). Artifact ATK means nothing here -- give him the biggest Base ATK weapon you own.',
			'He heals to 70% HP and buffs ATK in one circle. One ability. One slot. Literally every team wants him.',
		],
		playstyle:
			'Drop Burst, stand in circle, become immortal while your whole team gets a massive ATK steroid. He\'s in nearly every meta team for a reason. The only question is which team needs him most.',
	},
	Xiangling: {
		characterName: 'Xiangling',
		role: 'Off-Field DPS',
		tldr: "The free character from Abyss Floor 3 who somehow ended up as one of the best Pyro DPS in the entire game. Guoba walks so Pyronado can fly.",
		bestWeapons: [
			{ name: 'Staff of Homa', weaponId: 13501, note: 'Overkill on a free character and we love it', source: 'Wish' },
			{
				name: 'The Catch',
				weaponId: 13415,
				note: 'Fish for this immediately. R5 Catch on Xiangling is a war crime.',
				source: 'Fish',
			},
			{ name: "Dragon's Bane", weaponId: 13401, note: 'EM passive goes crazy in Vaporize comps. If you have R5, it\'s chef\'s kiss.', source: 'Wish' },
		],
		bestArtifacts: [
			{
				setName: 'Emblem of Severed Fate',
				pieces: 4,
				note: 'Pyronado is her whole identity and EoSF makes it hit like a truck.',
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
			'Guoba and Pyronado both SNAPSHOT buffs. Pop Bennett\'s Burst first, THEN deploy your abilities. Order matters enormously here.',
			'Pyronado lasts 14 seconds and it keeps spinning even when she\'s off-field. That\'s 14 seconds of free damage while your other characters do their thing.',
			'Her biggest weakness is energy. Funnel particles from Bennett\'s Skill into her -- swap to Xiangling right after Bennett uses Skill to catch those juicy Pyro particles.',
		],
		playstyle:
			'Stand in Bennett\'s Burst, drop Guoba, launch Pyronado, then swap out and let the tornado do its thing. She\'s the queen of "I\'m not even on the field and I\'m still outdamaging your main DPS." Just keep her energy topped up.',
	},
	Furina: {
		characterName: 'Furina',
		role: 'Off-Field Support / Sub-DPS',
		tldr: "The drama queen of Fontaine who turned HP fluctuation into an art form. Her Burst DMG% buff is so massive it\'s basically cheating.",
		bestWeapons: [
			{
				name: 'Splendor of Tranquil Waters',
				weaponId: 11513,
				note: 'Her signature drip -- er, weapon. Perfect synergy with her Bond of Life mechanics.',
				source: 'Wish',
			},
			{ name: 'Festering Desire', weaponId: 11413, note: 'If you have it from the event, it still slaps. Good ER for comfortable rotations.', source: 'Event' },
			{ name: 'Favonius Sword', weaponId: 11401, note: 'The universal energy printer. Boring but reliable -- like taxes.', source: 'Wish' },
		],
		bestArtifacts: [
			{
				setName: 'Golden Troupe',
				pieces: 4,
				note: 'Made for off-field damage dealers and Furina is the poster child. Don\'t bother with alternatives.',
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
			'Her Burst DMG% buff from Fanfare stacks is absolutely obscene at max stacks. This is the reason she\'s on every team -- it\'s not even close.',
			'Pair her with a healer. Seriously. Her Salon Members drain HP, and every HP change (drain or heal) generates Fanfare stacks. Healers aren\'t optional, they\'re the engine.',
			'Salon Members scale off Max HP -- stack HP% on everything. She doesn\'t need ATK. She doesn\'t want ATK. HP is her love language.',
		],
		playstyle:
			'Drop Skill, let her Salon Members nibble at your team\'s HP, then pop Burst to convert all that suffering into a team-wide DMG% buff that makes your DPS cry tears of joy. She turns any team into a powerhouse -- just make sure you have a healer or you\'ll be the one crying.',
	},
	'Kaedehara Kazuha': {
		characterName: 'Kaedehara Kazuha',
		role: 'Support / Sub-DPS',
		tldr: "The Anemo samurai who makes every element hit harder just by existing. Stack EM, swirl stuff, win the game.",
		bestWeapons: [
			{
				name: 'Freedom-Sworn',
				weaponId: 11505,
				note: 'His signature and it\'s perfect -- EM stat + team-wide buffs on Swirl. No contest.',
				source: 'Wish',
			},
			{
				name: 'Iron Sting',
				weaponId: 11407,
				note: 'Craftable EM weapon that does exactly what Kazuha needs. Free and fabulous.',
				source: 'Craft',
			},
			{
				name: 'Favonius Sword',
				weaponId: 11401,
				note: 'When your team is energy-starved and Kazuha has to play battery. Not glamorous but necessary.',
				source: 'Wish',
			},
		],
		bestArtifacts: [
			{
				setName: 'Viridescent Venerer',
				pieces: 4,
				note: '40% RES shred is non-negotiable. This set IS Anemo support. No alternatives, no discussion.',
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
			'Every point of EM he has becomes elemental DMG% for whatever he Swirls via his A4 passive. Triple EM mainstat, no exceptions. CRIT Kazuha is a trap.',
			'Swirl the element you want to buff BEFORE popping Burst. Swirl Pyro for Pyro DPS, Electro for Electro DPS, etc. Wrong element = wasted buff.',
			'Tap Skill for a quick plunge combo, hold Skill for bigger suction and more height. Double-tapping in midair for the plunge is peak style points.',
		],
		playstyle:
			'Jump in, Swirl everything, shred resistances, buff your team\'s elemental damage, then dip. He\'s the ultimate wingman -- he makes everyone else on the team look better. Also he groups enemies which is just the cherry on top of an already broken sundae.',
	},
	Mavuika: {
		characterName: 'Mavuika',
		role: 'Main DPS',
		tldr: "Natlan\'s Archon rides a flaming motorcycle and nukes everything. Build Fighting Spirit, press Burst, become the explosion.",
		bestWeapons: [
			{
				name: 'A Thousand Blazing Suns',
				weaponId: 12512,
				note: 'Her signature weapon is as extra as she is. Massive damage ceiling.',
				source: 'Wish',
			},
			{ name: 'Verdict', weaponId: 12510, note: 'Surprisingly strong on her -- close enough to signature that you won\'t cry', source: 'Wish' },
			{ name: 'Serpent Spine', weaponId: 12410, note: 'The Battle Pass weapon that refuses to stop being relevant. Stack it up carefully.', source: 'BP' },
		],
		bestArtifacts: [
			{
				setName: 'Obsidian Codex',
				pieces: 4,
				note: 'Nightsoul state + this set = disgusting synergy. Built for her playstyle.',
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
			'Fighting Spirit is your damage currency. Build it up through your team doing reactions and Nightsoul stuff, then cash it all in with Burst for a massive payday.',
			'Nightsoul state summons a literal flaming motorcycle. Yes, you ride it. Yes, it does damage. Yes, it\'s as cool as it sounds.',
			'Pair her with other Nightsoul characters like Xilonen for faster gauge building. They fuel each other like a content creator duo.',
		],
		playstyle:
			'Rotate through your team building Fighting Spirit, then unleash everything with her Burst for one of the biggest damage windows in the game. During Nightsoul state she\'s riding a motorcycle doing Pyro drive-bys. If that doesn\'t sell you on this character, nothing will.',
	},
	Nahida: {
		characterName: 'Nahida',
		role: 'Off-Field Sub-DPS',
		tldr: "The tiny Dendro Archon who marks everything on screen and watches them explode from reactions. Press Skill, touch grass (literally), profit.",
		bestWeapons: [
			{
				name: 'A Thousand Floating Dreams',
				weaponId: 14509,
				note: 'Her signature and it\'s perfect -- EM for days plus team-wide EM sharing.',
				source: 'Wish',
			},
			{
				name: 'Sacrificial Fragments',
				weaponId: 14402,
				note: 'Big EM stat stick and the Skill reset is nice but honestly she barely needs it.',
				source: 'Wish',
			},
			{ name: 'Mappa Mare', weaponId: 14407, note: 'Craftable and gets the job done. Not pretty, but functional -- like a minivan.', source: 'Craft' },
		],
		bestArtifacts: [
			{
				setName: 'Deepwood Memories',
				pieces: 4,
				note: 'If nobody else is wearing Deepwood, she\'s the one. Dendro RES shred is too important to skip.',
			},
			{
				setName: 'Gilded Dreams',
				pieces: 4,
				note: 'If someone ELSE has Deepwood duty, slap this on for personal damage. EM for days.',
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
			'Her Skill marks enemies and then Tri-Karma Purification procs Dendro damage every time they get hit with reactions. It\'s passive income for damage.',
			'Tri-Karma scales off EM, so stack it. The more EM she has, the harder those little green numbers hit -- and they add up fast.',
			'In reaction teams (Bloom, Quicken, Hyperbloom), she\'s the glue that holds everything together. Without Dendro application, those comps fall apart.',
		],
		playstyle:
			'Hold Skill to mark every enemy you can see (yes, you can aim it like a camera), swap out, and let the reactions do the talking. She applies Dendro off-field like a champ and her Tri-Karma hits proc automatically. Minimal effort, maximum chaos.',
	},
	Zhongli: {
		characterName: 'Zhongli',
		role: 'Shielder / Support',
		tldr: "The Geo Archon whose shield lets you facetank literally everything in the game. Dodge button optional. Brain cells optional.",
		bestWeapons: [
			{
				name: 'Staff of Homa',
				weaponId: 13501,
				note: 'For when you want shields AND damage. The HP scaling is perfect for hybrid Zhongli.',
				source: 'Wish',
			},
			{
				name: 'Favonius Lance',
				weaponId: 13407,
				note: 'Turns him into a battery for the team. Generate particles on crit for everyone.',
				source: 'Wish',
			},
			{
				name: 'Black Tassel',
				weaponId: 13301,
				note: 'A 3-star weapon being BiS for a character is peak comedy. HP% = chonky shields.',
				source: 'F2P',
			},
		],
		bestArtifacts: [
			{
				setName: 'Tenacity of the Millelith',
				pieces: 4,
				note: 'His pillar keeps proccing the 4pc ATK buff for your team. Shields AND buffs. The man does everything.',
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
			'Hold Skill for the thickest shield in the entire game. Nothing else comes close. You will forget how to dodge and that\'s okay.',
			'His shield shreds ALL elemental AND physical RES by 20% just by standing near enemies. It\'s a universal debuff that benefits literally every DPS.',
			'His Burst petrifies enemies which is fancy crowd control, but let\'s be real -- you\'re using him for the shield. The meteor is just a bonus.',
		],
		playstyle:
			'Hold Skill, get shield, become invincible, watch your DPS go ham without ever needing to dodge. His shield also shreds enemy resistances just for being near them. He single-handedly turned "git gud" into "get Zhongli."',
	},
	Yelan: {
		characterName: 'Yelan',
		role: 'Off-Field Sub-DPS',
		tldr: "Xingqiu but she scales on HP and ramps your team\'s damage over time. Also she\'s way more fun to explore with.",
		bestWeapons: [
			{ name: 'Aqua Simulacra', weaponId: 15503, note: 'Her signature bow and it\'s as cracked as you\'d expect. CRIT DMG for days.', source: 'Wish' },
			{
				name: 'Favonius Warbow',
				weaponId: 15401,
				note: 'When she needs to be the team\'s energy sugar mommy. Gets the job done.',
				source: 'Wish',
			},
			{ name: 'Recurve Bow', weaponId: 15301, note: 'A 3-star that works because she scales on HP. Budget but unironically functional.', source: 'F2P' },
		],
		bestArtifacts: [
			{
				setName: 'Emblem of Severed Fate',
				pieces: 4,
				note: 'Her Burst is her entire kit. EoSF makes it hit harder. Match made in artifact heaven.',
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
			'She\'s Xingqiu\'s cooler older sister. Same off-field Hydro application but she scales on HP instead of ATK, so they want completely different stats. Run both together for Double Hydro and watch Vaporize go brrr.',
			'Her A4 passive ramps up to a 50% DMG bonus over time. The longer the fight, the more your team benefits. Sustained DPS teams love her.',
			'C1 gives her an extra charge of Skill which is basically a free battery upgrade. If you\'re pulling cons, C1 is the sweet spot.',
		],
		playstyle:
			'Pop Skill for quick Hydro damage, then Burst and swap to your main DPS. Her Burst fires coordinated Hydro attacks on every Normal Attack just like Xingqiu. The kicker? She also ramps your active character\'s damage over time. She\'s an upgrade in most teams and they pair beautifully together.',
	},
	'Kamisato Ayaka': {
		characterName: 'Kamisato Ayaka',
		role: 'Burst DPS',
		tldr: "The Cryo princess who dashes through enemies then drops a Burst so powerful it deletes frozen targets from existence. Sprint. Slash. Obliterate.",
		bestWeapons: [
			{ name: 'Mistsplitter Reforged', weaponId: 11509, note: 'Her best weapon and it\'s not close. Elemental DMG bonus stacks are free for her.', source: 'Wish' },
			{
				name: 'Amenoma Kageuchi',
				weaponId: 11414,
				note: 'Craftable, gives energy refund, and looks gorgeous on her. The F2P dream.',
				source: 'Craft',
			},
			{ name: 'The Black Sword', weaponId: 11408, note: 'Battle Pass staple. CRIT Rate helps and the healing is a nice safety net.', source: 'BP' },
		],
		bestArtifacts: [
			{
				setName: 'Blizzard Strayer',
				pieces: 4,
				note: 'Up to 40% free CRIT Rate against frozen enemies. Stack CRIT DMG circlet and laugh.',
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
			'Her sprint gives Cryo infusion for 5 seconds. Dash through enemies then start slashing -- every Normal and Charged Attack becomes Cryo during this window.',
			'Her Burst does absolutely disgusting damage when enemies are frozen in place. If they\'re not frozen, the Burst can whiff and push enemies out. Always freeze first, Burst second.',
			'Blizzard Strayer gives so much free CRIT Rate that you can run a CRIT DMG circlet and ignore CRIT Rate substats. It\'s the most resin-efficient build in the game.',
		],
		playstyle:
			'Dash through enemies for Cryo infusion, weave in some Normal Attacks, then drop the Burst on frozen targets for nuclear damage. The whole game plan is freeze -> Burst -> delete. Pair with Hydro for freeze, Anemo for grouping, and watch the big number go up.',
	},
	Ganyu: {
		characterName: 'Ganyu',
		role: 'Main DPS / Sub-DPS',
		tldr: "The original Cryo sniper who made charged shots cool. Aim, release, watch the bloom AoE clear the screen. Also doubles as a Cryo support.",
		bestWeapons: [
			{
				name: "Amos' Bow",
				weaponId: 15502,
				note: 'Literally designed for her charged shots. Distance bonus is free damage on a character who wants to be far away anyway.',
				source: 'Wish',
			},
			{
				name: 'Prototype Crescent',
				weaponId: 15405,
				note: 'Craftable and strong -- just make sure enemies have weak points or the passive is useless.',
				source: 'Craft',
			},
			{
				name: 'Hamayumi',
				weaponId: 15410,
				note: 'Another craftable from Inazuma. Consistent damage bonus without conditions (unless you use Burst).',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{ setName: 'Blizzard Strayer', pieces: 4, note: 'Freeze Ganyu gets absurd CRIT Rate for free. The lazy and effective choice.' },
			{ setName: "Wanderer's Troupe", pieces: 4, note: 'Melt Ganyu wants this. 35% Charged Attack bonus is no joke.' },
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
			'Fully charged Frostflake Arrows are your bread and butter. The bloom AoE hits in a circle, so grouping enemies turns her into a Cryo carpet bomber.',
			'In Melt teams, every single charged shot Melts for obscene damage. Aim at the ground near enemies for guaranteed bloom hits -- it\'s a technique that separates good Ganyu players from great ones.',
			'Her Burst provides consistent Cryo application and at C4 gives a Cryo DMG bonus. In Freeze teams it\'s great, but in Melt teams you might skip it to avoid stealing Melt reactions.',
		],
		playstyle:
			'Charge shot, release, watch the satisfying bloom explosion. In Freeze teams she\'s a comfy sniper behind a wall of frozen enemies. In Melt teams she\'s a glass cannon hitting some of the biggest single-hit numbers in the game. Either way, if you like aiming, she rewards it.',
	},
	Xingqiu: {
		characterName: 'Xingqiu',
		role: 'Off-Field Sub-DPS',
		tldr: "The bookworm with the rain swords who has been enabling Vaporize and Freeze teams since 1.0. Off-field Hydro application king.",
		bestWeapons: [
			{
				name: 'Sacrificial Sword',
				weaponId: 11402,
				note: 'Best in Slot, period. Double Skill means double particles and double damage. His energy problems vanish.',
				source: 'Wish',
			},
			{
				name: 'Favonius Sword',
				weaponId: 11401,
				note: 'Plan B if Sac Sword won\'t come home. Still fixes energy and helps the whole team.',
				source: 'Wish',
			},
			{
				name: 'Harbinger of Dawn',
				weaponId: 11302,
				note: 'A 3-star weapon on a meta character. Keep HP above 90% and enjoy free CRIT stats. Budget king.',
				source: 'F2P',
			},
		],
		bestArtifacts: [
			{
				setName: 'Emblem of Severed Fate',
				pieces: 4,
				note: 'His Burst is the whole reason he exists. EoSF makes it hit harder. Simple math.',
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
			'Rain Swords reduce damage taken AND provide minor healing. He\'s not just Hydro application -- he\'s also a budget defensive support that people forget about.',
			'His Burst fires Hydro swords on every Normal Attack. This is the backbone of basically every Vaporize and Freeze team in the game. One of the most impactful abilities in Genshin.',
			'C6 is a massive power spike -- infuses his swords with Hydro and applies it even faster. If you\'re buying from the shop, get those constellations.',
		],
		playstyle:
			'Use Skill (twice if Sac Sword procs), pop Burst, swap to your DPS and watch coordinated Hydro swords fly with every Normal Attack. He\'s been the backbone of reaction teams since day one and nothing has replaced him. Pair with Pyro for Vaporize or Cryo for Freeze.',
	},
	Alhaitham: {
		characterName: 'Alhaitham',
		role: 'On-Field DPS',
		tldr: "The Dendro scholar who fights with light projections and couldn\'t care less about anything but efficiency. Stack EM and Spread everything.",
		bestWeapons: [
			{
				name: 'Light of Foliar Incision',
				weaponId: 11510,
				note: 'His signature and it\'s tailor-made. CRIT DMG + EM scaling = perfection.',
				source: 'Wish',
			},
			{
				name: 'Iron Sting',
				weaponId: 11407,
				note: 'Craftable EM weapon that does exactly what he needs. Brilliant for a free option.',
				source: 'Craft',
			},
			{
				name: 'Harbinger of Dawn',
				weaponId: 11302,
				note: 'Yes, another 3-star being viable on a 5-star character. Keep HP high and enjoy the CRIT stats.',
				source: 'F2P',
			},
		],
		bestArtifacts: [
			{
				setName: 'Gilded Dreams',
				pieces: 4,
				note: 'EM and ATK buffs on reaction -- exactly what his Quicken/Spread gameplay wants.',
			},
			{
				setName: 'Deepwood Memories',
				pieces: 4,
				note: 'Only if nobody else is running Deepwood. Someone on the team MUST have it.',
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
			'Chisel-Light mirrors are everything. More mirrors = more Dendro infused attacks = more Spread procs. Keep them stacked for maximum DPS.',
			'Spread reactions with high EM hit like a truck. This isn\'t a recommendation, it\'s a statement of fact. EM Alhaitham is scary.',
			'Pair with Fischl for constant Quicken aura. Oz keeps Electro on enemies so every Dendro hit from Alhaitham triggers Spread. It\'s a beautiful loop.',
		],
		playstyle:
			'Use Skill to get Chisel-Light mirrors, then weave Normal and Charged Attacks for constant Spread procs. Each mirror adds a Dendro projection to his attacks, turning him into a reaction machine. Pair with Electro for Quicken and watch the green and purple numbers fly.',
	},
	Clorinde: {
		characterName: 'Clorinde',
		role: 'On-Field DPS',
		tldr: "Fontaine\'s champion duelist who dual-wields a sword and pistol. Bond of Life fuels her damage -- the more she takes, the harder she hits.",
		bestWeapons: [
			{ name: 'Absolution', weaponId: 11514, note: 'Her signature weapon. Bond of Life synergy makes this a no-brainer if you have it.', source: 'Wish' },
			{ name: 'The Black Sword', weaponId: 11408, note: 'Battle Pass reliable. CRIT Rate + healing for when Bond of Life gets spicy.', source: 'BP' },
			{
				name: 'Finale of the Deep',
				weaponId: 11412,
				note: 'Craftable and designed around Bond of Life. A solid F2P choice with real synergy.',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{
				setName: 'Fragment of Harmonic Whimsy',
				pieces: 4,
				note: 'Built for Bond of Life characters. The damage bonus from BoL changes is nuts on her.',
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
			'Bond of Life is your damage steroid. When it\'s active, her pistol shots hit significantly harder. Managing it is the difference between good and great Clorinde gameplay.',
			'Alternate between Skill dashes and Normal Attacks to maintain Bond of Life while dealing maximum damage. It\'s a rhythm game -- find the flow and she feels incredible.',
			'Both Overloaded and Aggravate work as reaction strategies, so she\'s flexible. Overloaded with Xiangling for AoE, Quicken with Nahida for single-target.',
		],
		playstyle:
			'Activate Skill, dash in with pistol shots powered by Bond of Life, weave between sword slashes and gunfire. She plays like an action game character dropped into Genshin -- fast, fluid, and satisfying. Build around Bond of Life and pair with Electro resonance or reaction enablers.',
	},
	Xilonen: {
		characterName: 'Xilonen',
		role: 'Support',
		tldr: "The Geo DJ who rollerblades into battle and shreds elemental RES for the whole team. VV without the Anemo requirement.",
		bestWeapons: [
			{ name: 'Peak Patrol Song', weaponId: 11515, note: 'Her signature and it\'s cracked. DEF scaling + team buffs = everything she wants.', source: 'Wish' },
			{
				name: 'Favonius Sword',
				weaponId: 11401,
				note: 'Old reliable. Generates particles for the team and her ER needs. Never a bad choice.',
				source: 'Wish',
			},
			{ name: 'Festering Desire', weaponId: 11413, note: 'Event weapon that still holds up. Good ER and Skill damage.', source: 'Event' },
		],
		bestArtifacts: [
			{
				setName: 'Scroll of the Hero of Cinder City',
				pieces: 4,
				note: 'RES shred from the set PLUS RES shred from her kit. Enemies don\'t stand a chance.',
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
			'Her Nightsoul state shreds elemental RES universally. Think of her as VV without needing Anemo or Swirl -- she just does it by existing.',
			'Stack DEF% on everything. Her kit scales on DEF and she\'s a support -- she doesn\'t need damage stats. Just make her tanky and let her do her thing.',
			'Pair with other Nightsoul characters (Mavuika, Citlali, etc.) for extra synergy and faster Nightsoul gauge generation. The Natlan squad rolls together.',
		],
		playstyle:
			'Pop Skill, rollerblade through enemies in Nightsoul state shredding their resistances, then swap to your DPS who now hits way harder. She replaced VV in teams that couldn\'t run Anemo and made non-Anemo team building actually viable. Plus she\'s on roller skates and that\'s just fun.',
	},
	Sucrose: {
		characterName: 'Sucrose',
		role: 'Support / Sub-DPS',
		tldr: "Budget Kazuha who shares EM with the team and slaps a 48% ATK buff on your DPS with a 3-star book. The 4-star GOAT.",
		bestWeapons: [
			{
				name: 'Sacrificial Fragments',
				weaponId: 14402,
				note: 'EM stat + Skill reset = double the grouping, double the particles. Her best option by far.',
				source: 'Wish',
			},
			{
				name: 'Thrilling Tales of Dragon Slayers',
				weaponId: 14302,
				note: 'A 3-star book that gives 48% ATK to whoever comes next. The most broken "bad" weapon in the game.',
				source: 'F2P',
			},
			{
				name: 'Hakushin Ring',
				weaponId: 14414,
				note: 'Craftable option that buffs elemental damage on Swirl. Great in Taser teams specifically.',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{
				setName: 'Viridescent Venerer',
				pieces: 4,
				note: '40% RES shred is mandatory on every Anemo support. This is not optional. This is the law.',
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
			'Her A1 and A4 passives share EM with the entire team every time she Swirls. In reaction-heavy teams, this is a huge damage increase you\'re getting for free.',
			'VV shred is the main reason to run ANY Anemo support. Sucrose does this just as well as Kazuha -- the 40% RES shred doesn\'t care about your credit card.',
			'TTDS gives 48% ATK to whoever you swap to next. Put it on Sucrose, Swirl, then swap to your DPS for a massive buff that costs zero resin to build.',
		],
		playstyle:
			'Swirl the right element, share EM with the team, apply VV shred, pass the TTDS buff, and get out. She does 90% of what Kazuha does at a fraction of the primogem cost. In Taser teams she can be the driver too, proccing Swirl on every Normal Attack while Fischl and Beidou do off-field damage.',
	},
	Fischl: {
		characterName: 'Fischl',
		role: 'Off-Field Sub-DPS',
		tldr: "Summon bird. Bird does damage. Swap out. Bird still does damage. That\'s the whole pitch and it\'s been meta since 1.0.",
		bestWeapons: [
			{ name: 'Polar Star', weaponId: 15507, note: 'Overkill damage on a sub-DPS and we\'re here for it. Max stacks for maximum Oz pain.', source: 'Wish' },
			{
				name: 'The Stringless',
				weaponId: 15402,
				note: 'EM + Skill/Burst DMG bonus. Practically designed for her playstyle. R5 is cheat codes.',
				source: 'Wish',
			},
			{ name: 'Slingshot', weaponId: 15304, note: 'A 3-star with CRIT Rate. Works on Fischl because Oz doesn\'t care about arrow distance.', source: 'F2P' },
		],
		bestArtifacts: [
			{
				setName: 'Golden Troupe',
				pieces: 4,
				note: 'Made for off-field damage dealers. Oz is off-field. This is a match made in heaven.',
			},
			{
				setName: 'Thundering Fury',
				pieces: 4,
				note: 'Good in heavy-reaction teams where she\'s triggering Aggravate constantly.',
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
			'Oz attacks every 1 second for 12 seconds. That\'s 12 free Electro hits while you\'re doing other things. Oz doesn\'t take breaks and neither should you.',
			'Her A4 passive fires EXTRA Electro damage when reactions happen near Oz. In Taser or Quicken teams, this procs constantly and her damage skyrockets.',
			'Burst resummons Oz at full duration. Use it as an Oz refresh button -- it\'s not about the Burst damage, it\'s about keeping the bird on the field 24/7.',
		],
		playstyle:
			'Deploy Oz, swap out, do your rotation, and let the bird carry. Oz attacks independently, triggers reactions, and generates energy while Fischl does absolutely nothing. She\'s been a staple in Taser, Aggravate, and Quicken teams since launch because consistent off-field damage never goes out of style.',
	},
	Citlali: {
		characterName: 'Citlali',
		role: 'Off-Field Support / Sub-DPS',
		tldr: "Natlan\'s Cryo grandma who drops shields, applies Cryo off-field, and enables Melt and Freeze teams while looking adorable doing it.",
		bestWeapons: [
			{ name: 'Cashflow Supervision', weaponId: 14514, note: 'Top-tier stats that Citlali makes full use of. If you have it, don\'t hesitate.', source: 'Wish' },
			{
				name: 'Sacrificial Fragments',
				weaponId: 14402,
				note: 'EM stat stick with Skill reset. Double Skill = double the Cryo application and shields.',
				source: 'Wish',
			},
			{
				name: 'Prototype Amber',
				weaponId: 14401,
				note: 'Craftable and adds healing to her kit. Budget-friendly with real utility.',
				source: 'Craft',
			},
		],
		bestArtifacts: [
			{
				setName: 'Blizzard Strayer',
				pieces: 4,
				note: 'Free CRIT Rate in Freeze teams. If she\'s in a Freeze comp, this is the move.',
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
			'Her Skill provides strong shields AND off-field Cryo application in one package. She\'s doing double duty and excelling at both.',
			'Nightsoul state powers up her abilities for extra damage and better Cryo application. In Natlan teams she fits right in with the Nightsoul gang.',
			'In Melt teams with Xiangling and Bennett, she\'s the Cryo enabler. In Freeze teams with Neuvillette, she\'s the Cryo applier. Versatile queen.',
		],
		playstyle:
			'Drop Skill for shield and off-field Cryo, swap to your DPS, and let her do the support work from the sidelines. She combines shielding and Cryo application into one neat package, making her a flexible pick for both Melt and Freeze teams. Nightsoul state enhances everything when it\'s up.',
	},
};
