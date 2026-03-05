# Guild Enhancement Pass v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance Guild across all pages — streamer improvements, Akasha-style profile UI, KQM guide scraping, 3D wish animations, artifact roller revamp, calendar/abyss content, and visual quality pass.

**Architecture:** All changes within existing Next.js 16 monolith. New deps: `@react-three/fiber`, `@react-three/drei`, `three` for 3D wish star. KQM scraper added to existing worker. All image improvements use existing Yatta CDN. When tasks are completed, remove the corresponding line from `tasks.md`.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Three.js, ioredis, node-cron

**Design doc:** `docs/plans/2026-03-05-enhancement-pass-v2-design.md`

---

## Phase A: Quick Wins — Sidebar, Image Quality, Skip Fix

### Task 1: Live sidebar red dot animation

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

**Step 1: Add pulsing red dot to the "Live" nav item**

In the nav items rendering loop (around line 83-104), add a special case for the "Live" label. After the text `<span>` for "Live", add a pulsing red dot:

```tsx
{item.label === "Live" && (
  <span className="relative flex h-2 w-2 ml-1">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
  </span>
)}
```

This uses Tailwind's built-in `animate-ping` for the pulsing effect. The dot should appear next to the label text, so place it inside the label wrapper that is shown on sidebar hover/expand.

**Step 2: Verify build**

```bash
npx next build
```

**Step 3: Commit and remove from tasks.md**

```bash
git add src/components/layout/sidebar.tsx
git commit -m "feat: add pulsing red dot to Live sidebar item"
```

Remove line 14 from `tasks.md` ("the live icon on the sidebar...").

---

### Task 2: Wish simulator skip shows results

**Files:**
- Modify: `src/components/simulator/wish-animation.tsx`

**Step 1: Change skip behavior**

In the `WishAnimation` component, find the skip button's `onClick` handler which currently calls `onComplete()`. Change it to set `currentIndex` to `results.length` (which should trigger the summary view). The component already has a summary grid that shows when all animations are done.

Find the skip button (look for "Skip" text or `SkipForward` icon):

```tsx
// Before:
onClick={() => onComplete()}

// After:
onClick={() => setCurrentIndex(results.length)}
```

**Step 2: Ensure the summary screen has a "Back to Simulator" button**

After the summary grid (the section that shows when `currentIndex >= results.length`), add or verify there's a button:

```tsx
<button
  onClick={onComplete}
  className="mt-6 px-6 py-3 rounded-lg bg-guild-accent hover:bg-guild-accent/80 text-white font-medium transition-colors cursor-pointer"
>
  Back to Simulator
</button>
```

**Step 3: Verify build**

```bash
npx next build
```

**Step 4: Commit and remove from tasks.md**

```bash
git add src/components/simulator/wish-animation.tsx
git commit -m "fix: wish skip now shows results before returning to simulator"
```

Remove line 12 from `tasks.md` ("When pressing skip on the wish simulator...").

---

### Task 3: Character page and database grid high quality images

**Files:**
- Modify: `src/app/database/page.tsx`
- Modify: `src/app/database/[id]/detail-client.tsx`

**Step 1: Database grid image quality**

In `src/app/database/page.tsx`, find the `CharacterCard` component's `<Image>` (around line 432). Change `quality={95}` to `quality={100}`.

**Step 2: Detail page hero quality**

In `src/app/database/[id]/detail-client.tsx`, find the hero section's gacha art `<Image>`. Change `quality` to `100`. Make the hero section taller — increase `min-h-[400px]` or similar to `min-h-[500px]`. Reduce the gradient overlay to only cover the bottom portion: change `from-card via-card/70 to-transparent` to `from-card via-card/30 to-transparent`. Add `drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]` to text elements over the splash art.

**Step 3: Fresh drops in home page**

In `src/app/home-client.tsx`, find the "Fresh Drops" section character images. Verify they already use `quality={95}` or higher — change to `quality={100}` if not.

**Step 4: Verify build**

```bash
npx next build
```

**Step 5: Commit and remove from tasks.md**

```bash
git add 'src/app/database/page.tsx' 'src/app/database/[id]/detail-client.tsx' src/app/home-client.tsx
git commit -m "feat: max quality splash arts on character pages, details, and fresh drops"
```

