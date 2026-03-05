"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Swords,
  Shield,
  Calendar,
  Map,
  Dices,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ElementBadge, RarityStars, Countdown } from "@/components/shared";
import { ELEMENT_COLORS } from "@/lib/constants";
import { weaponIconUrl } from "@/lib/constants";
import { charIconUrl, charGachaUrl } from "@/lib/characters";
import {
  ELEMENT_ICONS,
  PrimogemIcon,
  AbyssIcon,
} from "@/components/icons/genshin-icons";
import { cn } from "@/lib/utils";
import { TALENT_BOOK_SCHEDULE } from "@/data/farming-schedule";
import type { CharacterEntry } from "@/lib/characters";
import type { ActiveBanners, BannerWeaponInfo } from "@/lib/banners/types";

// ── Helpers ──────────────────────────────────────────────────────────────

function parseBannerDate(dateStr: string): Date {
  return new Date(dateStr.replace(" ", "T") + "+08:00");
}

function getNextAbyssReset(): Date {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const h = now.getUTCHours();

  // Spiral Abyss resets on the 1st and 16th of each month at 04:00 UTC
  if (d < 1 || (d === 1 && h < 4)) {
    return new Date(Date.UTC(y, m, 1, 4, 0, 0));
  }
  if (d < 16 || (d === 16 && h < 4)) {
    return new Date(Date.UTC(y, m, 16, 4, 0, 0));
  }
  return new Date(Date.UTC(y, m + 1, 1, 4, 0, 0));
}

/** Return talent book names available for a given day (0=Sun..6=Sat). */
function getTodaysTalentBooks(): string[] {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[new Date().getDay()];
  if (todayName === "Sunday") return Object.keys(TALENT_BOOK_SCHEDULE);
  return Object.entries(TALENT_BOOK_SCHEDULE)
    .filter(([, days]) => days.includes(todayName))
    .map(([name]) => name);
}

// Element-specific hover glow for character cards
const ELEMENT_GLOW: Record<string, string> = {
  Pyro: "hover:border-red-500/50",
  Hydro: "hover:border-blue-500/50",
  Anemo: "hover:border-teal-500/50",
  Cryo: "hover:border-cyan-500/50",
  Electro: "hover:border-purple-500/50",
  Geo: "hover:border-yellow-500/50",
  Dendro: "hover:border-green-500/50",
};

// Quick navigation items
const NAV_CARDS = [
  {
    href: "/database",
    icon: Users,
    title: "Characters",
    description: "Browse all playable characters, stats, and builds",
  },
  {
    href: "/weapons",
    icon: Swords,
    title: "Weapons",
    description: "Explore weapon stats, passives, and rankings",
  },
  {
    href: "/abyss",
    icon: Shield,
    title: "Abyss Guide",
    description: "Spiral Abyss team comps and floor strategies",
  },
  {
    href: "/calendar",
    icon: Calendar,
    title: "Calendar",
    description: "Upcoming events, banners, and farming schedules",
  },
  {
    href: "/map",
    icon: Map,
    title: "Map",
    description: "Interactive map with markers and routes",
  },
  {
    href: "/simulator",
    icon: Dices,
    title: "Simulator",
    description: "Wish simulator to test your luck for free",
  },
];

// ── Props ────────────────────────────────────────────────────────────────

interface HomeClientProps {
  banners: ActiveBanners;
  newestCharacters: CharacterEntry[];
  featured5StarChars: CharacterEntry[];
  featured4StarChars: CharacterEntry[];
  featured5StarWeapons: BannerWeaponInfo[];
}

// ── Component ────────────────────────────────────────────────────────────

