'use client';

import { cn } from '@/lib/utils';
import { FallbackImage } from '@/components/shared';
import { charIconUrl } from '@/lib/characters';
import { ELEMENT_COLORS, ENKA_UI, SUBSTAT_COLORS } from '@/lib/constants';
import {
  calculateCV,
  grade,
  scoreArtifact,
  scoreCharacterBuild,
  scoreColor,
  getTier,
  getTierLabel,
  tierBadge,
} from '@/lib/scoring';
import type { Character, Artifact } from '@/lib/enka/client';
import {
  GitCompareArrows,
  Search,
  Trophy,
  Crown,
  Swords,
  Shield,
  ChevronDown,
  Loader2,
  Users,
  ArrowRight,
  Star,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useState, useCallback, useMemo } from 'react';

// ── Types ────────────────────────────────────────────────────────────────

interface ProfileData {
  player: { nickname: string; level: number };
  characters: Character[];
  uid: string;
  source: string;
}

type CompareMode = 'common' | 'all';

// ── Helpers ──────────────────────────────────────────────────────────────

const ARTIFACT_SLOTS = ['Flower', 'Plume', 'Sands', 'Goblet', 'Circlet'] as const;

function totalCV(char: Character): number {
  let cv = 0;
  for (const art of char.artifacts) {
    cv += calculateCV(art.substats);
  }
  return Math.round(cv * 10) / 10;
}

