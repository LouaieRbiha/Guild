"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Crown, Shield } from "lucide-react";
import { YATTA_RELIQUARY, RARITY_COLORS } from "@/lib/constants";
import { RarityStars } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────

interface ArtifactPiece {
  slot: string;
  slotLabel: string;
  name: string;
  description: string;
  icon: string;
  story: string;
}

interface ArtifactDetailData {
  id: number;
  name: string;
  maxRarity: number;
  icon: string;
  bonuses: { label: string; description: string }[];
  pieces: ArtifactPiece[];
}

interface Props {
  detail: ArtifactDetailData;
}

// ── Rarity visual constants ────────────────────────────────────────────

const RARITY_GRADIENT: Record<number, string> = {
  5: "from-amber-900/60 via-amber-950/40 to-black/80",
  4: "from-purple-900/50 via-purple-950/40 to-black/80",
  3: "from-blue-900/40 via-blue-950/30 to-black/80",
};

const RARITY_HERO_BG: Record<number, string> = {
  5: "from-amber-950/80 via-amber-900/30 to-transparent",
  4: "from-purple-950/80 via-purple-900/30 to-transparent",
  3: "from-blue-950/80 via-blue-900/30 to-transparent",
};

const RARITY_GLOW: Record<number, string> = {
  5: "drop-shadow-[0_0_40px_rgba(245,158,11,0.3)]",
  4: "drop-shadow-[0_0_40px_rgba(168,85,247,0.25)]",
  3: "drop-shadow-[0_0_30px_rgba(59,130,246,0.2)]",
};

const SLOT_ICONS: Record<string, string> = {
  EQUIP_BRACER: "FL",
  EQUIP_NECKLACE: "PL",
  EQUIP_SHOES: "SA",
  EQUIP_RING: "GO",
  EQUIP_DRESS: "CI",
};

// ── Main component ─────────────────────────────────────────────────────

