import cron from "node-cron";
import { refreshYattaCache } from "./jobs/cache";

console.log("[Worker] Starting Guild worker process...");

// Every 6 hours: refresh API caches
cron.schedule("0 */6 * * *", async () => {
  console.log("[Worker] Running cache refresh...");
  await refreshYattaCache();
});

// Run cache refresh on startup
refreshYattaCache().catch(console.error);

console.log("[Worker] Cron jobs scheduled.");
