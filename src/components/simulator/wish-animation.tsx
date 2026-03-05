"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────

interface WishAnimationProps {
  results: Array<{
    rarity: 3 | 4 | 5;
    name: string;
    itemType: "character" | "weapon";
  }>;
  onComplete: () => void;
}

// ── Rarity visual config ─────────────────────────────────────────────

const RARITY_CONFIG = {
  3: {
    starColor: "#60a5fa",
    glowColor: "rgba(59, 130, 246, 0.6)",
    trailColor: "rgba(59, 130, 246, 0.3)",
    flashColor: "rgba(59, 130, 246, 0.15)",
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    label: "3-Star",
    starDuration: 0.6,
    flashIntensity: 0.3,
  },
  4: {
    starColor: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.7)",
    trailColor: "rgba(168, 85, 247, 0.4)",
    flashColor: "rgba(168, 85, 247, 0.2)",
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    label: "4-Star",
    starDuration: 0.9,
    flashIntensity: 0.5,
  },
  5: {
    starColor: "#fbbf24",
    glowColor: "rgba(251, 191, 36, 0.8)",
    trailColor: "rgba(251, 191, 36, 0.4)",
    flashColor: "rgba(251, 191, 36, 0.3)",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    label: "5-Star",
    starDuration: 1.4,
    flashIntensity: 0.9,
  },
} as const;

const AUTO_ADVANCE_MS = { 3: 800, 4: 1500, 5: 0 } as const;

// ── Component ────────────────────────────────────────────────────────

