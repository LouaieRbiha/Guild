import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Character Comparison',
  description: 'Compare Genshin Impact characters side by side — tier rankings, recommended builds, artifact sets, substat priorities, and team compositions.',
  openGraph: {
    title: 'Character Comparison — Genshin Impact',
    description: 'Compare characters side by side with builds, tiers, and team comps.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
