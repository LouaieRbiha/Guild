export const ENKA_UI = "https://enka.network/ui";
export const YATTA_ASSETS = "https://gi.yatta.moe/assets/UI";

export const ELEMENT_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  Pyro:    { text: "text-red-400",    bg: "bg-red-500/20",    border: "border-red-500/30" },
  Hydro:   { text: "text-blue-400",   bg: "bg-blue-500/20",   border: "border-blue-500/30" },
  Anemo:   { text: "text-teal-300",   bg: "bg-teal-500/20",   border: "border-teal-500/30" },
  Cryo:    { text: "text-cyan-300",   bg: "bg-cyan-500/20",   border: "border-cyan-500/30" },
  Electro: { text: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30" },
  Geo:     { text: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30" },
  Dendro:  { text: "text-green-400",  bg: "bg-green-500/20",  border: "border-green-500/30" },
};

export const RARITY_COLORS: Record<number, { text: string; bg: string; border: string; star: string }> = {
  5: { text: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", star: "text-amber-400" },
  4: { text: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30", star: "text-purple-400" },
  3: { text: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", star: "text-blue-400" },
};

export const MAT_RARITY_BORDER: Record<number, string> = {
  1: "border-gray-600",
  2: "border-green-600",
  3: "border-blue-600",
  4: "border-purple-600",
  5: "border-amber-600",
};

export const MAT_RARITY_BG: Record<number, string> = {
  1: "bg-gray-700/60",
  2: "bg-green-900/40",
  3: "bg-blue-900/40",
  4: "bg-purple-900/40",
  5: "bg-amber-900/40",
};

export const SUBSTAT_COLORS: Record<string, string> = {
  "CRIT Rate": "text-red-400",
  "CRIT DMG": "text-orange-400",
  "ATK%": "text-yellow-400",
  "HP%": "text-green-400",
  "DEF%": "text-cyan-400",
  "Energy Recharge": "text-purple-400",
  "Elemental Mastery": "text-emerald-400",
  "Physical DMG%": "text-gray-300",
  "Physical DMG Bonus": "text-gray-300",
};
