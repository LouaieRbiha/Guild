"use client";

import { Lock, Eye, EyeOff, AlertTriangle, ExternalLink, MessageCircle, Twitter, Users, ChevronDown, ChevronUp, Sparkles, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ── Types ────────────────────────────────────────────────────────────

interface LeakEntry {
  id: string;
  category: "character" | "weapon" | "event" | "story" | "system" | "banner";
  title: string;
  description: string;
  source: string;
  reliability: "reliable" | "sus" | "speculative";
  severity: "mild" | "moderate" | "heavy";
  date: string;
  version?: string;
  rarity?: number;
  score?: number;
}

// ── Leak Data (curated from community) ───────────────────────────────

const LEAKS: LeakEntry[] = [
  {
    id: "1",
    category: "banner",
    title: "6.4 Phase 2 Banner Characters",
    description: "Phase 2 is expected to feature reruns. Possible characters include Mavuika and Citlali based on sales data and story relevance.",
    source: "Uncle Lu / NGA",
    reliability: "reliable",
    severity: "mild",
    date: "2026-03-01",
    version: "6.4",
  },
  {
    id: "2",
    category: "character",
    title: "6.5 New 5★ Character — Pyro Polearm",
    description: "A new 5★ Pyro Polearm user from Snezhnaya. Kit involves stance changes and Nightsoul-like mechanics adapted for the cold region.",
    source: "Reliable Uncle",
    reliability: "reliable",
    severity: "moderate",
    date: "2026-02-28",
    version: "6.5",
    rarity: 5,
  },
  {
    id: "3",
    category: "character",
    title: "6.5 New 4★ Support — Cryo Catalyst",
    description: "A 4★ Cryo Catalyst support character with team-wide Cryo application and energy generation. Designed to pair with physical/superconduct teams.",
    source: "Mero",
    reliability: "reliable",
    severity: "mild",
    date: "2026-02-27",
    version: "6.5",
    rarity: 4,
  },
  {
    id: "4",
    category: "weapon",
    title: "New Artifact Domain in Snezhnaya",
    description: "Two new artifact sets: one for ATK-based Pyro carries, one for shield-based supports. The domain is located in the underground factory area.",
    source: "Datamine",
    reliability: "reliable",
    severity: "mild",
    date: "2026-02-25",
    version: "6.5",
  },
  {
    id: "5",
    category: "event",
    title: "Major Event: Fatui Infiltration",
    description: "6.5 features a large-scale co-op event involving infiltrating a Fatui fortress. Rewards include a free 4★ character selector and a crown.",
    source: "BLANK",
    reliability: "reliable",
    severity: "moderate",
    date: "2026-02-26",
    version: "6.5",
  },
  {
    id: "6",
    category: "story",
    title: "Snezhnaya Archon Quest Direction",
    description: "The Snezhnaya Archon Quest involves multiple acts spanning the entire region. The Tsaritsa's true motivations are revealed in Act III.",
    source: "Story Team Leak",
    reliability: "sus",
    severity: "heavy",
    date: "2026-02-24",
    version: "6.5+",
  },
  {
    id: "7",
    category: "system",
    title: "Artifact Loadout System",
    description: "A new quality-of-life feature allowing players to save and quickly swap between artifact loadouts for each character. Up to 4 loadouts per character.",
    source: "Datamine",
    reliability: "reliable",
    severity: "mild",
    date: "2026-02-23",
    version: "6.5",
  },
  {
    id: "8",
    category: "banner",
    title: "6.5 Phase 1 Estimated Banners",
    description: "New Pyro Polearm 5★ + rerun to be determined. Weapon banner features their signature weapon alongside a rerun 5★ weapon.",
    source: "Community Speculation",
    reliability: "speculative",
    severity: "mild",
    date: "2026-03-02",
    version: "6.5",
  },
];

// ── API Types & Mapping ─────────────────────────────────────────────

interface ApiLeakPost {
  id: string;
  title: string;
  body: string;
  source: string;
  reliability: "reliable" | "questionable" | "speculative";
  category: string;
  imageUrl: string | null;
  timestamp: number;
  url: string;
  score: number;
  flair: string;
}

interface ApiLeaksResponse {
  posts: ApiLeakPost[];
  lastUpdated: number | null;
}

const API_RELIABILITY_MAP: Record<string, LeakEntry["reliability"]> = {
  reliable: "reliable",
  questionable: "sus",
  speculative: "speculative",
};

const API_SEVERITY_MAP: Record<string, LeakEntry["severity"]> = {
  reliable: "moderate",
  questionable: "moderate",
  speculative: "mild",
};

function formatTimestamp(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function mapApiPostToEntry(post: ApiLeakPost): LeakEntry {
  const validCategories = ["character", "weapon", "event", "story", "system", "banner"] as const;
  const category = validCategories.includes(post.category as typeof validCategories[number])
    ? (post.category as LeakEntry["category"])
    : "system";

  return {
    id: `api-${post.id}`,
    category,
    title: post.title,
    description: post.body,
    source: "Reddit r/GI_Leaks",
    reliability: API_RELIABILITY_MAP[post.reliability] || "speculative",
    severity: API_SEVERITY_MAP[post.reliability] || "mild",
    date: formatTimestamp(post.timestamp),
    score: post.score,
  };
}

// ── Community Sources ────────────────────────────────────────────────

const COMMUNITY_SOURCES = [
  {
    name: "r/Genshin_Impact_Leaks",
    url: "https://www.reddit.com/r/Genshin_Impact_Leaks/",
    description: "Primary Reddit community for verified leaks",
    icon: MessageCircle,
    color: "text-orange-400",
  },
  {
    name: "@MeowTews",
    url: "https://x.com/MeowTews",
    description: "Aggregates and verifies leaks from CN sources",
    icon: Twitter,
    color: "text-blue-400",
  },
  {
    name: "@gaborounobeta",
    url: "https://x.com/gaborounobeta",
    description: "Beta gameplay footage and kit details",
    icon: Twitter,
    color: "text-blue-400",
  },
  {
    name: "WFP (Wangsheng Funeral Parlor)",
    url: "https://discord.gg/hutao",
    description: "Discord community with organized leak channels",
    icon: Users,
    color: "text-indigo-400",
  },
];

// ── Visual Constants ─────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  character: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  weapon: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  event: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  story: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
  system: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  banner: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
};

const RELIABILITY_STYLES: Record<string, { text: string; bg: string; border: string; label: string }> = {
  reliable: { text: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", label: "Reliable" },
  sus: { text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Questionable" },
  speculative: { text: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", label: "Speculation" },
};

const SEV_LEFT_BORDER: Record<string, string> = {
  mild: "border-l-green-500/40",
  moderate: "border-l-yellow-500/40",
  heavy: "border-l-red-500/40",
};

// ── Page Component ───────────────────────────────────────────────────

export default function LeaksPage() {
  const [enabled, setEnabled] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterReliability, setFilterReliability] = useState<string>("all");
  const [showSources, setShowSources] = useState(false);
  const [leaks, setLeaks] = useState<LeakEntry[]>(LEAKS);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Check settings for default state
  useEffect(() => {
    try {
      const stored = localStorage.getItem("guild-settings");
      if (stored) {
        const settings = JSON.parse(stored);
        if (settings.showSpoilerWarning === false) {
          setEnabled(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch leak data from API, fall back to hardcoded data
  useEffect(() => {
    let cancelled = false;

    async function fetchLeaks(): Promise<void> {
      try {
        const res = await fetch("/api/leaks");
        if (!res.ok) return;

        const data: ApiLeaksResponse = await res.json();
        if (cancelled) return;

        if (data.posts.length > 0) {
          setLeaks(data.posts.map(mapApiPostToEntry));
          setLastUpdated(data.lastUpdated);
        }
      } catch {
        // API unavailable -- keep hardcoded fallback
      }
    }

    fetchLeaks();
    return () => { cancelled = true; };
  }, []);

  const toggle = (id: string) =>
    setRevealed((p) => {
      const s = new Set(p);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });

  const revealAll = () => setRevealed(new Set(leaks.map((l) => l.id)));
  const hideAll = () => setRevealed(new Set());

  const filtered = leaks.filter((l) => {
    if (filterCategory !== "all" && l.category !== filterCategory) return false;
    if (filterReliability !== "all" && l.reliability !== filterReliability) return false;
    return true;
  });

  if (!enabled) {
    return (
      <div className="max-w-md mx-auto mt-32 text-center space-y-6">
        <Lock className="h-16 w-16 text-guild-muted mx-auto" />
        <h1 className="text-2xl font-bold">Leaks & Spoilers</h1>
        <p className="text-guild-muted">
          This section contains leaked content from beta tests, datamines, and community sources. Nothing here is confirmed.
        </p>
        <div className="guild-card p-4 flex items-start gap-3 text-left border-yellow-500/20">
          <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-400">
            By enabling this section, you acknowledge you may see unreleased content that could spoil your experience.
          </p>
        </div>
        <button
          onClick={() => setEnabled(true)}
          className="h-10 px-6 rounded-md bg-guild-accent hover:bg-guild-accent/80 font-medium transition-colors cursor-pointer"
        >
          I understand, show me the leaks
        </button>
      </div>
    );
  }

  const categories = ["all", ...new Set(leaks.map((l) => l.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Leaks & Spoilers
          </h1>
          <p className="text-sm text-yellow-400/60 mt-1">
            Content from beta/datamines. Not final. Click cards to reveal.
          </p>
          {lastUpdated && (
            <p className="text-xs text-guild-dim mt-1">
              Last updated {Math.round((Date.now() - lastUpdated) / 60000)} minutes ago
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={revealed.size === leaks.length ? hideAll : revealAll}
            className="h-8 px-3 rounded-md bg-guild-elevated text-sm text-guild-muted hover:text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {revealed.size === leaks.length ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {revealed.size === leaks.length ? "Hide All" : "Reveal All"}
          </button>
          <button
            onClick={() => setEnabled(false)}
            className="h-8 px-3 rounded-md bg-guild-elevated text-sm text-guild-muted hover:text-foreground transition-colors cursor-pointer"
          >
            Lock Section
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant="outline"
            onClick={() => setFilterCategory(cat)}
            className={cn(
              "cursor-pointer transition-all select-none capitalize",
              filterCategory === cat
                ? cat === "all"
                  ? "bg-white/10 text-white border-white/20"
                  : cn(CATEGORY_COLORS[cat]?.bg, CATEGORY_COLORS[cat]?.text, CATEGORY_COLORS[cat]?.border)
                : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
            )}
          >
            {cat}
          </Badge>
        ))}
        <div className="w-px bg-white/10 mx-1" />
        {(["all", "reliable", "sus", "speculative"] as const).map((rel) => (
          <Badge
            key={rel}
            variant="outline"
            onClick={() => setFilterReliability(rel)}
            className={cn(
              "cursor-pointer transition-all select-none",
              filterReliability === rel
                ? rel === "all"
                  ? "bg-white/10 text-white border-white/20"
                  : cn(RELIABILITY_STYLES[rel]?.bg, RELIABILITY_STYLES[rel]?.text, RELIABILITY_STYLES[rel]?.border)
                : "bg-guild-elevated text-guild-muted border-white/5 hover:border-white/10"
            )}
          >
            {rel === "all" ? "All reliability" : RELIABILITY_STYLES[rel]?.label}
          </Badge>
        ))}
      </div>

      {/* Leak Cards */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((leak) => {
            const show = revealed.has(leak.id);
            const catColors = CATEGORY_COLORS[leak.category];
            const relStyle = RELIABILITY_STYLES[leak.reliability];

            return (
              <Card
                key={leak.id}
                className={cn(
                  "cursor-pointer transition-all border-l-4 hover:bg-white/2",
                  SEV_LEFT_BORDER[leak.severity],
                  "border-white/5"
                )}
                onClick={() => toggle(leak.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Top row: category + reliability + version */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge
                          variant="outline"
                          className={cn("text-[10px] uppercase", catColors?.text, catColors?.bg, catColors?.border)}
                        >
                          {leak.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn("text-[10px]", relStyle?.text, relStyle?.bg, relStyle?.border)}
                        >
                          {relStyle?.label}
                        </Badge>
                        {leak.version && (
                          <span className="text-[10px] text-guild-dim">v{leak.version}</span>
                        )}
                        {leak.rarity && leak.rarity > 0 && (
                          <span className={cn(
                            "text-xs",
                            show ? "" : "blur-sm",
                            leak.rarity === 5 ? "text-amber-400" : "text-purple-400"
                          )}>
                            {"★".repeat(leak.rarity)}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className={cn(
                        "font-semibold text-base mb-1 transition-all",
                        !show && "blur-sm select-none"
                      )}>
                        {leak.title}
                      </h3>

                      {/* Description */}
                      <p className={cn(
                        "text-sm text-guild-muted leading-relaxed transition-all",
                        !show && "blur-sm select-none"
                      )}>
                        {leak.description}
                      </p>

                      {/* Source + date */}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-guild-dim">Source: {leak.source}</span>
                        <span className="text-xs text-guild-dim">{leak.date}</span>
                        {leak.score != null && leak.score > 0 && (
                          <span className="text-xs text-guild-dim flex items-center gap-0.5">
                            <ArrowUp className="h-3 w-3" />
                            {leak.score.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button className="p-1.5 shrink-0 mt-1">
                      {show
                        ? <EyeOff className="h-4 w-4 text-guild-muted" />
                        : <Eye className="h-4 w-4 text-guild-muted" />
                      }
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-guild-muted">No leaks match your filters.</p>
          </div>
        )}
      </div>

      {/* Community Sources */}
      <Card className="border-white/5">
        <CardHeader
          className="cursor-pointer select-none"
          onClick={() => setShowSources(!showSources)}
        >
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-guild-accent" />
              Community Leak Sources
            </div>
            {showSources ? <ChevronUp className="h-4 w-4 text-guild-muted" /> : <ChevronDown className="h-4 w-4 text-guild-muted" />}
          </CardTitle>
        </CardHeader>
        {showSources && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {COMMUNITY_SOURCES.map((src) => (
                <a
                  key={src.name}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <src.icon className={cn("h-5 w-5 mt-0.5 shrink-0", src.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium group-hover:text-guild-accent transition-colors flex items-center gap-1.5">
                      {src.name}
                      <ExternalLink className="h-3 w-3 text-guild-dim" />
                    </p>
                    <p className="text-xs text-guild-muted mt-0.5">{src.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
