import { ALL_CHARACTERS } from '@/lib/characters';
import { ALL_WEAPONS } from '@/lib/weapons';
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://guild.gg';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '', '/database', '/weapons', '/artifacts', '/calendar',
    '/abyss', '/map', '/simulator', '/wordle', '/streamers', '/profile',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const characterRoutes = ALL_CHARACTERS.map((c) => ({
    url: `${BASE_URL}/database/${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  const weaponRoutes = ALL_WEAPONS.map((w) => ({
    url: `${BASE_URL}/weapons/${w.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...characterRoutes, ...weaponRoutes];
}
