import redis from "../../lib/redis";

export async function refreshYattaCache(): Promise<void> {
  console.log("[Cache] Refreshing Yatta API data...");

  try {
    // Pre-fetch character list
    const charRes = await fetch("https://gi.yatta.moe/api/v2/en/avatar");
    if (charRes.ok) {
      const data = await charRes.json();
      await redis.setex("guild:yatta:characters", 21600, JSON.stringify(data));
      console.log("[Cache] Characters cached");
    }

    // Pre-fetch weapon list
    const weaponRes = await fetch("https://gi.yatta.moe/api/v2/en/weapon");
    if (weaponRes.ok) {
      const data = await weaponRes.json();
      await redis.setex("guild:yatta:weapons", 21600, JSON.stringify(data));
      console.log("[Cache] Weapons cached");
    }

    // Pre-fetch artifact sets
    const artifactRes = await fetch("https://gi.yatta.moe/api/v2/en/reliquary");
    if (artifactRes.ok) {
      const data = await artifactRes.json();
      await redis.setex("guild:yatta:artifacts", 21600, JSON.stringify(data));
      console.log("[Cache] Artifacts cached");
    }
  } catch (err) {
    console.error("[Cache] Refresh failed:", err);
  }
}
