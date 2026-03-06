import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Endgame Guide',
  description: 'Spiral Abyss and Stygian Onslaught guide for Genshin Impact — floor breakdowns, boss mechanics, live usage rates, and recommended team compositions.',
  openGraph: {
    title: 'Endgame Guide — Genshin Impact',
    description: 'Spiral Abyss floors, boss mechanics, usage rates, and recommended teams.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