Remove lines 3 and 7 from `tasks.md` ("Character page..." and "The fresh drops...").

---

### Task 4: Streamer language sorting + YouTube dedup

**Files:**
- Modify: `src/app/api/streamers/route.ts`
- Modify: `src/app/streamers/page.tsx`

**Step 1: Add language field and sorting**

In `src/app/api/streamers/route.ts`:

1. Add `language` field to `LiveStreamer` interface:
```typescript
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
```

2. In `fetchTwitchLive()`, the Twitch API response includes a `language` field. Add it to the mapping:
```typescript
language: String(s.language || "en"),
```

3. For YouTube, set `language: "unknown"`.

4. Add dedup logic: before merging, check if any YouTube streamer's lowercased channel name matches a Twitch streamer's lowercased name. Skip duplicates.

5. Sort by language priority then viewers:
```typescript
const LANG_PRIORITY: Record<string, number> = { en: 0, fr: 1 };

const all = [...twitchStreams, ...deduped].sort((a, b) => {
  const langA = LANG_PRIORITY[a.language] ?? 2;
  const langB = LANG_PRIORITY[b.language] ?? 2;
  if (langA !== langB) return langA - langB;
  return b.viewers - a.viewers;
});
```

**Step 2: Show language badge on streamer cards**

In `src/app/streamers/page.tsx`, add a language badge to each live streamer card. In the thumbnail overlay area, add:

```tsx
<Badge className="absolute top-2 left-2 bg-black/60 text-white text-[10px] uppercase">
  {streamer.language}
</Badge>
```

**Step 3: Verify build**

```bash
npx next build
```

**Step 4: Commit and remove from tasks.md**

```bash
git add src/app/api/streamers/route.ts src/app/streamers/page.tsx
git commit -m "feat: sort streamers EN>FR>other, dedup YouTube, language badges"
```

Remove lines 1 and 2 from `tasks.md` ("Sort live streamers..." and "We should get live YouTube streamers...").

---

## Phase B: Content — Calendar Events, Artifact Images

### Task 5: Populate calendar with real events

**Files:**
- Modify: `src/data/events.ts`
- Modify: `src/app/calendar/page.tsx`

**Step 1: Add more events to CURRENT_VERSION**

In `src/data/events.ts`, expand the `CURRENT_VERSION.events` array with v6.4 events. Add at least 15+ events:

- In-game events: Ley Line Overflow, Overflowing Mastery, Domain bonus events
- Web events: HoYoLAB check-in, redemption codes
- Story quests: Archon Quest Act, Story Quest unlocks
- Limited-time events with primogem rewards
- Maintenance (update) events

Each event should have realistic `start` and `end` dates within the v6.4 window (2026-02-25 to 2026-04-07), proper `type`, `description`, and `rewards` arrays listing specific item rewards (e.g., `"Primogems x420"`, `"Hero's Wit x12"`).

**Step 2: Verify calendar renders correctly**

```bash
npx next build
```

Confirm the calendar page shows all events in the grid.

**Step 3: Commit and remove from tasks.md**

```bash
git add src/data/events.ts src/app/calendar/page.tsx
git commit -m "feat: populate calendar with v6.4 events and rewards"
```

Remove line 15 from `tasks.md` ("The calendar page is empty...").

---

### Task 6: Artifact list page piece images

**Files:**
- Modify: `src/app/artifacts/page.tsx`

**Step 1: Fetch piece data from Yatta API**

The artifact list page currently fetches the list from `https://gi.yatta.moe/api/v2/en/reliquary`. The list response includes each set's `icon` but not individual piece icons. To show piece images, fetch the detail for each set and extract piece icons.

Approach: When a set card is shown, it already has the set `icon`. The individual pieces follow a predictable URL pattern from Yatta: `https://gi.yatta.moe/assets/UI/UI_RelicIcon_{setId}_{pieceNum}.png` where `pieceNum` is 1-5. However, the actual icon names vary.

Better approach: Add a state `pieceCache` to store fetched piece data. When the page loads, fetch detail for all sets in parallel (or lazily). For each set, the detail API response at `https://gi.yatta.moe/api/v2/en/reliquary/{id}` returns a `suit` object with piece icons.

