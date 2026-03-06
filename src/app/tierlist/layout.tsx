import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tier List',
  description: 'Genshin Impact tier list based on live Spiral Abyss and Stygian Onslaught usage rates. See which characters are SS, S, A, B, and C tier.',
  openGraph: {
    title: 'Tier List — Genshin Impact',
    description: 'Live tier list based on Spiral Abyss and Stygian Onslaught usage data.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
