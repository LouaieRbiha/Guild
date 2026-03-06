import { Suspense } from 'react';
import type { Metadata } from 'next';
import { fetchCharacterDetail } from "@/lib/yatta/client";
import { ALL_CHARACTERS } from "@/lib/characters";
import { CharacterDetailClient } from "./detail-client";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return ALL_CHARACTERS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const char = ALL_CHARACTERS.find((c) => c.id === id);
  const name = char?.name ?? id;
  return {
    title: `${name} — Genshin Impact Character`,
    description: `Build guide, talents, constellations, and best artifacts for ${name} in Genshin Impact.`,
    openGraph: {
      title: `${name} — Genshin Impact Character`,
      description: `Build guide, talents, constellations, and best artifacts for ${name}.`,
    },
  };
}

export default async function CharacterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Find static entry for icon/element info
  const entry = ALL_CHARACTERS.find((c) => c.id === id);
  if (!entry) notFound();

  let detail;
  try {
    detail = await fetchCharacterDetail(id);
  } catch {
    notFound();
  }

  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CharacterDetailClient detail={detail} entry={entry} />
    </Suspense>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      <div className="h-4 w-32 bg-guild-elevated rounded" />
      <div className="guild-card p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-80 h-96 bg-guild-elevated shrink-0" />
          <div className="flex-1 p-6 space-y-4">
            <div className="h-8 w-48 bg-guild-elevated rounded" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-guild-elevated rounded-full" />
              <div className="h-6 w-16 bg-guild-elevated rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-guild-elevated rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
