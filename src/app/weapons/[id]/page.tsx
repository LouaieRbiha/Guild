import type { Metadata } from 'next';
import { fetchWeaponDetail } from "@/lib/yatta/client";
import { ALL_WEAPONS } from "@/lib/weapons";
import { WeaponDetailClient } from "./detail-client";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return ALL_WEAPONS.map((w) => ({ id: String(w.id) }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const weapon = ALL_WEAPONS.find((w) => String(w.id) === id);
  const name = weapon?.name ?? id;
  return {
    title: `${name} — Genshin Impact Weapon`,
    description: `${name} weapon stats, refinement effects, and best characters in Genshin Impact.`,
    openGraph: {
      title: `${name} — Genshin Impact Weapon`,
      description: `${name} stats, refinement details, and recommended characters.`,
    },
  };
}

export default async function WeaponDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const entry = ALL_WEAPONS.find((w) => String(w.id) === id);
  if (!entry) notFound();

  let detail;
  try {
    detail = await fetchWeaponDetail(id);
  } catch {
    notFound();
  }

  return <WeaponDetailClient detail={detail} entry={entry} />;
}