export function WishAnimation({
  results,
  onComplete,
}: WishAnimationProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"falling" | "impact" | "reveal" | "summary">("falling");

  const isMultiPull = results.length > 1;
  const currentResult = results[currentIndex];
  const config = currentResult ? RARITY_CONFIG[currentResult.rarity] : RARITY_CONFIG[3];

  const advanceToNext = useCallback(() => {
    if (currentIndex < results.length - 1) {
      setPhase("falling");
      setCurrentIndex((i) => i + 1);
    } else if (isMultiPull) {
      setPhase("summary");
    } else {
      onComplete();
    }
  }, [currentIndex, results.length, isMultiPull, onComplete]);

  // Phase transitions: falling -> impact -> reveal
  useEffect(() => {
    if (phase !== "falling") return;
    const rarity = results[currentIndex]?.rarity ?? 3;
    const dur = RARITY_CONFIG[rarity].starDuration;

    const impactTimer = setTimeout(() => setPhase("impact"), dur * 1000);
    return () => clearTimeout(impactTimer);
  }, [currentIndex, phase, results]);

  useEffect(() => {
    if (phase !== "impact") return;
    const revealTimer = setTimeout(() => setPhase("reveal"), 400);
    return () => clearTimeout(revealTimer);
  }, [phase]);

  // Auto-advance for 3/4-star
  useEffect(() => {
    if (phase !== "reveal") return;
    const rarity = results[currentIndex]?.rarity ?? 3;
    const delay = AUTO_ADVANCE_MS[rarity];
    if (delay === 0) return;
    const timer = setTimeout(advanceToNext, delay);
    return () => clearTimeout(timer);
  }, [phase, currentIndex, results, advanceToNext]);

  function handleScreenClick(): void {
    if (phase === "reveal") advanceToNext();
    else if (phase === "falling" || phase === "impact") {
      setPhase("reveal"); // skip to reveal
    }
  }

  if (phase === "summary") {
    return <SummaryGrid results={results} onDismiss={onComplete} />;
  }

  const rarity = currentResult?.rarity ?? 3;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden select-none"
      onClick={handleScreenClick}
    >
      {/* Injected keyframes */}
      <WishKeyframes />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Dark sky background */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${
                rarity === 5 ? "rgba(30, 25, 10, 1)" :
                rarity === 4 ? "rgba(20, 15, 35, 1)" :
                "rgba(10, 18, 35, 1)"
              } 0%, #000 100%)`,
            }}
          />

          {/* Ambient star field */}
          <StarField count={rarity === 5 ? 80 : rarity === 4 ? 50 : 30} />

          {/* The falling star */}
          {(phase === "falling") && (
            <FallingStar rarity={rarity} />
          )}

          {/* Impact flash */}
          {(phase === "impact" || phase === "reveal") && (
            <ImpactFlash rarity={rarity} />
          )}

          {/* Ring burst on impact */}
          {(phase === "impact" || phase === "reveal") && (
            <RingBurst rarity={rarity} />
          )}

          {/* Floating particles after impact */}
          {phase === "reveal" && (
            <FloatingEmbers rarity={rarity} />
          )}

          {/* Result card */}
          {phase === "reveal" && currentResult && (
            <RevealCard result={currentResult} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pull counter */}
      {isMultiPull && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-sm text-white/40 font-mono z-10">
          {currentIndex + 1} / {results.length}
        </div>
      )}

      {/* Click prompt for 5-star */}
      {phase === "reveal" && rarity === 5 && (
        <motion.div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 text-sm text-white/30 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Click to continue
        </motion.div>
      )}

      {/* Skip button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isMultiPull) setPhase("summary");
          else onComplete();
        }}
        className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-sm transition-colors cursor-pointer z-10"
      >
        <SkipForward className="h-4 w-4" />
        Skip
      </button>
    </div>
  );
}

// ── Star Field Background ───────────────────────────────────────────

function StarField({ count }: { count: number }): React.JSX.Element {
  // Generate positions deterministically to avoid hydration mismatches
  const stars = Array.from({ length: count }, (_, i) => {
    const hash = ((i * 2654435761) >>> 0) / 4294967296;
    const hash2 = (((i + 1000) * 2654435761) >>> 0) / 4294967296;
    const hash3 = (((i + 2000) * 2654435761) >>> 0) / 4294967296;
    return {
      left: `${hash * 100}%`,
      top: `${hash2 * 100}%`,
      size: 1 + hash3 * 2,
      delay: hash * 3,
      opacity: 0.3 + hash3 * 0.5,
    };
  });

  return (
    <>
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `star-twinkle ${2 + s.delay}s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </>
  );
}

// ── Falling Star ────────────────────────────────────────────────────

function FallingStar({ rarity }: { rarity: 3 | 4 | 5 }): React.JSX.Element {
  const config = RARITY_CONFIG[rarity];
  const dur = config.starDuration;

  // Trail particles that follow the star path
  const trailCount = rarity === 5 ? 12 : rarity === 4 ? 8 : 4;

  return (
    <>
      {/* Main star body */}
      <div
        className="absolute"
        style={{
          animation: `wish-star-fall ${dur}s cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
        }}
      >
        {/* Core bright point */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: rarity === 5 ? 12 : rarity === 4 ? 8 : 5,
            height: rarity === 5 ? 12 : rarity === 4 ? 8 : 5,
            backgroundColor: config.starColor,
            boxShadow: `0 0 ${rarity === 5 ? 40 : 20}px ${rarity === 5 ? 15 : 8}px ${config.glowColor}, 0 0 ${rarity === 5 ? 80 : 40}px ${rarity === 5 ? 30 : 15}px ${config.trailColor}`,
          }}
        />
        {/* Elongated tail / streak */}
        <div
          className="absolute -translate-y-1/2"
          style={{
            width: rarity === 5 ? 200 : rarity === 4 ? 120 : 60,
            height: rarity === 5 ? 4 : rarity === 4 ? 3 : 2,
            right: rarity === 5 ? 6 : 4,
            top: 0,
            background: `linear-gradient(to left, ${config.starColor}, ${config.trailColor}, transparent)`,
            borderRadius: 2,
            transformOrigin: "right center",
            transform: "rotate(35deg)",
          }}
        />
      </div>

      {/* Trailing sparkle particles */}
      {Array.from({ length: trailCount }, (_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            backgroundColor: config.starColor,
            opacity: 0,
            animation: `wish-star-fall ${dur}s cubic-bezier(0.22, 0.61, 0.36, 1) forwards`,
            animationDelay: `${(i / trailCount) * dur * 0.6}s`,
            filter: `blur(${1 + i * 0.5}px)`,
          }}
        />
      ))}
    </>
  );
}

// ── Impact Flash ────────────────────────────────────────────────────

function ImpactFlash({ rarity }: { rarity: 3 | 4 | 5 }): React.JSX.Element {
  const config = RARITY_CONFIG[rarity];

  return (
    <>
      {/* Full-screen white flash */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: "white" }}
        initial={{ opacity: config.flashIntensity }}
        animate={{ opacity: 0 }}
        transition={{ duration: rarity === 5 ? 0.8 : 0.4, ease: "easeOut" }}
      />

      {/* Central glow point */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${config.starColor} 0%, ${config.glowColor} 30%, transparent 70%)`,
        }}
        initial={{ width: 20, height: 20, opacity: 1 }}
        animate={{
          width: rarity === 5 ? 600 : rarity === 4 ? 400 : 200,
          height: rarity === 5 ? 600 : rarity === 4 ? 400 : 200,
          opacity: 0,
        }}
        transition={{ duration: rarity === 5 ? 1.2 : 0.6, ease: "easeOut" }}
      />
    </>
  );
}