function getArtifactSets(artifacts: Artifact[]): { name: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const a of artifacts) {
    counts[a.set] = (counts[a.set] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .filter((s) => s.count >= 2)
    .sort((a, b) => b.count - a.count);
}

function winnerClass(aVal: number, bVal: number, higher: boolean = true): [string, string] {
  if (aVal === bVal) return ['', ''];
  const aWins = higher ? aVal > bVal : aVal < bVal;
  return aWins
    ? ['bg-emerald-500/10 border-emerald-500/20', '']
    : ['', 'bg-emerald-500/10 border-emerald-500/20'];
}

// ── Skeleton ─────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-white/5', className)} />
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-5 w-28" />
      <div className="grid grid-cols-4 gap-2 mt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function ComparisonSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}

// ── Stat Row ─────────────────────────────────────────────────────────────

function StatRow({
  label,
  valA,
  valB,
  format,
  higherBetter = true,
}: {
  label: string;
  valA: number;
  valB: number;
  format?: (v: number) => string;
  higherBetter?: boolean;
}) {
  const fmt = format || ((v: number) => String(v));
  const [clsA, clsB] = winnerClass(valA, valB, higherBetter);

  return (
    <div className="grid grid-cols-3 gap-2 items-center text-sm py-1.5">
      <div
        className={cn(
          'text-right px-2 py-1 rounded-md transition-colors',
          clsA,
          clsA ? 'text-emerald-400 font-semibold' : 'text-foreground',
        )}
      >
        {fmt(valA)}
      </div>
      <div className="text-center text-guild-muted text-xs">{label}</div>
      <div
        className={cn(
          'text-left px-2 py-1 rounded-md transition-colors',
          clsB,
          clsB ? 'text-emerald-400 font-semibold' : 'text-foreground',
        )}
      >
        {fmt(valB)}
      </div>
    </div>
  );
}

// ── Artifact Card ────────────────────────────────────────────────────────

function ArtifactCompareCard({
  artA,
  artB,
  slot,
}: {
  artA: Artifact | undefined;
  artB: Artifact | undefined;
  slot: string;
}) {
  const scoreA = artA ? scoreArtifact(artA) : 0;
  const scoreB = artB ? scoreArtifact(artB) : 0;
  const cvA = artA ? calculateCV(artA.substats) : 0;
  const cvB = artB ? calculateCV(artB.substats) : 0;
  const [winA, winB] = winnerClass(scoreA, scoreB);

  return (
    <div className="rounded-xl bg-guild-card border border-white/5 overflow-hidden">
      <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5">
        <h4 className="text-sm font-medium text-guild-muted text-center">{slot}</h4>
      </div>
      <div className="grid grid-cols-2 divide-x divide-white/5">
        {/* Side A */}
        <div className={cn('p-3 space-y-2', winA && 'bg-emerald-500/5')}>
          {artA ? (
            <>
              <div className="flex items-center gap-2">
                <FallbackImage
                  src={`${ENKA_UI}/${artA.icon}.png`}
                  alt={artA.set}
                  width={32}
                  height={32}
                  className="rounded"
                />
                <div className="min-w-0">
                  <p className="text-xs text-guild-muted truncate">{artA.set}</p>
                  <p className="text-xs font-medium">
                    {artA.mainStat} <span className="text-guild-accent">{artA.mainValue}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-0.5">
                {artA.substats.map((sub) => {
                  const color = SUBSTAT_COLORS[sub.name] || 'text-guild-muted';
                  return (
                    <p key={sub.name} className={cn('text-xs', color)}>
                      {sub.name}: {sub.value}
                    </p>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className={cn('text-xs font-bold', scoreColor(scoreA))}>
                  {grade(scoreA)}
                </span>
                <span className="text-xs text-guild-dim">
                  {cvA.toFixed(1)} CV
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-guild-dim text-center py-4">No artifact</p>
          )}
        </div>

        {/* Side B */}
        <div className={cn('p-3 space-y-2', winB && 'bg-emerald-500/5')}>
          {artB ? (
            <>
              <div className="flex items-center gap-2">
                <FallbackImage
                  src={`${ENKA_UI}/${artB.icon}.png`}
                  alt={artB.set}
                  width={32}
                  height={32}
                  className="rounded"
                />
                <div className="min-w-0">
                  <p className="text-xs text-guild-muted truncate">{artB.set}</p>
                  <p className="text-xs font-medium">
                    {artB.mainStat} <span className="text-guild-accent">{artB.mainValue}</span>
                  </p>
                </div>
              </div>
              <div className="space-y-0.5">
                {artB.substats.map((sub) => {
                  const color = SUBSTAT_COLORS[sub.name] || 'text-guild-muted';
                  return (
                    <p key={sub.name} className={cn('text-xs', color)}>
                      {sub.name}: {sub.value}
                    </p>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className={cn('text-xs font-bold', scoreColor(scoreB))}>
                  {grade(scoreB)}
                </span>
                <span className="text-xs text-guild-dim">
                  {cvB.toFixed(1)} CV
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-guild-dim text-center py-4">No artifact</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Character Selector ───────────────────────────────────────────────────

function CharacterGrid({
  characters,
  selectedId,
  onSelect,
  side,
}: {
  characters: Character[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  side: 'A' | 'B';
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {characters.map((char) => {
        const elColor = ELEMENT_COLORS[char.element];
        const isSelected = char.id === selectedId;
        return (
          <button
            key={`${side}-${char.id}`}
            onClick={() => onSelect(char.id)}
            className={cn(
              'relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all',
              isSelected
                ? `${elColor?.border || 'border-guild-accent'} ring-1 ring-guild-accent/40 scale-105`
                : 'border-white/10 hover:border-white/25 hover:scale-105',
            )}
            title={char.name}
          >
            <FallbackImage
              src={charIconUrl(char.id)}
              alt={char.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
            {isSelected && (
              <div className="absolute inset-0 bg-guild-accent/10 pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────

export default function BuildComparePage() {
  const [uidA, setUidA] = useState('');
  const [uidB, setUidB] = useState('');
  const [profileA, setProfileA] = useState<ProfileData | null>(null);
  const [profileB, setProfileB] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCharA, setSelectedCharA] = useState<string | null>(null);
  const [selectedCharB, setSelectedCharB] = useState<string | null>(null);
  const [mode, setMode] = useState<CompareMode>('common');

  // Fetch both profiles
  const handleCompare = useCallback(async () => {
    if (!uidA.trim() || !uidB.trim()) {
      setError('Enter both UIDs to compare.');
      return;
    }
    if (!/^\d{9,10}$/.test(uidA.trim()) || !/^\d{9,10}$/.test(uidB.trim())) {
      setError('UIDs must be 9-10 digits.');
      return;
    }
    if (uidA.trim() === uidB.trim()) {
      setError('Enter two different UIDs to compare.');
      return;
    }

    setError(null);
    setLoading(true);
    setProfileA(null);
    setProfileB(null);
    setSelectedCharA(null);
    setSelectedCharB(null);

    try {
      const [resA, resB] = await Promise.all([
        fetch(`/api/profile/${uidA.trim()}`),
        fetch(`/api/profile/${uidB.trim()}`),
      ]);

      if (!resA.ok) {
        const body = await resA.json().catch(() => ({}));
        throw new Error(body.error || `Failed to fetch UID ${uidA.trim()}`);
      }
      if (!resB.ok) {
        const body = await resB.json().catch(() => ({}));
        throw new Error(body.error || `Failed to fetch UID ${uidB.trim()}`);
      }

      const dataA: ProfileData = await resA.json();
      const dataB: ProfileData = await resB.json();

      if (!dataA.characters || dataA.characters.length === 0) {
        throw new Error(`${dataA.player?.nickname || uidA} has no characters in showcase.`);
      }
      if (!dataB.characters || dataB.characters.length === 0) {
        throw new Error(`${dataB.player?.nickname || uidB} has no characters in showcase.`);
      }

      setProfileA(dataA);
      setProfileB(dataB);

      // Auto-select first common character
      const idsA = new Set(dataA.characters.map((c) => c.id));
      const common = dataB.characters.filter((c) => idsA.has(c.id));
      if (common.length > 0) {
        setSelectedCharA(common[0].id);
        setSelectedCharB(common[0].id);
        setMode('common');
      } else {
        setSelectedCharA(dataA.characters[0].id);
        setSelectedCharB(dataB.characters[0].id);
        setMode('all');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [uidA, uidB]);

  // Common characters (shared between both profiles)
  const commonChars = useMemo(() => {
    if (!profileA || !profileB) return [];
    const idsA = new Set(profileA.characters.map((c) => c.id));
    return profileB.characters.filter((c) => idsA.has(c.id));
  }, [profileA, profileB]);

  // Resolved selected characters
  const charA = useMemo(
    () => profileA?.characters.find((c) => c.id === selectedCharA) ?? null,
    [profileA, selectedCharA],
  );
  const charB = useMemo(
    () => profileB?.characters.find((c) => c.id === selectedCharB) ?? null,
    [profileB, selectedCharB],
  );

  // When in common mode, selecting one character selects it on both sides
  const handleCommonSelect = useCallback(
    (id: string) => {
      setSelectedCharA(id);
      setSelectedCharB(id);
    },
    [],
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <GitCompareArrows className="w-7 h-7 text-guild-accent" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Build Compare</h1>
        </div>
        <p className="text-guild-muted text-sm">
          Compare builds between two players side by side
        </p>
      </div>

      {/* UID Inputs */}
      <div className="rounded-xl bg-guild-card border border-white/5 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          {/* Player A */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-guild-muted uppercase tracking-wider">
              Player 1
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-guild-dim" />
              <input
                type="text"
                value={uidA}
                onChange={(e) => setUidA(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter UID..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-guild-elevated border border-white/10 text-foreground placeholder:text-guild-dim text-sm focus:outline-none focus:border-guild-accent/50 focus:ring-1 focus:ring-guild-accent/25 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
              />
            </div>
          </div>

          {/* VS / Compare Button */}
          <div className="flex flex-col items-center gap-2 pb-0.5">
            <span className="text-xs text-guild-dim font-bold hidden md:block">VS</span>
            <button
              onClick={handleCompare}
              disabled={loading}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all',
                loading
                  ? 'bg-guild-elevated text-guild-muted cursor-not-allowed'
                  : 'bg-guild-accent hover:bg-guild-accent/80 text-white shadow-lg shadow-guild-accent/20',
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching...
                </>
              ) : (
                <>
                  <GitCompareArrows className="w-4 h-4" />
                  Compare
                </>
              )}
            </button>
          </div>

          {/* Player B */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-guild-muted uppercase tracking-wider">
              Player 2
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-guild-dim" />
              <input
                type="text"
                value={uidB}
                onChange={(e) => setUidB(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter UID..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-guild-elevated border border-white/10 text-foreground placeholder:text-guild-dim text-sm focus:outline-none focus:border-guild-accent/50 focus:ring-1 focus:ring-guild-accent/25 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleCompare()}
              />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <X className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && <ComparisonSkeleton />}

      {/* Results */}
      {profileA && profileB && !loading && (
        <>
          {/* Player Names + Character Selector */}
          <div className="rounded-xl bg-guild-card border border-white/5 p-4 md:p-6 space-y-4">
            {/* Player headers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-lg font-bold">{profileA.player.nickname}</h2>
                <p className="text-xs text-guild-dim">
                  AR {profileA.player.level} &middot; UID {profileA.uid}
                </p>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold">{profileB.player.nickname}</h2>
                <p className="text-xs text-guild-dim">
                  AR {profileB.player.level} &middot; UID {profileB.uid}
                </p>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setMode('common')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  mode === 'common'
                    ? 'bg-guild-accent text-white'
                    : 'bg-guild-elevated text-guild-muted hover:text-foreground',
                )}
              >
                <Users className="w-3.5 h-3.5 inline mr-1" />
                Common ({commonChars.length})
              </button>
              <button
                onClick={() => setMode('all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  mode === 'all'
                    ? 'bg-guild-accent text-white'
                    : 'bg-guild-elevated text-guild-muted hover:text-foreground',
                )}
              >
                Pick Any
              </button>
            </div>

            {/* Character Selection */}
            {mode === 'common' ? (
              <div>
                {commonChars.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs text-guild-dim text-center">
                      Select a character both players have
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {commonChars.map((char) => {
                        const elColor = ELEMENT_COLORS[char.element];
                        const isSelected = char.id === selectedCharA;
                        return (
                          <button
                            key={`common-${char.id}`}
                            onClick={() => handleCommonSelect(char.id)}
                            className={cn(
                              'relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all',
                              isSelected
                                ? `${elColor?.border || 'border-guild-accent'} ring-1 ring-guild-accent/40 scale-105`
                                : 'border-white/10 hover:border-white/25 hover:scale-105',
                            )}
                            title={char.name}
                          >
                            <FallbackImage
                              src={charIconUrl(char.id)}
                              alt={char.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-guild-muted py-4">
                    No common characters found. Switch to &quot;Pick Any&quot; mode.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs text-guild-dim">
                    {profileA.player.nickname}&apos;s character
                  </p>
                  <CharacterGrid
                    characters={profileA.characters}
                    selectedId={selectedCharA}
                    onSelect={setSelectedCharA}
                    side="A"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-guild-dim">
                    {profileB.player.nickname}&apos;s character
                  </p>
                  <CharacterGrid
                    characters={profileB.characters}
                    selectedId={selectedCharB}
                    onSelect={setSelectedCharB}
                    side="B"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Comparison Panel */}
          {charA && charB && (
            <ComparisonPanel
              charA={charA}
              charB={charB}
              nameA={profileA.player.nickname}
              nameB={profileB.player.nickname}
            />
          )}
        </>
      )}

      {/* Empty state */}
      {!profileA && !profileB && !loading && !error && (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-full bg-guild-elevated flex items-center justify-center mx-auto">
            <Swords className="w-8 h-8 text-guild-dim" />
          </div>
          <p className="text-guild-muted">Enter two UIDs above and click Compare</p>
          <p className="text-xs text-guild-dim max-w-md mx-auto">
            Both players need their Character Showcase set to public in-game.
            Go to Profile &gt; Character Showcase and make sure it is visible.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Comparison Panel ─────────────────────────────────────────────────────

function ComparisonPanel({
  charA,
  charB,
  nameA,
  nameB,
}: {
  charA: Character;
  charB: Character;
  nameA: string;
  nameB: string;
}) {
  const scoreA = scoreCharacterBuild(charA);
  const scoreB = scoreCharacterBuild(charB);
  const tierA = getTier(scoreA);
  const tierB = getTier(scoreB);
  const cvA = totalCV(charA);
  const cvB = totalCV(charB);

  // Determine overall winner
  const aWinsOverall = scoreA > scoreB;
  const bWinsOverall = scoreB > scoreA;
  const isDraw = scoreA === scoreB;

  const elColorA = ELEMENT_COLORS[charA.element];
  const elColorB = ELEMENT_COLORS[charB.element];

  return (
    <div className="space-y-4">
      {/* Overall verdict */}
      <div className="rounded-xl bg-guild-card border border-white/5 p-4 md:p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Player A summary */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full overflow-hidden border-2 border-white/10">
              <FallbackImage
                src={charIconUrl(charA.id)}
                alt={charA.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className={cn('text-sm font-bold', elColorA?.text)}>{charA.name}</p>
              <p className="text-xs text-guild-dim">{nameA}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black">{scoreA}</span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  tierBadge[tierA],
                )}
              >
                {getTierLabel(scoreA)}
              </span>
            </div>
            {aWinsOverall && (
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <Crown className="w-4 h-4" />
                <span className="text-xs font-bold">Winner</span>
              </div>
            )}
          </div>

          {/* VS divider */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center font-black text-lg',
                isDraw
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-guild-elevated text-guild-muted',
              )}
            >
              {isDraw ? '=' : 'VS'}
            </div>
          </div>

          {/* Player B summary */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full overflow-hidden border-2 border-white/10">
              <FallbackImage
                src={charIconUrl(charB.id)}
                alt={charB.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className={cn('text-sm font-bold', elColorB?.text)}>{charB.name}</p>
              <p className="text-xs text-guild-dim">{nameB}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-2xl font-black">{scoreB}</span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  tierBadge[tierB],
                )}
              >
                {getTierLabel(scoreB)}
              </span>
            </div>
            {bWinsOverall && (
              <div className="flex items-center justify-center gap-1 text-emerald-400">
                <Crown className="w-4 h-4" />
                <span className="text-xs font-bold">Winner</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Comparison */}
      <div className="rounded-xl bg-guild-card border border-white/5 p-4 md:p-6 space-y-1">
        <h3 className="text-sm font-semibold text-guild-muted text-center mb-3">
          Character Stats
        </h3>

        <div className="grid grid-cols-3 gap-2 items-center text-xs text-guild-dim pb-2 border-b border-white/5">
          <div className="text-right">{nameA}</div>
          <div className="text-center">Stat</div>
          <div className="text-left">{nameB}</div>
        </div>

        <StatRow
          label="Level"
          valA={charA.level}
          valB={charB.level}
          format={(v) => `Lv. ${v}`}
        />
        <StatRow
          label="Constellation"
          valA={charA.constellation}
          valB={charB.constellation}
          format={(v) => `C${v}`}
        />
        <StatRow
          label="Talents"
          valA={charA.talents.reduce((a, b) => a + b, 0)}
          valB={charB.talents.reduce((a, b) => a + b, 0)}
          format={(v) => {
            // Show the full talent split for the corresponding character
            const char = v === charA.talents.reduce((a, b) => a + b, 0) ? charA : charB;
            return char.talents.join(' / ');
          }}
        />
        <StatRow
          label="Build Score"
          valA={scoreA}
          valB={scoreB}
          format={(v) => `${v} / 10`}
        />
        <StatRow
          label="Total CV"
          valA={cvA}
          valB={cvB}
          format={(v) => v.toFixed(1)}
        />

        {/* Combat stats */}
        <div className="border-t border-white/5 pt-2 mt-2" />
        <StatRow
          label="Max HP"
          valA={charA.combatStats.maxHP}
          valB={charB.combatStats.maxHP}
          format={(v) => v.toLocaleString()}
        />
        <StatRow
          label="ATK"
          valA={charA.combatStats.atk}
          valB={charB.combatStats.atk}
          format={(v) => v.toLocaleString()}
        />
        <StatRow
          label="DEF"
          valA={charA.combatStats.def}
          valB={charB.combatStats.def}
          format={(v) => v.toLocaleString()}
        />
        <StatRow
          label="CRIT Rate"
          valA={charA.combatStats.critRate}
          valB={charB.combatStats.critRate}
          format={(v) => `${v.toFixed(1)}%`}
        />
        <StatRow
          label="CRIT DMG"
          valA={charA.combatStats.critDMG}
          valB={charB.combatStats.critDMG}
          format={(v) => `${v.toFixed(1)}%`}
        />
        <StatRow
          label="ER"
          valA={charA.combatStats.energyRecharge}
          valB={charB.combatStats.energyRecharge}
          format={(v) => `${v.toFixed(1)}%`}
        />
        <StatRow
          label="EM"
          valA={charA.combatStats.elementalMastery}
          valB={charB.combatStats.elementalMastery}
        />
      </div>

      {/* Weapon Comparison */}
      <div className="rounded-xl bg-guild-card border border-white/5 p-4 md:p-6">
        <h3 className="text-sm font-semibold text-guild-muted text-center mb-3">
          <Swords className="w-4 h-4 inline mr-1.5" />
          Weapon
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <WeaponCard weapon={charA.weapon} />
          <WeaponCard weapon={charB.weapon} />
        </div>
      </div>

      {/* Artifact Set Bonuses */}
      <div className="rounded-xl bg-guild-card border border-white/5 p-4 md:p-6">
        <h3 className="text-sm font-semibold text-guild-muted text-center mb-3">
          <Shield className="w-4 h-4 inline mr-1.5" />
          Artifact Sets
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <SetBonusList artifacts={charA.artifacts} />
          <SetBonusList artifacts={charB.artifacts} />
        </div>
      </div>

      {/* Artifact Slot-by-Slot */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-guild-muted text-center">
          Artifact Breakdown
        </h3>
        {ARTIFACT_SLOTS.map((slot) => {
          const artA = charA.artifacts.find((a) => a.slot === slot);
          const artB = charB.artifacts.find((a) => a.slot === slot);
          return (
            <ArtifactCompareCard key={slot} artA={artA} artB={artB} slot={slot} />
          );
        })}
      </div>
    </div>
  );
}

// ── Weapon Card ──────────────────────────────────────────────────────────

function WeaponCard({ weapon }: { weapon: Character['weapon'] }) {
  const rarityColors: Record<number, string> = {
    5: 'border-amber-500/30',
    4: 'border-purple-500/30',
    3: 'border-blue-500/30',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg bg-guild-elevated p-3 border',
        rarityColors[weapon.rarity] || 'border-white/5',
      )}
    >
      <FallbackImage
        src={`${ENKA_UI}/${weapon.icon}.png`}
        alt={weapon.name}
        width={40}
        height={40}
        className="rounded"
      />
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{weapon.name}</p>
        <p className="text-xs text-guild-muted">
          Lv. {weapon.level} &middot; R{weapon.refinement}
        </p>
        <div className="flex gap-0.5 mt-0.5">
          {Array.from({ length: weapon.rarity }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'w-2.5 h-2.5',
                weapon.rarity >= 5
                  ? 'text-amber-400'
                  : weapon.rarity >= 4
                    ? 'text-purple-400'
                    : 'text-blue-400',
              )}
              fill="currentColor"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Set Bonus List ───────────────────────────────────────────────────────

function SetBonusList({ artifacts }: { artifacts: Artifact[] }) {
  const sets = getArtifactSets(artifacts);

  if (sets.length === 0) {
    return <p className="text-xs text-guild-dim text-center py-2">No set bonuses</p>;
  }

  return (
    <div className="space-y-1.5">
      {sets.map((set) => (
        <div
          key={set.name}
          className="flex items-center gap-2 rounded-lg bg-guild-elevated px-3 py-2"
        >
          <span
            className={cn(
              'text-xs font-bold px-1.5 py-0.5 rounded',
              set.count >= 4
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-blue-500/20 text-blue-400',
            )}
          >
            {set.count}pc
          </span>
          <span className="text-xs truncate">{set.name}</span>
        </div>
      ))}
    </div>
  );
}
