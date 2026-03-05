import { NextRequest, NextResponse } from "next/server";
import { fetchAkashaProfile } from "@/lib/akasha/client";
import { fetchEnkaProfile } from "@/lib/enka/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  if (!/^\d{9,10}$/.test(uid)) {
    return NextResponse.json(
      { error: "Invalid UID format. Must be 9-10 digits." },
      { status: 400 }
    );
  }

  // Try Akasha first, fall back to Enka
  try {
    const profile = await fetchAkashaProfile(uid);
    return NextResponse.json({ source: "akasha", ...profile });
  } catch (akashaErr) {
    console.warn(`[Profile] Akasha failed for ${uid}:`, akashaErr);

    try {
      const enkaProfile = await fetchEnkaProfile(uid);
      return NextResponse.json({ source: "enka", ...enkaProfile });
    } catch (enkaErr) {
      console.error(`[Profile] Both APIs failed for ${uid}:`, enkaErr);
      return NextResponse.json(
        { error: "Could not fetch profile. Both Akasha and Enka APIs are unavailable." },
        { status: 502 }
      );
    }
  }
}