Add to `ArtifactSetCard`:
- A row of 5 small images (20x20 or 24x24) below the set name showing each piece
- Use `${YATTA_ASSETS}/${pieceIcon}.png` for each piece icon
- Show placeholder shimmer if piece data hasn't loaded yet

**Step 2: Verify build**

```bash
npx next build
```

**Step 3: Commit and remove from tasks.md**

```bash
git add src/app/artifacts/page.tsx
git commit -m "feat: show artifact piece preview images on list page"
```

Remove line 4 from `tasks.md` ("Artifacts page does not have their images").

---

## Phase C: Weapon Banner + Abyss UI Revamp

### Task 7: Weapon banner (Epitome Invocation) redesign

**Files:**
- Modify: `src/app/home-client.tsx`

**Step 1: Replace weapon icon background with large art**

In the weapon banner card (both desktop and mobile), replace the current small 160px weapon icons with large weapon art. Use `https://gi.yatta.moe/assets/UI/UI_Gacha_EquipIcon_{weaponId}.png` as primary source, falling back to the existing `weaponIconUrl()` at a larger size.

Change the weapon background section:
- Remove `width={160} height={160}` and switch to `fill` mode like the character banner
- Set `className` to `object-contain` with higher opacity (like character banner: `opacity-80` for active)
- Add the same light gradient overlay: `bg-linear-to-t from-card via-card/40 to-transparent`
- Increase the banner card `min-h` from `min-h-80` to `min-h-96`

For the weapon name/details section:
- Use larger text for weapon names
- Add `drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]` to text elements
- Show weapon type (Sword, Polearm, etc.) below the name

Do this for both desktop and mobile layouts.

**Step 2: Update next.config.ts if needed**

Check that `gi.yatta.moe` is already in the `remotePatterns` (it is).

**Step 3: Verify build**

```bash
npx next build
```

**Step 4: Commit and remove from tasks.md**

```bash
git add src/app/home-client.tsx
git commit -m "feat: redesign weapon banner with large splash art and improved layout"
```

Remove line 6 from `tasks.md` ("The Epitome Invocation...").

---

### Task 8: Abyss boss splash arts + UI revamp

**Files:**
- Modify: `src/app/abyss/page.tsx`
- Modify: `src/data/abyss.ts`

**Step 1: Enhance boss images**

The bosses already have `icon` and `image` fields. The `BossCard` component needs to display them prominently. Redesign `BossCard`:

- Full-width card with boss image taking the left ~40% of the card as a large background image
- Right side: boss name, HP bar, resistance chart (visual bars with element colors), weakness list, tips
- Use `next/image` with the `image` field from the boss data
- Add error fallback for when Yatta image URLs don't resolve

**Step 2: Add enemy icons to chamber cards**

For regular enemies in chambers, display small element badges and type indicators. The `EnemyRow` component already shows element badges — make them more visual with larger badges and HP bars.

**Step 3: Verify abyss page renders all content**

The abyss data has 4 floors (9-12) and 5 Stygian stages. Ensure the floor tabs work correctly and display all chambers and bosses.

**Step 4: Verify build**

```bash
npx next build
```

**Step 5: Commit and remove from tasks.md**

```bash
git add src/app/abyss/page.tsx src/data/abyss.ts
git commit -m "feat: revamp abyss UI with boss splash arts and visual chamber layout"
```

Remove lines 10 and 16 from `tasks.md` ("In abyss and stygian..." and "The abyss guide is empty...").

---

## Phase D: Profile UI Revamp

### Task 9: Akasha-style profile UI

**Files:**
- Modify: `src/components/profile/profile-client.tsx`

**Step 1: Redesign player header**

Clean horizontal bar showing:
- Nickname (large, bold)
- AR level badge, World Level badge
- UID in monospace
- Achievement count
- Abyss floor progress
- Source badge (Akasha/Enka)

**Step 2: Redesign character selector as card grid**

Replace the horizontal avatar strip with a responsive grid (2 columns desktop, 1 mobile). Each character is a full card:

