# Guild Major Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Guild from a static fan site into a full-stack app with Docker/Redis infrastructure, live data from Akasha/Twitch/Reddit APIs, cinematic wish simulator, and polished UI across all pages.

**Architecture:** Monolithic Next.js 16 with Docker Compose (app + Redis + worker). API routes serve cached data from Redis. Worker process runs cron jobs for live streamers and leak scraping. Akasha.cv replaces Enka for UID lookups. Local filesystem image serving via API route.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, ioredis, node-cron, Framer Motion, Docker Compose

**Design doc:** `docs/plans/2026-03-05-major-overhaul-design.md`

---

## Phase A: Infrastructure — Docker + Redis + Image API

### Task 1: Install dependencies and create Redis client

**Files:**
- Create: `src/lib/redis.ts`

**Step 1: Install ioredis and node-cron**

```bash
bun add ioredis node-cron
bun add -D @types/node-cron
```

**Step 2: Create Redis client with caching helper**

Create `src/lib/redis.ts`:

```typescript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 200, 2000);
  },
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

/**
 * Get cached value or fetch and cache.
 * Returns fetcher result directly if Redis is unavailable (graceful degradation).
 */
export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached) as T;
  } catch {
    // Redis unavailable — fall through to fetcher
  }

  const data = await fetcher();

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
  } catch {
    // Redis unavailable — data still returned
  }

  return data;
}

/**
 * Invalidate a cache key.
 */
export async function invalidateCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch {
    // ignore
  }
}

export default redis;
```

**Step 3: Verify build**

```bash
npx next build
```
Expected: Build passes (redis.ts is a library file, not imported yet).

**Step 4: Commit**

```bash
git add src/lib/redis.ts package.json bun.lock
git commit -m "feat: add Redis client with caching helper"
```

---

### Task 2: Create Docker Compose setup

**Files:**
- Create: `Dockerfile`
- Create: `Dockerfile.worker`
- Create: `docker-compose.yml`
- Create: `.dockerignore`

**Step 1: Create Dockerfile for Next.js app**

Create `Dockerfile`:

```dockerfile
FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev"]
```

**Step 2: Create Dockerfile for worker**

Create `Dockerfile.worker`:

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
CMD ["bun", "run", "src/worker/index.ts"]
```

**Step 3: Create docker-compose.yml**

```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - ./data/images:/app/data/images
    environment:
      - REDIS_URL=redis://redis:6379
      - TWITCH_CLIENT_ID=${TWITCH_CLIENT_ID}
      - TWITCH_CLIENT_SECRET=${TWITCH_CLIENT_SECRET}
      - YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

  worker:
    build:
      context: .
      dockerfile: Dockerfile.worker
    volumes:
      - .:/app
      - /app/node_modules
      - ./data/images:/app/data/images
    environment:
      - REDIS_URL=redis://redis:6379
      - TWITCH_CLIENT_ID=${TWITCH_CLIENT_ID}
      - TWITCH_CLIENT_SECRET=${TWITCH_CLIENT_SECRET}
      - YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
    depends_on:
      - redis

volumes:
  redis-data:
