# Guild Website Enhancement Design

## Overview

Full redesign and enhancement of the Guild Genshin Impact website. Covers: shadcn/ui integration, live banner data, all-page redesign, performance improvements, and code refactoring.

## Data Layer

### Banner Data Integration
- New `src/lib/banners/client.ts` fetching from paimon.moe GitHub raw data
- Parse banner arrays (character, weapon, chronicled) from `https://raw.githubusercontent.com/MadeBaruna/paimon-moe/main/src/data/banners.js`
- Filter for currently active banners by date comparison
- Map featured character/weapon names to existing entries for icons and links
- Server-side fetch with `revalidate: 3600`

### API Client Improvements
- Add list endpoints to Yatta client: `fetchAllCharacters()`, `fetchAllWeapons()`
- Proper TypeScript return types and error handling
- Shared `src/types/index.ts` for cross-cutting types

### Performance Architecture
- Server components for list pages, client components only for interactivity
- `next/image` with proper `sizes` and `priority`
- `loading.tsx` skeleton UIs for each route
- Dynamic imports for heavy components

## shadcn/ui Components

Install: Card, Badge, Tabs, Skeleton, Dialog/Sheet, Tooltip, Separator, ScrollArea, Button, Input, Select

Custom game components:
- `ElementBadge` — Badge with element color theming
- `RarityStars` — star display with gold/purple
- `CharacterCard` — Card with gacha art, element overlay, hover effects
- `WeaponCard` — Card with weapon icon, rarity border
- `BannerCard` — active wish banner display
- `StatBar` — progress bar for stat visualization

## Page Designs

### Home Page
- Hero: "GUILD" branding, UID lookup with shadcn Input + glow
- Active Banners: two cards (character + weapon) with 5-star splash art, countdown timers, 4-star roster row
- Fresh Drops: newest characters grid with CharacterCard components
- Quick Stats: banner countdown, abyss reset, version countdown
- Trending Builds: featured banner character builds with links

### Character Database
- Sticky filter bar: shadcn Input search with autocomplete
- Icon-based element filter (7 toggleable icons, multi-select)
- Icon-based weapon type filter (5 toggleable icons)
- Rarity toggle: All/5★/4★ with Badge-style buttons
- Sort: Newest/Oldest/Name A-Z/Element
- Grid: 2 mobile, 4 tablet, 5-6 desktop columns
- CharacterCard: gacha art, gradient overlay, element icon, rarity stars, hover stats

### Character Detail
- Full-width gacha splash hero with gradient fade
- Name, title, element/weapon/rarity badges
- Info grid: shadcn Cards (2-3 columns) with icon+label+value
- shadcn Tabs: Talents, Constellations, Materials, Lore
- Constellations: vertical timeline layout
- Materials: level range slider, material grid with counts

### Weapons List
- Same filter pattern as characters (weapon type icons, rarity, search)
- Larger cards: weapon icon, name, rarity stars, substat badge
- Grid: 2 mobile, 3-4 tablet, 5-6 desktop

### Weapon Detail
- Hero with weapon art, type badge, rarity stars
- Stats card: Base ATK range, substat range
- Passive section with refinement value highlighting
- R1-R5 comparison tab
- Materials tab with range slider

## Performance

- `loading.tsx` skeleton screens for every route
- `next/dynamic` for heavy client components
- Proper `next/image` with sizes/priority/WebP
- Filter state in URL search params
- Debounced search (300ms)

## Refactoring

- `src/types/index.ts` for shared types
- `src/lib/constants.ts` for element/rarity colors
- `src/components/ui/` via shadcn
- `src/components/shared/` for game-specific reusables
- Clean up unused imports, consolidate duplicate patterns
- Error boundaries for API failures

## API Sources

| Data | Source |
|------|--------|
| Characters/Weapons | gi.yatta.moe API |
| Character/Weapon images | gi.yatta.moe CDN + enka.network CDN |
| Banner schedule | paimon.moe GitHub raw data |
| Player profiles | enka.network API |
