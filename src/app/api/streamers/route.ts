import { NextResponse } from "next/server";
import redis from "@/lib/redis";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || "";
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

interface LiveStreamer {
  name: string;
  platform: "twitch" | "youtube";
  title: string;
  viewers: number;
  thumbnail: string;
  url: string;
  startedAt: string;
  profileImage: string;
  language: string;
}

// ── Twitch helpers ──────────────────────────────────────────────────────

let cachedTwitchToken: { token: string; expiresAt: number } | null = null;

async function getTwitchToken(): Promise<string | null> {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) return null;

  // Check in-memory cache first
  if (cachedTwitchToken && cachedTwitchToken.expiresAt > Date.now()) {
    return cachedTwitchToken.token;
  }

  // Check Redis cache
  try {
    const redisToken = await redis.get("guild:twitch:token");
    if (redisToken) {
      cachedTwitchToken = { token: redisToken, expiresAt: Date.now() + 3000_000 };
      return redisToken;
    }
  } catch {
    // Redis unavailable
  }

  try {
    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    });

    if (!res.ok) return null;

    const data = await res.json();
    const token = data.access_token as string;
    const expiresIn = (data.expires_in as number) || 3600;

    cachedTwitchToken = { token, expiresAt: Date.now() + (expiresIn - 60) * 1000 };

    try {
      await redis.setex("guild:twitch:token", expiresIn - 60, token);
    } catch {
      // Redis unavailable
    }

    return token;
  } catch {
    return null;
  }
}

interface TwitchStream {
  user_id: string;
  user_name: string;
  user_login: string;
  title: string;
  viewer_count: number;
  thumbnail_url: string;
  started_at: string;
  language: string;
}

interface TwitchUser {
  id: string;
  profile_image_url: string;
}

async function fetchTwitchProfileImages(
  userIds: string[],
  token: string,
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (userIds.length === 0) return map;

  try {
    const params = userIds.map((id) => `id=${id}`).join("&");
    const res = await fetch(
      `https://api.twitch.tv/helix/users?${params}`,
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (res.ok) {
      const data = (await res.json()) as { data?: TwitchUser[] };
      for (const user of data.data || []) {
        map.set(user.id, user.profile_image_url);
      }
    }
  } catch {
    // Ignore — profile images are optional
  }

  return map;
}

async function fetchTwitchLive(): Promise<LiveStreamer[]> {
  const token = await getTwitchToken();
  if (!token) return [];

  try {
    // Genshin Impact game ID on Twitch: 513181
    const res = await fetch(
      "https://api.twitch.tv/helix/streams?game_id=513181&first=20",
      {
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          Authorization: `Bearer ${token}`,
        },
        next: { revalidate: 120 },
      },
    );

    if (!res.ok) return [];

    const data = (await res.json()) as { data?: TwitchStream[] };
    const streams = data.data || [];

    // Fetch profile images for all streamers in one batch
    const userIds = streams.map((s) => s.user_id);
    const profileImages = await fetchTwitchProfileImages(userIds, token);

    return streams.map((s) => ({
      name: s.user_name,
      platform: "twitch" as const,
      title: s.title,
      viewers: s.viewer_count,
      thumbnail: s.thumbnail_url
        .replace("{width}", "440")
        .replace("{height}", "248"),
      url: `https://twitch.tv/${s.user_login}`,
      startedAt: s.started_at,
      profileImage: profileImages.get(s.user_id) || "",
      language: s.language || "en",
    }));
  } catch {
    return [];
  }
}

// ── YouTube helpers ─────────────────────────────────────────────────────

async function fetchYouTubeLive(): Promise<LiveStreamer[]> {
  if (!YOUTUBE_API_KEY) return [];

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&q=Genshin+Impact&maxResults=10&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 120 } },
    );

    if (!res.ok) return [];

    const data = await res.json();

    return (data.items || []).map(
      (item: {
        id: { videoId: string };
        snippet: {
          channelTitle: string;
          title: string;
          publishedAt: string;
          thumbnails: { medium?: { url: string } };
        };
      }) => ({
        name: item.snippet.channelTitle,
        platform: "youtube" as const,
        title: item.snippet.title,
        viewers: 0,
        thumbnail: item.snippet.thumbnails.medium?.url || "",
        url: `https://youtube.com/watch?v=${item.id.videoId}`,
        startedAt: item.snippet.publishedAt,
        profileImage: "",
        language: "unknown",
      }),
    );
  } catch {
    return [];
  }
}

// ── Route handler ───────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  // 1. Try Redis cache first (populated by worker)
  try {
    const cached = await redis.get("guild:streamers:live");
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }
  } catch {
    // Redis unavailable
  }

  // 2. Direct fetch fallback when Redis is empty / no worker running
  const [twitch, youtube] = await Promise.allSettled([
    fetchTwitchLive(),
    fetchYouTubeLive(),
  ]);

  const twitchStreams = twitch.status === "fulfilled" ? twitch.value : [];
  const youtubeStreams = youtube.status === "fulfilled" ? youtube.value : [];
  // Dedup: skip YouTube streamers whose name matches a Twitch streamer
  const twitchNames = new Set(twitchStreams.map((s) => s.name.toLowerCase()));
  const dedupedYoutube = youtubeStreams.filter(
    (yt) => !twitchNames.has(yt.name.toLowerCase()),
  );

  // Sort by language priority (EN > FR > other), then by viewers
  const LANG_PRIORITY: Record<string, number> = { en: 0, fr: 1 };
  const all = [...twitchStreams, ...dedupedYoutube].sort((a, b) => {
    const langA = LANG_PRIORITY[a.language] ?? 2;
    const langB = LANG_PRIORITY[b.language] ?? 2;
    if (langA !== langB) return langA - langB;
    return b.viewers - a.viewers;
  });

  // Cache the result in Redis if available
  if (all.length > 0) {
    try {
      await redis.setex("guild:streamers:live", 300, JSON.stringify(all));
    } catch {
      // Redis unavailable
    }
  }

  return NextResponse.json(all);
}
