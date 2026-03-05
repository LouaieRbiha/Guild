# Guild Major Overhaul — Design Document

**Date:** 2026-03-05
**Status:** Draft — awaiting approval

---

## 1. Infrastructure: Docker + Redis

### Architecture

```
docker-compose.yml
├── app (Next.js 16)          — port 3000
├── redis (Redis 7)           — port 6379
└── worker (Node.js cron)     — no port, runs scheduled jobs
```

### Docker Compose Services

**`app`**: Next.js dev server with volume mounts for hot reload. Connects to Redis via `REDIS_URL=redis://redis:6379`. Serves the frontend and API routes.

**`redis`**: Redis 7 Alpine. Persistent volume for data. Used for:
- API response caching (Akasha, Yatta, Enka responses with TTL)
- Live streamer status (refreshed every 5 minutes)
- Scraped leak data (refreshed every 30 minutes)
- Rate limit tracking

**`worker`**: Node.js script using `node-cron`. Runs scheduled tasks:
- Every 5 min: Poll Twitch/YouTube APIs for live Genshin streamers
- Every 30 min: Scrape Reddit (r/Genshin_Impact_Leaks) for new leak posts
- Every 6 hours: Refresh Yatta API cache (characters, weapons, artifacts)

### New Files

```
docker-compose.yml
Dockerfile
Dockerfile.worker
src/lib/redis.ts              — Redis client (ioredis)
src/worker/index.ts           — Cron job runner
src/worker/jobs/streamers.ts  — Twitch/YouTube polling
src/worker/jobs/leaks.ts      — Reddit/Twitter scraping
src/worker/jobs/cache.ts      — API data pre-caching
```

### Redis Client (`src/lib/redis.ts`)

```typescript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export async function getCached<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

export default redis;
```

### API Routes

New Next.js API routes that read from Redis:

| Route | Purpose |
|-------|---------|
| `GET /api/streamers` | Returns live streamer data from Redis |
| `GET /api/leaks` | Returns scraped leak posts from Redis |
| `GET /api/profile/[uid]` | Proxied Akasha/Enka lookup with Redis caching |
| `GET /api/images/[...path]` | Serves images from `/data/images/` with cache headers |

### Image Serving

Images move from `/public/assets/` to `/data/images/` (a Docker-mounted volume). The API route `/api/images/[...path]` serves them with proper cache-control headers. This decouples image storage from the Next.js build.

Helper functions (`charIconUrl`, `weaponIconUrl`, etc.) update to point to `/api/images/characters/{id}/icon.png` etc.

---

## 2. Home Page Overhaul

### Banner Rotation (Character Banners)

Currently the home page shows both character banners side-by-side on desktop. The user wants them to **rotate** — showing one featured character's splash art at a time, cycling every 5 seconds. For example: Varka's splash → 5s → Flins's splash → 5s → repeat.

**Implementation:**
- `featured5StarChars` is an array (e.g., `[Varka, Flins]`). Add a `activeCharIdx` state that cycles through this array.
- The character banner card uses `featured5StarChars[activeCharIdx]` for splash art, name highlight, and element badge.
- All featured 5-star names remain listed, but the active one is visually emphasized (larger text, glow effect).
- Transition: CSS `opacity` + `scale` animation for smooth crossfade between splash arts.
- Navigation dots below the banner card, one per featured 5-star. Clicking a dot jumps to that character.
- Banner end countdown is always visible.

**Weapon Banner:**
- Same rotation pattern for `featured5StarWeapons`.
- Show one weapon's icon prominently at a time, cycling every 5 seconds.
- All weapon names listed; active one highlighted.

### Home Page Engagement Improvements

Add these sections to make the home page more compelling:

1. **Hero Section** — Keep current UID lookup, but add animated background particles (subtle primogem-shaped) using CSS keyframes.

2. **Active Banners** — Redesigned with rotation as described above. Both character and weapon banners visible (2-column on desktop), each rotating their featured items independently.

3. **Quick Stats Row** — Keep: banner countdown, abyss reset, featured count. Add: current version number, days until next patch.

4. **Quick Navigation** — Keep the 6-card grid linking to main sections.

5. **Fresh Drops** — Keep the newest 5 characters carousel.

6. **Daily Quick Tip** — New: Show today's talent book domain and farmable characters. Rotates daily based on day of week. Links to calendar.

---

## 3. UID Lookup — Akasha API Integration

### Replace Enka with Akasha

The current Enka integration (`src/lib/enka/client.ts`) will be replaced with Akasha.cv as the primary data source.

**Primary endpoint:** `GET https://akasha.cv/api/getCalculationsForUser/{uid}`

This returns:
- Character builds with weapon, artifact sets, constellation count
- Leaderboard rankings (rank N out of M)
- Damage calculation results
- Character icons

**Fallback:** Keep Enka.Network as fallback when Akasha is down (429/503).

### New File: `src/lib/akasha/client.ts`

