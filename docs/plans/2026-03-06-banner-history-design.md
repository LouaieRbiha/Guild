# Banner History Page Design

## Goal

A `/banners` page showing the complete Genshin Impact banner history as a visual timeline grouped by version. Each version section shows character and weapon banners with splash art, featured 4-star icons, and date ranges.

## Data Source

Fetch banner history from paimon.moe's GitHub raw data files at request time via an API route:

- **URL**: `https://raw.githubusercontent.com/MadeBaruna/paimon-moe/main/src/data/banners.js`
- **Format**: JS module — strip `export const banners =` prefix to get JSON-parseable object
- **Fields per banner**: `name`, `shortName`, `start`, `end`, `featured` (5-star IDs, snake_case), `featuredRare` (4-star IDs), `version`, `color`
- **Coverage**: v1.0 through current patch, character + weapon banners

## ID Mapping

paimon.moe uses snake_case IDs (e.g., `raiden_shogun`, `hu_tao`). Our data uses numeric IDs. Map by matching names: convert snake_case to title case and fuzzy-match against `ALL_CHARACTERS` and `ALL_WEAPONS` by name. For characters that match, use `charGachaUrl(id)` for splash art and `charIconUrl(id)` for icons. For weapons, use `weaponIconUrl(id)`.

## Architecture

1. **API route** (`/api/banners/history`): Fetch + parse paimon.moe data, cache for 1 hour via `revalidate`. Return cleaned JSON with `characters` and `weapons` arrays.
2. **Page** (`/banners/page.tsx`): Server component that calls the API, groups banners by version, renders the timeline.
3. **No new components needed** — use existing Card, Badge, Image components.

## Layout

Version timeline (newest first):

```
v6.4 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Phase 1  [Feb 25 - Mar 17]
 ┌─── Character Event Wish ────────┐
 │ [Varka splash] [Flins splash]   │
 │ 4★: Bennett · Xiangling · ...   │
 ├─── Epitome Invocation ──────────┤
 │ [WGS icon]  [SotSS icon]       │
 │ 4★: The Flute · Rust · ...     │
 └─────────────────────────────────┘

v6.3 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Phase 1  [...]
 ...
 Phase 2  [...]
 ...
```

- Version headers with version badges
- Phase sub-headers with date ranges
- Character banners: splash art images side by side, 4-star icons below
- Weapon banners: weapon icons, 4-star weapon names
- Current/active banner highlighted with accent border + "Live" badge

## Files to Create/Modify

1. **Create** `src/app/api/banners/history/route.ts` — API route to fetch + parse paimon.moe data
2. **Create** `src/app/banners/page.tsx` — Banner history page
3. **Modify** `src/data/banners.ts` — Add a helper to convert snake_case IDs to character/weapon entries
4. **Modify** sidebar + mobile nav — Add "Banners" link