```

**Step 4: Create .dockerignore**

```
node_modules
.next
.git
docs
```

**Step 5: Create .env.example**

```
REDIS_URL=redis://redis:6379
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
YOUTUBE_API_KEY=
```

**Step 6: Commit**

```bash
git add Dockerfile Dockerfile.worker docker-compose.yml .dockerignore .env.example
git commit -m "feat: add Docker Compose with Redis and worker services"
```

---

### Task 3: Create worker process skeleton

**Files:**
- Create: `src/worker/index.ts`
- Create: `src/worker/jobs/cache.ts`

**Step 1: Create cache refresh job (placeholder)**

Create `src/worker/jobs/cache.ts`:

```typescript
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
```

**Step 2: Create worker entry point**

Create `src/worker/index.ts`:

```typescript
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
```

**Step 3: Commit**

```bash
git add src/worker/
git commit -m "feat: add worker process with Yatta cache refresh job"
```

---

### Task 4: Create image serving API route

**Files:**
- Create: `src/app/api/images/[...path]/route.ts`
- Modify: `src/lib/constants.ts`
- Modify: `src/lib/characters.ts`

**Step 1: Move images directory**

```bash
mkdir -p data/images
cp -r public/assets/* data/images/
```

**Step 2: Create image API route**

Create `src/app/api/images/[...path]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const IMAGE_ROOT = join(process.cwd(), "data", "images");

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filePath = join(IMAGE_ROOT, ...path);

  // Security: prevent path traversal
  if (!filePath.startsWith(IMAGE_ROOT)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = "." + filePath.split(".").pop()?.toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  try {
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Read error" }, { status: 500 });
  }
}
```

**Step 3: Update image URL helpers**

In `src/lib/constants.ts`, change:
```typescript
// Before:
export function weaponIconUrl(id: string) { return `/assets/weapons/${id}/icon.png`; }
export function elementIconUrl(element: string) { return `/assets/elements/${element.toLowerCase()}.png`; }

// After:
export function weaponIconUrl(id: string) { return `/api/images/weapons/${id}/icon.png`; }
export function elementIconUrl(element: string) { return `/api/images/elements/${element.toLowerCase()}.png`; }
```

In `src/lib/characters.ts`, change:
```typescript
// Before:
export function charIconUrl(id: string) { return `/assets/characters/${id}/icon.png`; }
export function charGachaUrl(id: string) { return `/assets/characters/${id}/gacha.png`; }
export function charSideUrl(id: string) { return `/assets/characters/${id}/side.png`; }

// After:
export function charIconUrl(id: string) { return `/api/images/characters/${id}/icon.png`; }
export function charGachaUrl(id: string) { return `/api/images/characters/${id}/gacha.png`; }
export function charSideUrl(id: string) { return `/api/images/characters/${id}/side.png`; }
```

**Step 4: Verify build**

```bash
npx next build
```

**Step 5: Commit**

```bash
git add src/app/api/images/ src/lib/constants.ts src/lib/characters.ts
git commit -m "feat: add image serving API route, decouple images from public/"
```

---

## Phase B: Quick Fixes — cleanDescription, Calendar, Talent Tab

### Task 5: Fix cleanDescription `{LINK#...}` parsing

**Files:**
- Modify: `src/lib/yatta/client.ts:117-137`

**Step 1: Update cleanDescription function**

In `src/lib/yatta/client.ts`, replace the `cleanDescription` function (lines 117-137):

```typescript
export function cleanDescription(desc: string): string {
  if (!desc) return "";
  let cleaned = desc;
  // Remove HTML-style color tags <color=#RRGGBB>
  cleaned = cleaned.replace(/<color=#[A-Fa-f0-9]+>/g, "");
  cleaned = cleaned.replace(/<\/color>/g, "");
  // Remove {LAYOUT_MOBILE#...} blocks (keep PC content)
  cleaned = cleaned.replace(/\{LAYOUT_MOBILE#[^}]*\}/g, "");
  cleaned = cleaned.replace(/\{LAYOUT_PC#([^}]*)\}/g, "$1");
  // Handle {LINK#id}text{/LINK} — keep the text, remove the tags (case-insensitive)
  cleaned = cleaned.replace(/\{LINK#[^}]*\}([\s\S]*?)\{\/LINK\}/gi, "$1");
  // Remove any remaining unclosed link tags
  cleaned = cleaned.replace(/\{link#[^}]*\}/gi, "");
  cleaned = cleaned.replace(/\{\/link\}/gi, "");
  // Remove {color#...} / {/color} tags
  cleaned = cleaned.replace(/\{color[^}]*\}/g, "");
  cleaned = cleaned.replace(/\{\/color\}/g, "");
  // Remove HTML italic tags
  cleaned = cleaned.replace(/<i>/g, "").replace(/<\/i>/g, "");
  // Clean up literal \n to actual newlines
  cleaned = cleaned.replace(/\\n/g, "\n");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  return cleaned.trim();
}
```

Key changes:
- Added `{LINK#id}text{/LINK}` pattern that preserves the linked text (e.g., "Four Winds' Ascension")
- Added `i` flag to all link regexes for case-insensitive matching
- Added `{/LINK}` closing tag cleanup

**Step 2: Verify build**

```bash
npx next build
```

**Step 3: Verify fix by checking a character detail page in dev**

```bash
bun run dev
# Navigate to a character with LINK tags (e.g., Varka) and check talent descriptions
```

**Step 4: Commit**

```bash
git add src/lib/yatta/client.ts
git commit -m "fix: cleanDescription now handles uppercase {LINK#...} tags correctly"
```

---

### Task 6: Fix talent tab readability

**Files:**
- Modify: `src/app/database/[id]/detail-client.tsx`

**Step 1: Improve talent description styling**

Find the talent description rendering in `detail-client.tsx` (around line 498 in TalentsTab). Increase font size, add spacing, and improve readability:

- Change talent description text from `text-sm` to `text-base`
- Add `leading-relaxed` for better line height
- Add visual separator between talent sections
- Ensure HighlightNumbers component renders at readable size

**Step 2: Verify build and check visually**

```bash
npx next build
```

**Step 3: Commit**

```bash
git add 'src/app/database/[id]/detail-client.tsx'
git commit -m "fix: improve talent tab text readability and spacing"
```

---

### Task 7: Fix calendar page overlapping UI

**Files:**
- Modify: `src/app/calendar/page.tsx`

**Step 1: Fix EventCard overlapping elements**

In `src/app/calendar/page.tsx`, find the EventCard component. The primogem highlight badge uses `absolute top-4 right-4` which overlaps with the status indicator. Fix:

- Remove `absolute` positioning from primo badge
- Place primo badge inline in the header flex row
- Ensure consistent spacing with `gap-2`
- Add `truncate` to event names that might overflow
- Fix responsive grid breakpoints: use `grid-cols-1 sm:grid-cols-2` consistently

**Step 2: Verify build**

```bash
npx next build
```

**Step 3: Commit**

```bash
git add src/app/calendar/page.tsx
git commit -m "fix: resolve calendar page overlapping elements"
```

---

## Phase C: Akasha API Integration

### Task 8: Create Akasha API client

**Files:**
- Create: `src/lib/akasha/client.ts`
- Create: `src/lib/akasha/types.ts`

**Step 1: Create types**

Create `src/lib/akasha/types.ts`:

```typescript
export interface AkashaWeapon {
  name: string;
  icon: string;
  weaponId: number;
  level: number;
  refinement: number;
  rarity: number;
}

export interface AkashaArtifactSet {
  count: number;
  icon: string;
}

export interface AkashaCalculation {
  calculationId: string;
  name: string;
  details: string;
  ranking: number;
  outOf: number;
  result: number;
  weapon: {
    name: string;
    rarity: number;
    refinement: number;
  };
}

export interface AkashaCharacter {
  id: string;
  name: string;
  characterId: number;
  constellation: number;
  icon: string;
  weapon: AkashaWeapon;
  artifactSets: Record<string, AkashaArtifactSet>;
  calculations: {
    fit?: AkashaCalculation;
  };
}

export interface AkashaProfile {
  uid: string;
  characters: AkashaCharacter[];
  fetchedAt: number;
}
```

**Step 2: Create Akasha client**

Create `src/lib/akasha/client.ts`:

```typescript
import { getCached } from "@/lib/redis";
import type { AkashaProfile, AkashaCharacter } from "./types";

const AKASHA_BASE = "https://akasha.cv/api";
const USER_AGENT = "Guild-GenshinApp/2.0";
const TIMEOUT_MS = 15000;

export async function fetchAkashaProfile(uid: string): Promise<AkashaProfile> {
  return getCached<AkashaProfile>(
    `guild:profile:${uid}`,
    300, // 5 min TTL
    () => fetchFromAkasha(uid)
  );
}

async function fetchFromAkasha(uid: string): Promise<AkashaProfile> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${AKASHA_BASE}/getCalculationsForUser/${uid}`, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Akasha API returned ${res.status}`);
    }

    const json = await res.json();
    const characters: AkashaCharacter[] = (json.data || []).map(
      (entry: Record<string, unknown>) => parseCharacter(entry)
    );

    return {
      uid,
      characters,
      fetchedAt: Date.now(),
    };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Akasha request timed out after 15 seconds");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

function parseCharacter(raw: Record<string, unknown>): AkashaCharacter {
  const weaponRaw = raw.weapon as Record<string, unknown> | undefined;
  const weaponInfo = weaponRaw?.weaponInfo as Record<string, unknown> | undefined;
  const refinementLevel = weaponInfo?.refinementLevel as Record<string, unknown> | undefined;

  return {
    id: String(raw._id || ""),
    name: String(raw.name || "Unknown"),
    characterId: Number(raw.characterId || 0),
    constellation: Number(raw.constellation || 0),
    icon: String(raw.icon || ""),
    weapon: {
      name: String(weaponRaw?.name || "Unknown"),
      icon: String(weaponRaw?.icon || ""),
      weaponId: Number(weaponRaw?.weaponId || 0),
      level: Number((weaponInfo?.level as number) || 1),
      refinement: Number((refinementLevel?.value as number) || 1),
      rarity: Number(weaponRaw?.rarity || 3),
    },
    artifactSets: (raw.artifactSets || {}) as Record<string, { count: number; icon: string }>,
    calculations: {
      fit: raw.calculations
        ? parseCalculation((raw.calculations as Record<string, unknown>).fit)
        : undefined,
    },
  };
}

function parseCalculation(
  raw: unknown
): AkashaCharacter["calculations"]["fit"] | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const calc = raw as Record<string, unknown>;
  const weapon = calc.weapon as Record<string, unknown> | undefined;
  return {
    calculationId: String(calc.calculationId || ""),
    name: String(calc.name || ""),
    details: String(calc.details || ""),
    ranking: Number(calc.ranking || 0),
    outOf: Number(calc.outOf || 0),
    result: Number(calc.result || 0),
    weapon: {
      name: String(weapon?.name || ""),
      rarity: Number(weapon?.rarity || 3),
      refinement: Number(weapon?.refinement || 1),
    },
  };
}
```

**Step 3: Verify build**

```bash
npx next build
```

**Step 4: Commit**

```bash
git add src/lib/akasha/
git commit -m "feat: add Akasha.cv API client with Redis caching"
```

---

### Task 9: Create profile API route and update profile page

**Files:**
- Create: `src/app/api/profile/[uid]/route.ts`
- Modify: `src/app/profile/[uid]/page.tsx`
- Modify: `src/components/profile/profile-client.tsx`

**Step 1: Create profile API route**

Create `src/app/api/profile/[uid]/route.ts`:

```typescript
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
```

**Step 2: Update profile [uid] server page**

Update `src/app/profile/[uid]/page.tsx` to call the API route instead of Enka directly. The page becomes a client-side fetch to `/api/profile/{uid}` so it works with both data sources.

**Step 3: Update profile-client.tsx**

Add Akasha-specific display:
- Leaderboard ranking badge per character (e.g., "Top 3.5% — #150 / 50,000")
- Damage calculation result
- Artifact set icons from Akasha data
- Keep existing scoring/roast system working with both data formats

**Step 4: Verify build**

```bash
npx next build
```

**Step 5: Commit**

```bash
git add src/app/api/profile/ src/app/profile/ src/components/profile/
git commit -m "feat: integrate Akasha API for UID lookups with Enka fallback"
```

---

## Phase D: Home Page Banner Rotation + Engagement

### Task 10: Implement character banner rotation

**Files:**
- Modify: `src/app/home-client.tsx`

**Step 1: Add character rotation state**

In `HomeClient` component, add:
- `activeCharIdx` state cycling through `featured5StarChars` array
- `activeWeaponIdx` state cycling through `featured5StarWeapons` array
- `useEffect` with 5-second interval for each rotation
- Navigation dots below each banner card

**Step 2: Update character banner card**

The character banner card should:
- Show `featured5StarChars[activeCharIdx]`'s gacha splash art as background
- Crossfade between characters using CSS `transition-opacity duration-700`
- All featured 5-star names listed, with active one highlighted (scale, glow)
- Banner end countdown always visible
- Clickable dots to manually select character

**Step 3: Update weapon banner card**

Same rotation pattern for weapons:
- Show `featured5StarWeapons[activeWeaponIdx]`'s icon prominently
- Cycle independently from character banner
- Navigation dots

**Step 4: Add engagement sections**

Add a "Today's Farming" quick strip below banners:
- Show today's talent book domain and farmable materials based on day of week
- Import `TALENT_BOOK_SCHEDULE` from `src/data/farming-schedule.ts`
- Link to calendar page

**Step 5: Verify build**

```bash
npx next build
```

**Step 6: Commit**

```bash
git add src/app/home-client.tsx
git commit -m "feat: add banner rotation with crossfade and daily farming strip"
```

---

## Phase E: Artifacts — Detail Page + Images

### Task 11: Create artifact detail page

**Files:**
- Create: `src/app/artifacts/[id]/page.tsx`
- Create: `src/app/artifacts/[id]/detail-client.tsx`
- Modify: `src/app/artifacts/page.tsx`

**Step 1: Create server page**

Create `src/app/artifacts/[id]/page.tsx` — fetches artifact set data from Yatta API (`https://gi.yatta.moe/api/v2/en/reliquary/{id}`).

**Step 2: Create detail client component**

Create `src/app/artifacts/[id]/detail-client.tsx`:

- Hero section with set icon, rarity gradient, and set name
- 2-piece and 4-piece bonus descriptions
- All 5 artifact pieces displayed with images from Yatta assets
  - Image URL: `https://gi.yatta.moe/assets/UI/reliquary/{pieceIcon}.png`
  - Show piece name, piece type (Flower/Plume/Sands/Goblet/Circlet)
- Domain location where the set drops
- Recommended characters that use this set (cross-reference with `character-guides.ts`)
- Lore/description tab

**Step 3: Update grid page**

In `src/app/artifacts/page.tsx`:
- Replace expandable cards with Link to `/artifacts/{id}`
- Show artifact piece preview thumbnails on hover
- Keep search, filter, sort functionality

**Step 4: Verify build**

```bash
npx next build
```

**Step 5: Commit**

```bash
git add src/app/artifacts/
git commit -m "feat: add artifact detail page with piece images and set bonuses"
```

---

## Phase F: Abyss Page — Latest Data + Boss Images

### Task 12: Update abyss data with boss images

**Files:**
- Modify: `src/data/abyss.ts`
- Modify: `src/app/abyss/page.tsx`

**Step 1: Update abyss data**

In `src/data/abyss.ts`:
- Add `icon` and `image` fields to `AbyssBoss` interface
- Add `description` field with boss mechanic descriptions
- Add `phases` array for attack phase breakdowns
- Update enemy data with Yatta monster icon paths
- Boss image URLs: `https://gi.yatta.moe/assets/UI/monster/{monsterIcon}.png`
- Research current Spiral Abyss rotation from community sources

**Step 2: Update abyss page UI**

In `src/app/abyss/page.tsx`:
- Add boss cards with large images from Yatta assets
- Show HP bars and resistance charts with element icons
- Display phase/attack pattern descriptions
- Team comp cards with actual character icons from local assets
- Enemy lineup as icon strips with element indicators
- Add difficulty indicators per chamber

**Step 3: Verify build**

```bash
npx next build
```

**Step 4: Commit**

```bash
git add src/data/abyss.ts src/app/abyss/page.tsx
git commit -m "feat: update abyss page with boss images, descriptions, and latest data"
```

---

## Phase G: Wish Simulator — Cinematic Animations

### Task 13: Create wish animation component

**Files:**
- Create: `src/components/simulator/wish-animation.tsx`
- Modify: `src/app/simulator/page.tsx`

**Step 1: Create WishAnimation component**

Create `src/components/simulator/wish-animation.tsx` using Framer Motion:

**3-Star Animation:**
- Blue meteor streak: `motion.div` with `x: [-100, window.innerWidth]` over 0.5s
- Blue burst particles on impact
- Card fade-in with blue border glow
- Total duration: ~1s

**4-Star Animation:**
- Purple meteor with trailing particle divs (CSS `@keyframes`)
- Brief screen flash (white overlay opacity 0→0.3→0)
- Card slides up from bottom with `y: [200, 0]`, purple glow shadow
- Name + type text revealed with `opacity: [0, 1]` delay
- Total duration: ~1.5s

**5-Star Animation:**
- Golden meteor shower: multiple `motion.div` elements with staggered `x`/`y` paths
- Screen goes white: overlay `opacity: [0, 1, 0]` over 0.5s
- Dramatic slow reveal: golden silhouette scales from 0.5→1.0 over 1s
- Particle explosion: 20+ small divs with random trajectories using `Math.random()` transforms
- Persistent golden glow: `box-shadow` with `0 0 60px rgba(251, 191, 36, 0.4)`
- Name reveal with scale-up text animation
- Total duration: ~3s

**Skip button:**
- Always visible in bottom-right corner
- Clicking skips to result state immediately

**10-Pull Sequence:**
- State machine: process each pull sequentially
- 3-star: auto-advance after 0.5s
- 4-star: auto-advance after 1.5s
- 5-star: full animation, wait for click or 3s timeout
- After all 10: summary screen with grid of all results

**Step 2: Integrate into simulator page**

In `src/app/simulator/page.tsx`:
- Import WishAnimation component
- Add animation state: `idle | animating | result`
- When pulling: set state to `animating`, pass pull results to WishAnimation
- WishAnimation calls `onComplete` when done, returning to `result` state
- Results display shows after animation

**Step 3: Improve artifact roller**

In the artifact roller section of `src/app/simulator/page.tsx`:
- Add all artifact domains (fetch domain list from Yatta or hardcode ~20 domains)
- Add +4/+8/+12/+16/+20 upgrade simulation
- Show Crit Value (CV = CR×2 + CD) calculation
- Improve visual layout to match wish simulator quality

**Step 4: Verify build**

```bash
npx next build
```

**Step 5: Commit**

```bash
git add src/components/simulator/ src/app/simulator/page.tsx
git commit -m "feat: add cinematic wish animations and improve artifact roller"
```

---

## Phase H: Live Streamers — Twitch/YouTube Cron

### Task 14: Create streamer polling cron job

**Files:**
- Create: `src/worker/jobs/streamers.ts`
- Create: `src/app/api/streamers/route.ts`
- Modify: `src/worker/index.ts`
- Modify: `src/app/streamers/page.tsx`

**Step 1: Create streamer polling job**

Create `src/worker/jobs/streamers.ts`:

```typescript
import redis from "../../lib/redis";

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
}

async function getTwitchToken(): Promise<string> {
  const cached = await redis.get("guild:twitch:token");
  if (cached) return cached;

  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
  });

  const data = await res.json();
  const token = data.access_token;
  await redis.setex("guild:twitch:token", data.expires_in - 60, token);
  return token;
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
  const data = await res.json();

  return (data.data || []).map((s: Record<string, unknown>) => ({
    name: s.user_name,
    platform: "twitch" as const,
    title: s.title,
    viewers: s.viewer_count,
    thumbnail: (s.thumbnail_url as string)
      .replace("{width}", "440")
      .replace("{height}", "248"),
    url: `https://twitch.tv/${s.user_login}`,
    startedAt: s.started_at,
    profileImage: "",
  }));
}

async function fetchYouTubeStreamers(): Promise<LiveStreamer[]> {
  if (!YOUTUBE_API_KEY) return [];

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&eventType=live&q=Genshin+Impact&maxResults=10&key=${YOUTUBE_API_KEY}`
  );

  if (!res.ok) return [];
  const data = await res.json();

  return (data.items || []).map((item: Record<string, unknown>) => {
    const snippet = item.snippet as Record<string, unknown>;
    const thumbnails = snippet.thumbnails as Record<string, Record<string, unknown>>;
    return {
      name: snippet.channelTitle,
      platform: "youtube" as const,
      title: snippet.title,
      viewers: 0, // YouTube Search API doesn't return viewer count
      thumbnail: (thumbnails.medium as Record<string, unknown>)?.url || "",
      url: `https://youtube.com/watch?v=${(item.id as Record<string, unknown>).videoId}`,
      startedAt: snippet.publishedAt,
      profileImage: "",
    };
  });
}

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

    await redis.setex(
      "guild:streamers:live",
      600, // 10 min TTL
      JSON.stringify(all)
    );

    console.log(`[Streamers] Cached ${all.length} live streams`);
  } catch (err) {
    console.error("[Streamers] Poll failed:", err);
  }
}
```

**Step 2: Create API route**

Create `src/app/api/streamers/route.ts`:

```typescript
import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET() {
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
```

**Step 3: Register cron in worker**

Add to `src/worker/index.ts`:

```typescript
import { pollStreamers } from "./jobs/streamers";

// Every 5 minutes: poll live streamers
cron.schedule("*/5 * * * *", async () => {
  await pollStreamers();
});

