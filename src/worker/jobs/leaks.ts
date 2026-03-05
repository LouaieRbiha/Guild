import redis from "../../lib/redis";

interface LeakPost {
  id: string;
  title: string;
  body: string;
  source: "reddit" | "twitter";
  reliability: "reliable" | "questionable" | "speculative";
  category: string;
  imageUrl: string | null;
  timestamp: number;
  url: string;
  score: number;
  flair: string;
}

const FLAIR_RELIABILITY: Record<string, LeakPost["reliability"]> = {
  Reliable: "reliable",
  "Reliable Leaker": "reliable",
  Questionable: "questionable",
  Speculation: "speculative",
  "General Discussion": "speculative",
};

function categorizePost(title: string, flair: string): string {
  const lower = (title + " " + flair).toLowerCase();

  if (lower.includes("character") || lower.includes("kit") || lower.includes("constellation"))
    return "character";
  if (lower.includes("weapon")) return "weapon";
  if (lower.includes("event") || lower.includes("web event")) return "event";
  if (lower.includes("banner")) return "banner";
  if (lower.includes("story") || lower.includes("archon") || lower.includes("quest"))
    return "story";

  return "system";
}

export async function scrapeRedditLeaks(): Promise<void> {
  console.log("[Leaks] Scraping Reddit...");

  try {
    const res = await fetch(
      "https://www.reddit.com/r/Genshin_Impact_Leaks/hot.json?limit=50",
      {
        headers: {
          "User-Agent": "Guild-GenshinApp/2.0 (by /u/guildapp)",
        },
      }
    );

    if (!res.ok) {
      console.error(`[Leaks] Reddit returned ${res.status}`);
      return;
    }

    const data = await res.json();
    const posts: LeakPost[] = [];

    for (const child of data?.data?.children || []) {
      const post = child.data;

      // Skip pinned/stickied posts and low-score posts
      if (post.stickied || post.score < 50) continue;

      const flair = post.link_flair_text || "";

      posts.push({
        id: post.id,
        title: post.title,
        body: (post.selftext || "").slice(0, 500),
        source: "reddit",
        reliability: FLAIR_RELIABILITY[flair] || "speculative",
        category: categorizePost(post.title, flair),
        imageUrl: post.thumbnail?.startsWith("http") ? post.thumbnail : null,
        timestamp: post.created_utc * 1000,
        url: `https://reddit.com${post.permalink}`,
        score: post.score,
        flair,
      });
    }

    await redis.setex("guild:leaks:posts", 3600, JSON.stringify(posts));

    console.log(`[Leaks] Cached ${posts.length} leak posts`);
  } catch (err) {
    console.error("[Leaks] Scrape failed:", err);
  }
}
