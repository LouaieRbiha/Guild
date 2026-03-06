import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resin Planner',
  description: 'Plan your weekly Genshin Impact resin spending — track farming goals for talent books, weapon materials, bosses, and artifacts with a day-by-day schedule.',
  openGraph: {
    title: 'Resin Planner — Genshin Impact',
    description: 'Plan your weekly resin budget across talent books, weapon materials, and bosses.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