// Run on startup
pollStreamers().catch(console.error);
```

**Step 4: Update streamers page**

Update `src/app/streamers/page.tsx`:
- Add "Live Now" section at top that fetches from `/api/streamers`
- Show real thumbnails, viewer counts, stream titles
- Cards link directly to streamer channels
- Loading skeleton while fetching
- Keep "Featured Creators" section below with curated list
- Add profile images for creators (use Twitch/YouTube API to fetch and cache)

**Step 5: Verify build**

```bash
npx next build
```

**Step 6: Commit**

```bash
git add src/worker/jobs/streamers.ts src/app/api/streamers/ src/worker/index.ts src/app/streamers/page.tsx
git commit -m "feat: add live streamer polling from Twitch/YouTube APIs"
```

---

## Phase I: Leaks — Reddit Scraping Cron

### Task 15: Create leak scraping cron job

**Files:**
- Create: `src/worker/jobs/leaks.ts`
- Create: `src/app/api/leaks/route.ts`
- Modify: `src/worker/index.ts`
- Modify: `src/app/leaks/page.tsx`

**Step 1: Create Reddit scraper**

Create `src/worker/jobs/leaks.ts`:

```typescript
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

    await redis.setex(
      "guild:leaks:posts",
      3600, // 1 hour TTL
      JSON.stringify(posts)
    );

    console.log(`[Leaks] Cached ${posts.length} leak posts`);
  } catch (err) {
    console.error("[Leaks] Scrape failed:", err);
  }
}
```

**Step 2: Create API route**

Create `src/app/api/leaks/route.ts`:

```typescript
import { NextResponse } from "next/server";
import redis from "@/lib/redis";

