# Build Page Visual Overhaul — Design Doc

**Date:** 2026-03-06
**Scope:** Profile/UID lookup build page visual improvements

## Changes

### 1. Character Splash Art (replace circular icon)
- **Current:** 200x200 circular character icon from Enka UI CDN
- **New:** Full gacha splash art (`charGachaUrl`) filling the left panel as background
- Object position: `object-cover object-[50%_15%]` to focus on upper body
- Element-tinted gradient overlay on top (using existing `elBg` map)
- Character name + stats overlay at bottom with backdrop blur

### 2. Element Color Overlay on Character Selector Cards
- **Current:** Character selector cards have rarity-based ring colors only
- **New:** Add subtle element-colored background gradient to the selected character card
- Unselected cards get a very faint element tint on hover

### 3. Bigger Artifact Icons + Visible Substat Rolls
- **Current:** Artifact icons are 36px (`w-9 h-9`), substats at `text-[10px]`, roll count at `text-[9px]` only shown when >1
- **New:**
  - Icons: 48px (`w-12 h-12`)
  - Substats: `text-xs` (12px), with more spacing
  - Roll count: always visible as colored dots/pips (1-5 dots), styled by roll quality
  - Roll count text (`x3`, `x4`) at `text-[11px]` with quality color

### 4. Top% Badge on Character Selector Cards
- **Current:** Top% only shown in the detail panel under "Akasha Leaderboard"
- **New:** Small "Top X%" badge on each character card in the selector row
- Gold badge for top 1%, green for top 10%, muted for rest
- Only shown when Akasha ranking data is available for that character

### 5. Move Roll Quality from Verdict to Artifacts Section
- Remove the per-artifact roll quality bars from the BUILD VERDICT section
- Roll quality is now shown inline with each artifact (via the bigger substats + roll dots)

## Files to Modify
- `src/components/profile/profile-client.tsx` — all UI changes
- `src/lib/scoring.ts` — no changes needed (scoring logic stays same)

## Not In Scope (deferred to later sessions)
- Boss/monster icons in endgame page
- Build improvement recommendations card
- Recommended stats per character
- Roast improvements
- Per-piece resin estimates
