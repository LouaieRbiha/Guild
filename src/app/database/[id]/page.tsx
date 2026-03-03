import { fetchCharacterDetail } from "@/lib/yatta/client";
import { ALL_CHARACTERS, ENKA_UI, ELEMENT_COLORS } from "@/lib/characters";
import { CharacterDetailClient } from "./detail-client";
import { notFound } from "next/navigation";

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
