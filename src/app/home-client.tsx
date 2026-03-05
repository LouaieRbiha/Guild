"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ElementBadge, RarityStars, Countdown } from "@/components/shared";
import { ELEMENT_COLORS, ENKA_UI } from "@/lib/constants";
import {
  ELEMENT_ICONS,
  PrimogemIcon,
  AbyssIcon,
  VerdictIcon,
} from "@/components/icons/genshin-icons";
import { cn } from "@/lib/utils";
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
  const router = useRouter();

  const go = () => {
    if (uid.trim().length >= 9) router.push(`/profile/${uid.trim()}`);
  };

  const charBanner = banners.character;
  const weaponBanner = banners.weapon;
  const bannerEndDate = charBanner ? parseBannerDate(charBanner.end) : null;
  const abyssResetDate = getNextAbyssReset();

  // Hero splash art from first featured 5-star character
  const hero5Star = featured5StarChars[0];
  const heroSplashUrl = hero5Star
    ? `${ENKA_UI}/UI_Gacha_AvatarImg_${hero5Star.avatarKey}.png`
    : null;

  return (
    <div className="min-h-screen text-white">
      {/* ── 1. Hero Section ─────────────────────────────────────────── */}
      <section className="pt-16 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <h1 className="text-7xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-guild-accent to-guild-accent-2">
              GUILD
            </span>
          </h1>
          <p className="text-xl text-guild-muted">
            Your Genshin Impact Command Center
          </p>

          {/* UID Lookup */}
          <div className="max-w-md mx-auto">
            <Card className="guild-glow border-white/10 p-0 gap-0">
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
            <p className="text-sm text-guild-muted mt-3">
              Enter your UID to get your builds roasted
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Character Banner Card */}
            {charBanner ? (
              <Card className="overflow-hidden relative min-h-[320px] border-white/5 p-0 gap-0">
                {/* Background splash art */}
                {heroSplashUrl && (
                  <>
                    <Image
                      src={heroSplashUrl}
                      alt={hero5Star?.name || "Featured character"}
                      fill
                      className="object-cover object-top opacity-40"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
                  </>
                )}

                <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-[320px]">
                  {/* Top label + version */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-guild-muted">
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
                      ? featured5StarChars.map((char) => (
                          <div
                            key={char.id}
                            className="flex items-center gap-3"
                          >
                            <h3 className="text-2xl font-bold">{char.name}</h3>
                            <ElementBadge element={char.element} />
                          </div>
                        ))
                      : charBanner.featured5Star.map((name) => (
                          <h3 key={name} className="text-2xl font-bold">
                            {name}
                          </h3>
                        ))}
                  </div>

                  {/* Bottom: 4-star icons (left) + countdown (right) */}
                  <div className="flex items-end justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {featured4StarChars.map((char) => (
                        <div
                          key={char.id}
                          className="flex items-center gap-1.5"
                        >
                          <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 relative shrink-0">
                            <Image
                              src={`${ENKA_UI}/${char.icon}.png`}
                              alt={char.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                          <span className="text-xs text-guild-muted hidden sm:inline">
                            {char.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    {bannerEndDate && (
                      <Countdown target={bannerEndDate} label="Ends in" />
                    )}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="min-h-[320px] flex items-center justify-center p-0 gap-0">
                <p className="text-guild-muted">No active character banner</p>
              </Card>
            )}

            {/* Weapon Banner Card */}
            {weaponBanner ? (
              <Card className="overflow-hidden relative min-h-[320px] border-white/5 p-0 gap-0">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-guild-accent/10 via-card to-guild-accent-2/10" />

                {/* Background weapon icons */}
                {featured5StarWeapons.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center gap-8 opacity-20">
                    {featured5StarWeapons.map((weapon) => (
                      <Image
                        key={weapon.id}
                        src={`${ENKA_UI}/${weapon.icon}.png`}
                        alt={weapon.name}
                        width={160}
                        height={160}
                        className="object-contain"
                        sizes="160px"
                        priority={true}
                      />
                    ))}
                  </div>
                )}

                <div className="relative z-10 p-6 flex flex-col justify-between h-full min-h-[320px]">
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
                      ? featured5StarWeapons.map((weapon) => (
                          <div
                            key={weapon.id}
                            className="flex items-center gap-3"
                          >
                            <Image
                              src={`${ENKA_UI}/${weapon.icon}.png`}
                              alt={weapon.name}
                              width={40}
                              height={40}
                              className="object-contain"
                              sizes="40px"
                            />
                            <div>
                              <h3 className="text-lg font-bold">
                                {weapon.name}
                              </h3>
                              <RarityStars rarity={weapon.rarity} size="xs" />
                            </div>
                          </div>
                        ))
                      : weaponBanner.featured5Star.map((name) => (
                          <h3 key={name} className="text-lg font-bold">
                            {name}
                          </h3>
                        ))}
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
              <Card className="min-h-[320px] flex items-center justify-center p-0 gap-0">
                <p className="text-guild-muted">No active weapon banner</p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* ── 3. Fresh Drops ──────────────────────────────────────────── */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Fresh Drops</h2>
            <span className="text-sm text-guild-muted">Latest releases</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {newestCharacters.map((char) => {
              const Icon = ELEMENT_ICONS[char.element];
              const splashUrl = `${ENKA_UI}/UI_Gacha_AvatarImg_${char.avatarKey}.png`;

              return (
                <Link
                  key={char.id}
                  href={`/database/${char.id}`}
                  className="group"
                >
                  <Card
                    className={cn(
                      "relative aspect-[3/4] overflow-hidden p-0 gap-0 border-white/5",
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
                      className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />

                    {/* Bottom gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-transparent to-transparent" />

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

      {/* ── 4. Quick Stats Row ──────────────────────────────────────── */}
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

      {/* ── 5. Trending from this Banner ────────────────────────────── */}
      <section className="px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Trending from this Banner</CardTitle>
              <CardDescription>
                Featured characters you can pull right now
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[...featured5StarChars, ...featured4StarChars].map((char) => {
                const Icon = ELEMENT_ICONS[char.element];
                return (
                  <Link
                    key={char.id}
                    href={`/database/${char.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    {Icon && <Icon size={20} />}
                    <span
                      className={`font-medium ${ELEMENT_COLORS[char.element]?.text || ""}`}
                    >
                      {char.name}
                    </span>
                    <RarityStars
                      rarity={char.rarity}
                      size="xs"
                      className="ml-auto"
                    />
                  </Link>
                );
              })}
              {featured5StarChars.length === 0 &&
                featured4StarChars.length === 0 && (
                  <p className="text-guild-muted text-sm">
                    No featured characters available
                  </p>
                )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── 6. CTA Section ──────────────────────────────────────────── */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto">
          <Card className="guild-glow border-white/10">
            <CardContent className="text-center space-y-4 py-2">
              <VerdictIcon className="text-guild-accent mx-auto" size={40} />
              <h2 className="text-3xl font-bold">Ready to get roasted?</h2>
              <p className="text-guild-muted max-w-md mx-auto">
                Paste your UID above and we&apos;ll judge every artifact you
                own. No mercy. No filter. Just facts.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-guild-accent text-guild-accent hover:bg-guild-accent/10"
              >
                <Link href="/profile">Go to Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
