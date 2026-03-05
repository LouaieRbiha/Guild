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
    title: `${name} - Genshin Impact Character | Guild`,
    description: `${name} character details, talents, constellations, and build guide for Genshin Impact.`,
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

  return <CharacterDetailClient detail={detail} entry={entry} />;
}
