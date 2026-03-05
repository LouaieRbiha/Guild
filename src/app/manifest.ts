import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Guild - Genshin Impact Companion',
    short_name: 'Guild',
    description: 'Character database, tier lists, build guides, and tools for Genshin Impact',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#d4a853',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
