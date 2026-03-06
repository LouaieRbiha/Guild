import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Characters',
  description: 'Browse all Genshin Impact characters — filter by element, weapon type, and rarity. View stats, builds, and tier rankings.',
  openGraph: {
    title: 'Characters — Genshin Impact Database',
    description: 'Browse all Genshin Impact characters with filters for element, weapon, and rarity.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
