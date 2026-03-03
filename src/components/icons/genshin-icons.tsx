// Custom Genshin-themed SVG icon components
// These replace generic Lucide icons with game-accurate visuals

import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// ── Primogem ✦ ─────────────────────────────────────────────────────────
export function PrimogemIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5L12 2Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 2L15.5 8.5L22 12L15.5 15.5L12 22L8.5 15.5L2 12L8.5 8.5L12 2Z" />
      <path d="M12 7L14 10.5L17 12L14 13.5L12 17L10 13.5L7 12L10 10.5L12 7Z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

// ── Resin (Crescent Moon) ──────────────────────────────────────────────
export function ResinIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3C9.5 3 7.3 4.1 5.8 5.8C4.1 7.3 3 9.5 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12" strokeLinecap="round" />
      <path d="M21 12C21 9.5 19.5 7.3 17.5 6C15.5 4.5 14 4 12 3" strokeLinecap="round" strokeDasharray="2 3" />
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 9V12L14 14" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="5" r="2" fill="currentColor" fillOpacity="0.3" stroke="currentColor" />
    </svg>
  );
}

// ── Intertwined Fate ───────────────────────────────────────────────────
export function FateIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3C12 3 8 8 8 12C8 16 12 21 12 21" strokeLinecap="round" />
      <path d="M12 3C12 3 16 8 16 12C16 16 12 21 12 21" strokeLinecap="round" />
      <ellipse cx="12" cy="12" rx="9" ry="4" />
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

// ── Spiral Abyss Portal ────────────────────────────────────────────────
export function AbyssIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L14.5 4.5L12 7L9.5 4.5L12 2Z" fill="currentColor" fillOpacity="0.2" />
      <circle cx="12" cy="13" r="8" strokeDasharray="3 2" />
      <path d="M12 5C8 5 5 8.5 5 13" strokeLinecap="round" />
      <path d="M12 5C16 5 19 8.5 19 13" strokeLinecap="round" />
      <circle cx="12" cy="13" r="4" fill="currentColor" fillOpacity="0.1" />
      <circle cx="12" cy="13" r="1.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

// ── Compass Rose (Map) ─────────────────────────────────────────────────
export function CompassIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <polygon points="12,4 14,11 12,10 10,11" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
      <polygon points="12,20 14,13 12,14 10,13" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />
      <polygon points="4,12 11,10 10,12 11,14" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />
      <polygon points="20,12 13,10 14,12 13,14" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// ── Kamera (Live/Streamers) ────────────────────────────────────────────
export function KameraIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5.5C8 4.67 8.67 4 9.5 4H14.5C15.33 4 16 4.67 16 5.5V7" />
      <circle cx="12" cy="13.5" r="3.5" />
      <circle cx="12" cy="13.5" r="1.5" fill="currentColor" fillOpacity="0.3" />
      <circle cx="18" cy="9.5" r="1" fill="currentColor" fillOpacity="0.5" />
      <path d="M3 10L5 10" strokeLinecap="round" />
    </svg>
  );
}

// ── Crossed Swords (Builds) ────────────────────────────────────────────
export function BuildIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 19L10 14" strokeLinecap="round" />
      <path d="M19 5L14 10" strokeLinecap="round" />
      <path d="M15 4L20 4L20 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 19L14 14" strokeLinecap="round" />
      <path d="M5 5L10 10" strokeLinecap="round" />
      <path d="M4 9L4 4L9 4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
    </svg>
  );
}

// ── Vision Orb (Database) ──────────────────────────────────────────────
export function VisionIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity="0.1" />
      <path d="M12 7L13.5 10.5L17 12L13.5 13.5L12 17L10.5 13.5L7 12L10.5 10.5L12 7Z" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

