import { fetchWeaponDetail } from "@/lib/yatta/client";
import { ALL_WEAPONS } from "@/lib/weapons";
import { WeaponDetailClient } from "./detail-client";
import { notFound } from "next/navigation";

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
