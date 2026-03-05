import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(): Promise<NextResponse> {
  try {
    const cached = await redis.get("guild:leaks:posts");
    if (cached) {
      return NextResponse.json({
        posts: JSON.parse(cached),
        lastUpdated: Date.now(),
      });
    }
  } catch {
    // Redis unavailable — return empty fallback
  }

  return NextResponse.json({ posts: [], lastUpdated: null });
}