export function HomeClient({
  banners,
  newestCharacters,
  featured5StarChars,
  featured4StarChars,
  featured5StarWeapons,
}: HomeClientProps) {
  const [uid, setUid] = useState("");
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [activeCharIdx, setActiveCharIdx] = useState(0);
  const [activeWeaponIdx, setActiveWeaponIdx] = useState(0);
  const router = useRouter();

  const go = () => {
    if (uid.trim().length >= 9) router.push(`/profile/${uid.trim()}`);
  };

  const charBanner = banners.character;
  const weaponBanner = banners.weapon;
  const bannerEndDate = charBanner ? parseBannerDate(charBanner.end) : null;
  const abyssResetDate = getNextAbyssReset();
  const bannerCount = (charBanner ? 1 : 0) + (weaponBanner ? 1 : 0);

  // Auto-rotate banners on mobile every 6 seconds
  const nextBanner = useCallback(() => {
    if (bannerCount > 1) setActiveBannerIdx((i) => (i + 1) % bannerCount);
  }, [bannerCount]);

  useEffect(() => {
    if (bannerCount <= 1) return;
    const timer = setInterval(nextBanner, 6000);
    return () => clearInterval(timer);
  }, [bannerCount, nextBanner]);

  // Auto-rotate featured 5-star characters every 5 seconds
  useEffect(() => {
    if (featured5StarChars.length <= 1) return;
    const timer = setInterval(() => {
      setActiveCharIdx((i) => (i + 1) % featured5StarChars.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured5StarChars.length]);

  // Auto-rotate featured 5-star weapons every 5 seconds (independent timer)
  useEffect(() => {
    if (featured5StarWeapons.length <= 1) return;
    const timer = setInterval(() => {
      setActiveWeaponIdx((i) => (i + 1) % featured5StarWeapons.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured5StarWeapons.length]);

  // Today's farmable talent books
  const todaysBooks = getTodaysTalentBooks();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayNames[new Date().getDay()];

  return (
    <div className="min-h-screen text-white">
      {/* ── 1. Hero Section ─────────────────────────────────────────── */}
      <section className="pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <h1 className="text-7xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-guild-accent to-guild-accent-2">
              GUILD
            </span>
          </h1>
          <p className="text-xl text-guild-muted max-w-lg mx-auto leading-relaxed">
            Builds, banners, databases, and tools &mdash; everything a Traveler
            needs in one place.
          </p>

          {/* UID Lookup */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-guild-accent/30 via-guild-accent-2/20 to-guild-accent/30 blur-lg animate-pulse-glow" />
              <Card className="relative border-white/10 p-0 gap-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Input
                      type="text"
                      placeholder="Enter your UID"
                      value={uid}
                      onChange={(e) => setUid(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && go()}
                      className="h-12 font-mono text-lg bg-background/50"
                    />
                    <Button
                      onClick={go}
                      size="lg"
                      className="h-12 px-6 bg-guild-accent hover:bg-guild-accent/80"
                    >
                      Lookup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <p className="text-sm text-guild-muted mt-3">
              Paste a Genshin UID to view builds, stats, and more
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. Active Banners ───────────────────────────────────────── */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Banners</h2>
            {charBanner?.version && (
              <Badge
                variant="outline"
                className="text-guild-accent border-guild-accent/30"
              >
                v{charBanner.version}
              </Badge>
            )}
          </div>

          {/* Desktop: side by side. Mobile: carousel with rotation */}
          <div className="relative">
            {/* Desktop layout - both visible */}
            <div className="hidden md:grid md:grid-cols-2 gap-4">
            {/* Character Banner Card */}
            {charBanner ? (
              <Card className="overflow-hidden relative min-h-96 border-white/5 p-0 gap-0">
                {/* Background splash art — crossfade between featured chars */}
                {featured5StarChars.map((char, idx) => {
                  const url = charGachaUrl(char.id);
                  return (
                    <Image
                      key={char.id}
                      src={url}
                      alt={char.name}
                      fill
                      quality={100}
                      className={cn(
                        "object-cover object-top transition-opacity duration-700",
                        idx === activeCharIdx ? "opacity-80" : "opacity-0"
                      )}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={idx === 0}
                    />
                  );
                })}
                <div className="absolute inset-0 bg-linear-to-t from-card via-card/40 to-transparent" />

                <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-96">
                  {/* Top label + version */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                      Character Event Wish
                    </span>
                    {charBanner.version && (
                      <Badge className="bg-guild-accent/20 text-guild-accent border-guild-accent/30">
                        v{charBanner.version}
                      </Badge>
                    )}
                  </div>

                  {/* Featured 5-star names + element badges */}
                  <div className="space-y-2 my-auto py-6">
                    {featured5StarChars.length > 0
                      ? featured5StarChars.map((char, idx) => (
                          <Link
                            key={char.id}
                            href={`/database/${char.id}`}
                            className="flex items-center gap-3 group/name"
                          >
                            <h3
                              className={cn(
                                "text-2xl font-bold transition-all duration-500 group-hover/name:text-guild-accent drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]",
                                idx === activeCharIdx
                                  ? "text-white scale-105 origin-left"
                                  : "text-white/50"
                              )}
                            >
                              {char.name}
                            </h3>
                            <ElementBadge element={char.element} />
                          </Link>
                        ))
                      : charBanner.featured5Star.map((name) => (
                          <h3 key={name} className="text-2xl font-bold">
                            {name}
                          </h3>
                        ))}
                    {/* Navigation dots */}
                    {featured5StarChars.length > 1 && (
                      <div className="flex items-center gap-1.5 pt-2">
                        {featured5StarChars.map((char, idx) => (
                          <button
                            key={char.id}
                            onClick={() => setActiveCharIdx(idx)}
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300",
                              idx === activeCharIdx
                                ? "w-5 bg-guild-accent"
                                : "w-1.5 bg-white/25 hover:bg-white/40"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom: 4-star icons (left) + countdown (right) */}
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {featured4StarChars.map((char) => (
                        <Link
                          key={char.id}
                          href={`/database/${char.id}`}
                          className="flex items-center gap-1.5 group/four hover:opacity-90 transition-opacity"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 relative shrink-0">
                            <Image
                              src={charIconUrl(char.id)}
                              alt={char.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                          <span className="text-xs text-guild-muted hidden sm:inline group-hover/four:text-white transition-colors">
                            {char.name}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {bannerEndDate && (
                      <Countdown target={bannerEndDate} label="Ends in" />
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden relative min-h-80 border-white/5 p-0 gap-0">
                <div className="absolute inset-0 bg-linear-to-br from-guild-accent/10 via-card to-guild-accent-2/10" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-80 gap-3">
                  <PrimogemIcon className="text-guild-muted" size={40} />
                  <p className="text-guild-muted font-medium">
                    No Active Character Banner
                  </p>
                  <p className="text-guild-dim text-sm">
                    Check back when a new banner drops
                  </p>
                </div>
              </Card>
            )}

            {/* Weapon Banner Card */}
            {weaponBanner ? (
              <Card className="overflow-hidden relative min-h-80 border-white/5 p-0 gap-0">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-linear-to-br from-guild-accent/10 via-card to-guild-accent-2/10" />

                {/* Background weapon icon — crossfade between featured weapons */}
                {featured5StarWeapons.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {featured5StarWeapons.map((weapon, idx) => (
                      <Image
                        key={weapon.id}
                        src={weaponIconUrl(weapon.id)}
                        alt={weapon.name}
                        width={160}
                        height={160}
                        className={cn(
                          "absolute object-contain transition-opacity duration-700",
                          idx === activeWeaponIdx ? "opacity-20" : "opacity-0"
                        )}
                        sizes="160px"
                        priority={idx === 0}
                      />
                    ))}
                  </div>
                )}

                <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-80">
                  {/* Top label + version */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-guild-muted">
                      Epitome Invocation
                    </span>
                    {weaponBanner.version && (
                      <Badge className="bg-guild-accent-2/20 text-guild-accent-2 border-guild-accent-2/30">
                        v{weaponBanner.version}
                      </Badge>
                    )}
                  </div>

                  {/* Featured 5-star weapons with icons + rarity */}
                  <div className="space-y-3 my-auto py-6">
                    {featured5StarWeapons.length > 0
                      ? featured5StarWeapons.map((weapon, idx) => (
                          <Link
                            key={weapon.id}
                            href={`/weapons/${weapon.id}`}
                            className="flex items-center gap-3 group/wname hover:opacity-90 transition-opacity"
                          >
                            <Image
                              src={weaponIconUrl(weapon.id)}
                              alt={weapon.name}
                              width={40}
                              height={40}
                              className={cn(
                                "object-contain transition-opacity duration-500",
                                idx === activeWeaponIdx ? "opacity-100" : "opacity-40"
                              )}
                              sizes="40px"
                            />
                            <div>
                              <h3
                                className={cn(
                                  "text-lg font-bold transition-all duration-500 group-hover/wname:text-guild-accent",
                                  idx === activeWeaponIdx
                                    ? "text-white"
                                    : "text-white/50"
                                )}
                              >
                                {weapon.name}
                              </h3>
                              <RarityStars rarity={weapon.rarity} size="xs" />
                            </div>
                          </Link>
                        ))
                      : weaponBanner.featured5Star.map((name) => (
                          <h3 key={name} className="text-lg font-bold">
                            {name}
                          </h3>
                        ))}
                    {/* Navigation dots */}
                    {featured5StarWeapons.length > 1 && (
                      <div className="flex items-center gap-1.5 pt-2">
                        {featured5StarWeapons.map((weapon, idx) => (
                          <button
                            key={weapon.id}
                            onClick={() => setActiveWeaponIdx(idx)}
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300",
                              idx === activeWeaponIdx
                                ? "w-5 bg-guild-accent-2"
                                : "w-1.5 bg-white/25 hover:bg-white/40"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom: label + countdown */}
                  <div className="flex items-end justify-between">
                    <span className="text-sm text-guild-muted">
                      Weapon Event Wish
                    </span>
                    <Countdown
                      target={parseBannerDate(weaponBanner.end)}
                      label="Ends in"
                    />
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="overflow-hidden relative min-h-80 border-white/5 p-0 gap-0">
                <div className="absolute inset-0 bg-linear-to-br from-guild-accent-2/10 via-card to-guild-accent/10" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-80 gap-3">
                  <Swords className="text-guild-muted" size={40} />
                  <p className="text-guild-muted font-medium">
                    No Active Weapon Banner
                  </p>
                  <p className="text-guild-dim text-sm">
                    Check back when a new banner drops
                  </p>
                </div>
              </Card>
            )}
          </div>

            {/* Mobile layout - carousel with rotation */}
            <div className="md:hidden relative">
              <div className="overflow-hidden rounded-xl">
                {activeBannerIdx === 0 && charBanner ? (
                  <Card className="overflow-hidden relative min-h-96 border-white/5 p-0 gap-0">
                    {featured5StarChars.map((char, idx) => {
                      const url = charGachaUrl(char.id);
                      return (
                        <Image
                          key={char.id}
                          src={url}
                          alt={char.name}
                          fill
                          quality={100}
                          className={cn(
                            "object-cover object-top transition-opacity duration-700",
                            idx === activeCharIdx ? "opacity-80" : "opacity-0"
                          )}
                          sizes="100vw"
                        />
                      );
                    })}
                    <div className="absolute inset-0 bg-linear-to-t from-card via-card/40 to-transparent" />
                    <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-96">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-guild-muted">Character Event Wish</span>
                        {charBanner.version && (
                          <Badge className="bg-guild-accent/20 text-guild-accent border-guild-accent/30">v{charBanner.version}</Badge>
                        )}
                      </div>
                      <div className="space-y-2 my-auto py-6">
                        {featured5StarChars.map((char, idx) => (
                          <Link key={char.id} href={`/database/${char.id}`} className="flex items-center gap-3">
                            <h3 className={cn(
                              "text-2xl font-bold transition-all duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]",
                              idx === activeCharIdx ? "text-white scale-105 origin-left" : "text-white/50"
                            )}>{char.name}</h3>
                            <ElementBadge element={char.element} />
                          </Link>
                        ))}
                        {featured5StarChars.length > 1 && (
                          <div className="flex items-center gap-1.5 pt-2">
                            {featured5StarChars.map((char, idx) => (
                              <button
                                key={char.id}
                                onClick={() => setActiveCharIdx(idx)}
                                className={cn(
                                  "h-1.5 rounded-full transition-all duration-300",
                                  idx === activeCharIdx ? "w-5 bg-guild-accent" : "w-1.5 bg-white/25 hover:bg-white/40"
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-end justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {featured4StarChars.map((char) => (
                            <Link key={char.id} href={`/database/${char.id}`} className="flex items-center gap-1.5">
                              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 relative shrink-0">
                                <Image src={charIconUrl(char.id)} alt={char.name} fill className="object-cover" sizes="32px" />
                              </div>
                            </Link>
                          ))}
                        </div>
                        {bannerEndDate && <Countdown target={bannerEndDate} label="Ends in" />}
                      </div>
                    </div>
                  </Card>
                ) : weaponBanner ? (
                  <Card className="overflow-hidden relative min-h-80 border-white/5 p-0 gap-0">
                    <div className="absolute inset-0 bg-linear-to-br from-guild-accent/10 via-card to-guild-accent-2/10" />
                    {featured5StarWeapons.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        {featured5StarWeapons.map((weapon, idx) => (
                          <Image
                            key={weapon.id}
                            src={weaponIconUrl(weapon.id)}
                            alt={weapon.name}
                            width={160}
                            height={160}
                            className={cn(
                              "absolute object-contain transition-opacity duration-700",
                              idx === activeWeaponIdx ? "opacity-20" : "opacity-0"
                            )}
                            sizes="160px"
                          />
                        ))}
                      </div>
                    )}
                    <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-80">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-guild-muted">Epitome Invocation</span>
                        {weaponBanner.version && (
                          <Badge className="bg-guild-accent-2/20 text-guild-accent-2 border-guild-accent-2/30">v{weaponBanner.version}</Badge>
                        )}
                      </div>
                      <div className="space-y-3 my-auto py-6">
                        {featured5StarWeapons.map((weapon, idx) => (
                          <Link key={weapon.id} href={`/weapons/${weapon.id}`} className="flex items-center gap-3">
                            <Image
                              src={weaponIconUrl(weapon.id)}
                              alt={weapon.name}
                              width={40}
                              height={40}
                              className={cn(
                                "object-contain transition-opacity duration-500",
                                idx === activeWeaponIdx ? "opacity-100" : "opacity-40"
                              )}
                              sizes="40px"
                            />
                            <div>
                              <h3 className={cn(
                                "text-lg font-bold transition-all duration-500",
                                idx === activeWeaponIdx ? "text-white" : "text-white/50"
                              )}>{weapon.name}</h3>
                              <RarityStars rarity={weapon.rarity} size="xs" />
                            </div>
                          </Link>
                        ))}
                        {featured5StarWeapons.length > 1 && (
                          <div className="flex items-center gap-1.5 pt-2">
                            {featured5StarWeapons.map((weapon, idx) => (
                              <button
                                key={weapon.id}
                                onClick={() => setActiveWeaponIdx(idx)}
                                className={cn(
                                  "h-1.5 rounded-full transition-all duration-300",
                                  idx === activeWeaponIdx ? "w-5 bg-guild-accent-2" : "w-1.5 bg-white/25 hover:bg-white/40"
                                )}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-sm text-guild-muted">Weapon Event Wish</span>
                        <Countdown target={parseBannerDate(weaponBanner.end)} label="Ends in" />
                      </div>
                    </div>
                  </Card>
                ) : null}
              </div>

              {/* Carousel dots + arrows */}
              {bannerCount > 1 && (
                <div className="flex items-center justify-center gap-3 mt-3">
                  <button onClick={() => setActiveBannerIdx((i) => (i - 1 + bannerCount) % bannerCount)} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    <ChevronLeft className="h-4 w-4 text-guild-muted" />
                  </button>
                  <div className="flex gap-1.5">
                    {Array.from({ length: bannerCount }).map((_, i) => (
                      <button key={i} onClick={() => setActiveBannerIdx(i)} className={cn("w-2 h-2 rounded-full transition-all", activeBannerIdx === i ? "bg-guild-accent w-6" : "bg-white/20 hover:bg-white/40")} />
                    ))}
                  </div>
                  <button onClick={nextBanner} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                    <ChevronRight className="h-4 w-4 text-guild-muted" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Today's Farming ────────────────────────────────────────── */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <Card className="border-white/5 p-0 gap-0">
            <CardContent className="px-5 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 shrink-0">
                  <BookOpen size={18} className="text-guild-accent" />
                  <span className="text-sm font-semibold">
                    Today&apos;s Talent Books
                  </span>
                  <Badge variant="outline" className="text-xs text-guild-muted border-white/10">
                    {todayName}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {todaysBooks.map((book) => (
                    <Badge
                      key={book}
                      className="bg-guild-accent/10 text-guild-accent border-guild-accent/20 text-xs"
                    >
                      {book}
                    </Badge>
                  ))}
                </div>
                <Link
                  href="/calendar"
                  className="text-xs text-guild-accent hover:text-guild-accent/80 transition-colors shrink-0"
                >
                  Full schedule &rarr;
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── 3. Quick Navigation ─────────────────────────────────────── */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto space-y-4">
          <h2 className="text-xl font-bold">Explore</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {NAV_CARDS.map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <Card className="h-full border-white/5 transition-all duration-300 hover:border-guild-accent/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]">
                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="w-10 h-10 rounded-lg bg-guild-accent/10 flex items-center justify-center text-guild-accent group-hover:bg-guild-accent/20 transition-colors">
                      <item.icon size={22} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      <p className="text-xs text-guild-muted mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Fresh Drops ──────────────────────────────────────────── */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Fresh Drops</h2>
            <span className="text-sm text-guild-muted">Latest releases</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {newestCharacters.map((char) => {
              const Icon = ELEMENT_ICONS[char.element];
              const splashUrl = charGachaUrl(char.id);

              return (
                <Link
                  key={char.id}
                  href={`/database/${char.id}`}
                  className="group"
                >
                  <Card
                    className={cn(
                      "relative aspect-3/4 overflow-hidden p-0 gap-0 border-white/5",
                      "transition-all duration-300 hover:scale-105 hover:shadow-lg",
                      ELEMENT_GLOW[char.element] ||
                        "hover:border-guild-accent/50"
                    )}
                  >
                    {/* Element background tint */}
                    <div
                      className={`absolute inset-0 ${ELEMENT_COLORS[char.element]?.bg || ""}`}
                    />

                    {/* Character gacha art */}
                    <Image
                      src={splashUrl}
                      alt={char.name}
                      fill
                      quality={95}
                      className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />

                    {/* Bottom gradient */}
                    <div className="absolute inset-0 bg-linear-to-t from-[#1a1b2e] via-transparent to-transparent" />

                    {/* Element icon (top-right) */}
                    {Icon && (
                      <div className="absolute top-3 right-3">
                        <Icon size={20} />
                      </div>
                    )}

                    {/* Name + rarity stars (bottom) */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-bold text-base truncate">
                        {char.name}
                      </h3>
                      <RarityStars rarity={char.rarity} size="xs" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Quick Stats Row ──────────────────────────────────────── */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Banner Ends */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-guild-muted">
                <PrimogemIcon className="text-guild-gold" size={18} />
                Banner Ends
              </div>
              {bannerEndDate ? (
                <Countdown target={bannerEndDate} className="text-3xl" />
              ) : (
                <div className="text-guild-muted">No active banner</div>
              )}
            </CardContent>
          </Card>

          {/* Spiral Abyss */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-guild-muted">
                <AbyssIcon className="text-guild-accent" size={18} />
                Spiral Abyss
              </div>
              <Countdown
                target={abyssResetDate}
                label="Until reset"
                className="text-3xl"
              />
            </CardContent>
          </Card>

          {/* Featured Characters */}
          <Card>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-guild-muted">
                <PrimogemIcon className="text-guild-accent-2" size={18} />
                Featured Characters
              </div>
              <div className="text-3xl font-bold font-mono">
                {featured5StarChars.length}
                <span className="text-sm font-normal text-guild-muted ml-2">
                  5-star{featured5StarChars.length !== 1 ? "s" : ""} on banner
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
