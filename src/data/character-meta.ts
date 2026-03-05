// Extra character metadata for Genshindle game
// Gender and Region are not in the main character data

export type Gender = 'Male' | 'Female';
export type Region = 'Mondstadt' | 'Liyue' | 'Inazuma' | 'Sumeru' | 'Fontaine' | 'Natlan' | 'Snezhnaya' | 'Other';

export interface CharacterMeta {
	gender: Gender;
	region: Region;
}

// Keyed by character name
export const CHARACTER_META: Record<string, CharacterMeta> = {
	// ── Mondstadt ──────────────────────────────────────────────
	Jean: { gender: 'Female', region: 'Mondstadt' },
	Lisa: { gender: 'Female', region: 'Mondstadt' },
	Barbara: { gender: 'Female', region: 'Mondstadt' },
	Kaeya: { gender: 'Male', region: 'Mondstadt' },
	Diluc: { gender: 'Male', region: 'Mondstadt' },
	Razor: { gender: 'Male', region: 'Mondstadt' },
	Amber: { gender: 'Female', region: 'Mondstadt' },
	Venti: { gender: 'Male', region: 'Mondstadt' },
	Klee: { gender: 'Female', region: 'Mondstadt' },
	Fischl: { gender: 'Female', region: 'Mondstadt' },
	Bennett: { gender: 'Male', region: 'Mondstadt' },
	Noelle: { gender: 'Female', region: 'Mondstadt' },
	Sucrose: { gender: 'Female', region: 'Mondstadt' },
	Albedo: { gender: 'Male', region: 'Mondstadt' },
	Eula: { gender: 'Female', region: 'Mondstadt' },
	Mona: { gender: 'Female', region: 'Mondstadt' },
	Diona: { gender: 'Female', region: 'Mondstadt' },
	Rosaria: { gender: 'Female', region: 'Mondstadt' },
	Mika: { gender: 'Male', region: 'Mondstadt' },

	// ── Liyue ─────────────────────────────────────────────────
	Xiangling: { gender: 'Female', region: 'Liyue' },
	Beidou: { gender: 'Female', region: 'Liyue' },
	Xingqiu: { gender: 'Male', region: 'Liyue' },
	Ningguang: { gender: 'Female', region: 'Liyue' },
	Chongyun: { gender: 'Male', region: 'Liyue' },
	Keqing: { gender: 'Female', region: 'Liyue' },
	Qiqi: { gender: 'Female', region: 'Liyue' },
	Tartaglia: { gender: 'Male', region: 'Snezhnaya' },
	Zhongli: { gender: 'Male', region: 'Liyue' },
	Xinyan: { gender: 'Female', region: 'Liyue' },
	Ganyu: { gender: 'Female', region: 'Liyue' },
	Xiao: { gender: 'Male', region: 'Liyue' },
	'Hu Tao': { gender: 'Female', region: 'Liyue' },
	Yanfei: { gender: 'Female', region: 'Liyue' },
	Shenhe: { gender: 'Female', region: 'Liyue' },
	'Yun Jin': { gender: 'Female', region: 'Liyue' },
	Yelan: { gender: 'Female', region: 'Liyue' },
	Baizhu: { gender: 'Male', region: 'Liyue' },
	Yaoyao: { gender: 'Female', region: 'Liyue' },
	Gaming: { gender: 'Male', region: 'Liyue' },
	Xianyun: { gender: 'Female', region: 'Liyue' },
	'Lan Yan': { gender: 'Female', region: 'Liyue' },

	// ── Inazuma ───────────────────────────────────────────────
	'Kaedehara Kazuha': { gender: 'Male', region: 'Inazuma' },
	'Kamisato Ayaka': { gender: 'Female', region: 'Inazuma' },
	Yoimiya: { gender: 'Female', region: 'Inazuma' },
	Sayu: { gender: 'Female', region: 'Inazuma' },
	'Raiden Shogun': { gender: 'Female', region: 'Inazuma' },
	'Kujou Sara': { gender: 'Female', region: 'Inazuma' },
	'Sangonomiya Kokomi': { gender: 'Female', region: 'Inazuma' },
	Thoma: { gender: 'Male', region: 'Inazuma' },
	Gorou: { gender: 'Male', region: 'Inazuma' },
	'Arataki Itto': { gender: 'Male', region: 'Inazuma' },
	'Yae Miko': { gender: 'Female', region: 'Inazuma' },
	'Kamisato Ayato': { gender: 'Male', region: 'Inazuma' },
	'Kuki Shinobu': { gender: 'Female', region: 'Inazuma' },
	'Shikanoin Heizou': { gender: 'Male', region: 'Inazuma' },
	Kirara: { gender: 'Female', region: 'Inazuma' },
	'Yumemizuki Mizuki': { gender: 'Female', region: 'Inazuma' },

	// ── Sumeru ────────────────────────────────────────────────
	Collei: { gender: 'Female', region: 'Sumeru' },
	Tighnari: { gender: 'Male', region: 'Sumeru' },
	Dori: { gender: 'Female', region: 'Sumeru' },
	Cyno: { gender: 'Male', region: 'Sumeru' },
	Candace: { gender: 'Female', region: 'Sumeru' },
	Nilou: { gender: 'Female', region: 'Sumeru' },
	Nahida: { gender: 'Female', region: 'Sumeru' },
	Layla: { gender: 'Female', region: 'Sumeru' },
	Wanderer: { gender: 'Male', region: 'Sumeru' },
	Faruzan: { gender: 'Female', region: 'Sumeru' },
	Alhaitham: { gender: 'Male', region: 'Sumeru' },
	Dehya: { gender: 'Female', region: 'Sumeru' },
	Kaveh: { gender: 'Male', region: 'Sumeru' },
	Sethos: { gender: 'Male', region: 'Sumeru' },

	// ── Fontaine ──────────────────────────────────────────────
	Lynette: { gender: 'Female', region: 'Fontaine' },
	Lyney: { gender: 'Male', region: 'Fontaine' },
	Freminet: { gender: 'Male', region: 'Fontaine' },
	Neuvillette: { gender: 'Male', region: 'Fontaine' },
	Wriothesley: { gender: 'Male', region: 'Fontaine' },
	Charlotte: { gender: 'Female', region: 'Fontaine' },
	Furina: { gender: 'Female', region: 'Fontaine' },
	Navia: { gender: 'Female', region: 'Fontaine' },
	Chevreuse: { gender: 'Female', region: 'Fontaine' },
	Chiori: { gender: 'Female', region: 'Fontaine' },
	Arlecchino: { gender: 'Female', region: 'Fontaine' },
	Clorinde: { gender: 'Female', region: 'Fontaine' },
	Sigewinne: { gender: 'Female', region: 'Fontaine' },
	Emilie: { gender: 'Female', region: 'Fontaine' },
	Escoffier: { gender: 'Male', region: 'Fontaine' },

	// ── Natlan ────────────────────────────────────────────────
	Kachina: { gender: 'Female', region: 'Natlan' },
	Mualani: { gender: 'Female', region: 'Natlan' },
	Kinich: { gender: 'Male', region: 'Natlan' },
	Xilonen: { gender: 'Female', region: 'Natlan' },
	Chasca: { gender: 'Female', region: 'Natlan' },
	Ororon: { gender: 'Male', region: 'Natlan' },
	Mavuika: { gender: 'Female', region: 'Natlan' },
	Citlali: { gender: 'Female', region: 'Natlan' },
	Iansan: { gender: 'Female', region: 'Natlan' },
	Varesa: { gender: 'Female', region: 'Natlan' },

	// ── Snezhnaya ─────────────────────────────────────────────
	Ifa: { gender: 'Female', region: 'Snezhnaya' },
	Skirk: { gender: 'Female', region: 'Snezhnaya' },
	Dahlia: { gender: 'Female', region: 'Snezhnaya' },
	Ineffa: { gender: 'Female', region: 'Snezhnaya' },
	Lauma: { gender: 'Female', region: 'Snezhnaya' },
	Aino: { gender: 'Female', region: 'Snezhnaya' },
	Flins: { gender: 'Male', region: 'Snezhnaya' },
	Nefer: { gender: 'Female', region: 'Snezhnaya' },
	Columbina: { gender: 'Female', region: 'Snezhnaya' },

	// ── Other / Cross-region ──────────────────────────────────
	Aloy: { gender: 'Female', region: 'Other' },
	Durin: { gender: 'Male', region: 'Mondstadt' },
	Jahoda: { gender: 'Female', region: 'Snezhnaya' },
	Zibai: { gender: 'Male', region: 'Liyue' },
	Illuga: { gender: 'Male', region: 'Snezhnaya' },
	Varka: { gender: 'Male', region: 'Mondstadt' },
};
