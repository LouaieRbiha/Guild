import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(): Promise<NextResponse> {
  try {
    const cached = await redis.get("guild:streamers:live");
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }
  } catch {
    // Redis unavailable
  }

  return NextResponse.json([]);
}
