'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMounted } from '@/hooks/use-mounted';
import {
  Search,
  Check,
  Filter,
  Star,
  Globe,
  BookOpen,
  Swords,
  DoorOpen,
  Map,
  ChevronDown,
  Trophy,
  CheckCheck,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PrimogemIcon } from '@/components/icons/genshin-icons';

// ── Types ────────────────────────────────────────────────────────────────

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  primogems: 5 | 10 | 20;
}

type AchievementCategory =
  | 'Wonders of the World'
  | 'Memories'
  | 'Challenger'
  | 'Domains'
  | 'Exploration';

type CompletionFilter = 'all' | 'completed' | 'incomplete';

// ── Category metadata ────────────────────────────────────────────────────

const CATEGORIES: {
  name: AchievementCategory;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    name: 'Wonders of the World',
    icon: <Globe className="h-4 w-4" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    name: 'Memories',
    icon: <BookOpen className="h-4 w-4" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    name: 'Challenger',
    icon: <Swords className="h-4 w-4" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  {
    name: 'Domains',
    icon: <DoorOpen className="h-4 w-4" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
  },
  {
    name: 'Exploration',
    icon: <Map className="h-4 w-4" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.name, c]));

// ── Achievement Data ─────────────────────────────────────────────────────

const ACHIEVEMENTS: Achievement[] = [
  // ── Wonders of the World (16) ──────────────────────────────────────────
  { id: 'wow-01', name: 'Wind-Blessed Traveler', description: 'Unlock all Teleport Waypoints in Mondstadt.', category: 'Wonders of the World', primogems: 20 },
  { id: 'wow-02', name: 'Rock-Steady Traveler', description: 'Unlock all Teleport Waypoints in Liyue.', category: 'Wonders of the World', primogems: 20 },
  { id: 'wow-03', name: 'Lightning-Riding Traveler', description: 'Unlock all Teleport Waypoints in Inazuma.', category: 'Wonders of the World', primogems: 20 },
  { id: 'wow-04', name: 'Rainforest Traveler', description: 'Unlock all Teleport Waypoints in Sumeru.', category: 'Wonders of the World', primogems: 20 },
  { id: 'wow-05', name: 'Fontaine Traveler', description: 'Unlock all Teleport Waypoints in Fontaine.', category: 'Wonders of the World', primogems: 20 },
  { id: 'wow-06', name: 'Natlan Traveler', description: 'Unlock all Teleport Waypoints in Natlan.', category: 'Wonders of the World', primogems: 20 },
  { id: 'wow-07', name: 'Peak of Vindagnyr', description: 'Reach the summit of Dragonspine.', category: 'Wonders of the World', primogems: 10 },
  { id: 'wow-08', name: 'The Crown of Inazuma', description: 'Reach the peak of Mt. Yougou.', category: 'Wonders of the World', primogems: 10 },
  { id: 'wow-09', name: 'First Light of Dawn', description: 'Witness a sunrise from Stormterror\'s Lair.', category: 'Wonders of the World', primogems: 5 },
  { id: 'wow-10', name: 'Seven Statue Seeker', description: 'Find all Statues of The Seven in Mondstadt.', category: 'Wonders of the World', primogems: 10 },
  { id: 'wow-11', name: 'Geo Archon\'s Gaze', description: 'Find all Statues of The Seven in Liyue.', category: 'Wonders of the World', primogems: 10 },
  { id: 'wow-12', name: 'Sacred Sakura\'s Favor', description: 'Fully level the Sacred Sakura\'s Favor.', category: 'Wonders of the World', primogems: 20 },
  { id: 'wow-13', name: 'Tree of Dreams', description: 'Fully level the Tree of Dreams in Sumeru.', category: 'Wonders of the World', primogems: 20 },
  { id: 'wow-14', name: 'Lumenstone Adjuvant', description: 'Fully upgrade the Lumenstone Adjuvant.', category: 'Wonders of the World', primogems: 10 },
  { id: 'wow-15', name: 'Catch of the Day', description: 'Catch your first fish in Teyvat.', category: 'Wonders of the World', primogems: 5 },
  { id: 'wow-16', name: 'Master Angler', description: 'Catch one of every fish species.', category: 'Wonders of the World', primogems: 20 },

  // ── Memories (16) ──────────────────────────────────────────────────────
  { id: 'mem-01', name: 'The Outlander Who Caught the Wind', description: 'Complete Archon Quest Prologue: Act I.', category: 'Memories', primogems: 10 },
  { id: 'mem-02', name: 'For a Tomorrow Without Tears', description: 'Complete Archon Quest Prologue: Act II.', category: 'Memories', primogems: 10 },
  { id: 'mem-03', name: 'Song of the Dragon and Freedom', description: 'Complete Archon Quest Prologue: Act III.', category: 'Memories', primogems: 20 },
  { id: 'mem-04', name: 'Of the Land Amidst Monoliths', description: 'Complete Archon Quest Chapter I: Act I.', category: 'Memories', primogems: 10 },
  { id: 'mem-05', name: 'Farewell, Archaic Lord', description: 'Complete Archon Quest Chapter I: Act II.', category: 'Memories', primogems: 10 },
  { id: 'mem-06', name: 'A New Star Approaches', description: 'Complete Archon Quest Chapter I: Act III.', category: 'Memories', primogems: 20 },
  { id: 'mem-07', name: 'The Immovable God and the Eternal Euthymia', description: 'Complete Archon Quest Chapter II: Act I.', category: 'Memories', primogems: 10 },
  { id: 'mem-08', name: 'Stillness, the Sublimation of Shadow', description: 'Complete Archon Quest Chapter II: Act II.', category: 'Memories', primogems: 10 },
  { id: 'mem-09', name: 'Omnipresence Over Mortals', description: 'Complete Archon Quest Chapter II: Act III.', category: 'Memories', primogems: 20 },
  { id: 'mem-10', name: 'Through Mists of Smoke and Forests Dark', description: 'Complete Archon Quest Chapter III: Act I.', category: 'Memories', primogems: 10 },
  { id: 'mem-11', name: 'The Morn a Thousand Roses Brings', description: 'Complete Archon Quest Chapter III: Act II.', category: 'Memories', primogems: 10 },
  { id: 'mem-12', name: 'Akasha Pulses, the Kalpa Flame Rises', description: 'Complete Archon Quest Chapter III: Act V.', category: 'Memories', primogems: 20 },
  { id: 'mem-13', name: 'Masquerade of the Guilty', description: 'Complete Archon Quest Chapter IV: Act V.', category: 'Memories', primogems: 20 },
  { id: 'mem-14', name: 'Leo Minor Chapter', description: 'Complete Jean\'s Story Quest.', category: 'Memories', primogems: 10 },
  { id: 'mem-15', name: 'Noctua Chapter', description: 'Complete Diluc\'s Story Quest.', category: 'Memories', primogems: 10 },
  { id: 'mem-16', name: 'Papilio Charontis Chapter', description: 'Complete Hu Tao\'s Story Quest.', category: 'Memories', primogems: 10 },

  // ── Challenger (16) ────────────────────────────────────────────────────
  { id: 'chl-01', name: 'Wind of Courage', description: 'Defeat Dvalin without taking damage.', category: 'Challenger', primogems: 10 },
  { id: 'chl-02', name: 'Lupus Major', description: 'Defeat Andrius without using food or buffs.', category: 'Challenger', primogems: 10 },
  { id: 'chl-03', name: 'Rex Incognito', description: 'Defeat Azhdaha without any party member being knocked out.', category: 'Challenger', primogems: 10 },
  { id: 'chl-04', name: 'Thunderclap', description: 'Defeat the Raiden Shogun weekly boss in under 90 seconds.', category: 'Challenger', primogems: 20 },
  { id: 'chl-05', name: 'Abyssal Conqueror', description: 'Obtain 36 stars in the Spiral Abyss.', category: 'Challenger', primogems: 20 },
  { id: 'chl-06', name: 'Overloaded!', description: 'Defeat 4 enemies with a single Overloaded reaction.', category: 'Challenger', primogems: 5 },
  { id: 'chl-07', name: 'Frozen Solid', description: 'Freeze 4 enemies simultaneously.', category: 'Challenger', primogems: 5 },
  { id: 'chl-08', name: 'Swirl Savant', description: 'Swirl 3 different elements in a single combat encounter.', category: 'Challenger', primogems: 10 },
  { id: 'chl-09', name: 'Nowhere to Hide', description: 'Defeat a Fatui Agent before it turns invisible.', category: 'Challenger', primogems: 5 },
  { id: 'chl-10', name: 'Shield Breaker', description: 'Break 50 Abyss Mage shields total.', category: 'Challenger', primogems: 10 },
  { id: 'chl-11', name: 'Childe\'s Play', description: 'Defeat Tartaglia in the Golden House without using elemental bursts.', category: 'Challenger', primogems: 10 },
  { id: 'chl-12', name: 'Rifthound Wrangler', description: 'Defeat 50 Rifthounds.', category: 'Challenger', primogems: 5 },
  { id: 'chl-13', name: 'Quick Draw', description: 'Defeat an enemy within 2 seconds of entering combat.', category: 'Challenger', primogems: 5 },
  { id: 'chl-14', name: 'Elementalist', description: 'Trigger every elemental reaction at least once.', category: 'Challenger', primogems: 10 },
  { id: 'chl-15', name: 'No Sweat', description: 'Complete Floor 12 of the Spiral Abyss without any party member falling.', category: 'Challenger', primogems: 20 },
  { id: 'chl-16', name: 'Plunging Excellence', description: 'Defeat 4 enemies with a single plunging attack.', category: 'Challenger', primogems: 5 },

  // ── Domains (14) ───────────────────────────────────────────────────────
  { id: 'dom-01', name: 'Domain Raider', description: 'Complete 100 Domain challenges.', category: 'Domains', primogems: 10 },
  { id: 'dom-02', name: 'Domain Master', description: 'Complete 500 Domain challenges.', category: 'Domains', primogems: 20 },
  { id: 'dom-03', name: 'Eagle\'s Gate', description: 'Complete the Eagle\'s Gate Domain for the first time.', category: 'Domains', primogems: 5 },
  { id: 'dom-04', name: 'Temple of the Lion', description: 'Complete the Temple of the Lion Domain.', category: 'Domains', primogems: 5 },
  { id: 'dom-05', name: 'Hidden Palace of Zhou Formula', description: 'Complete the Hidden Palace of Zhou Formula on the hardest difficulty.', category: 'Domains', primogems: 10 },
  { id: 'dom-06', name: 'Valley of Remembrance', description: 'Complete the Valley of Remembrance on the hardest difficulty.', category: 'Domains', primogems: 10 },
  { id: 'dom-07', name: 'Momiji-Dyed Court', description: 'Complete the Momiji-Dyed Court Domain on the hardest difficulty.', category: 'Domains', primogems: 10 },
  { id: 'dom-08', name: 'Slumbering Court', description: 'Complete the Slumbering Court Domain without being hit by lightning.', category: 'Domains', primogems: 10 },
  { id: 'dom-09', name: 'Domain Speedrunner', description: 'Complete any Level 90 Domain in under 30 seconds.', category: 'Domains', primogems: 20 },
  { id: 'dom-10', name: 'No Resin Left Behind', description: 'Spend 10,000 Original Resin on Domains.', category: 'Domains', primogems: 20 },
  { id: 'dom-11', name: 'Solo Specialist', description: 'Complete a Level 90 Domain with only one character.', category: 'Domains', primogems: 10 },
  { id: 'dom-12', name: 'Artifact Addict', description: 'Complete 1,000 Artifact Domain runs.', category: 'Domains', primogems: 20 },
  { id: 'dom-13', name: 'Talent Book Collector', description: 'Obtain all types of talent books.', category: 'Domains', primogems: 10 },
  { id: 'dom-14', name: 'Weapon Ascension Hoarder', description: 'Obtain all types of weapon ascension materials from domains.', category: 'Domains', primogems: 10 },

  // ── Exploration (16) ───────────────────────────────────────────────────
  { id: 'exp-01', name: 'Mondstadt Treasure Hunter', description: 'Open 200 chests in Mondstadt.', category: 'Exploration', primogems: 10 },
  { id: 'exp-02', name: 'Liyue Treasure Hunter', description: 'Open 400 chests in Liyue.', category: 'Exploration', primogems: 10 },
  { id: 'exp-03', name: 'Inazuma Treasure Hunter', description: 'Open 300 chests in Inazuma.', category: 'Exploration', primogems: 10 },
  { id: 'exp-04', name: 'Sumeru Treasure Hunter', description: 'Open 300 chests in Sumeru.', category: 'Exploration', primogems: 10 },
  { id: 'exp-05', name: 'Fontaine Treasure Hunter', description: 'Open 200 chests in Fontaine.', category: 'Exploration', primogems: 10 },
  { id: 'exp-06', name: 'Mondstadt: Full Coverage', description: 'Reach 100% exploration progress in all Mondstadt areas.', category: 'Exploration', primogems: 20 },
  { id: 'exp-07', name: 'Liyue: Full Coverage', description: 'Reach 100% exploration progress in all Liyue areas.', category: 'Exploration', primogems: 20 },
  { id: 'exp-08', name: 'Inazuma: Full Coverage', description: 'Reach 100% exploration progress in all Inazuma areas.', category: 'Exploration', primogems: 20 },
  { id: 'exp-09', name: 'Oculus Resonance I', description: 'Collect all Anemoculi.', category: 'Exploration', primogems: 10 },
  { id: 'exp-10', name: 'Oculus Resonance II', description: 'Collect all Geoculi.', category: 'Exploration', primogems: 10 },
  { id: 'exp-11', name: 'Oculus Resonance III', description: 'Collect all Electroculi.', category: 'Exploration', primogems: 10 },
  { id: 'exp-12', name: 'Oculus Resonance IV', description: 'Collect all Dendroculi.', category: 'Exploration', primogems: 10 },
  { id: 'exp-13', name: 'Seelie Friend', description: 'Guide 50 Seelie to their courts.', category: 'Exploration', primogems: 5 },
  { id: 'exp-14', name: 'Seelie Shepherd', description: 'Guide 150 Seelie to their courts.', category: 'Exploration', primogems: 10 },
  { id: 'exp-15', name: 'Chest Connoisseur', description: 'Open 1,000 total chests across all regions.', category: 'Exploration', primogems: 20 },
  { id: 'exp-16', name: 'Teyvat Cartographer', description: 'Reveal the entire map of Teyvat.', category: 'Exploration', primogems: 20 },
];

