import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Weapons',
  description: 'Browse the full Genshin Impact weapon database — search by type, rarity, and substat. Compare swords, claymores, polearms, bows, and catalysts.',
  openGraph: {
    title: 'Weapons — Genshin Impact Database',
    description: 'Full Genshin Impact weapon database with search, filters, and detailed stats.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
