# Guild Website v2 Enhancement Design

## Overview

V2 overhaul focusing on: eliminating external image dependencies (local assets), fixing broken banners, real Genshin element icons, deep indigo aesthetic inspired by paimon.moe/lunaris.moe, new Calendar and Abyss guide pages, and overall performance improvements.

## Core Issues Fixed

1. **504 Gateway Timeouts** — All images served locally from `public/assets/`, zero external CDN calls
2. **Broken Banners** — Hardcoded banner data instead of fragile paimon.moe JS parser
3. **Slow UID Lookup** — Add timeout, retry, better error messaging
4. **Generic Element Icons** — Replace diamond SVGs with real Genshin Vision icons
5. **No Any Types** — Clean all `any` usage from codebase

## Local Image System

Download script downloads from gi.yatta.moe CDN to:
- `public/assets/characters/{id}/icon.png` (111 files)
- `public/assets/characters/{id}/gacha.png` (111 files)
- `public/assets/characters/{id}/side.png` (111 files)
- `public/assets/weapons/{id}/icon.png` (232 files)
- `public/assets/elements/{element}.png` (7 files)

Helper functions rewritten to return local paths. All `remotePatterns` removed except gi.yatta.moe (still needed for material icons on detail pages).

## Visual Identity (paimon.moe inspired)

- Background: `#1a1b2e` (deep indigo-navy)
- Cards: `#252841` (indigo-tinted)
- Elevated: `#2d3054`
- Element-colored accents on cards, filters, badges
- 5-star golden shimmer borders, 4-star purple tint
- Poppins font for headings (like gi.yatta.moe)

## New Pages

### Calendar (`/calendar`)
- Current version events list with type badges
- Countdown timers per event
- Timeline-style vertical layout
- Hardcoded data in `src/data/events.ts`

### Abyss Guide (`/abyss`)
- Tabs for Spiral Abyss floors 9-12
- Enemy info, ley line disorders
- Recommended team compositions with character icons
- Boss HP and elemental resistance charts
- Hardcoded data in `src/data/abyss.ts`

## Banner Fix

Hardcoded in `src/data/banners.ts`. Pure synchronous `getActiveBanners()`. No network calls.

## Performance

- Zero external image fetches on any page except character/weapon detail (yatta API for talent data)
- All images under `/public/assets/` served by Next.js static file server
- No more 504 timeouts
- Pages load instantly
