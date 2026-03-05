export interface Banner {
  name: string;
  image: string;
  start: string;
  end: string;
  featured5Star: string[];
  featured4Star: string[];
  type: "character" | "weapon" | "chronicled";
  version: string;
}

export interface ActiveBanners {
  character: Banner | null;
  weapon: Banner | null;
  chronicled: Banner | null;
}

export interface BannerCharacterInfo {
  name: string;
  id: string;
  element: string;
  icon: string;
  rarity: number;
}

export interface BannerWeaponInfo {
  name: string;
  id: number;
  type: string;
  icon: string;
  rarity: number;
}
