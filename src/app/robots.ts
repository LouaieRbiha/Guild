import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/leaks'],
    },
    sitemap: 'https://guild.gg/sitemap.xml',
  };
}