export async function GET() {
  try {
    const cached = await redis.get("guild:leaks:posts");
    if (cached) {
      return NextResponse.json({
        posts: JSON.parse(cached),
        lastUpdated: Date.now(),
      });
    }
  } catch {
    // Redis unavailable
  }
  return NextResponse.json({ posts: [], lastUpdated: null });
}
```

**Step 3: Register cron in worker**

Add to `src/worker/index.ts`:

```typescript
import { scrapeRedditLeaks } from "./jobs/leaks";

// Every 30 minutes: scrape Reddit leaks
cron.schedule("*/30 * * * *", async () => {
  await scrapeRedditLeaks();
});

// Run on startup
scrapeRedditLeaks().catch(console.error);
```

**Step 4: Update leaks page**

Update `src/app/leaks/page.tsx`:
- Fetch from `/api/leaks` instead of hardcoded data
- Show "Last updated N minutes ago" timestamp
- Keep existing UI: category/reliability filters, blur spoiler protection
- Add post source attribution (Reddit icon + link) and score
- Add image previews for posts that have thumbnails
- Handle empty state when Redis has no data (show "Fetching leaks..." or fallback to static data)

**Step 5: Verify build**

```bash
npx next build
```

**Step 6: Commit**

```bash
git add src/worker/jobs/leaks.ts src/app/api/leaks/ src/worker/index.ts src/app/leaks/page.tsx
git commit -m "feat: add Reddit leak scraping cron job and dynamic leaks page"
```

---

## Verification Checklist

After all phases complete, verify:

- [ ] `docker compose up` starts all 3 services
- [ ] Redis connects and caching works
- [ ] `npx next build` passes with zero errors
- [ ] Home page banners rotate every 5 seconds with crossfade
- [ ] Character talent descriptions no longer show `{LINK#...}` tags
- [ ] Calendar page has no overlapping elements
- [ ] UID lookup works via Akasha API (test with UID 756131205)
- [ ] Artifact detail pages show piece images
- [ ] Abyss page shows boss images and descriptions
- [ ] Wish simulator plays cinematic animations for each rarity
- [ ] Artifact roller has all domains and upgrade simulation
- [ ] `/api/streamers` returns live stream data (requires Twitch/YouTube API keys)
- [ ] `/api/leaks` returns Reddit leak posts
- [ ] All pages render correctly on mobile (bottom nav + responsive layouts)
