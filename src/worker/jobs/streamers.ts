import redis from "../../lib/redis";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || "";
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "";
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";

// ── Types ──────────────────────────────────────────────────────────────────

interface LiveStreamer {
  name: string;
  platform: "twitch" | "youtube";
  title: string;
  viewers: number;
  thumbnail: string;
  url: string;
  startedAt: string;
  profileImage: string;
}

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
}

interface TwitchStream {
  user_name: string;
  user_login: string;
  title: string;
  viewer_count: number;
  thumbnail_url: string;
  started_at: string;
}

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    channelTitle: string;
    title: string;
    publishedAt: string;
    thumbnails: {
      medium?: { url: string };
    };
  };
}

// ── Twitch ─────────────────────────────────────────────────────────────────

async function getTwitchToken(): Promise<string> {
  const cached = await redis.get("guild:twitch:token");
  if (cached) return cached;

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
  });

  const data = (await res.json()) as TwitchTokenResponse;
  await redis.setex("guild:twitch:token", data.expires_in - 60, data.access_token);
  return data.access_token;
}

async function fetchTwitchStreamers(): Promise<LiveStreamer[]> {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) return [];

  const token = await getTwitchToken();

  // Genshin Impact game ID on Twitch: 513181
  const res = await fetch(
    "https://api.twitch.tv/helix/streams?game_id=513181&first=20",
    {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) return [];

  const data = (await res.json()) as { data?: TwitchStream[] };

  return (data.data || []).map((s) => ({
    name: s.user_name,
    platform: "twitch" as const,
    title: s.title,
    viewers: s.viewer_count,
    thumbnail: s.thumbnail_url
      .replace("{width}", "440")
      .replace("{height}", "248"),
    url: `https://twitch.tv/${s.user_login}`,
    startedAt: s.started_at,
    profileImage: "",
  }));
}

// ── YouTube ────────────────────────────────────────────────────────────────

async function fetchYouTubeStreamers(): Promise<LiveStreamer[]> {
  if (!YOUTUBE_API_KEY) return [];

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&q=Genshin+Impact&maxResults=10&key=${YOUTUBE_API_KEY}`
  );

  if (!res.ok) return [];

  const data = (await res.json()) as { items?: YouTubeSearchItem[] };

  return (data.items || []).map((item) => ({
    name: item.snippet.channelTitle,
    platform: "youtube" as const,
    title: item.snippet.title,
    viewers: 0,
    thumbnail: item.snippet.thumbnails.medium?.url || "",
    url: `https://youtube.com/watch?v=${item.id.videoId}`,
    startedAt: item.snippet.publishedAt,
    profileImage: "",
  }));
}

// ── Main ───────────────────────────────────────────────────────────────────

export async function pollStreamers(): Promise<void> {
  console.log("[Streamers] Polling live streams...");

  try {
    const [twitch, youtube] = await Promise.all([
      fetchTwitchStreamers(),
      fetchYouTubeStreamers(),
    ]);

    const all = [...twitch, ...youtube].sort(
      (a, b) => b.viewers - a.viewers
    );

    await redis.setex("guild:streamers:live", 600, JSON.stringify(all));

    console.log(`[Streamers] Cached ${all.length} live streams`);
  } catch (err) {
    console.error("[Streamers] Poll failed:", err);
  }
}