// ── Ring Burst ──────────────────────────────────────────────────────

function RingBurst({ rarity }: { rarity: 3 | 4 | 5 }): React.JSX.Element {
  const config = RARITY_CONFIG[rarity];
  const ringCount = rarity === 5 ? 3 : rarity === 4 ? 2 : 1;

  return (
    <>
      {Array.from({ length: ringCount }, (_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            border: `${rarity === 5 ? 3 : 2}px solid ${config.starColor}`,
          }}
          initial={{ width: 0, height: 0, opacity: 0.8 }}
          animate={{
            width: [0, rarity === 5 ? 500 : 300],
            height: [0, rarity === 5 ? 500 : 300],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: rarity === 5 ? 1 : 0.6,
            delay: i * 0.15,
            ease: "easeOut",
          }}
        />
      ))}
    </>
  );
}

// ── Floating Embers ─────────────────────────────────────────────────

function FloatingEmbers({ rarity }: { rarity: 3 | 4 | 5 }): React.JSX.Element {
  const config = RARITY_CONFIG[rarity];
  const count = rarity === 5 ? 24 : rarity === 4 ? 12 : 6;

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const hash = ((i * 2654435761) >>> 0) / 4294967296;
        const hash2 = (((i + 500) * 2654435761) >>> 0) / 4294967296;
        const startX = 30 + hash * 40;
        const startY = 40 + hash2 * 20;
        const size = 2 + hash * 4;

        return (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size,
              height: size,
              backgroundColor: config.starColor,
              left: `${startX}%`,
              top: `${startY}%`,
              filter: `blur(${hash > 0.5 ? 1 : 0}px)`,
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 0.8, 0],
              y: -(40 + hash * 80),
              x: (hash2 - 0.5) * 100,
            }}
            transition={{
              duration: 2 + hash * 2,
              delay: hash * 0.5,
              ease: "easeOut",
            }}
          />
        );
      })}
    </>
  );
}

// ── Reveal Card ─────────────────────────────────────────────────────

