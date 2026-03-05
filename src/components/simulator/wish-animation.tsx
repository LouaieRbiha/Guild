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
    glow: "rgba(59, 130, 246, 0.4)",
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    meteor: "bg-blue-400",
    meteorTrail: "bg-blue-400/30",
    particle: "bg-blue-400",
    label: "3-Star",
  },
  4: {
    glow: "rgba(168, 85, 247, 0.5)",
    text: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    meteor: "bg-purple-400",
    meteorTrail: "bg-purple-400/30",
    particle: "bg-purple-400",
    label: "4-Star",
  },
  5: {
    glow: "rgba(251, 191, 36, 0.6)",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    meteor: "bg-amber-400",
    meteorTrail: "bg-amber-400/20",
    particle: "bg-amber-400",
    label: "5-Star",
  },
} as const;

const AUTO_ADVANCE_MS = { 3: 800, 4: 1500, 5: 0 } as const;

// ── Component ────────────────────────────────────────────────────────

export function WishAnimation({
  results,
  onComplete,
}: WishAnimationProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"reveal" | "summary">("reveal");
  const [showCard, setShowCard] = useState(false);

  const isMultiPull = results.length > 1;
  const currentResult = results[currentIndex];
  const config = currentResult ? RARITY_CONFIG[currentResult.rarity] : RARITY_CONFIG[3];

  // Advance to the next result or to the summary screen
  const advanceToNext = useCallback(() => {
    if (currentIndex < results.length - 1) {
      setShowCard(false);
      setCurrentIndex((i) => i + 1);
    } else if (isMultiPull) {
      setPhase("summary");
    } else {
      onComplete();
    }
  }, [currentIndex, results.length, isMultiPull, onComplete]);

  // Delay showing the card after the meteor animation
  useEffect(() => {
    if (phase !== "reveal") return;

    setShowCard(false);
    const rarity = results[currentIndex]?.rarity ?? 3;

    // Card appears after meteor crosses center
    const cardDelay = rarity === 5 ? 1200 : rarity === 4 ? 600 : 400;
    const cardTimer = setTimeout(() => setShowCard(true), cardDelay);

    return () => clearTimeout(cardTimer);
  }, [currentIndex, phase, results]);

  // Auto-advance for 3-star and 4-star
  useEffect(() => {
    if (phase !== "reveal" || !showCard) return;

    const rarity = results[currentIndex]?.rarity ?? 3;
    const delay = AUTO_ADVANCE_MS[rarity];
    if (delay === 0) return; // 5-star waits for click

    const timer = setTimeout(advanceToNext, delay);
    return () => clearTimeout(timer);
  }, [showCard, phase, currentIndex, results, advanceToNext]);

  // Click handler for dismiss and click-to-advance
  function handleScreenClick(): void {
    if (phase !== "summary" && showCard) {
      advanceToNext();
    }
  }

  if (phase === "summary") {
    return (
      <SummaryGrid results={results} onDismiss={onComplete} />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black overflow-hidden select-none"
      onClick={handleScreenClick}
    >
      {/* CSS keyframes */}
      <WishKeyframes />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Meteor streaks */}
          <MeteorAnimation rarity={currentResult?.rarity ?? 3} />

          {/* Screen flash for 4-star and 5-star */}
          {(currentResult?.rarity === 4 || currentResult?.rarity === 5) && (
            <ScreenFlash rarity={currentResult.rarity} />
          )}

          {/* Result card reveal */}
          {showCard && currentResult && (
            <ResultCard result={currentResult} />
          )}

          {/* Particle burst for 5-star */}
          {showCard && currentResult?.rarity === 5 && (
            <ParticleBurst count={18} colorClass={config.particle} />
          )}

          {/* Small particle burst for 4-star */}
          {showCard && currentResult?.rarity === 4 && (
            <ParticleBurst count={8} colorClass={config.particle} />
          )}

          {/* Golden halo for 5-star */}
          {showCard && currentResult?.rarity === 5 && (
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
              style={{
                background: `radial-gradient(circle, ${RARITY_CONFIG[5].glow} 0%, transparent 70%)`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.6 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pull counter for multi-pull */}
      {isMultiPull && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-sm text-white/50 font-mono">
          {currentIndex + 1} / {results.length}
        </div>
      )}

      {/* 5-star click prompt */}
      {showCard && currentResult?.rarity === 5 && (
        <motion.div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 text-sm text-white/40"
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
          onComplete();
        }}
        className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-sm transition-colors cursor-pointer z-10"
      >
        <SkipForward className="h-4 w-4" />
        Skip
      </button>
    </div>
  );
}

// ── Meteor Animation ─────────────────────────────────────────────────

function MeteorAnimation({ rarity }: { rarity: 3 | 4 | 5 }): React.JSX.Element {
  const config = RARITY_CONFIG[rarity];

  if (rarity === 5) {
    // Multiple golden meteor streaks with staggered timing
    return (
      <>
        {[0, 0.15, 0.3].map((delay, i) => (
          <div
            key={i}
            className={cn("absolute w-32 h-1 rounded-full", config.meteor)}
            style={{
              top: `${30 + i * 15}%`,
              animation: `meteor-streak 0.9s ease-in-out ${delay}s forwards`,
              boxShadow: `0 0 20px 6px ${config.glow}`,
            }}
          />
        ))}
      </>
    );
  }

  if (rarity === 4) {
    // Single purple meteor with trail
    return (
      <>
        <div
          className={cn("absolute w-24 h-1 rounded-full", config.meteor)}
          style={{
            top: "40%",
            animation: "meteor-streak 0.7s ease-in-out forwards",
            boxShadow: `0 0 15px 4px ${config.glow}`,
          }}
        />
        <div
          className={cn("absolute w-40 h-0.5 rounded-full", config.meteorTrail)}
          style={{
            top: "40%",
            animation: "meteor-streak 0.7s ease-in-out 0.05s forwards",
          }}
        />
      </>
    );
  }

  // 3-star: simple blue meteor
  return (
    <div
      className={cn("absolute w-16 h-0.5 rounded-full", config.meteor)}
      style={{
        top: "45%",
        animation: "meteor-streak 0.5s ease-in-out forwards",
        boxShadow: `0 0 8px 2px ${config.glow}`,
      }}
    />
  );
}

// ── Screen Flash ─────────────────────────────────────────────────────

function ScreenFlash({ rarity }: { rarity: 4 | 5 }): React.JSX.Element {
  const intensity = rarity === 5 ? 0.8 : 0.3;
  const delay = rarity === 5 ? 0.6 : 0.3;

  return (
    <motion.div
      className="absolute inset-0 bg-white pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, intensity, 0] }}
      transition={{ duration: rarity === 5 ? 0.8 : 0.4, delay, ease: "easeOut" }}
    />
  );
}

// ── Result Card ──────────────────────────────────────────────────────

function ResultCard({
  result,
}: {
  result: { rarity: 3 | 4 | 5; name: string; itemType: "character" | "weapon" };
}): React.JSX.Element {
  const config = RARITY_CONFIG[result.rarity];

  // 3-star: simple fade in
  if (result.rarity === 3) {
    return (
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className={cn(
            "rounded-xl border-2 p-8 text-center",
            config.bg,
            config.border,
          )}
          style={{ boxShadow: `0 0 30px ${config.glow}` }}
        >
          <div className="flex justify-center mb-3">
            <RarityStarsInline count={result.rarity} rarity={result.rarity} />
          </div>
          <div className={cn("text-lg font-semibold", config.text)}>
            {result.name}
          </div>
          <div className="text-xs text-white/40 mt-1 capitalize">
            {result.itemType}
          </div>
        </div>
      </motion.div>
    );
  }

  // 4-star: slide up from bottom
  if (result.rarity === 4) {
    return (
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, y: 80 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div
          className={cn(
            "rounded-xl border-2 p-10 text-center",
            config.bg,
            config.border,
          )}
          style={{ boxShadow: `0 0 40px ${config.glow}` }}
        >
          <div className="flex justify-center mb-3">
            <RarityStarsInline count={result.rarity} rarity={result.rarity} />
          </div>
          <motion.div
            className={cn("text-xl font-bold", config.text)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {result.name}
          </motion.div>
          <div className="text-xs text-white/40 mt-1 capitalize">
            {result.itemType}
          </div>
        </div>
      </motion.div>
    );
  }

  // 5-star: dramatic scale-up golden silhouette reveal
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={cn(
          "rounded-2xl border-2 p-12 text-center min-w-[240px]",
          config.bg,
          config.border,
        )}
        style={{ boxShadow: `0 0 60px ${config.glow}, 0 0 120px ${config.glow}` }}
      >
        {/* Golden silhouette icon */}
        <motion.div
          className="flex justify-center mb-4"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          <div className="w-20 h-20 rounded-full bg-amber-400/20 flex items-center justify-center">
            <Star className="h-10 w-10 text-amber-400 fill-amber-400" />
          </div>
        </motion.div>

        <div className="flex justify-center mb-3">
          <RarityStarsInline count={5} rarity={5} />
        </div>

        <motion.div
          className={cn("text-2xl font-bold", config.text)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          {result.name}
        </motion.div>
        <motion.div
          className="text-sm text-white/40 mt-1 capitalize"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {result.itemType}
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Particle Burst ───────────────────────────────────────────────────

function ParticleBurst({
  count,
  colorClass,
}: {
  count: number;
  colorClass: string;
}): React.JSX.Element {
  const particles = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360;
    const distance = 80 + Math.random() * 60;
    return (
      <div
        key={i}
        className={cn("absolute w-2 h-2 rounded-full", colorClass)}
        style={
          {
            left: "50%",
            top: "50%",
            animation: "particle-burst 0.8s ease-out forwards",
            animationDelay: `${Math.random() * 0.2}s`,
            "--angle": `${angle}deg`,
            "--distance": `${distance}px`,
          } as React.CSSProperties
        }
      />
    );
  });

  return <>{particles}</>;
}

// ── Summary Grid (10-pull results) ───────────────────────────────────

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
  // Sort by rarity descending for display
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
          const config = RARITY_CONFIG[result.rarity];
          return (
            <motion.div
              key={i}
              className={cn(
                "rounded-lg border p-3 text-center min-w-[100px]",
                config.bg,
                config.border,
              )}
              style={{ boxShadow: `0 0 15px ${config.glow}` }}
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
              <div className={cn("text-xs font-medium", config.text)}>
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
        className="mt-8 px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm transition-colors cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Close
      </motion.button>
    </div>
  );
}

// ── Inline Rarity Stars ──────────────────────────────────────────────

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

// ── CSS Keyframes ────────────────────────────────────────────────────

function WishKeyframes(): React.JSX.Element {
  return (
    <style>{`
      @keyframes particle-burst {
        0% {
          transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--distance));
          opacity: 0;
        }
      }
      @keyframes meteor-streak {
        0% {
          transform: translateX(-100vw) translateY(20vh) rotate(-15deg);
          opacity: 0;
        }
        10% {
          opacity: 1;
        }
        90% {
          opacity: 1;
        }
        100% {
          transform: translateX(100vw) translateY(-20vh) rotate(-15deg);
          opacity: 0;
        }
      }
    `}</style>
  );
}