- Left side (~40%): large character splash art using Enka CDN `https://enka.network/ui/{charKey}.png`, with element-colored left border
- Right side (~60%):
  - Character name + level + constellation (C0-C6)
  - Weapon: icon (40x40) + name + "R{refinement}" + level
  - Artifact sets: colored piece-count badges (e.g., "4pc Emblem of Severed Fate")
  - Talent levels: NA/E/Q with level numbers
  - Akasha ranking badge if available (Top X%, #N/M)

Clicking a card selects it and expands the artifact detail panel below.

**Step 3: Redesign artifact detail panel**

When a character is selected, show below the card:
- Horizontal strip of 5 artifact pieces
- Each piece: slot icon/image, main stat with value, 4 substats with values
- Highlight crit substats in white/accent
- Show CV per piece and total CV
- Set bonus indicator

**Step 4: Update the Roast/Verdict section**

Keep the existing score, tier, roast quote, and resin estimates. Ensure they work with the new layout.

**Step 5: Verify build**

```bash
npx next build
```

**Step 6: Commit and remove from tasks.md**

```bash
git add src/components/profile/profile-client.tsx
git commit -m "feat: redesign profile UI with Akasha-style character cards"
```

Remove line 5 from `tasks.md` ("Uid lookups are now working...").

---

## Phase E: Artifact Probabilities + Roasts

### Task 10: Real artifact probability data + enhanced roasts

**Files:**
- Create: `src/data/artifact-stats.ts`
- Modify: `src/components/profile/profile-client.tsx`

**Step 1: Create artifact stats data file**

Create `src/data/artifact-stats.ts` with real probability data from the Genshin wiki:

```typescript
// Main stat drop weights per slot (from wiki)
export const MAIN_STAT_WEIGHTS: Record<string, Record<string, number>> = {
  Sands: {
    "HP%": 2668,
    "ATK%": 2666,
    "DEF%": 2666,
    "Energy Recharge": 1000,
    "Elemental Mastery": 1000,
  },
  Goblet: {
    "HP%": 1925,
    "ATK%": 1925,
    "DEF%": 1900,
    "Pyro DMG%": 500,
    "Electro DMG%": 500,
    "Cryo DMG%": 500,
    "Hydro DMG%": 500,
    "Anemo DMG%": 500,
    "Geo DMG%": 500,
    "Dendro DMG%": 500,
    "Physical DMG%": 500,
    "Elemental Mastery": 250,
  },
  Circlet: {
    "HP%": 2200,
    "ATK%": 2200,
    "DEF%": 2200,
    "CRIT Rate": 1000,
    "CRIT DMG": 1000,
    "Healing Bonus": 1000,
    "Elemental Mastery": 400,
  },
};

// Substat roll value ranges (5-star artifacts)
export const SUBSTAT_ROLLS: Record<string, { min: number; max: number; isPercent: boolean }> = {
  "HP": { min: 209, max: 299, isPercent: false },
  "ATK": { min: 14, max: 19, isPercent: false },
  "DEF": { min: 16, max: 23, isPercent: false },
  "HP%": { min: 4.1, max: 5.8, isPercent: true },
  "ATK%": { min: 4.1, max: 5.8, isPercent: true },
  "DEF%": { min: 5.1, max: 7.3, isPercent: true },
  "Energy Recharge": { min: 4.5, max: 6.5, isPercent: true },
  "Elemental Mastery": { min: 16, max: 23, isPercent: false },
  "CRIT Rate": { min: 2.7, max: 3.9, isPercent: true },
  "CRIT DMG": { min: 5.4, max: 7.8, isPercent: true },
};

// Resin per domain run
export const RESIN_PER_RUN = 20;
export const DAILY_RESIN = 160; // without refresh
export const DAILY_RESIN_REFRESH = 180; // one 50-primo refresh
```

Add helper functions:
- `getMainStatChance(slot, stat)` — returns probability as a percentage
- `getExpectedResin(slot, mainStat, wantDoubleCrit)` — calculates expected resin cost
- `getExpectedDays(resin, withRefresh)` — converts resin to days

**Step 2: Add more roast messages using real math**

Add 15+ new roast messages that reference real probabilities:

```typescript
export const MATH_ROASTS: string[] = [
  "Your EM Sands had a 10% chance of existing. And yet here it is, with DEF% substats.",
  "You need ~4,520 Resin on average for a CRIT circlet with double crit subs. Good luck.",
  "An Elemental DMG goblet has a 5% drop rate. You rolled one. Then got flat HP four times.",
  // ... etc
];
```

**Step 3: Integrate into profile verdict section**

In `profile-client.tsx`, import the probability data and add:
- Per-piece probability analysis: "This ATK% Sands had a 26.7% chance of dropping"
- Resin cost estimate using real math
- Use `MATH_ROASTS` alongside existing `ARTIFACT_QUIPS`

**Step 4: Verify build**

```bash
npx next build
```

**Step 5: Commit and remove from tasks.md**

```bash
git add src/data/artifact-stats.ts src/components/profile/profile-client.tsx
git commit -m "feat: real artifact probability calculations and enhanced roasts"
```

Remove line 8 from `tasks.md` ("Can we add more Honest Roasts...").

---

## Phase F: KQM Guide Scraper

### Task 11: KQM guide scraper worker job

**Files:**
- Create: `src/worker/jobs/guides.ts`
- Modify: `src/worker/index.ts`

**Step 1: Create KQM scraper**

Create `src/worker/jobs/guides.ts`. The scraper:

1. Maintains a list of character names to scrape (map to KQM URL slugs)
2. Fetches `https://keqingmains.com/{slug}/` for each character
3. Parses HTML to extract:
   - Talent priority (look for headings containing "Talent Priority")
   - Weapon rankings (look for tables/lists under "Weapons")
   - Artifact sets (look for tables/lists under "Artifacts")
   - Team comps (look for sections with team names)
4. Stores parsed data in Redis: `guild:guides:{name}` with 24h TTL
5. Falls back gracefully if scraping fails for a character

**Step 2: Register cron in worker**

In `src/worker/index.ts`, add:
```typescript
import { scrapeKQMGuides } from "./jobs/guides";

// Every 24 hours: scrape KQM guides
cron.schedule("0 6 * * *", async () => {
  await scrapeKQMGuides();
});

// Run on startup
scrapeKQMGuides().catch(console.error);
```

**Step 3: Verify build**

```bash
npx next build
```

**Step 4: Commit**

```bash
git add src/worker/jobs/guides.ts src/worker/index.ts
git commit -m "feat: add KQM guide scraper worker job"
```

---

### Task 12: Guide API route + update guides tab

**Files:**
- Create: `src/app/api/guides/[name]/route.ts`
- Modify: `src/app/database/[id]/detail-client.tsx`

**Step 1: Create API route**

Create `src/app/api/guides/[name]/route.ts`:

```typescript
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
```

**Step 2: Update guides tab in detail page**

In `src/app/database/[id]/detail-client.tsx`, update the Guides tab:

1. Add a `useEffect` that fetches `/api/guides/{characterName}` when the guides tab is active
2. If API returns data, render it using the same visual format as existing static guides
3. If API returns null, fall back to existing `CHARACTER_GUIDES[name]`
4. If neither has data, show the "Coming Soon" placeholder

**Step 3: Verify build**

```bash
npx next build
```

**Step 4: Commit and remove from tasks.md**

```bash
git add 'src/app/api/guides/[name]/route.ts' 'src/app/database/[id]/detail-client.tsx'
git commit -m "feat: add guide API route and dynamic KQM guide loading"
```

Remove line 9 from `tasks.md` ("The tab guide is empty...").

---

## Phase G: 3D Wish Star + Artifact Roller Revamp

### Task 13: Install Three.js and create 3D wish star

**Files:**
- Create: `src/components/simulator/wish-star-3d.tsx`
- Modify: `src/components/simulator/wish-animation.tsx`

**Step 1: Install Three.js dependencies**

```bash
bun add three @react-three/fiber @react-three/drei
bun add -D @types/three
```

**Step 2: Create WishStar3D component**

Create `src/components/simulator/wish-star-3d.tsx`:

```typescript
"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import * as THREE from "three";
```

Three star variants:

**3-star (blue):** A small icosahedron with blue emissive material, gentle rotation, and subtle point-light particle dust. Use `<Stars>` from drei for background starfield.

**4-star (purple):** A purple dodecahedron with an orbiting ring of small spheres (particle ring), brighter glow via `<pointLight>`. Use `<Float>` for gentle bobbing.

**5-star (golden):** A golden star-shaped geometry (custom `THREE.Shape` or merged icosahedron), explosive particle system (instanced mesh with random velocities), volumetric light rays (cone geometry with transparent golden material), bright golden `<pointLight>` with high intensity.

**Props:**
```typescript
interface WishStar3DProps {
  rarity: 3 | 4 | 5;
  phase: "entering" | "revealed" | "idle";
}
```

**Step 3: Integrate into wish animation**

In `wish-animation.tsx`, replace the 2D CSS meteor/particle section with the `WishStar3D` component. The star appears during the "entering" phase of the animation, then scales into the card reveal.

Wrap in a `<Suspense>` fallback (the existing 2D animation serves as fallback for slow Three.js load):

```tsx
<Suspense fallback={<div className="meteor-2d-fallback" />}>
  <WishStar3D rarity={result.rarity} phase={phase} />
</Suspense>
```

**Step 4: Verify build**

```bash
npx next build
```

**Step 5: Commit and remove from tasks.md**

```bash
git add src/components/simulator/wish-star-3d.tsx src/components/simulator/wish-animation.tsx package.json bun.lock
git commit -m "feat: add 3D star animations for wish simulator using Three.js"
```

Remove line 11 from `tasks.md` ("The wish simulator is kinda good...").

---

### Task 14: Artifact roller UI revamp

**Files:**
- Modify: `src/app/simulator/page.tsx`

**Step 1: Create domain data structure**

Replace the flat `ARTIFACT_SETS` array with a domain-based structure:

```typescript
interface ArtifactDomain {
  name: string;
  location: string;
  sets: { name: string; icon: string }[];
}

const ARTIFACT_DOMAINS: ArtifactDomain[] = [
  {
    name: "Momiji-Dyed Court",
    location: "Inazuma",
    sets: [
      { name: "Emblem of Severed Fate", icon: "UI_RelicIcon_15020_4" },
      { name: "Shimenawa's Reminiscence", icon: "UI_RelicIcon_15019_4" },
    ],
  },
  // ... all other domains
];
```

**Step 2: Replace dropdown with visual domain selector**

Replace the `<select>` dropdown with a grid of domain cards. Each card shows:
- Domain name
- Location (small text)
- Two set icons side by side (32x32 from Yatta CDN)
- Two set names below

Clicking a domain selects it. Selected domain has a highlighted border.

**Step 3: Add piece images to rolled artifacts**

Each rolled artifact card should show:
- The artifact piece icon from Yatta (use `YATTA_ASSETS` constant)
- Piece type label (Flower, Plume, etc.)
- Larger card layout with the icon on the left and stats on the right

**Step 4: Verify build**

```bash
npx next build
```

**Step 5: Commit and remove from tasks.md**

```bash
git add src/app/simulator/page.tsx
git commit -m "feat: revamp artifact roller with visual domains and piece images"
```

Remove line 13 from `tasks.md` ("The artifact roller is mid...").

---

## Verification Checklist

After all phases complete, verify:

- [ ] `npx next build` passes with zero errors
- [ ] Live sidebar item has a pulsing red dot
- [ ] Wish skip shows results grid before returning to simulator
- [ ] Character database grid uses quality=100 images
- [ ] Character detail hero has prominent splash art with minimal overlay
- [ ] Fresh drops section uses quality=100
- [ ] Streamers are sorted EN > FR > other, with language badges
- [ ] Calendar page shows 15+ events with rewards
- [ ] Artifact list page shows piece preview thumbnails per set
- [ ] Weapon banner has large weapon art with crossfade
- [ ] Abyss boss cards have large splash arts and visual resistance charts
- [ ] Profile page uses Akasha-style full character cards
- [ ] Artifact probability math shows real percentages and resin costs
- [ ] Guides tab fetches from KQM API with static fallback
- [ ] 3D stars render for each rarity in wish simulator
- [ ] Artifact roller has visual domain selector and piece images