// ── Hourglass (Timeline) ───────────────────────────────────────────────
export function HourglassIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2H18" strokeLinecap="round" />
      <path d="M6 22H18" strokeLinecap="round" />
      <path d="M7 2V7.5L12 12L7 16.5V22" />
      <path d="M17 2V7.5L12 12L17 16.5V22" />
      <path d="M9 18.5L12 16L15 18.5V22H9V18.5Z" fill="currentColor" fillOpacity="0.2" />
      <circle cx="12" cy="12" r="1" fill="currentColor" fillOpacity="0.4" />
    </svg>
  );
}

// ── Hidden Eye (Leaks) ─────────────────────────────────────────────────
export function LeakIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2 12C4 7 7.5 4 12 4C16.5 4 20 7 22 12" strokeLinecap="round" />
      <path d="M2 12C4 17 7.5 20 12 20C16.5 20 20 17 22 12" strokeLinecap="round" strokeDasharray="3 2" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <path d="M3 21L21 3" strokeLinecap="round" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

// ── Artifact Slot Icons ────────────────────────────────────────────────

export function FlowerIcon({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="10" r="3" fill="currentColor" fillOpacity="0.3" />
      <path d="M12 7C12 7 14 4 12 2C10 4 12 7 12 7Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M9.5 8.5C9.5 8.5 6 8 5 5.5C7.5 6.5 9.5 8.5 9.5 8.5Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M14.5 8.5C14.5 8.5 18 8 19 5.5C16.5 6.5 14.5 8.5 14.5 8.5Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M10 12.5C10 12.5 7 14 6 17C8.5 15 10 12.5 10 12.5Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M14 12.5C14 12.5 17 14 18 17C15.5 15 14 12.5 14 12.5Z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 13V22" strokeLinecap="round" />
    </svg>
  );
}

export function PlumeIcon({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M5 21C5 21 8 18 10 14C12 10 14 6 18 3C16 7 15 10 14 13C13 16 11 19 5 21Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M5 21C5 21 8 18 10 14C12 10 14 6 18 3" strokeLinecap="round" />
      <path d="M10 14L7 11" strokeLinecap="round" />
      <path d="M12 11L9 8" strokeLinecap="round" />
      <path d="M14 8L12 6" strokeLinecap="round" />
    </svg>
  );
}

export function SandsIcon({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M7 3H17" strokeLinecap="round" />
      <path d="M7 21H17" strokeLinecap="round" />
      <path d="M8 3V8L12 12L8 16V21" />
      <path d="M16 3V8L12 12L16 16V21" />
      <path d="M10 18L12 16.5L14 18V21H10V18Z" fill="currentColor" fillOpacity="0.25" />
    </svg>
  );
}

