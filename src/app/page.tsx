"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ELEMENT_ICONS,
  ALL_CHARACTERS,
  charIconUrl,
} from "@/lib/characters";
import {
  PrimogemIcon,
  AbyssIcon,
  KameraIcon,
  VerdictIcon,
} from "@/components/icons/genshin-icons";

// Mock data for banners and trending builds
const currentBanners = [
  { name: "Neuvillette", element: "Hydro", daysLeft: 12 },
  { name: "Zhongli", element: "Geo", daysLeft: 12 },
];

const trendingBuilds = [
  { name: "Neuvillette (Mona)", uses: "34.2%", element: "Hydro" },
  { name: "Furina", uses: "31.8%", element: "Hydro" },
  { name: "Nahida", uses: "28.5%", element: "Dendro" },
  { name: "Kazuha", uses: "26.1%", element: "Anemo" },
];

const upcomingEvents = [
  { name: "Spiral Abyss Reset", date: "3d 12h" },
  { name: "Version 5.4 Phase 2", date: "Mar 12" },
  { name: "Adventurer's Booster Bundle", date: "Mar 5 – Mar 18" },
];

// Recent roast feed (mock)
const RECENT_ROASTS = [
  { uid: "UID714xxx", character: "Neuvillette", verdict: "YOUR BUILD IS SO BAD 🔥" },
  { uid: "UID823yyy", character: "Furina", verdict: "CRIT RATE CAPPED? YOU'RE DOING IT WRONG! 💀" },
  { uid: "UID901zzz", character: "Kazuha", verdict: "ARTIFACTS LOOK LIKE TRASH 😂" },
];

// Character quick-pick grid (top 5 newest releases)
const QUICK_PICKS = ALL_CHARACTERS.slice(0, 5);

export default function HomePage() {
  const [uid, setUid] = useState("");
  const router = useRouter();

  const go = () => { if (uid.trim().length >= 9) router.push(`/profile/${uid.trim()}`); };

  return (
    <div className="min-h-screen bg-[#0A0E1A] text-white">
      {/* Floating Navigation Pills */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex gap-2 p-1.5 bg-[#111827]/90 backdrop-blur-md border border-white/10 rounded-full shadow-xl">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => router.push("/database")}
            className="px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Characters
          </button>
          <button
            onClick={() => router.push("/weapons")}
            className="px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Weapons
          </button>
          <button
            onClick={() => router.push("/simulator")}
            className="px-4 py-1.5 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Simulator
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold tracking-tight">
            <span className="text-guild-accent">✦</span> GUILD <span className="text-guild-accent">✦</span>
          </h1>
          <p className="text-xl text-guild-muted">Your Genshin Impact Command Center</p>

          {/* UID Lookup Card */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 p-3 bg-[#111827]/80 backdrop-blur-sm border border-white/10 rounded-xl guild-glow">
              <input
                type="text"
                placeholder="Enter your UID to get started"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                className="flex-1 h-12 px-4 rounded-lg bg-[#0D1117] border border-white/10 text-foreground placeholder:text-guild-muted focus:outline-none focus:border-guild-accent font-mono text-lg"
              />
              <button
                onClick={go}
                className="h-12 px-6 rounded-lg bg-guild-accent hover:bg-guild-accent/80 font-semibold transition-colors cursor-pointer"
              >
                Lookup
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Character Quick Picks */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Fresh Drops</h2>
            <span className="text-sm text-guild-muted">Latest releases</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {QUICK_PICKS.map((char) => {
              const Icon = ELEMENT_ICONS[char.element];
              return (
                <a
                  key={char.id}
                  href={`/database/${char.id}`}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/5 hover:border-guild-accent/50 transition-all cursor-pointer"
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 ${ELEMENT_COLORS[char.element].bg}`} />

                  {/* Character art */}
                  <img
                    src={charIconUrl(char.icon)}
                    alt={char.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-transparent to-transparent" />

                  {/* Name tag */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-base truncate">{char.name}</h3>
                    {Icon && (
                      <Icon size={14} className="inline ml-auto" />
                    )}
                  </div>

                  {/* Release date */}
                  <p className="absolute top-3 right-3 text-[10px] text-white/50">{char.release}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Info Cards Grid */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Banners */}
          <div className="guild-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-guild-muted">
              <PrimogemIcon className="text-guild-gold" size={18} /> Current Banners
            </div>
            {currentBanners.map((b) => (
              <div key={b.name} className="flex items-center justify-between">
                <span className={`font-medium ${ELEMENT_COLORS[b.element].text}`}>{b.name}</span>
                <span className="text-sm text-guild-muted">{b.daysLeft}d left</span>
              </div>
            ))}
          </div>

          {/* Spiral Abyss */}
          <div className="guild-card p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-guild-muted">
              <AbyssIcon className="text-guild-accent" size={18} /> Spiral Abyss
            </div>
            <div className="text-3xl font-bold font-mono">3d 12h</div>
            <div className="text-sm text-guild-muted">Until reset</div>
          </div>

          {/* Live Streamers */}
          <div className="guild-card p-5 space-y-3 cursor-pointer hover:border-white/10 transition-colors" onClick={() => router.push("/streamers")}>
            <div className="flex items-center gap-2 text-sm font-medium text-guild-muted">
              <KameraIcon className="text-red-400" size={18} /> Live Now
            </div>
            <div className="text-3xl font-bold font-mono">24 <span className="text-sm font-normal text-guild-muted">streamers</span></div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm text-red-400">Live</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending + Events */}
      <section className="px-6 pb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Trending Builds */}
          <div className="guild-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-guild-muted">
              <VerdictIcon className="h-4 w-4 text-guild-accent" /> Trending Builds This Week
            </div>
            {trendingBuilds.map((b, i) => (
              <div key={b.name} className="flex items-center gap-3">
                <span className="text-sm font-mono text-guild-muted w-4">{i + 1}.</span>
                <span className={`font-medium ${ELEMENT_COLORS[b.element].text}`}>{b.name}</span>
                <span className="text-sm text-guild-muted ml-auto">{b.uses} usage</span>
              </div>
            ))}
          </div>

          {/* Upcoming Events */}
          <div className="guild-card p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-guild-muted">
              <PrimogemIcon className="text-guild-gold" size={18} /> Upcoming
            </div>
            {upcomingEvents.map((e) => (
              <div key={e.name} className="flex items-center justify-between">
                <span className="font-medium text-sm">{e.name}</span>
                <span className="text-sm text-guild-muted font-mono">{e.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Roast Feed */}
      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto space-y-4">
          <h2 className="text-xl font-bold">Recent Roasts 🔥</h2>
          {RECENT_ROASTS.map((r, i) => (
            <div key={i} className="guild-card p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <span className={`font-bold text-lg ${ELEMENT_COLORS[Hypo].text}`}>{r.uid.split("x")[0]}x</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Roasted: <span className={ELEMENT_COLORS[r.element as keyof typeof ELEMENT_COLORS]?.text || "text-white"}>{r.character}</span></p>
                <p className="text-red-400 font-semibold text-base">{r.verdict}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-12">
        <div className="max-w-3xl mx-auto guild-card p-8 text-center space-y-4 guild-glow">
          <VerdictIcon className="text-guild-accent" size={40} />
          <h2 className="text-3xl font-bold">Ready to get roasted?</h2>
          <p className="text-guild-muted max-w-md mx-auto">
            Paste your UID above and we&apos;ll judge every artifact you own. No mercy. No filter. Just facts.
          </p>
        </div>
      </section>
    </div>
  );
}