```typescript
interface AkashaCharacter {
  name: string;
  characterId: number;
  constellation: number;
  icon: string;
  weapon: { name: string; icon: string; level: number; refinement: number };
  artifactSets: Record<string, { count: number; icon: string }>;
  calculations: {
    fit: {
      ranking: number;
      outOf: number;
      result: number;
      weapon: { name: string; rarity: number; refinement: number };
    };
  };
}

export async function fetchAkashaProfile(uid: string): Promise<AkashaProfile> {
  // Fetch with custom User-Agent
  // Cache in Redis with 5-minute TTL
  // Parse and normalize data
  // Fall back to Enka on error
}
```

### Profile Page Updates

The profile display (`profile-client.tsx`) will be updated to show:
- **Leaderboard rank** per character (e.g., "Top 3.5% — Rank 150 / 50,000")
- Damage calculation results
- Artifact set display with icons from Akasha
- Keep existing scoring/roast system as a separate tab or section

### API Route: `/api/profile/[uid]/route.ts`

Server-side route that:
1. Checks Redis cache for the UID
2. If miss: calls Akasha API, caches result with 5-min TTL
3. Returns normalized profile data
4. On Akasha failure: falls back to Enka

---

## 4. Live Streamers — Twitch/YouTube Integration

### Cron Worker: `src/worker/jobs/streamers.ts`

**Twitch API:**
- Use Twitch Helix API (`https://api.twitch.tv/helix/streams`)
- Query: `?game_id=513181` (Genshin Impact game ID on Twitch)
- Returns: live streams with title, viewer count, thumbnail, streamer name
- Requires: Client ID + OAuth token (stored in `.env`)
- Refresh: Every 5 minutes

**YouTube API:**
- Use YouTube Data API v3 (`https://www.googleapis.com/youtube/v3/search`)
- Query: `?part=snippet&type=video&eventType=live&q=Genshin+Impact`
- Returns: live streams with title, channel, thumbnail
- Requires: API key (stored in `.env`)
- Refresh: Every 5 minutes

### Redis Storage

```
key: "guild:streamers:live"
value: JSON array of { name, platform, title, viewers, thumbnail, url, startedAt }
TTL: 10 minutes (stale data acceptable for 5 min between refreshes)
```

### Streamers Page Updates

- **Live Now** section at top: real data from `/api/streamers`
- Streamer cards show actual thumbnails, real viewer counts, links to streams
- **Featured Creators** section below: keep current curated list with actual profile images (fetched from Twitch/YouTube API and cached)
- Community Resources section: keep current

---

## 5. Leaks — Reddit/Twitter Scraping

### Cron Worker: `src/worker/jobs/leaks.ts`

**Reddit scraping:**
- Use Reddit's JSON feed: `https://www.reddit.com/r/Genshin_Impact_Leaks/hot.json`
- No OAuth needed for `.json` endpoint (public subreddit)
- Parse posts: title, body, score, flair, thumbnail, created_utc, permalink
- Filter: only posts with score > 50 and flair containing "Reliable" or "Questionable"
- Extract reliability from flair tags

**Twitter/X scraping:**
- Use Nitter instances or RSS feeds as alternative to paid API
- Monitor known leak accounts: @gaboratory, @meraboratory, @haboratory (Hxg_diluc alternatives)
- Parse: tweet text, images, timestamp

### Redis Storage

```
key: "guild:leaks:posts"
value: JSON array of leak posts with { title, body, source, reliability, category, imageUrl, timestamp, url }
TTL: 1 hour
```

### Leaks Page Updates

- Fetch from `/api/leaks` instead of hardcoded data
- Keep existing UI: category/reliability filters, blur spoiler protection
- Add: post source attribution (Reddit/Twitter), direct link to original post
- Add: "Last updated" timestamp

---

## 6. Artifacts Page — Detail Pages + Images

### Current Problem

The artifacts page shows expandable cards inline. No dedicated detail page. Artifact piece images aren't shown (only set icons).

### Solution

**New route: `/artifacts/[id]`**

Detail page for each artifact set, showing:
- Hero section with set icon and name
- 2-piece and 4-piece set bonuses
- All 5 artifact pieces with images (Flower, Plume, Sands, Goblet, Circlet)
- Each piece shows: name, image, piece type
- Domain where the set drops (data from Yatta API)
- Recommended characters that use this set

**Artifact images:** The Yatta API provides artifact piece images. Each piece has an `icon` field. URL format: `https://gi.yatta.moe/assets/UI/reliquary/{icon}.png`

### Grid Page Updates

- Cards link to `/artifacts/{id}` instead of expanding inline
- Show artifact piece thumbnails in a row on hover
- Better loading skeleton

---

## 7. Wish Simulator — Cinematic Animations

### Animation Phases

**3-Star Pull:**
- Brief blue meteor streak across screen (0.5s)
- Card reveal with blue burst particle effect
- Quick fade — no dramatic delay

**4-Star Pull:**
- Purple meteor with trailing particles (1s)
- Screen flash
- Card slides in from bottom with purple glow
- Name + weapon/character type revealed

