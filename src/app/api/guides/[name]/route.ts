import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  try {
    const cached = await redis.get(`guild:guides:${slug}`);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }
  } catch {
    // Redis unavailable
  }

  return NextResponse.json(null);
}
