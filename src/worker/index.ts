import cron from "node-cron";
import { refreshYattaCache } from "./jobs/cache";
import { scrapeRedditLeaks } from "./jobs/leaks";
import { pollStreamers } from "./jobs/streamers";

console.log("[Worker] Starting Guild worker process...");

// Every 6 hours: refresh API caches
cron.schedule("0 */6 * * *", async () => {
  console.log("[Worker] Running cache refresh...");
  await refreshYattaCache();
});

// Every 30 minutes: scrape Reddit for leaks
cron.schedule("*/30 * * * *", async () => {
  console.log("[Worker] Running leak scrape...");
  await scrapeRedditLeaks();
});

// Every 5 minutes: poll live streamers
cron.schedule("*/5 * * * *", async () => {
  console.log("[Worker] Running streamer poll...");
  await pollStreamers();
});

// Run cache refresh on startup
refreshYattaCache().catch(console.error);

// Run leak scrape on startup
scrapeRedditLeaks().catch(console.error);

// Run streamer poll on startup
pollStreamers().catch(console.error);

console.log("[Worker] Cron jobs scheduled.");
