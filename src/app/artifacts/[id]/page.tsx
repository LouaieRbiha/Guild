import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArtifactDetailClient } from "./detail-client";
import { cleanDescription } from "@/lib/yatta/client";

// ── Types ──────────────────────────────────────────────────────────────

interface ArtifactSuitPiece {
  name: string;
  description: string;
  icon: string;
  story: string;
}

interface ArtifactDetailData {
  id: number;
  name: string;
  maxRarity: number;
  icon: string;
  bonuses: { label: string; description: string }[];
  pieces: {
    slot: string;
    slotLabel: string;
    name: string;
    description: string;
    icon: string;
    story: string;
  }[];
}

const SUIT_KEY_LABELS: Record<string, string> = {
  EQUIP_BRACER: "Flower of Life",
  EQUIP_NECKLACE: "Plume of Death",
  EQUIP_SHOES: "Sands of Eon",
  EQUIP_RING: "Goblet of Eonothem",
  EQUIP_DRESS: "Circlet of Logos",
};

const SUIT_KEY_ORDER = [
  "EQUIP_BRACER",
  "EQUIP_NECKLACE",
  "EQUIP_SHOES",
  "EQUIP_RING",
  "EQUIP_DRESS",
];

// ── Data fetching ──────────────────────────────────────────────────────

async function fetchArtifactDetail(id: string): Promise<ArtifactDetailData> {
  const res = await fetch(`https://gi.yatta.moe/api/v2/en/reliquary/${id}`, {
    headers: { "User-Agent": "Guild-GenshinApp/1.0" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Yatta API error: ${res.status}`);
  const json = await res.json();
  const d = json.data;

  const levelList: number[] = d.levelList || [];
  const maxRarity = levelList.length > 0 ? Math.max(...levelList) : 3;

  const affixEntries = Object.values(d.affixList || {}) as string[];
  const bonuses: { label: string; description: string }[] = [];
  if (affixEntries.length === 1) {
    bonuses.push({ label: "1-Piece", description: affixEntries[0] });
  } else if (affixEntries.length >= 2) {
    bonuses.push({ label: "2-Piece", description: affixEntries[0] });
    bonuses.push({ label: "4-Piece", description: affixEntries[1] });
  }

  const suit: Record<string, ArtifactSuitPiece> = d.suit || {};
  const pieces = SUIT_KEY_ORDER
    .filter((key) => suit[key])
    .map((key) => ({
      slot: key,
      slotLabel: SUIT_KEY_LABELS[key] || key,
      name: suit[key].name,
      description: cleanDescription(suit[key].description || ""),
      icon: suit[key].icon,
      story: cleanDescription(suit[key].story || ""),
    }));

  return {
    id: d.id,
    name: d.name || "Unknown",
    maxRarity,
    icon: d.icon || "",
    bonuses,
    pieces,
  };
}

// ── Dynamic metadata ───────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    const detail = await fetchArtifactDetail(id);
    return {
      title: `${detail.name} - Artifact Set | Guild`,
      description: detail.bonuses.map((b) => `${b.label}: ${b.description}`).join(" | "),
    };
  } catch {
    return { title: "Artifact Set | Guild" };
  }
}

// ── Page component ─────────────────────────────────────────────────────

export default async function ArtifactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let detail: ArtifactDetailData;
  try {
    detail = await fetchArtifactDetail(id);
  } catch {
    notFound();
  }

  return <ArtifactDetailClient detail={detail} />;
}
