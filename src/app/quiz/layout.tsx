import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiz',
  description: 'Test your Genshin Impact knowledge — identify characters from silhouettes, guess elements, and answer build questions across three quiz modes.',
  openGraph: {
    title: 'Quiz — Genshin Impact',
    description: 'Test your Genshin Impact knowledge with character, element, and build quizzes.',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
