import { getActiveBanners, findWeaponByName } from "@/lib/banners/client";
import { ALL_CHARACTERS } from "@/lib/characters";
import type { CharacterEntry } from "@/lib/characters";
import type { BannerWeaponInfo } from "@/lib/banners/types";
import { HomeClient } from "./home-client";

export default async function HomePage() {
  const banners = await getActiveBanners();

  // Newest 5 characters (array sorted oldest-first, newest at end)
  const newestCharacters = ALL_CHARACTERS.slice(-5).reverse();

  // Resolve featured characters from banner names to full CharacterEntry objects
  const featured5StarChars: CharacterEntry[] = [];
  const featured4StarChars: CharacterEntry[] = [];

  if (banners.character) {
    for (const name of banners.character.featured5Star) {
      const char = ALL_CHARACTERS.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (char) featured5StarChars.push(char);
    }
    for (const name of banners.character.featured4Star) {
      const char = ALL_CHARACTERS.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (char) featured4StarChars.push(char);
    }
  }

  // Resolve featured weapons from banner names
  const featured5StarWeapons: BannerWeaponInfo[] = [];
  if (banners.weapon) {
    for (const name of banners.weapon.featured5Star) {
      const weapon = findWeaponByName(name);
      if (weapon) featured5StarWeapons.push(weapon);
    }
  }

  return (
    <HomeClient
      banners={banners}
      newestCharacters={newestCharacters}
      featured5StarChars={featured5StarChars}
      featured4StarChars={featured4StarChars}
      featured5StarWeapons={featured5StarWeapons}
    />
  );
}
