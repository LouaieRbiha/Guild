# Guild Website Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enhance the Guild Genshin Impact website with shadcn/ui components, live banner data, redesigned pages, and performance improvements.

**Architecture:** shadcn/ui as the component foundation, server components for data fetching with client components for interactivity, paimon.moe GitHub data for live banners, gi.yatta.moe API for character/weapon data.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Radix UI, framer-motion, gi.yatta.moe API, paimon.moe GitHub data

---

### Task 1: Initialize shadcn/ui

**Files:**
- Create: `components.json`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/skeleton.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/components/ui/tooltip.tsx`
- Create: `src/components/ui/separator.tsx`
- Create: `src/components/ui/scroll-area.tsx`
- Modify: `src/app/globals.css` (add shadcn CSS variables)

**Step 1: Initialize shadcn**
Run: `cd /Users/macosm2/Guild && npx shadcn@latest init`
- Select style: "new-york"
- Import alias: `@/components`
- Tailwind CSS vars: yes
- Base color: "zinc" (closest to our dark navy theme)
- CSS file: `src/app/globals.css`

**Step 2: Install shadcn components**
Run these in sequence:
```bash
npx shadcn@latest add button card badge tabs skeleton input tooltip separator scroll-area
```

**Step 3: Customize globals.css**
After shadcn adds its CSS variables, merge with existing theme. Keep all `--color-guild-*` custom vars and the `.guild-card`, `.guild-glow`, `.gold-glow` classes. Update the shadcn CSS vars to match our dark theme:
```css
--background: 222 47% 7%;      /* #0A0E1A */
--foreground: 210 40% 98%;     /* #F8FAFC */
--card: 222 47% 11%;           /* #111827 */
--card-foreground: 210 40% 98%;
--primary: 239 84% 67%;        /* #6366F1 guild-accent */
--primary-foreground: 210 40% 98%;
--muted: 217 19% 27%;          /* #1E293B */
--muted-foreground: 215 20% 65%; /* #94A3B8 */
--border: 217 19% 27%;         /* #1E293B */
--accent: 250 89% 66%;         /* #8B5CF6 */
```

**Step 4: Verify build**
Run: `cd /Users/macosm2/Guild && npm run build`
Expected: Build succeeds with no errors

**Step 5: Commit**
```bash
git add -A && git commit -m "feat: initialize shadcn/ui with core components"
```

---

### Task 2: Create shared types and constants

**Files:**
- Create: `src/types/index.ts`
- Create: `src/lib/constants.ts`
- Modify: `src/lib/characters.ts` (move ELEMENT_COLORS, ELEMENT_ICONS exports)

**Step 1: Create types file**
Create `src/types/index.ts` re-exporting all shared types:
```typescript
// Re-export from existing modules
export type { CharacterEntry } from "@/lib/characters";
export type { WeaponEntry } from "@/lib/weapons";
export type { CharacterDetail, WeaponDetail, TalentInfo, ConstellationInfo, MaterialItem, MaterialGroup } from "@/lib/yatta/client";

export type Element = "Pyro" | "Hydro" | "Anemo" | "Cryo" | "Electro" | "Geo" | "Dendro";
export type WeaponType = "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst";
export type Rarity = 3 | 4 | 5;
```

**Step 2: Create constants file**
Create `src/lib/constants.ts` with element colors, rarity colors, and shared constants extracted from where they're currently duplicated across files:
```typescript
export const ELEMENT_COLORS = { /* move from characters.ts */ };
export const RARITY_COLORS = {
  5: { text: "text-amber-400", bg: "bg-amber-500/20", border: "border-amber-500/30", star: "text-amber-400" },
  4: { text: "text-purple-400", bg: "bg-purple-500/20", border: "border-purple-500/30", star: "text-purple-400" },
  3: { text: "text-blue-400", bg: "bg-blue-500/20", border: "border-blue-500/30", star: "text-blue-400" },
};
export const MAT_RARITY_BORDER = {
  1: "border-gray-600", 2: "border-green-600", 3: "border-blue-600",
  4: "border-purple-600", 5: "border-amber-600",
};
export const MAT_RARITY_BG = {
  1: "bg-gray-700/60", 2: "bg-green-900/40", 3: "bg-blue-900/40",
  4: "bg-purple-900/40", 5: "bg-amber-900/40",
};
export const ENKA_UI = "https://enka.network/ui";
export const YATTA_ASSETS = "https://gi.yatta.moe/assets/UI";
```

**Step 3: Update imports across codebase**
Update `characters.ts` to import/re-export from constants. Update `weapons/page.tsx` and `weapons/[id]/detail-client.tsx` to use shared RARITY_COLORS and MAT_RARITY_BORDER instead of local duplicates. Update `database/[id]/detail-client.tsx` to use shared MAT_RARITY_BORDER instead of local duplicate.

**Step 4: Verify build**
Run: `cd /Users/macosm2/Guild && npm run build`

**Step 5: Commit**
```bash
git add -A && git commit -m "refactor: extract shared types and constants"
```

---

### Task 3: Create shared game components

**Files:**
- Create: `src/components/shared/element-badge.tsx`
- Create: `src/components/shared/rarity-stars.tsx`
- Create: `src/components/shared/material-card.tsx`
- Create: `src/components/shared/stat-bar.tsx`
- Create: `src/components/shared/countdown.tsx`

**Step 1: Create ElementBadge**
```tsx
// Uses shadcn Badge with element-specific color styling
import { Badge } from "@/components/ui/badge";
import { ELEMENT_COLORS } from "@/lib/constants";
import { ELEMENT_ICONS } from "@/components/icons/genshin-icons";

