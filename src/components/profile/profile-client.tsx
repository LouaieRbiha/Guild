"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Download, Share2 } from "lucide-react";
import type { EnkaProfile, Character as CharType } from "@/lib/enka/client";
import { ENKA_UI } from "@/lib/characters";
import {
  VerdictIcon,
  ResinIcon,
  ConstellationIcon,
  TrophyIcon,
  SLOT_ICONS,
  ELEMENT_ICONS,
} from "@/components/icons/genshin-icons";
import {
  scoreArtifact, scoreCharacterBuild, estimateResin,
  getTier, getTierLabel, getRoast,
  scoreColor, grade, barColor, pieceLabel, tierBadge,
  elColor, elBg,
} from "@/lib/scoring";

// Character image with fallback for unknown/new characters
function CharImg({ src, alt, size, className }: { src: string; alt: string; size: number; className?: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <div className={cn("flex items-center justify-center bg-guild-elevated text-guild-muted font-bold", className)} style={{ width: size, height: size }}>
        {alt[0]}
      </div>
    );
  }
  return (
    <Image src={src} alt={alt} width={size} height={size} className={cn("object-cover", className)} unoptimized onError={() => setErr(true)} />
  );
}

export function ProfileClient({ profile }: { profile: EnkaProfile }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selected = profile.characters[selectedIdx];

  // Score artifacts
  const artifactScores = selected.artifacts.map(scoreArtifact);
  const overallScore = scoreCharacterBuild(selected);
  const avgScore = artifactScores.length > 0
    ? artifactScores.reduce((a, b) => a + b, 0) / artifactScores.length
    : 0;
  const resin = estimateResin(avgScore);
  const tier = getTier(overallScore);
  // Deterministic seed: uid + character name → same roast on server and client
  const roast = getRoast(tier, `${profile.uid}-${selected.name}`);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Player Header */}
      <div className="guild-card p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profile.player.nickname}</h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-guild-muted">
            <span>AR {profile.player.level}</span>
            <span>WL {profile.player.worldLevel}</span>
            <span className="font-mono">UID: {profile.uid}</span>
            {profile.player.achievements && <span className="flex items-center gap-1"><TrophyIcon size={14} className="text-guild-gold" /> {profile.player.achievements}</span>}
            {profile.player.abyssFloor && <span>Abyss {profile.player.abyssFloor}-{profile.player.abyssChamber}</span>}
          </div>
          {profile.player.signature && (
            <p className="text-sm text-guild-muted mt-2 italic">&quot;{profile.player.signature}&quot;</p>
          )}
        </div>
        <div className="flex gap-2">
          <button className="h-9 px-4 rounded-md bg-guild-elevated hover:bg-white/10 text-sm flex items-center gap-2 transition-colors cursor-pointer">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <button className="h-9 px-4 rounded-md bg-guild-accent hover:bg-guild-accent/80 text-sm flex items-center gap-2 transition-colors cursor-pointer">
            <Download className="h-4 w-4" /> Card
          </button>
        </div>
      </div>

      {/* Character Selector */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {profile.characters.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setSelectedIdx(i)}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg border transition-all min-w-[80px] cursor-pointer",
              selectedIdx === i
                ? "bg-guild-accent/20 border-guild-accent/50 guild-glow"
                : "bg-guild-card border-white/5 hover:border-white/10"
            )}
          >
            <div className={cn(
              "w-12 h-12 rounded-full overflow-hidden",
              c.rarity === 5 ? "ring-2 ring-guild-gold/50" : "ring-2 ring-guild-accent-2/50"
            )}>
              <CharImg
                src={`${ENKA_UI}/${c.sideIcon}.png`}
                alt={c.name}
                size={48}
              />
            </div>
            <span className="text-xs mt-1.5 font-medium truncate w-full text-center">{c.name}</span>
            <span className="text-[10px] text-guild-muted flex items-center gap-0.5">
              <ConstellationIcon size={10} /> {c.constellation}
            </span>
          </button>
        ))}
      </div>

      {/* Character + Artifacts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={cn("guild-card p-5 space-y-4 bg-gradient-to-br to-transparent", elBg[selected.element] || elBg.Unknown)}>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
              <CharImg
                src={`${ENKA_UI}/${selected.icon}.png`}
                alt={selected.name}
                size={80}
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className={cn("text-2xl font-bold", elColor[selected.element] || elColor.Unknown)}>{selected.name}</h2>
                {(() => { const EI = ELEMENT_ICONS[selected.element]; return EI ? <EI size={22} /> : null; })()}
              </div>
              <p className="text-sm text-guild-muted flex items-center gap-1.5">
                Lv.{selected.level} · <ConstellationIcon size={12} className="text-guild-muted" />{selected.constellation} · {selected.talents.join("/")}
              </p>
              <div className="text-sm text-guild-gold mt-1">{"★".repeat(selected.rarity)}</div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-4">
            <h3 className="text-sm font-medium text-guild-muted mb-2">Weapon</h3>
            <div className="flex items-center gap-3">
              {selected.weapon.icon && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-guild-elevated">
                  <CharImg
                    src={`${ENKA_UI}/${selected.weapon.icon}.png`}
                    alt={selected.weapon.name}
                    size={48}
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-guild-gold">{selected.weapon.name}</p>
                <p className="text-sm text-guild-muted">R{selected.weapon.refinement} · Lv.{selected.weapon.level}</p>
              </div>
              <div className="w-8 h-8 rounded bg-guild-gold/10 flex items-center justify-center">
                <span className="text-guild-gold text-sm">{"★".repeat(selected.weapon.rarity).slice(0,3)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 guild-card p-5 space-y-4">
          <h3 className="text-sm font-medium text-guild-muted flex items-center gap-2">
            Artifacts
          </h3>
          {selected.artifacts.length > 0 ? (
            <div className="grid grid-cols-5 gap-2">
              {selected.artifacts.map((a, i) => {
                const s = artifactScores[i];
                return (
                  <div key={a.slot} className="bg-guild-elevated rounded-lg p-3 space-y-2 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-guild-muted flex items-center gap-1">
                        {(() => { const SI = SLOT_ICONS[a.slot]; return SI ? <SI size={14} className="text-guild-muted" /> : null; })()}
                        {a.slot}
                      </span>
                      <span className={cn("text-xs font-bold", scoreColor(s))}>{grade(s)}</span>
                    </div>
                    {a.icon && (
                      <div className="flex justify-center">
                        <CharImg src={`${ENKA_UI}/${a.icon}.png`} alt={a.slot} size={36} />
                      </div>
                    )}
                    <div className="text-xs font-medium text-guild-gold">{a.mainStat}</div>
                    <div className="space-y-0.5">
                      {a.substats.map((sub) => (
                        <div key={sub.name} className="text-[10px] text-guild-muted flex justify-between">
                          <span>{sub.name}</span>
                          <span className="font-mono">{sub.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", barColor(s))} style={{ width: `${s}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-guild-dim">No artifacts equipped</p>
          )}
        </div>
      </div>

      {/* THE ROAST 🔥 */}
      {selected.artifacts.length > 0 && (
        <div className="guild-card p-6 space-y-6 guild-glow">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <VerdictIcon className="text-orange-500" size={22} /> BUILD VERDICT
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold font-mono">{overallScore}</span>
              <span className="text-sm text-guild-muted">/10</span>
              <span className={cn("text-sm font-medium px-2 py-0.5 rounded", tierBadge[tier])}>
                {getTierLabel(overallScore)}
              </span>
            </div>
          </div>

          <div className="bg-guild-elevated rounded-lg p-4 border border-white/5">
            {roast.split("\n").map((line, i) => (
              <p key={i} className={cn("text-lg italic leading-relaxed", i > 0 && "mt-2 text-base text-guild-muted")}>
                {i === 0 ? `"${line}` : line}{i === roast.split("\n").length - 1 ? '"' : ""}
              </p>
            ))}
          </div>

          {/* Per-piece bars */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-guild-muted">Roll Quality</h4>
            {selected.artifacts.map((a, i) => {
              const s = artifactScores[i];
              const SI = SLOT_ICONS[a.slot];
              return (
                <div key={a.slot} className="flex items-center gap-3">
                  <span className="text-sm w-20 text-guild-muted flex items-center gap-1.5">
                    {SI && <SI size={14} />} {a.slot}
                  </span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", barColor(s))} style={{ width: `${s}%` }} />
                  </div>
                  <span className={cn("text-sm font-mono w-10 text-right", scoreColor(s))}>{s}%</span>
                  <span className="text-xs text-guild-muted w-16">{pieceLabel(s)}</span>
                </div>
              );
            })}
          </div>

          {/* Resin Estimate */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <h4 className="text-sm font-medium text-guild-muted flex items-center gap-2">
              <ResinIcon className="text-guild-muted" size={18} /> Resin Cost Estimate
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {([
                { label: "To match this build", data: resin.match, color: "text-yellow-400" },
                { label: "For a good build", data: resin.good, color: "text-green-400" },
                { label: "95th percentile", data: resin.god, color: "text-red-400" },
              ] as const).map((r) => (
                <div key={r.label} className="bg-guild-elevated rounded-lg p-3 text-center">
                  <div className="text-xs text-guild-muted mb-1">{r.label}</div>
                  <div className={cn("text-lg font-bold font-mono", r.color)}>{r.data.resin.toLocaleString()}</div>
                  <div className="text-xs text-guild-muted">≈{r.data.days} days {r.label.includes("95") ? "💀" : ""}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