export function ArtifactDetailClient({ detail }: Props) {
  const [expandedPiece, setExpandedPiece] = useState<string | null>(null);
  const colors = RARITY_COLORS[detail.maxRarity] || RARITY_COLORS[4];
  const twoPcBonus = detail.bonuses.find((b) => b.label === "2-Piece" || b.label === "1-Piece");
  const fourPcBonus = detail.bonuses.find((b) => b.label === "4-Piece");

  function togglePiece(slot: string) {
    setExpandedPiece(expandedPiece === slot ? null : slot);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Back nav */}
      <Link
        href="/artifacts"
        className="inline-flex items-center gap-2 text-sm text-guild-muted hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Artifact Sets
      </Link>

      {/* Hero section */}
      <div className="relative rounded-xl overflow-hidden border border-guild-border/30">
        <div className={cn("absolute inset-0 bg-linear-to-r", RARITY_HERO_BG[detail.maxRarity] || RARITY_HERO_BG[4])} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.03),transparent_70%)]" />

        <div className="relative flex flex-col lg:flex-row items-center gap-6 p-6 lg:p-8">
          {/* Artifact icon */}
          <div className="relative shrink-0 w-48 h-48 lg:w-64 lg:h-64">
            <div className={cn(
              "absolute inset-0 rounded-full bg-linear-to-t",
              RARITY_GRADIENT[detail.maxRarity] || RARITY_GRADIENT[4],
            )} />
            <div className={cn("absolute inset-0 flex items-center justify-center", RARITY_GLOW[detail.maxRarity])}>
              <Image
                src={`${YATTA_RELIQUARY}/${detail.icon}.png`}
                alt={detail.name}
                width={256}
                height={256}
                quality={95}
                className="object-contain p-4"
                sizes="256px"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div>
              <Badge variant="outline" className={cn("mb-2 text-xs", colors.text, colors.border, colors.bg)}>
                Artifact Set
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">{detail.name}</h1>
              <div className="mt-1.5 flex items-center justify-center lg:justify-start">
                <RarityStars rarity={detail.maxRarity} size="md" />
              </div>
            </div>

            {/* Bonus preview in hero */}
            <div className="space-y-2 max-w-lg mx-auto lg:mx-0">
              {twoPcBonus && (
                <div className="flex items-start gap-2">
                  <Shield className={cn("h-4 w-4 mt-0.5 shrink-0", colors.text)} />
                  <p className="text-sm text-guild-muted leading-relaxed">
                    <span className={cn("font-semibold", colors.text)}>{twoPcBonus.label}: </span>
                    {twoPcBonus.description}
                  </p>
                </div>
              )}
              {fourPcBonus && (
                <div className="flex items-start gap-2">
                  <Crown className={cn("h-4 w-4 mt-0.5 shrink-0", colors.text)} />
                  <p className="text-sm text-guild-muted leading-relaxed">
                    <span className={cn("font-semibold", colors.text)}>{fourPcBonus.label}: </span>
                    {fourPcBonus.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Set bonuses section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {twoPcBonus && (
          <Card className={cn("bg-guild-elevated/50 backdrop-blur-sm border-guild-border/30 border-l-2", colors.border)}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className={cn("h-5 w-5", colors.text)} />
                <span className={cn("text-sm font-bold uppercase tracking-wide", colors.text)}>
                  {twoPcBonus.label} Bonus
                </span>
              </div>
              <p className="text-base text-guild-muted leading-relaxed">
                {twoPcBonus.description}
              </p>
            </CardContent>
          </Card>
        )}
        {fourPcBonus && (
          <Card className={cn("bg-guild-elevated/50 backdrop-blur-sm border-guild-border/30 border-l-2", colors.border)}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Crown className={cn("h-5 w-5", colors.text)} />
                <span className={cn("text-sm font-bold uppercase tracking-wide", colors.text)}>
                  {fourPcBonus.label} Bonus
                </span>
              </div>
              <p className="text-base text-guild-muted leading-relaxed">
                {fourPcBonus.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Artifact pieces grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <BookOpen className={cn("h-5 w-5", colors.text)} />
          Artifact Pieces
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {detail.pieces.map((piece) => (
            <ArtifactPieceCard
              key={piece.slot}
              piece={piece}
              rarity={detail.maxRarity}
              expanded={expandedPiece === piece.slot}
              onToggle={() => togglePiece(piece.slot)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Artifact Piece Card ────────────────────────────────────────────────

interface ArtifactPieceCardProps {
  piece: ArtifactPiece;
  rarity: number;
  expanded: boolean;
  onToggle: () => void;
}

function ArtifactPieceCard({ piece, rarity, expanded, onToggle }: ArtifactPieceCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const colors = RARITY_COLORS[rarity] || RARITY_COLORS[4];
  const gradient = RARITY_GRADIENT[rarity] || RARITY_GRADIENT[4];
  const abbr = SLOT_ICONS[piece.slot] || "??";

  return (
    <div className="flex flex-col">
      <button
        onClick={onToggle}
        className={cn(
          "group relative overflow-hidden rounded-xl border border-guild-border/30 bg-guild-card hover:border-guild-border transition-all text-left",
          expanded && "rounded-b-none border-b-0"
        )}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Piece image */}
          <div className={cn("relative shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-linear-to-t", gradient)}>
            {!imgErr ? (
              <Image
                src={`${YATTA_RELIQUARY}/${piece.icon}.png`}
                alt={piece.name}
                fill
                sizes="64px"
                className="object-contain p-1"
                onError={() => setImgErr(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-lg font-bold text-foreground/30">{abbr}</span>
              </div>
            )}
          </div>

          {/* Piece info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{piece.name}</p>
            <p className={cn("text-xs mt-0.5", colors.text)}>{piece.slotLabel}</p>
          </div>

          {/* Expand indicator */}
          <span className="text-white/30 group-hover:text-white/60 transition-colors shrink-0">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </div>
      </button>

      {/* Expanded lore/description */}
      {expanded && (
        <div className={cn(
          "border border-t-0 rounded-b-xl p-4 space-y-3 bg-guild-card/90 backdrop-blur-sm",
          colors.border.replace("/30", "/20")
        )}>
          {piece.description && (
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wide text-guild-muted">Description</span>
              <p className="text-sm text-gray-300 leading-relaxed">{piece.description}</p>
            </div>
          )}
          {piece.story && (
            <div className="space-y-1">
              <span className={cn("text-xs font-bold uppercase tracking-wide", colors.text)}>Story</span>
              <blockquote className={cn("border-l-2 pl-3 py-1", colors.border)}>
                <p className="text-sm text-gray-400 leading-relaxed italic whitespace-pre-line">{piece.story}</p>
              </blockquote>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