export function ElementBadge({ element, showIcon = true, className }: { element: string; showIcon?: boolean; className?: string }) {
  const colors = ELEMENT_COLORS[element];
  const Icon = ELEMENT_ICONS[element];
  return (
    <Badge variant="outline" className={cn(colors?.text, colors?.bg, colors?.border, className)}>
      {showIcon && Icon && <Icon size={12} className="mr-1" />}
      {element}
    </Badge>
  );
}
```

**Step 2: Create RarityStars**
```tsx
export function RarityStars({ rarity, size = "sm" }: { rarity: number; size?: "xs" | "sm" | "md" }) {
  const colors = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS];
  const sizeClass = { xs: "text-[8px]", sm: "text-xs", md: "text-sm" }[size];
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: rarity }).map((_, i) => (
        <span key={i} className={cn(sizeClass, colors?.star || "text-gray-400")}>★</span>
      ))}
    </div>
  );
}
```

**Step 3: Create MaterialCard**
Extract the `MaterialItemCard` component that's duplicated between character detail and weapon detail into a shared component. Use shadcn Card styling.

**Step 4: Create Countdown component**
```tsx
"use client";
// Real-time countdown to a target date
export function Countdown({ target, label }: { target: Date; label: string }) {
  // Uses useState + useEffect with setInterval to count down
  // Display: "Xd Yh Zm"
}
```

**Step 5: Create StatBar**
```tsx
// Animated progress bar for stat visualization
export function StatBar({ value, max, label, color }: { value: number; max: number; label: string; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", color || "bg-primary")}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
```

**Step 6: Verify build**
Run: `cd /Users/macosm2/Guild && npm run build`

**Step 7: Commit**
```bash
git add -A && git commit -m "feat: add shared game UI components"
```

---

### Task 4: Create banner data client

**Files:**
- Create: `src/lib/banners/client.ts`
- Create: `src/lib/banners/types.ts`

**Step 1: Create banner types**
```typescript
// src/lib/banners/types.ts
export interface Banner {
  name: string;
  image: string;
  start: string; // ISO date
  end: string;   // ISO date
  featured5Star: string[];
  featured4Star: string[];
  type: "character" | "weapon" | "chronicled";
  version: string;
}

export interface ActiveBanners {
  character: Banner | null;
  weapon: Banner | null;
  chronicled: Banner | null;
}
```

**Step 2: Create banner client**
Create `src/lib/banners/client.ts` that:
1. Fetches `https://raw.githubusercontent.com/MadeBaruna/paimon-moe/main/src/data/banners.js`
2. The file exports JS arrays — parse the raw text to extract banner data:
   - Look for `export const characters = [...]` and `export const weapons = [...]`
   - Parse each banner entry for: name, image, start, end, featured5Star (the character/weapon name), featured4Star (array of 3 names)
3. Filter for currently active banners by comparing `start` and `end` dates to `new Date()`
4. Returns `ActiveBanners` object
5. Uses `next: { revalidate: 3600 }` for server-side caching
6. Maps featured character names to `ALL_CHARACTERS` entries for icons/links
7. Maps featured weapon names to `ALL_WEAPONS` entries for icons/links

Key implementation details:
- The paimon.moe banners.js file uses JS date format strings like `"2026-02-25 18:00:00"`
- Banner entries have shape: `{ name, image, start, end, featured, featuredRare }`
- `featured` = array of 5-star names, `featuredRare` = array of 4-star names
- Parse the JS source text with regex since we can't import it as a module
- Provide fallback mock data if fetch fails

**Step 3: Verify types compile**
Run: `cd /Users/macosm2/Guild && npx tsc --noEmit`

**Step 4: Commit**
```bash
git add -A && git commit -m "feat: add banner data client with paimon.moe integration"
```

---

### Task 5: Redesign Home Page

**Files:**
- Modify: `src/app/page.tsx` (convert to server component with client interactivity)
- Create: `src/app/home-client.tsx` (client component for interactive parts)

**Step 1: Create server component wrapper**
Convert `src/app/page.tsx` from `"use client"` to a server component that:
1. Calls `getActiveBanners()` from the banner client
2. Gets the latest 5 characters from `ALL_CHARACTERS` (sorted by release)
3. Passes data as props to `HomeClient`

**Step 2: Build HomeClient with these sections**

**Hero Section:**
- Large "GUILD" title with animated gradient text using CSS `background-clip: text` and a slow-moving gradient from guild-accent to guild-accent-2
- Subtitle "Your Genshin Impact Command Center"
- UID lookup using shadcn `Input` + `Button` with glow border effect
- Subtle animated particles/dots in background (CSS only, using radial gradients)

**Active Banners Section (new - live data):**
- Two large cards side-by-side (character + weapon), using shadcn `Card`
- Each card has:
  - 5-star character/weapon splash art as background image with gradient overlay
  - Featured character/weapon name + element badge (ElementBadge component)
  - `Countdown` component showing time remaining
  - Row of 3 featured 4-star characters with small icons and names
  - "Phase X" + Version label
- If no active banner data, show fallback with mock data (current behavior)

**Fresh Drops Section (enhanced):**
- Use shadcn `Card` for each character
- Gacha splash art background with gradient overlay
- ElementBadge in corner, RarityStars below name
- Element-colored hover glow using CSS `box-shadow`
- Link to character detail page

**Quick Stats Row:**
- Three `Card` components: Banner countdown, Spiral Abyss reset, Version info
- Use `Countdown` component for timers
- Animated border on hover

**Trending Builds (connected to banner):**
- Show the featured banner characters as trending (not mock data)
- Each entry links to `/database/{id}`
- Shows element badge + character name

**Remove:**
- Mock roast feed (keep only on profile page)
- Floating navigation pills (redundant with sidebar)
- Mock banner data constants

**Step 3: Verify build**
Run: `cd /Users/macosm2/Guild && npm run build`

**Step 4: Commit**
```bash
git add -A && git commit -m "feat: redesign home page with live banners and shadcn components"
```

---

### Task 6: Redesign Character Database Page

**Files:**
- Modify: `src/app/database/page.tsx`

**Step 1: Enhance filters with shadcn components**
- Replace raw `<input>` with shadcn `Input` component
- Replace filter buttons with shadcn `Badge` used as toggleable filter pills
- Add multi-select support for element filters (array state instead of single string)
- Add sort options: Newest, Oldest, Name A-Z, Element (using a simple select or button group)
- Make filter bar sticky: `sticky top-0 z-10 bg-background/80 backdrop-blur-sm`
- Add active filter count indicator

**Step 2: Enhance character cards**
- Wrap in shadcn `Card`
- Improve hover effect: scale + element-colored glow shadow
- Add `RarityStars` component below character name
- Better gradient overlay (from-black/80 via-black/30 to-transparent)
- Use `framer-motion` `layoutId` on the grid for smooth filter transitions (wrap grid in `AnimatePresence` with `layout` prop on each card's `motion.div`)

**Step 3: Improve grid responsiveness**
Change grid to: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`
(current is 3/4/5/7 which is too dense)

**Step 4: Add search debouncing**
Debounce the search input with a 300ms delay using a simple `useEffect` + `setTimeout` pattern (no external library needed).

**Step 5: Verify build**
Run: `cd /Users/macosm2/Guild && npm run build`

**Step 6: Commit**
```bash
git add -A && git commit -m "feat: redesign character database with shadcn and improved filters"
```

---

### Task 7: Redesign Character Detail Page

**Files:**
- Modify: `src/app/database/[id]/detail-client.tsx`

**Step 1: Enhance hero section**
- Make hero full-width with larger splash art area
- Add ElementBadge + weapon type badge + RarityStars
- Better gradient: multi-layered gradient from character art to background
- Improved typography hierarchy

**Step 2: Replace custom tabs with shadcn Tabs**
Replace the custom tab implementation with:
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```
- Style TabsTrigger with element color when active
- Each TabsContent wraps the existing tab content

**Step 3: Enhance info grid**
- Use shadcn `Card` for each info item
- 2-column grid on mobile, 3-column on desktop
- Add subtle element-colored left border on each card
- Better label/value typography

**Step 4: Enhance constellation tab**
- Vertical timeline layout: each constellation connected by a vertical line
- Constellation number in a circle on the left, content on the right
- Keep the impact analysis badges
- Use shadcn `Badge` for impact labels

**Step 5: Use shared MaterialCard component**
Replace the local `MaterialItemCard` with the shared component from Task 3.

**Step 6: Verify build**
Run: `cd /Users/macosm2/Guild && npm run build`

**Step 7: Commit**
```bash
git add -A && git commit -m "feat: redesign character detail page with shadcn tabs and enhanced layout"
```

---

### Task 8: Redesign Weapons List Page

**Files:**
- Modify: `src/app/weapons/page.tsx`

**Step 1: Enhance filters**
- Same filter pattern as character database: shadcn `Input` for search, `Badge` for filter pills
- Make filter bar sticky
- Add search debouncing (300ms)

**Step 2: Redesign weapon cards**
- Use shadcn `Card` component
- Larger cards than current (reduce grid density)
- Show: weapon icon (larger), name, RarityStars, substat as shadcn Badge with appropriate color
- Better hover effects: scale + rarity-colored glow

**Step 3: Fix grid density**
Change from `grid-cols-3/4/6/8/10` (too dense) to:
`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`

**Step 4: Verify build**
Run: `cd /Users/macosm2/Guild && npm run build`

**Step 5: Commit**
```bash
git add -A && git commit -m "feat: redesign weapons page with larger cards and improved filters"
```

---

### Task 9: Redesign Weapon Detail Page

**Files:**
- Modify: `src/app/weapons/[id]/detail-client.tsx`

**Step 1: Enhance hero section**
- Larger weapon art with rarity-colored background gradient
- Type badge + RarityStars using shared components
- Better stat cards using shadcn Card

**Step 2: Replace custom tabs with shadcn Tabs**
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

**Step 3: Use shared components**
- Replace local RARITY_COLORS, MAT_RARITY_BORDER with imports from constants
- Replace local material card rendering with shared MaterialCard

**Step 4: Verify build**
Run: `cd /Users/macosm2/Guild && npm run build`

**Step 5: Commit**
```bash
git add -A && git commit -m "feat: redesign weapon detail page with shadcn tabs and shared components"
```

---

### Task 10: Add loading skeletons

**Files:**
- Create: `src/app/loading.tsx`
- Create: `src/app/database/loading.tsx`
- Create: `src/app/database/[id]/loading.tsx`
- Create: `src/app/weapons/loading.tsx`
- Create: `src/app/weapons/[id]/loading.tsx`
- Create: `src/app/profile/[uid]/loading.tsx`

**Step 1: Create home loading skeleton**
```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="space-y-8 p-6">
      {/* Hero skeleton */}
      <div className="flex flex-col items-center gap-4 pt-12">
        <Skeleton className="h-16 w-64" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-12 w-80" />
      </div>
      {/* Banner skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      {/* Character grid skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Create database loading skeleton**
Grid of skeleton cards matching the character grid layout.

**Step 3: Create character detail loading skeleton**
Hero skeleton + tabs skeleton + content skeleton.

**Step 4: Create weapons loading skeleton**
Similar to database loading skeleton but for weapon cards.

**Step 5: Create weapon detail loading skeleton**
Similar to character detail loading.

**Step 6: Create profile loading skeleton**

**Step 7: Verify build**
Run: `cd /Users/macosm2/Guild && npm run build`

**Step 8: Commit**
```bash
git add -A && git commit -m "feat: add loading skeleton screens for all routes"
```

---

### Task 11: Performance optimizations

**Files:**
- Modify: `src/app/database/page.tsx` (add image optimization)
- Modify: `src/app/weapons/page.tsx` (add image optimization)
- Modify: `src/app/database/[id]/detail-client.tsx` (optimize images)
- Modify: `src/app/weapons/[id]/detail-client.tsx` (optimize images)

**Step 1: Fix unoptimized images**
Remove `unoptimized` prop from all `next/image` components where possible. The `remotePatterns` in `next.config.ts` already allows enka.network and gi.yatta.moe. This enables Next.js image optimization (WebP conversion, resizing).

**Step 2: Add proper sizes attributes**
Ensure all `Image` components have accurate `sizes` props matching their actual display sizes:
- Character grid cards: `"(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"`
- Weapon grid cards: `"(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"`
- Detail hero images: `"(max-width: 768px) 100vw, 320px"`
- Talent/constellation/material icons: `"48px"` (fixed size)

**Step 3: Add priority to above-fold images**
- Home page hero/banner images: `priority={true}`
- Character/weapon detail hero image: `priority={true}` (already done)
- Grid pages: NO priority (let lazy loading work)

**Step 4: Add genshin.jmp.blue to image domains**
Add to `next.config.ts` remotePatterns:
```typescript
{ protocol: "https", hostname: "genshin.jmp.blue", pathname: "/**" }
```

**Step 5: Verify build**
Run: `cd /Users/macosm2/Guild && npm run build`

**Step 6: Commit**
```bash
git add -A && git commit -m "perf: optimize images with proper sizes, priority, and Next.js optimization"
```

---

### Task 12: Enhance globals.css and theme polish

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add custom scrollbar styling**
```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgb(255 255 255 / 0.1); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgb(255 255 255 / 0.2); }
```

**Step 2: Add smooth scroll**
```css
html { scroll-behavior: smooth; }
```

**Step 3: Add animation utilities**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.animate-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
```

**Step 4: Add enhanced glow classes**
```css
.element-glow-pyro { box-shadow: 0 0 20px rgba(239, 68, 68, 0.2); }
.element-glow-hydro { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
.element-glow-anemo { box-shadow: 0 0 20px rgba(45, 212, 191, 0.2); }
.element-glow-electro { box-shadow: 0 0 20px rgba(168, 85, 247, 0.2); }
.element-glow-cryo { box-shadow: 0 0 20px rgba(103, 232, 249, 0.2); }
.element-glow-geo { box-shadow: 0 0 20px rgba(250, 204, 21, 0.2); }
.element-glow-dendro { box-shadow: 0 0 20px rgba(74, 222, 128, 0.2); }
```

**Step 5: Verify build**
Run: `cd /Users/macosm2/Guild && npm run build`

**Step 6: Commit**
```bash
git add -A && git commit -m "feat: enhance theme with custom scrollbar, animations, and element glows"
```

---

### Task 13: Final code cleanup and quality pass

**Files:**
- All modified files from previous tasks

**Step 1: Remove dead code**
- Remove the unused `CONSTELLATION_IMPACT` empty object in `detail-client.tsx:83`
- Remove unused `ASC_LABELS` in `database/page.tsx:29-34` if not used
- Remove `ELEMENT_COLORS_SHORT` from `characters.ts` if replaced by constants
- Remove mock data constants from old home page that are no longer used

**Step 2: Consolidate imports**
- Ensure all element/rarity constants come from `@/lib/constants`
- Ensure all shared components come from `@/components/shared/`
- Remove any lingering duplicate definitions

**Step 3: Verify full build**
Run: `cd /Users/macosm2/Guild && npm run build`
Expected: Clean build with no errors

**Step 4: Run lint**
Run: `cd /Users/macosm2/Guild && npm run lint`
Fix any lint issues.

**Step 5: Final commit**
```bash
git add -A && git commit -m "refactor: clean up dead code, consolidate imports, fix lint"
```

---

## Execution Order Summary

| Task | Description | Dependencies |
|------|-------------|--------------|
| 1 | Initialize shadcn/ui | None |
| 2 | Shared types & constants | Task 1 |
| 3 | Shared game components | Tasks 1, 2 |
| 4 | Banner data client | Task 2 |
| 5 | Redesign Home Page | Tasks 1-4 |
| 6 | Redesign Character Database | Tasks 1-3 |
| 7 | Redesign Character Detail | Tasks 1-3 |
| 8 | Redesign Weapons List | Tasks 1-3 |
| 9 | Redesign Weapon Detail | Tasks 1-3 |
| 10 | Loading skeletons | Task 1 |
| 11 | Performance optimizations | Tasks 5-9 |
| 12 | Theme polish | Task 1 |
| 13 | Final cleanup | All |

**Parallelizable:** Tasks 6, 7, 8, 9 can run in parallel (independent pages). Task 10 and 12 can run in parallel with 6-9.
