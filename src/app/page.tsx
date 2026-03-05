import { getActiveBanner } from "@/data/banners";
import { ALL_CHARACTERS } from "@/lib/characters";
import { ALL_WEAPONS } from "@/lib/weapons";
import type { CharacterEntry } from "@/lib/characters";
import type { BannerWeaponInfo } from "@/lib/banners/types";
import { HomeClient } from "./home-client";

export default async function HomePage() {
  const banner = getActiveBanner();

  // Newest 5 characters (array sorted oldest-first, newest at end)
  const newestCharacters = ALL_CHARACTERS.slice(-5).reverse();

  // Resolve featured characters from banner names to full CharacterEntry objects
  const featured5StarChars: CharacterEntry[] = [];
  const featured4StarChars: CharacterEntry[] = [];

  if (banner) {
    for (const name of banner.characters.featured5) {
      const char = ALL_CHARACTERS.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (char) featured5StarChars.push(char);
    }
    for (const name of banner.characters.featured4) {
      const char = ALL_CHARACTERS.find(
        (c) => c.name.toLowerCase() === name.toLowerCase()
      );
      if (char) featured4StarChars.push(char);
    }
  }

  // Resolve featured weapons from banner names
  const featured5StarWeapons: BannerWeaponInfo[] = [];
  if (banner) {
    for (const name of banner.weapons.featured5) {
      const weapon = ALL_WEAPONS.find(
        (w) => w.name.toLowerCase() === name.toLowerCase()
      );
      if (weapon) {
        featured5StarWeapons.push({
          name: weapon.name,
          id: weapon.id,
          type: weapon.type,
          icon: weapon.icon,
          rarity: weapon.rarity,
        });
      }
    }
  }

  // Build the banners object in the shape HomeClient expects
  const banners = {
    character: banner
      ? {
          name: "Character Event Wish",
          image: "",
          start: banner.start,
          end: banner.end,
          featured5Star: banner.characters.featured5,
          featured4Star: banner.characters.featured4,
          type: "character" as const,
          version: banner.version,
        }
      : null,
    weapon: banner
      ? {
          name: "Epitome Invocation",
          image: "",
          start: banner.start,
          end: banner.end,
          featured5Star: banner.weapons.featured5,
          featured4Star: banner.weapons.featured4,
          type: "weapon" as const,
          version: banner.version,
        }
      : null,
    chronicled: null,
  };

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
