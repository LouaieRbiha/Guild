import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Team Compositions',
  description: 'Popular Genshin Impact team compositions with elemental resonance info, difficulty ratings, and synergy breakdowns for every archetype.',
  openGraph: {
    title: 'Team Compositions — Genshin Impact',
    description: 'Popular team comps with elemental resonance and synergy breakdowns.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
