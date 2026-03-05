import { fetchEnkaProfile } from "@/lib/enka/client";
import { fetchAkashaProfile } from "@/lib/akasha/client";
import { ProfileClient } from "@/components/profile/profile-client";
import Link from "next/link";
import type { AkashaCalculation } from "@/lib/akasha/types";

export default async function ProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;

  // Fetch both sources in parallel — Akasha for rankings, Enka for full profile
  const [akashaResult, enkaResult] = await Promise.allSettled([
    fetchAkashaProfile(uid),
    fetchEnkaProfile(uid),
  ]);

  const akashaProfile = akashaResult.status === "fulfilled" ? akashaResult.value : null;
  const enkaProfile = enkaResult.status === "fulfilled" ? enkaResult.value : null;

  if (akashaResult.status === "rejected") {
    console.warn(`[Profile] Akasha failed for ${uid}:`, akashaResult.reason);
  }

  // Enka is required for the full profile display (player info, artifacts, etc.)
  if (!enkaProfile) {
    const error = enkaResult.status === "rejected"
      ? (enkaResult.reason instanceof Error ? enkaResult.reason.message : "Failed to fetch profile")
      : "Unknown error";

    return (
      <div className="max-w-md mx-auto mt-32 text-center space-y-4">
        <h1 className="text-2xl font-bold text-guild-danger">Error</h1>
        <p className="text-guild-muted">{error}</p>
        <p className="text-sm text-guild-dim">Make sure the UID is correct and the player&apos;s Character Showcase is public.</p>
        <Link href={`/profile/${uid}`} className="inline-block mt-2 px-4 py-2 rounded-md bg-guild-accent hover:bg-guild-accent/80 text-sm font-medium transition-colors">
          Try Again
        </Link>
      </div>
    );
  }

  if (enkaProfile.characters.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-32 text-center space-y-4">
        <h1 className="text-2xl font-bold">{enkaProfile.player.nickname}</h1>
        <p className="text-guild-muted">AR {enkaProfile.player.level} · UID: {uid}</p>
        <div className="guild-card p-6 space-y-2">
          <p className="text-lg">No characters in showcase</p>
          <p className="text-sm text-guild-dim">
            This player hasn&apos;t added characters to their Character Showcase, or it&apos;s set to private.
          </p>
          <p className="text-sm text-guild-dim">
            Go to in-game Profile → Character Showcase → add characters and make it public.
          </p>
        </div>
      </div>
    );
  }

  // Build rankings map from Akasha data, keyed by character name
  const rankings: Record<string, AkashaCalculation> = {};
  if (akashaProfile) {
    for (const char of akashaProfile.characters) {
      if (char.calculations.fit) {
        rankings[char.name] = char.calculations.fit;
      }
    }
  }

  const source: "akasha" | "enka" = akashaProfile ? "akasha" : "enka";

  return <ProfileClient profile={enkaProfile} rankings={rankings} source={source} />;
}
