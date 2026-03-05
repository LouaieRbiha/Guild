// Auto-generated from yatta.moe — 111 playable characters (sorted by release date)
// Icons: https://enka.network/ui/{icon}.png

export interface CharacterEntry {
  id: string;
  name: string;
  element: "Pyro" | "Hydro" | "Anemo" | "Cryo" | "Electro" | "Geo" | "Dendro" | "Unknown";
  rarity: 4 | 5;
  weapon: "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst" | "Unknown";
  icon: string;
  sideIcon: string;
  avatarKey: string;
  release: string;  // YYYY-MM-DD
}

// Re-export shared constants from canonical location
export { ELEMENT_COLORS } from "@/lib/constants";

export function charIconUrl(id: string): string {
  return `/assets/characters/${id}/icon.png`;
}

export function charGachaUrl(id: string): string {
  return `/assets/characters/${id}/gacha.png`;
}

export function charSideUrl(id: string): string {
  return `/assets/characters/${id}/side.png`;
}

export const ELEMENTS = ["All", "Pyro", "Hydro", "Anemo", "Cryo", "Electro", "Geo", "Dendro"] as const;
export const WEAPONS = ["All", "Sword", "Claymore", "Polearm", "Bow", "Catalyst"] as const;

// Element icons mapping
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ELEMENT_ICONS: Record<string, any> = {
  Pyro: PyroIcon,
  Hydro: HydroIcon,
  Anemo: AnemoIcon,
  Electro: ElectroIcon,
  Cryo: CryoIcon,
  Geo: GeoIcon,
  Dendro: DendroIcon,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as Record<string, any>;

// Export icons from the icon components file
import { PyroIcon, HydroIcon, AnemoIcon, ElectroIcon, CryoIcon, GeoIcon, DendroIcon } from "@/components/icons/genshin-icons";

export const ALL_CHARACTERS: CharacterEntry[] = [
  { id: "10000003", name: "Jean", element: "Anemo", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Qin", sideIcon: "UI_AvatarIcon_Side_Qin", avatarKey: "Qin", release: "2020-09-27" },
  { id: "10000006", name: "Lisa", element: "Electro", rarity: 4, weapon: "Catalyst", icon: "UI_AvatarIcon_Lisa", sideIcon: "UI_AvatarIcon_Side_Lisa", avatarKey: "Lisa", release: "2020-09-27" },
  { id: "10000014", name: "Barbara", element: "Hydro", rarity: 4, weapon: "Catalyst", icon: "UI_AvatarIcon_Barbara", sideIcon: "UI_AvatarIcon_Side_Barbara", avatarKey: "Barbara", release: "2020-09-27" },
  { id: "10000015", name: "Kaeya", element: "Cryo", rarity: 4, weapon: "Sword", icon: "UI_AvatarIcon_Kaeya", sideIcon: "UI_AvatarIcon_Side_Kaeya", avatarKey: "Kaeya", release: "2020-09-27" },
  { id: "10000016", name: "Diluc", element: "Pyro", rarity: 5, weapon: "Claymore", icon: "UI_AvatarIcon_Diluc", sideIcon: "UI_AvatarIcon_Side_Diluc", avatarKey: "Diluc", release: "2020-09-27" },
  { id: "10000020", name: "Razor", element: "Electro", rarity: 4, weapon: "Claymore", icon: "UI_AvatarIcon_Razor", sideIcon: "UI_AvatarIcon_Side_Razor", avatarKey: "Razor", release: "2020-09-27" },
  { id: "10000021", name: "Amber", element: "Pyro", rarity: 4, weapon: "Bow", icon: "UI_AvatarIcon_Ambor", sideIcon: "UI_AvatarIcon_Side_Ambor", avatarKey: "Ambor", release: "2020-09-27" },
  { id: "10000022", name: "Venti", element: "Anemo", rarity: 5, weapon: "Bow", icon: "UI_AvatarIcon_Venti", sideIcon: "UI_AvatarIcon_Side_Venti", avatarKey: "Venti", release: "2020-09-27" },
  { id: "10000023", name: "Xiangling", element: "Pyro", rarity: 4, weapon: "Polearm", icon: "UI_AvatarIcon_Xiangling", sideIcon: "UI_AvatarIcon_Side_Xiangling", avatarKey: "Xiangling", release: "2020-09-27" },
  { id: "10000024", name: "Beidou", element: "Electro", rarity: 4, weapon: "Claymore", icon: "UI_AvatarIcon_Beidou", sideIcon: "UI_AvatarIcon_Side_Beidou", avatarKey: "Beidou", release: "2020-09-27" },
  { id: "10000025", name: "Xingqiu", element: "Hydro", rarity: 4, weapon: "Sword", icon: "UI_AvatarIcon_Xingqiu", sideIcon: "UI_AvatarIcon_Side_Xingqiu", avatarKey: "Xingqiu", release: "2020-09-27" },
  { id: "10000027", name: "Ningguang", element: "Geo", rarity: 4, weapon: "Catalyst", icon: "UI_AvatarIcon_Ningguang", sideIcon: "UI_AvatarIcon_Side_Ningguang", avatarKey: "Ningguang", release: "2020-09-27" },
  { id: "10000029", name: "Klee", element: "Pyro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Klee", sideIcon: "UI_AvatarIcon_Side_Klee", avatarKey: "Klee", release: "2020-09-27" },
  { id: "10000031", name: "Fischl", element: "Electro", rarity: 4, weapon: "Bow", icon: "UI_AvatarIcon_Fischl", sideIcon: "UI_AvatarIcon_Side_Fischl", avatarKey: "Fischl", release: "2020-09-27" },
  { id: "10000032", name: "Bennett", element: "Pyro", rarity: 4, weapon: "Sword", icon: "UI_AvatarIcon_Bennett", sideIcon: "UI_AvatarIcon_Side_Bennett", avatarKey: "Bennett", release: "2020-09-27" },
  { id: "10000034", name: "Noelle", element: "Geo", rarity: 4, weapon: "Claymore", icon: "UI_AvatarIcon_Noel", sideIcon: "UI_AvatarIcon_Side_Noel", avatarKey: "Noel", release: "2020-09-27" },
  { id: "10000035", name: "Qiqi", element: "Cryo", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Qiqi", sideIcon: "UI_AvatarIcon_Side_Qiqi", avatarKey: "Qiqi", release: "2020-09-27" },
  { id: "10000036", name: "Chongyun", element: "Cryo", rarity: 4, weapon: "Claymore", icon: "UI_AvatarIcon_Chongyun", sideIcon: "UI_AvatarIcon_Side_Chongyun", avatarKey: "Chongyun", release: "2020-09-27" },
  { id: "10000041", name: "Mona", element: "Hydro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Mona", sideIcon: "UI_AvatarIcon_Side_Mona", avatarKey: "Mona", release: "2020-09-27" },
  { id: "10000042", name: "Keqing", element: "Electro", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Keqing", sideIcon: "UI_AvatarIcon_Side_Keqing", avatarKey: "Keqing", release: "2020-09-27" },
  { id: "10000043", name: "Sucrose", element: "Anemo", rarity: 4, weapon: "Catalyst", icon: "UI_AvatarIcon_Sucrose", sideIcon: "UI_AvatarIcon_Side_Sucrose", avatarKey: "Sucrose", release: "2020-09-27" },
  { id: "10000033", name: "Tartaglia", element: "Hydro", rarity: 5, weapon: "Bow", icon: "UI_AvatarIcon_Tartaglia", sideIcon: "UI_AvatarIcon_Side_Tartaglia", avatarKey: "Tartaglia", release: "2020-11-11" },
  { id: "10000039", name: "Diona", element: "Cryo", rarity: 4, weapon: "Bow", icon: "UI_AvatarIcon_Diona", sideIcon: "UI_AvatarIcon_Side_Diona", avatarKey: "Diona", release: "2020-11-11" },
  { id: "10000030", name: "Zhongli", element: "Geo", rarity: 5, weapon: "Polearm", icon: "UI_AvatarIcon_Zhongli", sideIcon: "UI_AvatarIcon_Side_Zhongli", avatarKey: "Zhongli", release: "2020-12-02" },
  { id: "10000044", name: "Xinyan", element: "Pyro", rarity: 4, weapon: "Claymore", icon: "UI_AvatarIcon_Xinyan", sideIcon: "UI_AvatarIcon_Side_Xinyan", avatarKey: "Xinyan", release: "2020-12-02" },
  { id: "10000038", name: "Albedo", element: "Geo", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Albedo", sideIcon: "UI_AvatarIcon_Side_Albedo", avatarKey: "Albedo", release: "2020-12-21" },
  { id: "10000037", name: "Ganyu", element: "Cryo", rarity: 5, weapon: "Bow", icon: "UI_AvatarIcon_Ganyu", sideIcon: "UI_AvatarIcon_Side_Ganyu", avatarKey: "Ganyu", release: "2021-01-12" },
  { id: "10000026", name: "Xiao", element: "Anemo", rarity: 5, weapon: "Polearm", icon: "UI_AvatarIcon_Xiao", sideIcon: "UI_AvatarIcon_Side_Xiao", avatarKey: "Xiao", release: "2021-02-01" },
  { id: "10000046", name: "Hu Tao", element: "Pyro", rarity: 5, weapon: "Polearm", icon: "UI_AvatarIcon_Hutao", sideIcon: "UI_AvatarIcon_Side_Hutao", avatarKey: "Hutao", release: "2021-03-02" },
  { id: "10000045", name: "Rosaria", element: "Cryo", rarity: 4, weapon: "Polearm", icon: "UI_AvatarIcon_Rosaria", sideIcon: "UI_AvatarIcon_Side_Rosaria", avatarKey: "Rosaria", release: "2021-04-06" },
  { id: "10000048", name: "Yanfei", element: "Pyro", rarity: 4, weapon: "Catalyst", icon: "UI_AvatarIcon_Feiyan", sideIcon: "UI_AvatarIcon_Side_Feiyan", avatarKey: "Feiyan", release: "2021-04-26" },
  { id: "10000051", name: "Eula", element: "Cryo", rarity: 5, weapon: "Claymore", icon: "UI_AvatarIcon_Eula", sideIcon: "UI_AvatarIcon_Side_Eula", avatarKey: "Eula", release: "2021-05-18" },
  { id: "10000047", name: "Kaedehara Kazuha", element: "Anemo", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Kazuha", sideIcon: "UI_AvatarIcon_Side_Kazuha", avatarKey: "Kazuha", release: "2021-06-29" },
  { id: "10000002", name: "Kamisato Ayaka", element: "Cryo", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Ayaka", sideIcon: "UI_AvatarIcon_Side_Ayaka", avatarKey: "Ayaka", release: "2021-07-20" },
  { id: "10000049", name: "Yoimiya", element: "Pyro", rarity: 5, weapon: "Bow", icon: "UI_AvatarIcon_Yoimiya", sideIcon: "UI_AvatarIcon_Side_Yoimiya", avatarKey: "Yoimiya", release: "2021-08-10" },
  { id: "10000053", name: "Sayu", element: "Anemo", rarity: 4, weapon: "Claymore", icon: "UI_AvatarIcon_Sayu", sideIcon: "UI_AvatarIcon_Side_Sayu", avatarKey: "Sayu", release: "2021-08-10" },
  { id: "10000052", name: "Raiden Shogun", element: "Electro", rarity: 5, weapon: "Polearm", icon: "UI_AvatarIcon_Shougun", sideIcon: "UI_AvatarIcon_Side_Shougun", avatarKey: "Shougun", release: "2021-08-31" },
  { id: "10000056", name: "Kujou Sara", element: "Electro", rarity: 4, weapon: "Bow", icon: "UI_AvatarIcon_Sara", sideIcon: "UI_AvatarIcon_Side_Sara", avatarKey: "Sara", release: "2021-08-31" },
  { id: "10000062", name: "Aloy", element: "Cryo", rarity: 5, weapon: "Bow", icon: "UI_AvatarIcon_Aloy", sideIcon: "UI_AvatarIcon_Side_Aloy", avatarKey: "Aloy", release: "2021-08-31" },
  { id: "10000054", name: "Sangonomiya Kokomi", element: "Hydro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Kokomi", sideIcon: "UI_AvatarIcon_Side_Kokomi", avatarKey: "Kokomi", release: "2021-09-21" },
  { id: "10000050", name: "Thoma", element: "Pyro", rarity: 4, weapon: "Polearm", icon: "UI_AvatarIcon_Tohma", sideIcon: "UI_AvatarIcon_Side_Tohma", avatarKey: "Tohma", release: "2021-11-02" },
  { id: "10000055", name: "Gorou", element: "Geo", rarity: 4, weapon: "Bow", icon: "UI_AvatarIcon_Gorou", sideIcon: "UI_AvatarIcon_Side_Gorou", avatarKey: "Gorou", release: "2021-12-14" },
  { id: "10000057", name: "Arataki Itto", element: "Geo", rarity: 5, weapon: "Claymore", icon: "UI_AvatarIcon_Itto", sideIcon: "UI_AvatarIcon_Side_Itto", avatarKey: "Itto", release: "2021-12-14" },
  { id: "10000063", name: "Shenhe", element: "Cryo", rarity: 5, weapon: "Polearm", icon: "UI_AvatarIcon_Shenhe", sideIcon: "UI_AvatarIcon_Side_Shenhe", avatarKey: "Shenhe", release: "2022-01-04" },
  { id: "10000064", name: "Yun Jin", element: "Geo", rarity: 4, weapon: "Polearm", icon: "UI_AvatarIcon_Yunjin", sideIcon: "UI_AvatarIcon_Side_Yunjin", avatarKey: "Yunjin", release: "2022-01-04" },
  { id: "10000058", name: "Yae Miko", element: "Electro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Yae", sideIcon: "UI_AvatarIcon_Side_Yae", avatarKey: "Yae", release: "2022-02-15" },
  { id: "10000066", name: "Kamisato Ayato", element: "Hydro", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Ayato", sideIcon: "UI_AvatarIcon_Side_Ayato", avatarKey: "Ayato", release: "2022-03-29" },
  { id: "10000060", name: "Yelan", element: "Hydro", rarity: 5, weapon: "Bow", icon: "UI_AvatarIcon_Yelan", sideIcon: "UI_AvatarIcon_Side_Yelan", avatarKey: "Yelan", release: "2022-05-30" },
  { id: "10000065", name: "Kuki Shinobu", element: "Electro", rarity: 4, weapon: "Sword", icon: "UI_AvatarIcon_Shinobu", sideIcon: "UI_AvatarIcon_Side_Shinobu", avatarKey: "Shinobu", release: "2022-06-21" },
  { id: "10000059", name: "Shikanoin Heizou", element: "Anemo", rarity: 4, weapon: "Catalyst", icon: "UI_AvatarIcon_Heizo", sideIcon: "UI_AvatarIcon_Side_Heizo", avatarKey: "Heizo", release: "2022-07-12" },
  { id: "10000067", name: "Collei", element: "Dendro", rarity: 4, weapon: "Bow", icon: "UI_AvatarIcon_Collei", sideIcon: "UI_AvatarIcon_Side_Collei", avatarKey: "Collei", release: "2022-08-23" },
  { id: "10000069", name: "Tighnari", element: "Dendro", rarity: 5, weapon: "Bow", icon: "UI_AvatarIcon_Tighnari", sideIcon: "UI_AvatarIcon_Side_Tighnari", avatarKey: "Tighnari", release: "2022-08-23" },
  { id: "10000068", name: "Dori", element: "Electro", rarity: 4, weapon: "Claymore", icon: "UI_AvatarIcon_Dori", sideIcon: "UI_AvatarIcon_Side_Dori", avatarKey: "Dori", release: "2022-09-09" },
  { id: "10000071", name: "Cyno", element: "Electro", rarity: 5, weapon: "Polearm", icon: "UI_AvatarIcon_Cyno", sideIcon: "UI_AvatarIcon_Side_Cyno", avatarKey: "Cyno", release: "2022-09-26" },
  { id: "10000072", name: "Candace", element: "Hydro", rarity: 4, weapon: "Polearm", icon: "UI_AvatarIcon_Candace", sideIcon: "UI_AvatarIcon_Side_Candace", avatarKey: "Candace", release: "2022-09-26" },
  { id: "10000070", name: "Nilou", element: "Hydro", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Nilou", sideIcon: "UI_AvatarIcon_Side_Nilou", avatarKey: "Nilou", release: "2022-10-14" },
  { id: "10000073", name: "Nahida", element: "Dendro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Nahida", sideIcon: "UI_AvatarIcon_Side_Nahida", avatarKey: "Nahida", release: "2022-10-31" },
  { id: "10000074", name: "Layla", element: "Cryo", rarity: 4, weapon: "Sword", icon: "UI_AvatarIcon_Layla", sideIcon: "UI_AvatarIcon_Side_Layla", avatarKey: "Layla", release: "2022-11-18" },
  { id: "10000075", name: "Wanderer", element: "Anemo", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Wanderer", sideIcon: "UI_AvatarIcon_Side_Wanderer", avatarKey: "Wanderer", release: "2022-12-05" },
  { id: "10000076", name: "Faruzan", element: "Anemo", rarity: 4, weapon: "Bow", icon: "UI_AvatarIcon_Faruzan", sideIcon: "UI_AvatarIcon_Side_Faruzan", avatarKey: "Faruzan", release: "2022-12-05" },
  { id: "10000077", name: "Yaoyao", element: "Dendro", rarity: 4, weapon: "Polearm", icon: "UI_AvatarIcon_Yaoyao", sideIcon: "UI_AvatarIcon_Side_Yaoyao", avatarKey: "Yaoyao", release: "2023-01-16" },
  { id: "10000078", name: "Alhaitham", element: "Dendro", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Alhatham", sideIcon: "UI_AvatarIcon_Side_Alhatham", avatarKey: "Alhatham", release: "2023-01-16" },
  { id: "10000079", name: "Dehya", element: "Pyro", rarity: 5, weapon: "Claymore", icon: "UI_AvatarIcon_Dehya", sideIcon: "UI_AvatarIcon_Side_Dehya", avatarKey: "Dehya", release: "2023-02-27" },
  { id: "10000080", name: "Mika", element: "Cryo", rarity: 4, weapon: "Polearm", icon: "UI_AvatarIcon_Mika", sideIcon: "UI_AvatarIcon_Side_Mika", avatarKey: "Mika", release: "2023-03-21" },
  { id: "10000081", name: "Kaveh", element: "Dendro", rarity: 4, weapon: "Claymore", icon: "UI_AvatarIcon_Kaveh", sideIcon: "UI_AvatarIcon_Side_Kaveh", avatarKey: "Kaveh", release: "2023-05-02" },
  { id: "10000082", name: "Baizhu", element: "Dendro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Baizhuer", sideIcon: "UI_AvatarIcon_Side_Baizhuer", avatarKey: "Baizhuer", release: "2023-05-02" },
  { id: "10000061", name: "Kirara", element: "Dendro", rarity: 4, weapon: "Sword", icon: "UI_AvatarIcon_Momoka", sideIcon: "UI_AvatarIcon_Side_Momoka", avatarKey: "Momoka", release: "2023-05-22" },
  { id: "10000083", name: "Lynette", element: "Anemo", rarity: 4, weapon: "Sword", icon: "UI_AvatarIcon_Linette", sideIcon: "UI_AvatarIcon_Side_Linette", avatarKey: "Linette", release: "2023-08-14" },
  { id: "10000084", name: "Lyney", element: "Pyro", rarity: 5, weapon: "Bow", icon: "UI_AvatarIcon_Liney", sideIcon: "UI_AvatarIcon_Side_Liney", avatarKey: "Liney", release: "2023-08-14" },
  { id: "10000085", name: "Freminet", element: "Cryo", rarity: 4, weapon: "Claymore", icon: "UI_AvatarIcon_Freminet", sideIcon: "UI_AvatarIcon_Side_Freminet", avatarKey: "Freminet", release: "2023-09-05" },
  { id: "10000087", name: "Neuvillette", element: "Hydro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Neuvillette", sideIcon: "UI_AvatarIcon_Side_Neuvillette", avatarKey: "Neuvillette", release: "2023-09-25" },
  { id: "10000086", name: "Wriothesley", element: "Cryo", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Wriothesley", sideIcon: "UI_AvatarIcon_Side_Wriothesley", avatarKey: "Wriothesley", release: "2023-10-17" },
  { id: "10000088", name: "Charlotte", element: "Cryo", rarity: 4, weapon: "Catalyst", icon: "UI_AvatarIcon_Charlotte", sideIcon: "UI_AvatarIcon_Side_Charlotte", avatarKey: "Charlotte", release: "2023-11-06" },
  { id: "10000089", name: "Furina", element: "Hydro", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Furina", sideIcon: "UI_AvatarIcon_Side_Furina", avatarKey: "Furina", release: "2023-11-06" },
  { id: "10000091", name: "Navia", element: "Geo", rarity: 5, weapon: "Claymore", icon: "UI_AvatarIcon_Navia", sideIcon: "UI_AvatarIcon_Side_Navia", avatarKey: "Navia", release: "2023-12-18" },
  { id: "10000090", name: "Chevreuse", element: "Pyro", rarity: 4, weapon: "Polearm", icon: "UI_AvatarIcon_Chevreuse", sideIcon: "UI_AvatarIcon_Side_Chevreuse", avatarKey: "Chevreuse", release: "2024-01-09" },
  { id: "10000092", name: "Gaming", element: "Pyro", rarity: 4, weapon: "Claymore", icon: "UI_AvatarIcon_Gaming", sideIcon: "UI_AvatarIcon_Side_Gaming", avatarKey: "Gaming", release: "2024-01-29" },
  { id: "10000093", name: "Xianyun", element: "Anemo", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Liuyun", sideIcon: "UI_AvatarIcon_Side_Liuyun", avatarKey: "Liuyun", release: "2024-01-29" },
  { id: "10000094", name: "Chiori", element: "Geo", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Chiori", sideIcon: "UI_AvatarIcon_Side_Chiori", avatarKey: "Chiori", release: "2024-03-11" },
  { id: "10000096", name: "Arlecchino", element: "Pyro", rarity: 5, weapon: "Polearm", icon: "UI_AvatarIcon_Arlecchino", sideIcon: "UI_AvatarIcon_Side_Arlecchino", avatarKey: "Arlecchino", release: "2024-04-22" },
  { id: "10000097", name: "Sethos", element: "Electro", rarity: 4, weapon: "Bow", icon: "UI_AvatarIcon_Sethos", sideIcon: "UI_AvatarIcon_Side_Sethos", avatarKey: "Sethos", release: "2024-06-03" },
  { id: "10000098", name: "Clorinde", element: "Electro", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Clorinde", sideIcon: "UI_AvatarIcon_Side_Clorinde", avatarKey: "Clorinde", release: "2024-06-03" },
  { id: "10000095", name: "Sigewinne", element: "Hydro", rarity: 5, weapon: "Bow", icon: "UI_AvatarIcon_Sigewinne", sideIcon: "UI_AvatarIcon_Side_Sigewinne", avatarKey: "Sigewinne", release: "2024-06-26" },
  { id: "10000099", name: "Emilie", element: "Dendro", rarity: 5, weapon: "Polearm", icon: "UI_AvatarIcon_Emilie", sideIcon: "UI_AvatarIcon_Side_Emilie", avatarKey: "Emilie", release: "2024-08-06" },
  { id: "10000100", name: "Kachina", element: "Geo", rarity: 4, weapon: "Polearm", icon: "UI_AvatarIcon_Kachina", sideIcon: "UI_AvatarIcon_Side_Kachina", avatarKey: "Kachina", release: "2024-08-26" },
  { id: "10000102", name: "Mualani", element: "Hydro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Mualani", sideIcon: "UI_AvatarIcon_Side_Mualani", avatarKey: "Mualani", release: "2024-08-26" },
  { id: "10000101", name: "Kinich", element: "Dendro", rarity: 5, weapon: "Claymore", icon: "UI_AvatarIcon_Kinich", sideIcon: "UI_AvatarIcon_Side_Kinich", avatarKey: "Kinich", release: "2024-09-17" },
  { id: "10000103", name: "Xilonen", element: "Geo", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Xilonen", sideIcon: "UI_AvatarIcon_Side_Xilonen", avatarKey: "Xilonen", release: "2024-10-07" },
  { id: "10000104", name: "Chasca", element: "Anemo", rarity: 5, weapon: "Bow", icon: "UI_AvatarIcon_Chasca", sideIcon: "UI_AvatarIcon_Side_Chasca", avatarKey: "Chasca", release: "2024-11-18" },
  { id: "10000105", name: "Ororon", element: "Electro", rarity: 4, weapon: "Bow", icon: "UI_AvatarIcon_Olorun", sideIcon: "UI_AvatarIcon_Side_Olorun", avatarKey: "Olorun", release: "2024-11-18" },
  { id: "10000106", name: "Mavuika", element: "Pyro", rarity: 5, weapon: "Claymore", icon: "UI_AvatarIcon_Mavuika", sideIcon: "UI_AvatarIcon_Side_Mavuika", avatarKey: "Mavuika", release: "2024-12-30" },
  { id: "10000107", name: "Citlali", element: "Cryo", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Citlali", sideIcon: "UI_AvatarIcon_Side_Citlali", avatarKey: "Citlali", release: "2024-12-30" },
  { id: "10000108", name: "Lan Yan", element: "Anemo", rarity: 4, weapon: "Catalyst", icon: "UI_AvatarIcon_Lanyan", sideIcon: "UI_AvatarIcon_Side_Lanyan", avatarKey: "Lanyan", release: "2025-01-21" },
  { id: "10000109", name: "Yumemizuki Mizuki", element: "Anemo", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Mizuki", sideIcon: "UI_AvatarIcon_Side_Mizuki", avatarKey: "Mizuki", release: "2025-02-10" },
  { id: "10000110", name: "Iansan", element: "Electro", rarity: 4, weapon: "Polearm", icon: "UI_AvatarIcon_Iansan", sideIcon: "UI_AvatarIcon_Side_Iansan", avatarKey: "Iansan", release: "2025-03-24" },
  { id: "10000111", name: "Varesa", element: "Electro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Varesa", sideIcon: "UI_AvatarIcon_Side_Varesa", avatarKey: "Varesa", release: "2025-03-24" },
  { id: "10000112", name: "Escoffier", element: "Cryo", rarity: 5, weapon: "Polearm", icon: "UI_AvatarIcon_Escoffier", sideIcon: "UI_AvatarIcon_Side_Escoffier", avatarKey: "Escoffier", release: "2025-05-05" },
  { id: "10000113", name: "Ifa", element: "Anemo", rarity: 4, weapon: "Catalyst", icon: "UI_AvatarIcon_Ifa", sideIcon: "UI_AvatarIcon_Side_Ifa", avatarKey: "Ifa", release: "2025-05-05" },
  { id: "10000114", name: "Skirk", element: "Cryo", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_SkirkNew", sideIcon: "UI_AvatarIcon_Side_SkirkNew", avatarKey: "SkirkNew", release: "2025-06-16" },
  { id: "10000115", name: "Dahlia", element: "Hydro", rarity: 4, weapon: "Sword", icon: "UI_AvatarIcon_Dahlia", sideIcon: "UI_AvatarIcon_Side_Dahlia", avatarKey: "Dahlia", release: "2025-06-16" },
  { id: "10000116", name: "Ineffa", element: "Electro", rarity: 5, weapon: "Polearm", icon: "UI_AvatarIcon_Ineffa", sideIcon: "UI_AvatarIcon_Side_Ineffa", avatarKey: "Ineffa", release: "2025-07-28" },
  { id: "10000119", name: "Lauma", element: "Dendro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Lauma", sideIcon: "UI_AvatarIcon_Side_Lauma", avatarKey: "Lauma", release: "2025-09-08" },
  { id: "10000121", name: "Aino", element: "Hydro", rarity: 4, weapon: "Claymore", icon: "UI_AvatarIcon_Aino", sideIcon: "UI_AvatarIcon_Side_Aino", avatarKey: "Aino", release: "2025-09-08" },
  { id: "10000120", name: "Flins", element: "Electro", rarity: 5, weapon: "Polearm", icon: "UI_AvatarIcon_Flins", sideIcon: "UI_AvatarIcon_Side_Flins", avatarKey: "Flins", release: "2025-09-30" },
  { id: "10000122", name: "Nefer", element: "Dendro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Nefer", sideIcon: "UI_AvatarIcon_Side_Nefer", avatarKey: "Nefer", release: "2025-10-20" },
  { id: "10000123", name: "Durin", element: "Pyro", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Durin", sideIcon: "UI_AvatarIcon_Side_Durin", avatarKey: "Durin", release: "2025-12-01" },
  { id: "10000124", name: "Jahoda", element: "Anemo", rarity: 4, weapon: "Bow", icon: "UI_AvatarIcon_Jahoda", sideIcon: "UI_AvatarIcon_Side_Jahoda", avatarKey: "Jahoda", release: "2025-12-01" },
  { id: "10000125", name: "Columbina", element: "Hydro", rarity: 5, weapon: "Catalyst", icon: "UI_AvatarIcon_Columbina", sideIcon: "UI_AvatarIcon_Side_Columbina", avatarKey: "Columbina", release: "2026-01-12" },
  { id: "10000126", name: "Zibai", element: "Geo", rarity: 5, weapon: "Sword", icon: "UI_AvatarIcon_Zibai", sideIcon: "UI_AvatarIcon_Side_Zibai", avatarKey: "Zibai", release: "2026-02-03" },
  { id: "10000127", name: "Illuga", element: "Geo", rarity: 4, weapon: "Polearm", icon: "UI_AvatarIcon_Illuga", sideIcon: "UI_AvatarIcon_Side_Illuga", avatarKey: "Illuga", release: "2026-02-03" },
  { id: "10000128", name: "Varka", element: "Anemo", rarity: 5, weapon: "Claymore", icon: "UI_AvatarIcon_Varka", sideIcon: "UI_AvatarIcon_Side_Varka", avatarKey: "Varka", release: "2026-02-23" },
];
