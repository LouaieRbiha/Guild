import Link from "next/link";
import { Search, Sparkles, Shield, TrendingUp, Award, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: Award,
    title: "Build Analysis",
    description:
      "Artifact scoring, substats breakdown, and overall build grade for every character on your showcase.",
  },
  {
    icon: Heart,
    title: "Honest Roasts",
    description:
      "AI-generated roasts based on your build quality. No feelings were spared in the making of this feature.",
  },
  {
    icon: TrendingUp,
    title: "Resin Estimates",
    description:
      "See how much resin you'd need to perfect each build. Spoiler: it's always more than you think.",
  },
];

const STEPS = [
  { number: 1, label: "Enter UID", detail: "Paste any Genshin UID into the search bar above" },
  { number: 2, label: "View Characters", detail: "Browse every character on the player's showcase" },
  { number: 3, label: "Get Roasted", detail: "Receive brutally honest AI feedback on each build" },
];

const EXAMPLE_UIDS = [
  { uid: "800784650", label: "High AR player" },
  { uid: "618285856", label: "Build showcase" },
];

export default function ProfileIndex() {
  return (
    <div className="min-h-screen text-foreground pb-16">
      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="pt-20 pb-14 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Icon with accent glow */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-guild-accent/20 blur-2xl scale-150" />
            <div className="relative w-20 h-20 rounded-full bg-guild-accent/10 border border-guild-accent/30 flex items-center justify-center">
              <Shield className="w-10 h-10 text-guild-accent" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-guild-accent to-guild-accent-2">
              Build Showcase
            </span>
          </h1>

          <p className="text-lg text-guild-muted max-w-md mx-auto leading-relaxed">
            Enter a UID in the search bar above to analyze builds, get roasted,
            and see how much resin you really need.
          </p>

          {/* Decorative accent divider */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <div className="h-px w-16 bg-linear-to-r from-transparent to-guild-accent/50" />
            <Sparkles className="w-4 h-4 text-guild-accent/60" />
            <div className="h-px w-16 bg-linear-to-l from-transparent to-guild-accent/50" />
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────────── */}
      <section className="px-6 pb-14">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="border-guild-border transition-all duration-300 hover:border-guild-accent/20 hover:shadow-[0_0_24px_rgba(99,102,241,0.08)]"
            >
              <CardContent className="p-5 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-guild-accent/10 flex items-center justify-center text-guild-accent">
                  <feature.icon size={22} />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-guild-muted leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── How To Use ────────────────────────────────────────────────── */}
      <section className="px-6 pb-14">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-xl font-bold text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.number} className="flex flex-col items-center text-center gap-3">
                {/* Step number circle */}
                <div className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-px bg-linear-to-r from-guild-accent/40 to-guild-accent/10 -translate-y-1/2" />
                  )}
                  <div className="w-10 h-10 rounded-full bg-guild-accent/15 border border-guild-accent/30 flex items-center justify-center text-guild-accent font-bold text-sm">
                    {step.number}
                  </div>
                </div>
                <h3 className="font-semibold text-sm">{step.label}</h3>
                <p className="text-xs text-guild-muted leading-relaxed">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Example UIDs ──────────────────────────────────────────────── */}
      <section className="px-6">
        <div className="max-w-md mx-auto text-center space-y-4">
          <p className="text-sm text-guild-dim flex items-center justify-center gap-2">
            <Search className="w-4 h-4" />
            Try these example UIDs
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            {EXAMPLE_UIDS.map((example) => (
              <Link key={example.uid} href={`/profile/${example.uid}`}>
                <Badge
                  variant="outline"
                  className="px-4 py-1.5 text-sm font-mono border-guild-accent/30 text-guild-accent hover:bg-guild-accent/10 transition-colors cursor-pointer"
                >
                  {example.uid}
                  <span className="ml-2 font-sans text-guild-dim text-xs">
                    {example.label}
                  </span>
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
