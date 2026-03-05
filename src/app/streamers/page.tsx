"use client";

import { useEffect, useState } from "react";
import {
  Radio,
  ExternalLink,
  Users,
  Tv,
  Youtube,
  Twitch,
  Play,
  Clock,
  Star,
  TrendingUp,
  Heart,
  ChevronDown,
  Eye,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ────────────────────────────────────────────────────────────────

type Platform = "youtube" | "twitch";
type Category = "Guide Maker" | "Theorycrafter" | "Entertainer" | "Whale" | "F2P";

interface Creator {
  name: string;
  handle: string;
  platform: Platform;
  category: Category;
  description: string;
  url: string;
}

interface LiveStreamer {
  name: string;
  platform: "twitch" | "youtube";
  title: string;
  viewers: number;
  thumbnail: string;
  url: string;
  startedAt: string;
  profileImage: string;
}

// ── Data ─────────────────────────────────────────────────────────────────

const CREATORS: Creator[] = [
  {
    name: "TenTen",
    handle: "TenTen",
    platform: "youtube",
    category: "Theorycrafter",
    description: "Meta analysis, character reviews, and team building guides",
    url: "https://youtube.com/@TenTen",
  },
  {
    name: "Zy0x",
    handle: "Zy0x",
    platform: "youtube",
    category: "Guide Maker",
    description: "In-depth character build guides and weapon comparisons",
    url: "https://youtube.com/@Zy0x",
  },
  {
    name: "Zajef77",
    handle: "Zajef77",
    platform: "twitch",
    category: "Theorycrafter",
    description: "Advanced theorycrafting, TC math, and community discussions",
    url: "https://twitch.tv/Zajef77",
  },
  {
    name: "IWinToLose",
    handle: "IWinToLoseGaming",
    platform: "youtube",
    category: "Whale",
    description: "Whale vs F2P damage comparisons and big number showcases",
    url: "https://youtube.com/@IWinToLoseGaming",
  },
  {
    name: "Sekapoko",
    handle: "Sekapoko",
    platform: "twitch",
    category: "Entertainer",
    description: "Gacha reactions, co-op streams, and variety content",
    url: "https://twitch.tv/Sekapoko",
  },
  {
    name: "Braxophone",
    handle: "Braxophone",
    platform: "youtube",
    category: "Guide Maker",
    description: "Beginner-friendly guides and exploration content",
    url: "https://youtube.com/@Braxophone",
  },
  {
    name: "KeqingMains",
    handle: "KeqingMains",
    platform: "youtube",
    category: "Theorycrafter",
    description: "Community-driven theorycrafting and character guides",
    url: "https://youtube.com/@KeqingMains",
  },
  {
    name: "Xlice",
    handle: "Xlice",
    platform: "youtube",
    category: "Guide Maker",
    description: "Team comp guides and tierlist discussions",
    url: "https://youtube.com/@Xlice",
  },
  {
    name: "SevyPlays",
    handle: "SevyPlays",
    platform: "youtube",
    category: "F2P",
    description: "F2P friendly guides and budget team building",
    url: "https://youtube.com/@SevyPlays",
  },
  {
    name: "Dish",
    handle: "Dish",
    platform: "youtube",
    category: "Entertainer",
    description: "Genshin lore, story analysis, and cinematic content",
    url: "https://youtube.com/@Dish",
  },
];

const RESOURCES = [
  {
    name: "Genshin Wiki",
    url: "https://genshin-impact.fandom.com",
    description: "Comprehensive community wiki with all game data",
  },
  {
    name: "Paimon.moe",
    url: "https://paimon.moe",
    description: "Wish history tracker and planning tools",
  },
  {
    name: "Enka.Network",
    url: "https://enka.network",
    description: "Live character build showcase from your UID",
  },
  {
    name: "Genshin Optimizer",
    url: "https://frzyc.github.io/genshin-optimizer",
    description: "Artifact optimizer and damage calculator",
  },
  {
    name: "Akasha System",
    url: "https://akasha.cv",
    description: "Leaderboards and build ranking system",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<Category, { bg: string; text: string; border: string }> = {
  "Guide Maker": {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/30",
  },
  Theorycrafter: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/30",
  },
  Entertainer: {
    bg: "bg-green-500/15",
    text: "text-green-400",
    border: "border-green-500/30",
  },
  Whale: {
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
  },
  F2P: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
  },
};

const PLATFORM_CONFIG: Record<Platform, { icon: typeof Youtube; color: string; ring: string; label: string; badgeBg: string; badgeText: string }> = {
  youtube: {
    icon: Youtube,
    color: "text-red-500",
    ring: "ring-red-500/50",
    label: "YouTube",
    badgeBg: "bg-red-500/15",
    badgeText: "text-red-400",
  },
  twitch: {
    icon: Twitch,
    color: "text-purple-400",
    ring: "ring-purple-500/50",
    label: "Twitch",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-400",
  },
};

type FilterValue = "all" | "youtube" | "twitch";

// ── Component ────────────────────────────────────────────────────────────

export default function StreamersPage() {
  const [platformFilter, setPlatformFilter] = useState<FilterValue>("all");
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [liveStreamers, setLiveStreamers] = useState<LiveStreamer[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    fetch("/api/streamers")
      .then((res) => res.json())
      .then((data: LiveStreamer[]) => setLiveStreamers(data))
      .catch(() => setLiveStreamers([]))
      .finally(() => setLiveLoading(false));
  }, []);

  const filteredCreators =
    platformFilter === "all"
      ? CREATORS
      : CREATORS.filter((c) => c.platform === platformFilter);

  const filters: { label: string; value: FilterValue; icon: typeof Tv }[] = [
    { label: "All", value: "all", icon: Tv },
    { label: "YouTube", value: "youtube", icon: Youtube },
    { label: "Twitch", value: "twitch", icon: Twitch },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-guild-accent/15 flex items-center justify-center">
            <Radio className="text-guild-accent" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Community Hub</h1>
            <p className="text-sm text-guild-muted">
              Genshin Impact creators, guides &amp; streams
            </p>
          </div>
        </div>
      </div>

      {/* ── Live Now ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
          </span>
          Live Now
        </h2>

        {liveLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className="border-white/5 p-0 gap-0 overflow-hidden"
              >
                <Skeleton className="w-full aspect-video" />
                <CardContent className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!liveLoading && liveStreamers.length === 0 && (
          <div className="text-center py-8 rounded-xl bg-guild-card border border-white/5">
            <Tv className="mx-auto text-guild-dim mb-2" size={32} />
            <p className="text-sm text-guild-muted">
              No Genshin streams live right now
            </p>
          </div>
        )}

        {!liveLoading && liveStreamers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveStreamers.map((streamer) => {
              const platformCfg = PLATFORM_CONFIG[streamer.platform];
              const PlatformIcon = platformCfg.icon;

              return (
                <a
                  key={`${streamer.platform}-${streamer.name}`}
                  href={streamer.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <Card
                    className={cn(
                      "border-white/5 p-0 gap-0 overflow-hidden transition-all duration-300",
                      "hover:border-guild-accent/30 hover:shadow-[0_0_24px_rgba(99,102,241,0.12)]",
                      "hover:scale-[1.02]"
                    )}
                  >
                    <div className="relative w-full aspect-video bg-guild-elevated">
                      {streamer.thumbnail ? (
                        <Image
                          src={streamer.thumbnail}
                          alt={streamer.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="text-guild-dim" size={32} />
                        </div>
                      )}
                      <Badge
                        className={cn(
                          "absolute top-2 left-2 text-[11px]",
                          platformCfg.badgeBg,
                          platformCfg.badgeText
                        )}
                      >
                        <PlatformIcon size={12} className="mr-1" />
                        {platformCfg.label}
                      </Badge>
                      {streamer.viewers > 0 && (
                        <Badge className="absolute top-2 right-2 bg-black/60 text-white text-[11px]">
                          <Eye size={12} className="mr-1" />
                          {streamer.viewers.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3 space-y-1">
                      <p className="text-sm font-medium leading-snug line-clamp-1 group-hover:text-guild-accent transition-colors">
                        {streamer.title}
                      </p>
                      <p className="text-xs text-guild-muted">{streamer.name}</p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Platform Filters ────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star className="text-guild-accent" size={18} />
            Featured Creators
          </h2>
          <div className="flex gap-2">
            {filters.map((f) => {
              const Icon = f.icon;
              const active = platformFilter === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setPlatformFilter(f.value)}
                  className={cn(
                    "h-8 px-3 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all duration-200 cursor-pointer",
                    active
                      ? "bg-guild-accent text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                      : "bg-guild-elevated text-guild-muted hover:bg-white/10 hover:text-foreground"
                  )}
                >
                  <Icon size={14} />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Creator Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCreators.map((creator) => {
            const platform = PLATFORM_CONFIG[creator.platform];
            const category = CATEGORY_STYLES[creator.category];
            const PlatformIcon = platform.icon;

            return (
              <a
                key={creator.name}
                href={creator.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <Card
                  className={cn(
                    "border-white/5 p-0 gap-0 transition-all duration-300",
                    "hover:border-guild-accent/30 hover:shadow-[0_0_24px_rgba(99,102,241,0.12)]",
                    "hover:scale-[1.02]"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div
                        className={cn(
                          "w-14 h-14 rounded-full shrink-0 flex items-center justify-center",
                          "bg-guild-elevated ring-2 transition-all duration-300",
                          platform.ring,
                          "group-hover:ring-3"
                        )}
                      >
                        <span className="text-xl font-bold text-foreground/80">
                          {creator.name[0]}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1 space-y-2">
                        {/* Name + External Link */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base group-hover:text-guild-accent transition-colors truncate">
                            {creator.name}
                          </span>
                          <ExternalLink
                            size={14}
                            className="text-guild-dim opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          />
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] border",
                              platform.badgeBg,
                              platform.badgeText,
                              platform.ring.replace("ring-", "border-")
                            )}
                          >
                            <PlatformIcon size={12} className="mr-1" />
                            {platform.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] border",
                              category.bg,
                              category.text,
                              category.border
                            )}
                          >
                            {creator.category}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-guild-muted leading-relaxed">
                          {creator.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredCreators.length === 0 && (
          <div className="text-center py-12">
            <Tv className="mx-auto text-guild-dim mb-3" size={40} />
            <p className="text-guild-muted font-medium">No creators found</p>
            <p className="text-guild-dim text-sm mt-1">
              Try a different platform filter
            </p>
          </div>
        )}
      </div>

      {/* ── Useful Resources ────────────────────────────────────────── */}
      <div className="space-y-0">
        <button
          onClick={() => setResourcesOpen((prev) => !prev)}
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-xl cursor-pointer",
            "bg-guild-card border border-white/5 transition-all duration-200",
            "hover:border-guild-accent/20 hover:bg-guild-elevated",
            resourcesOpen && "rounded-b-none border-b-0"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-guild-accent/15 flex items-center justify-center">
              <TrendingUp className="text-guild-accent" size={16} />
            </div>
            <div className="text-left">
              <span className="font-semibold text-sm">Useful Resources</span>
              <p className="text-xs text-guild-muted">
                Community tools, wikis, and calculators
              </p>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={cn(
              "text-guild-muted transition-transform duration-200",
              resourcesOpen && "rotate-180"
            )}
          />
        </button>

        {resourcesOpen && (
          <div
            className={cn(
              "bg-guild-card border border-white/5 border-t-0 rounded-b-xl",
              "divide-y divide-white/5"
            )}
          >
            {RESOURCES.map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 group/res hover:bg-guild-elevated transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="text-sm font-medium group-hover/res:text-guild-accent transition-colors">
                    {resource.name}
                  </span>
                  <p className="text-xs text-guild-dim">{resource.description}</p>
                </div>
                <ExternalLink
                  size={14}
                  className="text-guild-dim shrink-0 ml-4 opacity-0 group-hover/res:opacity-100 transition-opacity"
                />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
