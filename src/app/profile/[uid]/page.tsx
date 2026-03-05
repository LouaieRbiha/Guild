import { fetchEnkaProfile } from "@/lib/enka/client";
import { ProfileClient } from "@/components/profile/profile-client";
import Link from "next/link";

export default async function ProfilePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;

  let profile;
  let error: string | null = null;

  try {
    profile = await fetchEnkaProfile(uid);
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "Failed to fetch profile";
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto mt-32 text-center space-y-4">
        <h1 className="text-2xl font-bold text-guild-danger">Error</h1>
        <p className="text-guild-muted">{error || "Unknown error"}</p>
        <p className="text-sm text-guild-dim">Make sure the UID is correct and the player&apos;s Character Showcase is public.</p>
        <Link href={`/profile/${uid}`} className="inline-block mt-2 px-4 py-2 rounded-md bg-guild-accent hover:bg-guild-accent/80 text-sm font-medium transition-colors">
          Try Again
        </Link>
      </div>
    );
  }

  if (profile.characters.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-32 text-center space-y-4">
        <h1 className="text-2xl font-bold">{profile.player.nickname}</h1>
        <p className="text-guild-muted">AR {profile.player.level} · UID: {uid}</p>
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

  return <ProfileClient profile={profile} />;
}
