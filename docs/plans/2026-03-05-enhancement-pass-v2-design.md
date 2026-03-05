# Guild Enhancement Pass v2 — Design Document

**Date:** 2026-03-05
**Source:** tasks.md (16 items)

## Architecture

All changes stay within the existing Next.js 16 + React 19 + Tailwind v4 + shadcn/ui stack. New dependencies: `@react-three/fiber`, `@react-three/drei`, `three` for the wish simulator 3D star. KQM guide scraping added to the existing worker process. No new infrastructure needed — everything uses the existing Docker + Redis + worker setup.

---

## Task 1: Streamer Language Sort + Dedup

**Problem:** Streamers aren't sorted by language; EN and FR should appear first. Twitch and YouTube may show duplicates of the same streamer.

**Solution:** Use the Twitch API `language` field. Sort order: `en` > `fr` > alphabetical. For YouTube dedup: compare lowercased channel name against Twitch `user_name` — skip YouTube entry if match exists. Show a language badge on each streamer card.

**Files:** `src/app/api/streamers/route.ts`, `src/app/streamers/page.tsx`

---

## Task 2: YouTube Live Streamers

**Problem:** YouTube streamers not showing even when API key is set.

**Solution:** Already implemented in the API route via `fetchYouTubeLive()`. Requires `YOUTUBE_API_KEY` env var. Dedup from Task 1 applies. No code change needed beyond Task 1.

---

## Task 3: Character Page High Quality Splash Arts

**Problem:** Character images on database grid and detail page could be higher quality.

**Solution:**
- Database grid: `quality={100}`, better `object-position` to show face/upper body
- Detail page hero: taller card, full-bleed gacha art, bottom-only gradient (not full overlay), text with drop shadows
- Inspired by Yatta's character pages with large splash art

**Files:** `src/app/database/page.tsx`, `src/app/database/[id]/detail-client.tsx`

---

## Task 4: Artifacts List Page Images

**Problem:** Artifact cards on the list page don't show individual piece images.

**Solution:** Each artifact card shows the set icon large (current) plus a row of 5 mini piece thumbnails below. Fetch piece data per-set from Yatta API. Cache in component state. Use `${YATTA_ASSETS}/${piece.icon}.png` for each piece.

**Files:** `src/app/artifacts/page.tsx`

---

## Task 5: Profile UI Revamp (Akasha-style)

**Problem:** Profile UI is basic — small avatars, cramped layout.

**Solution:** Full card-based layout inspired by Akasha:
- Player header: clean bar with nickname, AR, WL, UID, achievements, source badge
- Character grid: 2-column cards with large splash art (left ~40%), stats panel (right)
- Each card: weapon with icon + refinement, artifact set names, talent levels, constellation
- Expanded view: artifact pieces in horizontal strip with main stat, substats, CV
- Akasha ranking badge per character

**Files:** `src/components/profile/profile-client.tsx`

---

## Task 6: Weapon Banner Revamp

**Problem:** Epitome Invocation shows tiny 40px weapon icons on a plain gradient.

**Solution:** Use large weapon art as background with crossfade (like character banner). Try `https://gi.yatta.moe/assets/UI/UI_Gacha_EquipIcon_{weaponId}.png` for large art. Fall back to weapon icon at 200px+ size. Same visual treatment as character banner: high opacity art, light bottom gradient, text with drop shadows.

**Files:** `src/app/home-client.tsx`

---

## Task 7: Fresh Drops High Quality

**Problem:** Fresh drops images need to be highest quality.

**Solution:** Bump `quality={100}`, verify `object-top` positioning, increase card height if needed.

**Files:** `src/app/home-client.tsx`

---

## Task 8: Honest Roasts + Real Artifact Probability

**Problem:** Roasts lack real math. No probability calculations for artifact farming.

