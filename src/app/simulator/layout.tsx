import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wish Simulator',
  description: 'Genshin Impact wish simulator and artifact roller — simulate character and weapon banner pulls with accurate pity, 50/50, and Capturing Radiance mechanics.',
  openGraph: {
    title: 'Wish Simulator — Genshin Impact',
    description: 'Simulate wishes with accurate pity and 50/50 mechanics, plus an artifact roller.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