function RevealCard({
  result,
}: {
  result: { rarity: 3 | 4 | 5; name: string; itemType: "character" | "weapon" };
}): React.JSX.Element {
  const config = RARITY_CONFIG[result.rarity];

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
      initial={{ opacity: 0, scale: result.rarity === 5 ? 0.3 : 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: result.rarity === 5 ? 0.8 : 0.4,
        ease: result.rarity === 5 ? [0.16, 1, 0.3, 1] : "easeOut",
      }}
    >
      <div
        className={cn(
          "rounded-2xl border-2 text-center backdrop-blur-sm",
          config.bg,
          config.border,
          result.rarity === 5 ? "p-12 min-w-[260px]" : result.rarity === 4 ? "p-10" : "p-8",
        )}
        style={{
          boxShadow: `0 0 ${result.rarity === 5 ? 60 : 30}px ${config.glowColor}, 0 0 ${result.rarity === 5 ? 120 : 60}px ${config.trailColor}`,
        }}
      >
        {/* Star icon for 5-star */}
        {result.rarity === 5 && (
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center">
              <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
            </div>
          </motion.div>
        )}

        {/* Rarity stars */}
        <div className="flex justify-center mb-3">
          <RarityStarsInline count={result.rarity} rarity={result.rarity} />
        </div>

        {/* Name */}
        <motion.div
          className={cn(
            "font-bold",
            config.text,
            result.rarity === 5 ? "text-2xl" : result.rarity === 4 ? "text-xl" : "text-lg",
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: result.rarity === 5 ? 0.4 : 0.2 }}
        >
          {result.name}
        </motion.div>

        <motion.div
          className="text-sm text-white/40 mt-1 capitalize"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: result.rarity === 5 ? 0.6 : 0.3 }}
        >
          {result.itemType}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Summary Grid ────────────────────────────────────────────────────

function SummaryGrid({
  results,
  onDismiss,
}: {
  results: Array<{
    rarity: 3 | 4 | 5;
    name: string;
    itemType: "character" | "weapon";
  }>;
  onDismiss: () => void;
}): React.JSX.Element {
  const sorted = [...results].sort((a, b) => b.rarity - a.rarity);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center select-none">
      <motion.h2
        className="text-xl font-bold text-white/80 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Wish Results
      </motion.h2>

      <motion.div
        className="grid grid-cols-5 gap-3 max-w-2xl px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 }}
      >
        {sorted.map((result, i) => {
          const cfg = RARITY_CONFIG[result.rarity];
          return (
            <motion.div
              key={i}
              className={cn(
                "rounded-lg border p-3 text-center min-w-[100px]",
                cfg.bg,
                cfg.border,
              )}
              style={{ boxShadow: `0 0 15px ${cfg.glowColor}` }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div className="flex justify-center mb-1">
                <RarityStarsInline
                  count={result.rarity}
                  rarity={result.rarity}
                  size="small"
                />
              </div>
              <div className={cn("text-xs font-medium", cfg.text)}>
                {result.name}
              </div>
              <div className="text-[10px] text-white/30 capitalize mt-0.5">
                {result.itemType}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.button
        onClick={onDismiss}
        className="mt-6 px-6 py-3 rounded-lg bg-guild-accent hover:bg-guild-accent/80 text-white font-medium transition-colors cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Back to Simulator
      </motion.button>
    </div>
  );
}

// ── Inline Rarity Stars ─────────────────────────────────────────────

function RarityStarsInline({
  count,
  rarity,
  size = "normal",
}: {
  count: number;
  rarity: 3 | 4 | 5;
  size?: "small" | "normal";
}): React.JSX.Element {
  const starSize = size === "small" ? "h-3 w-3" : "h-4 w-4";
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: count }, (_, i) => (
        <Star
          key={i}
          className={cn(starSize, "fill-current", RARITY_CONFIG[rarity].text)}
        />
      ))}
    </span>
  );
}

// ── CSS Keyframes ───────────────────────────────────────────────────

function WishKeyframes(): React.JSX.Element {
  return (
    <style>{`
      @keyframes wish-star-fall {
        0% {
          left: 75%;
          top: -5%;
          opacity: 0;
        }
        5% {
          opacity: 1;
        }
        85% {
          opacity: 1;
        }
        100% {
          left: 50%;
          top: 50%;
          opacity: 0;
        }
      }
      @keyframes star-twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.3); }
      }
    `}</style>
  );
}