**5-Star Pull:**
- Golden meteor shower across screen (1.5s)
- Screen goes white briefly
- Dramatic slow reveal: golden silhouette → full character/weapon reveal
- Particle explosion with golden stars
- Persistent golden glow around the card
- Name revealed with fanfare-style text animation

### 10-Pull Sequence

- Play meteors for all 10 in sequence (blue skip fast, purple pause briefly, gold full animation)
- After all reveals: summary screen showing all 10 results
- Skip button available at all times

### Implementation

- Use Framer Motion (already installed) for animations
- CSS `@keyframes` for particles and glow effects
- State machine: `idle → pulling → revealing → result`
- New component: `WishAnimation.tsx` with render phases

### Artifact Roller Improvements

- Add all domains from Yatta API (`/api/v2/en/domain` or hardcode the ~20 artifact domains)
- Better substat roll logic: accurate +4/+8/+12/+16/+20 upgrade simulation
- Show Crit Value (CV) calculation: `CR×2 + CD`
- Visual upgrade animation when leveling
- Domain selection with artifact set icons

---

## 8. Abyss Page — Latest Data + Boss Images

### Data Updates

Update `src/data/abyss.ts` with latest Spiral Abyss rotation. Add:
- Boss images from Yatta API: `https://gi.yatta.moe/assets/UI/monster/{icon}.png`
- Boss descriptions and lore snippets
- Enemy elemental shields and weaknesses with visual icons
- Phase/attack pattern descriptions

### UI Improvements

- Boss cards with large images, HP bars, resistance charts
- Enemy lineup shown as icon strips with element indicators
- Interactive resistance table: click an element to see effective/ineffective
- Team comp cards with actual character icons (link to database pages)
- Chamber difficulty indicators (stars earned by community average)

### New Fields in Data

```typescript
interface AbyssBoss {
  name: string;
  icon: string;        // Yatta monster icon path
  image: string;       // Larger image for card
  description: string; // Boss lore/mechanic description
  hp: string;
  resistances: EnemyResistance[];
  weaknesses: string[];
  tips: string[];
  phases?: string[];   // Attack phase descriptions
}
```

---

## 9. Calendar Page — Fix Overlapping UI

### Issues

1. The primogem highlight badge (`absolute top-4 right-4`) overlaps with the status indicator in event cards
2. DailyChecklist/PrimogemCalculator grid breaks at certain breakpoints

### Fixes

- Move primo badge into the event card's flex header row (remove `absolute` positioning)
- Use consistent responsive breakpoints: `grid-cols-1 sm:grid-cols-2` for event sections
- Add proper `gap` and `min-h` to prevent overlap
- Ensure countdown text doesn't overflow on mobile
- Add `truncate` to long event names

---

## 10. Talent Tab — Fix `{LINK#...}` Parsing

### Root Cause

`cleanDescription()` in `src/lib/yatta/client.ts` uses case-sensitive regex:
```
/\{link#[^}]*\}/g
```

The Yatta API returns `{LINK#N11280002}` (uppercase), which doesn't match.

### Fix

1. Add `i` flag for case-insensitive matching
2. Handle the `{LINK#...}text{/LINK}` pattern properly — extract the text between tags instead of deleting everything

**Updated regex:**
```typescript
// Remove link tags but keep the text content between them
cleaned = cleaned.replace(/\{LINK#[^}]*\}(.*?)\{\/LINK\}/gi, "$1");
// Fallback: remove any remaining unclosed link tags
cleaned = cleaned.replace(/\{link#[^}]*\}/gi, "");
cleaned = cleaned.replace(/\{\/link\}/gi, "");
```

This preserves the skill name text like "Four Winds' Ascension" while removing the `{LINK#N11280002}` wrapper.

### Talent Tab Engagement

- Increase font size from `text-sm` to `text-base` for descriptions
- Add visual separators between talent sections
- Show talent scaling values in a formatted table instead of inline text
- Add talent material icons next to upgrade costs

---

## 11. Implementation Order

| Phase | Items | Dependencies |
|-------|-------|-------------|
| **Phase A** | Docker + Redis + image API route | None |
| **Phase B** | Fix `cleanDescription`, calendar overlap, talent tab UI | None |
| **Phase C** | Akasha API integration, update profile page | Phase A (Redis) |
| **Phase D** | Home page banner rotation + engagement | None |
| **Phase E** | Artifacts detail page + images | None |
| **Phase F** | Abyss data update + boss images | None |
| **Phase G** | Wish simulator cinematic animations | None |
| **Phase H** | Streamer cron + live page | Phase A (Redis, worker) |
| **Phase I** | Leaks cron + page update | Phase A (Redis, worker) |

Phases B, D, E, F, G can run in parallel since they have no infrastructure dependencies. Phases C, H, I depend on Phase A (Docker/Redis).

---

## 12. New Dependencies

```
ioredis          — Redis client
node-cron        — Scheduled task runner
sharp            — Image processing (resize, format conversion)
```

### Environment Variables (`.env`)

```
REDIS_URL=redis://redis:6379
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
YOUTUBE_API_KEY=...
```