**Solution:** Hardcode real artifact stat distribution data from the Genshin wiki:
- Main stat drop rates per slot (e.g., ATK% Sands: 26.68%, EM Sands: 10%)
- Substat roll value ranges
- Resin cost calculator: expected resin for X piece with Y main stat and Z crit subs
- Days estimate: 160 resin/day (no refresh) or 180 (with refresh)
- More roast messages using real math

**Files:** `src/data/artifact-stats.ts` (new), `src/components/profile/profile-client.tsx`

---

## Task 9: KQM Guide Scraper

**Problem:** Guides tab is empty for most characters.

**Solution:** Worker job scrapes KQM character pages (`https://keqingmains.com/{name}/`). Parse HTML for:
- Talent priority
- Weapon rankings
- Artifact set recommendations
- Main stat/substat priority
- Team comps
- Constellation values

Store in Redis (24h TTL). API route `/api/guides/[name]`. Guides tab fetches from API, falls back to static `CHARACTER_GUIDES`.

**Files:** `src/worker/jobs/guides.ts` (new), `src/app/api/guides/[name]/route.ts` (new), `src/worker/index.ts`, `src/app/database/[id]/detail-client.tsx`

---

## Task 10: Abyss Boss Splash Arts + UI Revamp

**Problem:** Bosses show as small icons. UI is text-heavy.

**Solution:** Use larger Yatta monster images. Boss cards: full-width with large art on left, resistance chart + tips on right. Chamber cards: show enemy type icons in a visual strip. Stygian stages: same treatment.

**Files:** `src/app/abyss/page.tsx`, `src/data/abyss.ts`

---

## Task 11: Wish Simulator 3D Star (Three.js)

**Problem:** Wish animation uses flat 2D CSS meteors.

**Solution:** Add Three.js ecosystem (`@react-three/fiber`, `@react-three/drei`, `three`). Create `WishStar3D` component:
- 3-star: Blue icosahedron with particle dust, gentle rotation
- 4-star: Purple dodecahedron with orbiting particle ring
- 5-star: Golden star with explosive particle burst, volumetric light rays

Replace 2D meteor in wish-animation.tsx with 3D star Canvas during reveal.

**Files:** `src/components/simulator/wish-star-3d.tsx` (new), `src/components/simulator/wish-animation.tsx`

---

## Task 12: Wish Skip Shows Results

**Problem:** Skip during 10-pull dismisses everything instead of showing results.

**Solution:** Skip sets internal state to `"summary"` instead of calling `onComplete()`. Summary grid shows all 10 results with a "Back to Simulator" button that calls `onComplete()`.

**Files:** `src/components/simulator/wish-animation.tsx`

---

## Task 13: Artifact Roller UI Revamp

**Problem:** Artifact roller uses a plain dropdown, no images, no domain info.

**Solution:** Visual domain selector: grid of domain cards with set icons. Each rolled artifact shows piece image from Yatta. Bigger cards with piece icon, set name, visual main stat. Domain location info.

**Files:** `src/app/simulator/page.tsx`

---

## Task 14: Live Sidebar Red Dot

**Problem:** "Live" nav item has no visual indicator.

**Solution:** Add a pulsing red dot next to the "Live" label in the sidebar, matching the pulse animation used in the "Live Now" section on the streamers page.

**Files:** `src/components/layout/sidebar.tsx`

---

## Task 15: Calendar Page Events

**Problem:** Calendar page appears empty or sparse.

**Solution:** Populate `src/data/events.ts` with current v6.4 events: web events, in-game events, login campaigns, permanent content. Add dates, primo rewards, type badges. Ensure the calendar renders all events properly.

**Files:** `src/data/events.ts`, `src/app/calendar/page.tsx`

---

## Task 16: Abyss Data Verification

**Problem:** User reports abyss guide is empty.

**Solution:** The data exists (4 floors + 5 Stygian stages). Verify the page renders correctly, ensure floor tabs work, and that all data is visible. This is covered by Task 10's UI revamp.

**Files:** Covered by Task 10.