export function GobletIcon({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2H16L15 11C15 14 13.5 15 12 15C10.5 15 9 14 9 11L8 2Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 2H16L15 11C15 14 13.5 15 12 15C10.5 15 9 14 9 11L8 2Z" />
      <path d="M16 4H19C19 7 17 9 15 9.5" strokeLinecap="round" />
      <path d="M8 4H5C5 7 7 9 9 9.5" strokeLinecap="round" />
      <path d="M12 15V18" />
      <path d="M8 22H16" strokeLinecap="round" />
      <path d="M10 18H14V22H10V18Z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}

export function CircletIcon({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 16C4 10 7 6 12 6C17 6 20 10 20 16" strokeLinecap="round" />
      <path d="M2 16H22" strokeLinecap="round" />
      <path d="M12 6L13 3L14 6" fill="currentColor" fillOpacity="0.3" />
      <path d="M8 9L7 6.5L9 8.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M16 9L17 6.5L15 8.5" fill="currentColor" fillOpacity="0.2" />
      <circle cx="12" cy="11" r="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" />
    </svg>
  );
}

// Map slot name to icon component
export const SLOT_ICONS: Record<string, React.FC<IconProps>> = {
  Flower: FlowerIcon,
  Plume: PlumeIcon,
  Sands: SandsIcon,
  Goblet: GobletIcon,
  Circlet: CircletIcon,
};

// ── Element Vision Icons (Real Genshin Assets) ────────────────────────
// Using official-looking SVG paths that match game assets
function VisionBase({ className, size, children, color }: IconProps & { children: React.ReactNode; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size || 16} height={size || 16} className={cn(color, className)}>
      <path d="M12 2L20 12L12 22L4 12L12 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
      {children}
    </svg>
  );
}

// Pyro — Fire emblem with flame flicker at center
export function PyroIcon({ className, size }: IconProps) {
  return (
    <VisionBase className={className} size={size} color="text-red-500">
      {/* Diamond base */}
      <path d="M12 6L19 12L12 18L5 12L12 6Z" fill="currentColor" fillOpacity="0.4" />
      {/* Inner flame detail */}
      <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M12 9C14 11 15.5 12.5 16 14" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="12" r="0.8" fill="white" fillOpacity="0.9" />
    </VisionBase>
  );
}

// Hydro — Water orb with ripple effect
export function HydroIcon({ className, size }: IconProps) {
  return (
    <VisionBase className={className} size={size} color="text-blue-450">
      <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.35" />
      {/* Ripple rings */}
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.6" />
      <circle cx="12" cy="12" r="2.5" stroke="white" strokeWidth="0.4" fill="none" opacity="0.7" />
      {/* Water droplets */}
      <circle cx="9" cy="10" r="0.6" fill="currentColor" fillOpacity="0.8" />
      <circle cx="15" cy="14" r="0.5" fill="white" fillOpacity="0.9" />
    </VisionBase>
  );
}

// Anemo — Wind swirl with teal glow
export function AnemoIcon({ className, size }: IconProps) {
  return (
    <VisionBase className={className} size={size} color="text-teal-350">
      <path d="M12 8C15 8 18 11 18 14C18 17 15 20 12 20C9 20 6 17 6 14C6 11 9 8 12 8Z" fill="currentColor" fillOpacity="0.3" />
      <path d="M12 8C13.5 9.5 15 11.5 16 14C15 15.5 13 17 12 18C11 17 9 15.5 8 14C7 11.5 8.5 9.5 10 8" stroke="currentColor" strokeWidth="0.6" fill="none" opacity="0.7" />
      <circle cx="12" cy="12" r="1" fill="currentColor" fillOpacity="0.5" />
    </VisionBase>
  );
}

// Electro — Lightning bolt diamond
export function ElectroIcon({ className, size }: IconProps) {
  return (
    <VisionBase className={className} size={size} color="text-purple-400">
      <path d="M12 6L9.5 11H7L9.5 16" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <path d="M16 6L13.5 11H16L18.5 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M12 9C13.5 10.5 14 12.5 14 14C14 15.5 13 17 12 18C11 17 10 15.5 10 14C10 12.5 10.5 10.5 12 9Z" fill="none" stroke="currentColor" strokeWidth="0.6" />
    </VisionBase>
  );
}

// Cryo — Ice shard with frost edges
export function CryoIcon({ className, size }: IconProps) {
  return (
    <VisionBase className={className} size={size} color="text-cyan-300">
      <path d="M12 6L4 12L12 18L20 12L12 6Z" fill="currentColor" fillOpacity="0.35" />
      {/* Frost crystallization */}
      <path d="M8 12C8 9 10 7 12 7C14 7 16 9 16 12C16 14 14 16 12 16C10 16 8 14 8 12Z" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.7" />
      <circle cx="12" cy="9" r="0.8" fill="white" fillOpacity="0.9" />
      <circle cx="12" cy="15" r="0.6" fill="currentColor" fillOpacity="0.7" />
    </VisionBase>
  );
}

// Geo — Stone gem with gold rim
export function GeoIcon({ className, size }: IconProps) {
  return (
    <VisionBase className={className} size={size} color="text-yellow-450">
      <path d="M12 6L18 9L15 15L9 12L12 6Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="12" cy="10.5" r="2" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.8" />
      <path d="M12 9V12L14 14L11 16L9 14L7 16L10 14Z" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.8" />
      <circle cx="12" cy="11" r="0.5" fill="black" fillOpacity="0.4" />
    </VisionBase>
  );
}

// Dendro — Leaf sprout with growth spiral
export function DendroIcon({ className, size }: IconProps) {
  return (
    <VisionBase className={className} size={size} color="text-green-450">
      <path d="M12 6C9.5 8 7 11 7 14C7 17 9 19 12 20C15 19 17 17 17 14C17 11 14.5 8 12 6Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7" />
      <path d="M8.5 8.5C9 9 9 10.5 10 11C10.5 11.5 11.5 11 12 11.5C12.5 12 13 11 13 10" fill="currentColor" fillOpacity="0.4" />
      <path d="M10 13C9.5 13.5 9 14.5 8 16C8.5 16 9.5 17 10 17C10.5 17 12 16.5 12 16" stroke="currentColor" strokeWidth="0.6" fill="none" />
      <circle cx="12" cy="10.5" r="1.5" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.8" />
    </VisionBase>
  );
}

export const ELEMENT_ICONS: Record<string, React.FC<IconProps>> = {
  Pyro: PyroIcon,
  Hydro: HydroIcon,
  Anemo: AnemoIcon,
  Electro: ElectroIcon,
  Cryo: CryoIcon,
  Geo: GeoIcon,
  Dendro: DendroIcon,
};

// ── Constellation Star ─────────────────────────────────────────────────
export function ConstellationIcon({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="5" r="1.5" fill="currentColor" fillOpacity="0.6" />
      <circle cx="6" cy="9" r="1.2" fill="currentColor" fillOpacity="0.4" />
      <circle cx="18" cy="9" r="1.2" fill="currentColor" fillOpacity="0.4" />
      <circle cx="8" cy="16" r="1.2" fill="currentColor" fillOpacity="0.4" />
      <circle cx="16" cy="16" r="1.2" fill="currentColor" fillOpacity="0.4" />
      <circle cx="12" cy="20" r="1" fill="currentColor" fillOpacity="0.3" />
      <path d="M12 5L6 9M12 5L18 9M6 9L8 16M18 9L16 16M8 16L12 20M16 16L12 20" strokeOpacity="0.3" />
    </svg>
  );
}

// ── Fire Verdict ───────────────────────────────────────────────────────
export function VerdictIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2C12 2 7 8 7 14C7 18 9 22 12 22C15 22 17 18 17 14C17 8 12 2 12 2Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M12 2C12 2 7 8 7 14C7 18 9 22 12 22C15 22 17 18 17 14C17 8 12 2 12 2Z" />
      <path d="M12 10C12 10 9.5 13 9.5 15.5C9.5 17.5 10.5 19 12 19C13.5 19 14.5 17.5 14.5 15.5C14.5 13 12 10 12 10Z" fill="currentColor" fillOpacity="0.3" />
      <path d="M12 14V17" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

// ── Weapon Blade ───────────────────────────────────────────────────────
export function WeaponIcon({ className, size = 20 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18 3L21 6L10 17L7 20L4 20L4 17L7 14L18 3Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M18 3L21 6L10 17L7 20L4 20L4 17L7 14L18 3Z" />
      <path d="M15 6L18 9" strokeLinecap="round" />
      <path d="M4 20L8 16" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

export function TrophyIcon({ className, size = 16 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 2H16V10C16 13 14 15 12 15C10 15 8 13 8 10V2Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M8 2H16V10C16 13 14 15 12 15C10 15 8 13 8 10V2Z" />
      <path d="M16 4H19C19 7 17 9 15 10" strokeLinecap="round" />
      <path d="M8 4H5C5 7 7 9 9 10" strokeLinecap="round" />
      <path d="M12 15V18" />
      <path d="M8 22H16" strokeLinecap="round" />
      <path d="M10 18H14V22H10V18Z" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}
