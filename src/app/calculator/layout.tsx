import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Damage Calculator',
  description: 'Genshin Impact damage calculator — compute expected damage with the full damage formula including DEF, RES, elemental reactions, and crit averaging.',
  openGraph: {
    title: 'Damage Calculator — Genshin Impact',
    description: 'Calculate expected damage with the full Genshin Impact damage formula.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