// ── localStorage helpers ─────────────────────────────────────────────────

const STORAGE_KEY = 'guild-achievements';

function loadCompletedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      return new Set(parsed);
    }
  } catch {
    // ignore
  }
  return new Set();
}

function saveCompletedIds(ids: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    // ignore
  }
}

// ── Main Component ───────────────────────────────────────────────────────

export default function AchievementsPage() {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const mounted = useMounted();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'All'>('All');
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setCompletedIds(loadCompletedIds());
  }, []);

  // Persist when completedIds change
  useEffect(() => {
    if (mounted) {
      saveCompletedIds(completedIds);
    }
  }, [completedIds, mounted]);

  // Toggle a single achievement
  const toggleAchievement = useCallback((id: string) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Mark all in category
  const markAllInCategory = useCallback((category: AchievementCategory) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      for (const a of ACHIEVEMENTS) {
        if (a.category === category) next.add(a.id);
      }
      return next;
    });
  }, []);

  // Clear all in category
  const clearAllInCategory = useCallback((category: AchievementCategory) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      for (const a of ACHIEVEMENTS) {
        if (a.category === category) next.delete(a.id);
      }
      return next;
    });
  }, []);

  // Overall stats
  const stats = useMemo(() => {
    const totalAchievements = ACHIEVEMENTS.length;
    const totalCompleted = ACHIEVEMENTS.filter((a) => completedIds.has(a.id)).length;
    const totalPrimogems = ACHIEVEMENTS.reduce((s, a) => s + a.primogems, 0);
    const earnedPrimogems = ACHIEVEMENTS
      .filter((a) => completedIds.has(a.id))
      .reduce((s, a) => s + a.primogems, 0);
    return { totalAchievements, totalCompleted, totalPrimogems, earnedPrimogems };
  }, [completedIds]);

  // Per-category stats
  const categoryStats = useMemo(() => {
    const map: Record<AchievementCategory, { total: number; completed: number; primogems: number; earnedPrimogems: number }> = {} as never;
    for (const cat of CATEGORIES) {
      const catAchievements = ACHIEVEMENTS.filter((a) => a.category === cat.name);
      map[cat.name] = {
        total: catAchievements.length,
        completed: catAchievements.filter((a) => completedIds.has(a.id)).length,
        primogems: catAchievements.reduce((s, a) => s + a.primogems, 0),
        earnedPrimogems: catAchievements.filter((a) => completedIds.has(a.id)).reduce((s, a) => s + a.primogems, 0),
      };
    }
    return map;
  }, [completedIds]);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    let list = ACHIEVEMENTS;

    // Category filter
    if (activeCategory !== 'All') {
      list = list.filter((a) => a.category === activeCategory);
    }

    // Completion filter
    if (completionFilter === 'completed') {
      list = list.filter((a) => completedIds.has(a.id));
    } else if (completionFilter === 'incomplete') {
      list = list.filter((a) => !completedIds.has(a.id));
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q),
      );
    }

    return list;
  }, [activeCategory, completionFilter, search, completedIds]);

  // Group filtered achievements by category for display
  const groupedAchievements = useMemo(() => {
    const groups: { category: AchievementCategory; achievements: Achievement[] }[] = [];
    const categoryOrder: AchievementCategory[] = CATEGORIES.map((c) => c.name);

    for (const cat of categoryOrder) {
      const catAchievements = filteredAchievements.filter((a) => a.category === cat);
      if (catAchievements.length > 0) {
        groups.push({ category: cat, achievements: catAchievements });
      }
    }
    return groups;
  }, [filteredAchievements]);

  if (!mounted) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <span className="text-guild-dim">Loading...</span>
      </div>
    );
  }

  const completionPct = stats.totalAchievements > 0
    ? Math.round((stats.totalCompleted / stats.totalAchievements) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ═══ Page Header ═══ */}
      <div className="flex items-center gap-3">
        <Trophy className="h-6 w-6 text-guild-accent" />
        <div>
          <h1 className="text-2xl font-bold">Achievement Tracker</h1>
          <p className="text-sm text-guild-muted">
            Track your Genshin Impact achievement progress
          </p>
        </div>
      </div>

      {/* ═══ Overall Stats ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border p-3 sm:p-4 bg-guild-accent/5 border-guild-accent/10">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-4 w-4 text-guild-accent" />
            <span className="text-[10px] text-guild-dim uppercase tracking-wider">Completed</span>
          </div>
          <div className="text-xl font-mono font-bold">
            {stats.totalCompleted}
            <span className="text-sm text-guild-muted font-normal"> / {stats.totalAchievements}</span>
          </div>
          <div className="text-[10px] text-guild-dim">{completionPct}% complete</div>
        </div>

        <div className="rounded-xl border p-3 sm:p-4 bg-blue-500/5 border-blue-500/10">
          <div className="flex items-center gap-2 mb-1">
            <PrimogemIcon className="text-blue-400" size={16} />
            <span className="text-[10px] text-guild-dim uppercase tracking-wider">Primogems Earned</span>
          </div>
          <div className="text-xl font-mono font-bold text-blue-400">
            {stats.earnedPrimogems.toLocaleString()}
          </div>
          <div className="text-[10px] text-guild-dim">of {stats.totalPrimogems.toLocaleString()} total</div>
        </div>

        <div className="rounded-xl border p-3 sm:p-4 bg-amber-500/5 border-amber-500/10">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span className="text-[10px] text-guild-dim uppercase tracking-wider">Remaining</span>
          </div>
          <div className="text-xl font-mono font-bold text-amber-400">
            {stats.totalAchievements - stats.totalCompleted}
          </div>
          <div className="text-[10px] text-guild-dim">achievements left</div>
        </div>

        <div className="rounded-xl border p-3 sm:p-4 bg-green-500/5 border-green-500/10">
          <div className="flex items-center gap-2 mb-1">
            <PrimogemIcon className="text-green-400" size={16} />
            <span className="text-[10px] text-guild-dim uppercase tracking-wider">Primos Left</span>
          </div>
          <div className="text-xl font-mono font-bold text-green-400">
            {(stats.totalPrimogems - stats.earnedPrimogems).toLocaleString()}
          </div>
          <div className="text-[10px] text-guild-dim">unclaimed primogems</div>
        </div>
      </div>

      {/* ═══ Overall Progress Bar ═══ */}
      <div className="rounded-xl bg-guild-card border border-white/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold">Overall Progress</span>
          <span className="text-xs text-guild-muted font-mono">{completionPct}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-guild-accent to-blue-400 transition-all duration-700 ease-out"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* ═══ Search + Filters ═══ */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-guild-dim" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search achievements..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-guild-elevated border border-white/5 text-sm text-foreground placeholder:text-guild-dim focus:outline-none focus:border-guild-accent/40 transition-colors"
          />
        </div>

        {/* Completion filter dropdown */}
        <div className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={cn(
              'h-10 px-4 rounded-xl border text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer',
              'bg-guild-elevated border-white/5 hover:border-white/10',
              completionFilter !== 'all' && 'border-guild-accent/30 text-guild-accent',
            )}
          >
            <Filter className="h-4 w-4" />
            <span className="capitalize">{completionFilter}</span>
            <ChevronDown className={cn('h-3 w-3 transition-transform', filterOpen && 'rotate-180')} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-12 z-20 rounded-xl bg-guild-elevated border border-white/10 shadow-xl overflow-hidden min-w-[140px]">
              {(['all', 'completed', 'incomplete'] as CompletionFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    setCompletionFilter(f);
                    setFilterOpen(false);
                  }}
                  className={cn(
                    'w-full px-4 py-2.5 text-sm text-left transition-colors cursor-pointer capitalize flex items-center gap-2',
                    'hover:bg-white/5',
                    completionFilter === f ? 'text-guild-accent' : 'text-foreground',
                  )}
                >
                  {f === 'all' && <Star className="h-3.5 w-3.5" />}
                  {f === 'completed' && <Check className="h-3.5 w-3.5" />}
                  {f === 'incomplete' && <XCircle className="h-3.5 w-3.5" />}
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Category Tabs ═══ */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('All')}
          className={cn(
            'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border',
            activeCategory === 'All'
              ? 'bg-guild-accent/15 border-guild-accent/30 text-guild-accent'
              : 'bg-guild-elevated border-white/5 text-guild-muted hover:text-foreground hover:border-white/10',
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer border flex items-center gap-2',
              activeCategory === cat.name
                ? cn(cat.bgColor, cat.borderColor, cat.color)
                : 'bg-guild-elevated border-white/5 text-guild-muted hover:text-foreground hover:border-white/10',
            )}
          >
            {cat.icon}
            <span className="hidden sm:inline">{cat.name}</span>
            <span className="sm:hidden">{cat.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* ═══ Achievement Groups ═══ */}
      {groupedAchievements.length === 0 && (
        <div className="rounded-xl bg-guild-card border border-white/5 p-12 text-center">
          <Search className="h-8 w-8 text-guild-dim mx-auto mb-3" />
          <p className="text-guild-muted text-sm">No achievements found.</p>
          <p className="text-guild-dim text-xs mt-1">Try adjusting your search or filters.</p>
        </div>
      )}

      {groupedAchievements.map(({ category, achievements }) => {
        const catMeta = CATEGORY_MAP[category];
        const catStat = categoryStats[category];

        return (
          <div key={category} className="space-y-3">
            {/* Category header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', catMeta.bgColor, catMeta.color)}>
                  {catMeta.icon}
                </div>
                <div>
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    {category}
                    <span className="text-guild-dim font-mono text-xs">
                      {catStat.completed}/{catStat.total}
                    </span>
                  </h2>
                  <div className="flex items-center gap-1 text-[10px] text-guild-dim">
                    <PrimogemIcon size={10} className="text-guild-dim" />
                    {catStat.earnedPrimogems}/{catStat.primogems}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markAllInCategory(category)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-guild-elevated hover:bg-white/10 text-guild-muted transition-colors cursor-pointer"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark All
                </button>
                <button
                  onClick={() => clearAllInCategory(category)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-guild-elevated hover:bg-white/10 text-guild-muted transition-colors cursor-pointer"
                >
                  <XCircle className="h-3 w-3" />
                  Clear
                </button>
              </div>
            </div>

            {/* Category progress bar */}
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500 ease-out',
                  catMeta.color === 'text-amber-400' && 'bg-amber-400',
                  catMeta.color === 'text-purple-400' && 'bg-purple-400',
                  catMeta.color === 'text-red-400' && 'bg-red-400',
                  catMeta.color === 'text-cyan-400' && 'bg-cyan-400',
                  catMeta.color === 'text-green-400' && 'bg-green-400',
                )}
                style={{ width: `${catStat.total > 0 ? (catStat.completed / catStat.total) * 100 : 0}%` }}
              />
            </div>

            {/* Achievement list */}
            <div className="space-y-2">
              {achievements.map((achievement) => {
                const isCompleted = completedIds.has(achievement.id);
                return (
                  <button
                    key={achievement.id}
                    onClick={() => toggleAchievement(achievement.id)}
                    className={cn(
                      'w-full rounded-xl border p-4 flex items-center gap-4 transition-all cursor-pointer text-left group',
                      isCompleted
                        ? 'bg-green-500/5 border-green-500/15 hover:border-green-500/30'
                        : 'bg-guild-card border-white/5 hover:border-white/10 hover:bg-guild-elevated/50',
                    )}
                  >
                    {/* Checkbox */}
                    <div
                      className={cn(
                        'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200',
                        isCompleted
                          ? 'bg-green-500 border-green-500 scale-100'
                          : 'border-white/20 group-hover:border-white/40 scale-100 group-hover:scale-105',
                      )}
                    >
                      <Check
                        className={cn(
                          'h-3.5 w-3.5 text-white transition-all duration-200',
                          isCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
                        )}
                      />
                    </div>

                    {/* Achievement info */}
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        'text-sm font-medium transition-colors',
                        isCompleted ? 'text-green-300 line-through decoration-green-500/30' : 'text-foreground',
                      )}>
                        {achievement.name}
                      </div>
                      <div className={cn(
                        'text-xs mt-0.5 transition-colors',
                        isCompleted ? 'text-green-400/50' : 'text-guild-muted',
                      )}>
                        {achievement.description}
                      </div>
                    </div>

                    {/* Primogem reward */}
                    <div className={cn(
                      'flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg transition-colors',
                      isCompleted ? 'bg-green-500/10' : 'bg-blue-500/10',
                    )}>
                      <PrimogemIcon
                        size={14}
                        className={cn(isCompleted ? 'text-green-400' : 'text-blue-400')}
                      />
                      <span className={cn(
                        'text-xs font-bold font-mono',
                        isCompleted ? 'text-green-400' : 'text-blue-400',
                      )}>
                        {achievement.primogems}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ═══ Reset Button ═══ */}
      <div className="flex justify-center pt-4 pb-8">
        <button
          onClick={() => {
            if (confirm('Reset all achievement progress? This cannot be undone.')) {
              setCompletedIds(new Set());
            }
          }}
          className="px-4 py-2 rounded-lg bg-guild-elevated hover:bg-white/10 text-sm text-guild-muted transition-colors cursor-pointer"
        >
          Reset All Progress
        </button>
      </div>
    </div>
  );
}
