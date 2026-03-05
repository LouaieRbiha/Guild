"use client";

import { useState } from "react";
import { MapPin, ExternalLink, Compass, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const MAP_TOOLS = [
  { label: "Oculi", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { label: "Chests", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  { label: "Materials", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  { label: "Waypoints", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
  { label: "Bosses", color: "bg-red-500/20 text-red-300 border-red-500/30" },
];

const ALT_MAPS = [
  {
    label: "Official HoYoLAB Map",
    href: "https://act.hoyolab.com/ys/app/interactive-map/",
  },
  {
    label: "Teyvat Interactive Map",
    href: "https://genshin-impact-map.appsample.com/",
  },
  {
    label: "MapGenie",
    href: "https://mapgenie.io/genshin-impact",
  },
];

export default function MapPage() {
  const [mapLoaded, setMapLoaded] = useState(false);

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-guild-accent/10 flex items-center justify-center text-guild-accent">
            <MapPin size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Interactive Map</h1>
            <p className="text-sm text-guild-muted">
              Explore Teyvat &mdash; Powered by AppSample
            </p>
          </div>
        </div>

        {/* Quick-link badges */}
        <div className="flex flex-wrap items-center gap-2">
          {MAP_TOOLS.map((tool) => (
            <Badge
              key={tool.label}
              variant="outline"
              className={cn("border", tool.color)}
            >
              {tool.label}
            </Badge>
          ))}
        </div>

        {/* Usage note */}
        <div className="flex items-start gap-2 rounded-lg bg-guild-elevated px-4 py-3 border border-white/5">
          <Compass size={16} className="mt-0.5 shrink-0 text-guild-accent" />
          <p className="text-sm text-guild-dim leading-relaxed">
            Use the sidebar in the map to filter markers and layers. Click
            markers for details.
          </p>
        </div>
      </div>

      {/* ── Map Embed ───────────────────────────────────────────────────── */}
      <div
        className="relative rounded-xl border border-white/5 overflow-hidden bg-guild-card"
        style={{ height: "calc(100vh - 220px)" }}
      >
        {/* Loading skeleton */}
        {!mapLoaded && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-guild-card">
            <Loader2 size={32} className="animate-spin text-guild-accent" />
            <p className="text-sm text-guild-muted">Loading Teyvat map...</p>
          </div>
        )}

        <iframe
          src="https://genshin-impact-map.appsample.com/"
          className={cn(
            "w-full h-full border-0 transition-opacity duration-500",
            mapLoaded ? "opacity-100" : "opacity-0"
          )}
          title="Teyvat Interactive Map"
          allow="fullscreen"
          onLoad={() => setMapLoaded(true)}
        />
      </div>

      {/* ── Alternative Maps ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-white/5 bg-guild-elevated px-5 py-4 space-y-3">
        <h2 className="text-sm font-semibold text-guild-muted">
          Alternative Maps
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {ALT_MAPS.map((map) => (
            <a
              key={map.label}
              href={map.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/5 bg-guild-card px-3 py-1.5 text-sm text-guild-muted transition-colors hover:text-guild-accent hover:border-guild-accent/30"
            >
              <ExternalLink size={14} />
              {map.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
