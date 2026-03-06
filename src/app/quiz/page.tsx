"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Brain, Eye, Flame, RotateCcw, Trophy, Zap, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ALL_CHARACTERS, charIconUrl } from "@/lib/characters";
import type { CharacterEntry } from "@/types";
import { ELEMENT_COLORS } from "@/lib/constants";
import { CHARACTER_BUILDS } from "@/data/character-builds";

// ── Types ──────────────────────────────────────────────────────────────

type QuizMode = "silhouette" | "element" | "build";
type GamePhase = "menu" | "playing" | "answered" | "results";

interface QuizQuestion {
  character: CharacterEntry;
  options: string[];
  correctAnswer: string;
  questionText: string;
}

interface GameState {
  mode: QuizMode;
  phase: GamePhase;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  selectedAnswer: string | null;
  bestStreak: number;
  currentStreak: number;
}

interface HighScores {
  silhouette: number;
  element: number;
  build: number;
}

// ── Constants ──────────────────────────────────────────────────────────

const QUESTIONS_PER_ROUND = 10;

const ALL_ELEMENTS = ["Pyro", "Hydro", "Anemo", "Cryo", "Electro", "Geo", "Dendro"] as const;

const ELEMENT_BUTTON_COLORS: Record<string, { bg: string; hover: string; ring: string }> = {
  Pyro:    { bg: "bg-red-500/20",    hover: "hover:bg-red-500/30",    ring: "ring-red-500/50" },
  Hydro:   { bg: "bg-blue-500/20",   hover: "hover:bg-blue-500/30",   ring: "ring-blue-500/50" },
  Anemo:   { bg: "bg-teal-500/20",   hover: "hover:bg-teal-500/30",   ring: "ring-teal-500/50" },
  Cryo:    { bg: "bg-cyan-500/20",   hover: "hover:bg-cyan-500/30",   ring: "ring-cyan-500/50" },
  Electro: { bg: "bg-purple-500/20", hover: "hover:bg-purple-500/30", ring: "ring-purple-500/50" },
  Geo:     { bg: "bg-yellow-500/20", hover: "hover:bg-yellow-500/30", ring: "ring-yellow-500/50" },
  Dendro:  { bg: "bg-green-500/20",  hover: "hover:bg-green-500/30",  ring: "ring-green-500/50" },
};

const ELEMENT_TEXT_COLORS: Record<string, string> = {
  Pyro: "text-red-400",
  Hydro: "text-blue-400",
  Anemo: "text-teal-300",
  Cryo: "text-cyan-300",
  Electro: "text-purple-400",
  Geo: "text-yellow-400",
  Dendro: "text-green-400",
};

const MODE_INFO: Record<QuizMode, { label: string; icon: React.ReactNode; description: string }> = {
  silhouette: { label: "Who Am I?", icon: <Eye className="size-5" />, description: "Identify characters from silhouettes" },
  element: { label: "Guess the Element", icon: <Flame className="size-5" />, description: "Match characters to their element" },
  build: { label: "Build Quiz", icon: <Brain className="size-5" />, description: "Test your build knowledge" },
};

// ── Utility functions ──────────────────────────────────────────────────

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getLetterGrade(score: number, total: number): { grade: string; color: string } {
  const pct = score / total;
  if (pct >= 0.9) return { grade: "S", color: "text-amber-400" };
  if (pct >= 0.8) return { grade: "A", color: "text-green-400" };
  if (pct >= 0.6) return { grade: "B", color: "text-blue-400" };
  if (pct >= 0.4) return { grade: "C", color: "text-yellow-400" };
  return { grade: "D", color: "text-red-400" };
}

// ── Question Generators ────────────────────────────────────────────────

function generateSilhouetteQuestions(seed: number): QuizQuestion[] {
  const shuffled = seededShuffle(ALL_CHARACTERS, seed);
  const selected = shuffled.slice(0, QUESTIONS_PER_ROUND);

  return selected.map((char, idx) => {
    const wrongPool = ALL_CHARACTERS.filter((c) => c.id !== char.id);
    const wrongOptions = seededShuffle(wrongPool, seed + idx * 997).slice(0, 3);
    const options = seededShuffle(
      [char.name, ...wrongOptions.map((w) => w.name)],
      seed + idx * 443
    );

    return {
      character: char,
      options,
      correctAnswer: char.name,
      questionText: "Who is this character?",
    };
  });
}

function generateElementQuestions(seed: number): QuizQuestion[] {
  const shuffled = seededShuffle(
    ALL_CHARACTERS.filter((c) => c.element !== "Unknown"),
    seed
  );
  const selected = shuffled.slice(0, QUESTIONS_PER_ROUND);

  return selected.map((char) => ({
    character: char,
    options: [...ALL_ELEMENTS],
    correctAnswer: char.element,
    questionText: `What element is ${char.name}?`,
  }));
}

function generateBuildQuestions(seed: number): QuizQuestion[] {
  const buildChars = Object.entries(CHARACTER_BUILDS);
  const shuffledBuilds = seededShuffle(buildChars, seed);
  const questions: QuizQuestion[] = [];

  const allArtifactSets = [...new Set(buildChars.flatMap(([, b]) => b.artifactSets))];
  const allMainStats = [
    ...new Set(
      buildChars.flatMap(([, b]) => [b.mainStats.sands, b.mainStats.goblet, b.mainStats.circlet])
    ),
  ];

  const slots: ("sands" | "goblet" | "circlet")[] = ["sands", "goblet", "circlet"];
  const slotLabels: Record<string, string> = { sands: "Sands", goblet: "Goblet", circlet: "Circlet" };

  let questionSeed = seed;
  for (const [charName, build] of shuffledBuilds) {
    if (questions.length >= QUESTIONS_PER_ROUND) break;

    const charEntry = ALL_CHARACTERS.find((c) => c.name === charName);
    if (!charEntry) continue;

    questionSeed = (questionSeed * 1664525 + 1013904223) & 0x7fffffff;
    const isArtifactQ = questionSeed % 3 === 0;

    if (isArtifactQ) {
      const correct = build.artifactSets[0];
      const wrongPool = allArtifactSets.filter((s) => !build.artifactSets.includes(s));
      const wrongs = seededShuffle(wrongPool, questionSeed).slice(0, 3);
      const options = seededShuffle([correct, ...wrongs], questionSeed + 17);

      questions.push({
        character: charEntry,
        options,
        correctAnswer: correct,
        questionText: `Which artifact set is best for ${charName}?`,
      });
    } else {
      const slot = slots[questionSeed % slots.length];
      const correct = build.mainStats[slot];
      const wrongPool = allMainStats.filter((s) => s !== correct);
      const wrongs = seededShuffle(wrongPool, questionSeed).slice(0, 3);
      const options = seededShuffle([correct, ...wrongs], questionSeed + 31);

      questions.push({
        character: charEntry,
        options,
        correctAnswer: correct,
        questionText: `What main stat for ${charName}'s ${slotLabels[slot]}?`,
      });
    }
  }

  return questions;
}

// ── localStorage helpers ───────────────────────────────────────────────

function loadHighScores(): HighScores {
  if (typeof window === "undefined") return { silhouette: 0, element: 0, build: 0 };
  try {
    const raw = localStorage.getItem("guild-quiz-highscores");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { silhouette: 0, element: 0, build: 0 };
}

function saveHighScore(mode: QuizMode, score: number) {
  if (typeof window === "undefined") return;
  try {
    const current = loadHighScores();
    if (score > current[mode]) {
      current[mode] = score;
      localStorage.setItem("guild-quiz-highscores", JSON.stringify(current));
    }
  } catch {}
}

// ── Components ─────────────────────────────────────────────────────────

function ProgressBar({ current, total, score }: { current: number; total: number; score: number }) {
  const pct = ((current + 1) / total) * 100;
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full bg-guild-accent transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-1.5 text-sm font-medium shrink-0">
        <Trophy className="size-4 text-guild-accent" />
        <span className="text-foreground">{score}</span>
        <span className="text-guild-muted">/ {total}</span>
      </div>
    </div>
  );
}

function CharacterSilhouette({
  character,
  revealed,
}: {
  character: CharacterEntry;
  revealed: boolean;
}) {
  return (
    <div className="relative w-32 h-32 mx-auto">
      <div
        className={cn(
          "w-32 h-32 rounded-2xl overflow-hidden border-2 transition-all duration-500",
          revealed
            ? "border-guild-accent/50 shadow-[0_0_30px_rgba(99,102,241,0.3)]"
            : "border-white/10"
        )}
      >
        <Image
          src={charIconUrl(character.id)}
          alt={revealed ? character.name : "Mystery character"}
          width={128}
          height={128}
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            !revealed && "brightness-0 blur-[2px] opacity-80"
          )}
        />
      </div>
      {revealed && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs px-2",
              ELEMENT_COLORS[character.element]?.text,
              ELEMENT_COLORS[character.element]?.bg,
              ELEMENT_COLORS[character.element]?.border
            )}
          >
            {character.element}
          </Badge>
        </div>
      )}
    </div>
  );
}

function CharacterDisplay({ character }: { character: CharacterEntry }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10">
        <Image
          src={charIconUrl(character.id)}
          alt={character.name}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-lg font-semibold text-foreground">{character.name}</span>
    </div>
  );
}

function AnswerButton({
  label,
  isCorrect,
  isSelected,
  isRevealed,
  disabled,
  onClick,
  elementHighlight,
}: {
  label: string;
  isCorrect: boolean;
  isSelected: boolean;
  isRevealed: boolean;
  disabled: boolean;
  onClick: () => void;
  elementHighlight?: string;
}) {
  const elementColor = elementHighlight ? ELEMENT_TEXT_COLORS[label] : undefined;
  const elementBg = elementHighlight ? ELEMENT_BUTTON_COLORS[label] : undefined;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative py-4 px-4 rounded-xl text-sm font-medium transition-all duration-300",
        "border select-none cursor-pointer",
        "hover:scale-[1.02] active:scale-[0.98]",
        // Default state
        !isRevealed && !disabled && [
          "bg-guild-elevated/60 border-white/10 text-foreground",
          "hover:bg-guild-elevated hover:border-white/20",
          elementBg && [elementBg.bg, elementBg.hover, elementColor],
        ],
        // Correct answer revealed
        isRevealed && isCorrect && [
          "bg-emerald-500/20 border-emerald-500/50 text-emerald-300",
          "scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.2)]",
        ],
        // Wrong answer selected
        isRevealed && isSelected && !isCorrect && [
          "bg-red-500/20 border-red-500/50 text-red-300",
          "scale-[0.98]",
        ],
        // Other options when revealed
        isRevealed && !isCorrect && !isSelected && [
          "bg-white/3 border-white/5 text-guild-dim",
          "opacity-50",
        ],
        // Disabled
        disabled && "cursor-not-allowed",
      )}
    >
      {label}
      {isRevealed && isCorrect && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
          <Zap className="size-4" />
        </span>
      )}
    </button>
  );
}

function ResultsScreen({
  score,
  total,
  mode,
  highScore,
  bestStreak,
  onPlayAgain,
  onChangeMode,
}: {
  score: number;
  total: number;
  mode: QuizMode;
  highScore: number;
  bestStreak: number;
  onPlayAgain: () => void;
  onChangeMode: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const { grade, color } = getLetterGrade(score, total);
  const isNewHigh = score >= highScore && score > 0;
  const isPerfect = score === total;

  return (
    <div
      className={cn(
        "guild-card p-8 text-center space-y-6 max-w-md mx-auto",
        (isPerfect || grade === "S") && "guild-glow border-guild-accent/30"
      )}
    >
      {/* Grade */}
      <div className="space-y-2">
        <div
          className={cn(
            "text-7xl font-black tracking-tight transition-all duration-700",
            color
          )}
        >
          {grade}
        </div>
        {isPerfect && (
          <div className="flex items-center justify-center gap-1 text-amber-400 text-sm font-medium">
            <Star className="size-4 fill-amber-400" />
            Perfect Score!
            <Star className="size-4 fill-amber-400" />
          </div>
        )}
      </div>

      {/* Score */}
      <div className="space-y-1">
        <div className="text-3xl font-bold text-foreground">
          {score} <span className="text-guild-muted text-xl">/ {total}</span>
        </div>
        <div className="text-guild-dim text-sm">{MODE_INFO[mode].label}</div>
      </div>

      {/* Stats row */}
      <div className="flex justify-center gap-8 py-4 border-y border-white/5">
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{pct}%</div>
          <div className="text-xs text-guild-muted">Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">{bestStreak}</div>
          <div className="text-xs text-guild-muted">Best Streak</div>
        </div>
        <div className="text-center">
          <div className={cn("text-lg font-semibold", isNewHigh ? "text-amber-400" : "text-foreground")}>
            {highScore}
          </div>
          <div className="text-xs text-guild-muted">
            {isNewHigh ? "New Best!" : "High Score"}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={onPlayAgain}
          className="bg-guild-accent hover:bg-guild-accent/80 text-white gap-2 px-6 cursor-pointer"
        >
          <RotateCcw className="size-4" />
          Play Again
        </Button>
        <Button
          onClick={onChangeMode}
          variant="outline"
          className="gap-2 cursor-pointer"
        >
          Change Mode
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function QuizPage() {
  const [game, setGame] = useState<GameState>({
    mode: "silhouette",
    phase: "menu",
    questions: [],
    currentIndex: 0,
    score: 0,
    selectedAnswer: null,
    bestStreak: 0,
    currentStreak: 0,
  });

  const [highScores, setHighScores] = useState<HighScores>({
    silhouette: 0,
    element: 0,
    build: 0,
  });

  // Load high scores on mount
  useEffect(() => {
    setHighScores(loadHighScores());
  }, []);

  const currentQuestion = game.questions[game.currentIndex] ?? null;

  const startGame = useCallback((mode: QuizMode) => {
    const seed = Date.now();
    let questions: QuizQuestion[];

    switch (mode) {
      case "silhouette":
        questions = generateSilhouetteQuestions(seed);
        break;
      case "element":
        questions = generateElementQuestions(seed);
        break;
      case "build":
        questions = generateBuildQuestions(seed);
        break;
    }

    setGame({
      mode,
      phase: "playing",
      questions,
      currentIndex: 0,
      score: 0,
      selectedAnswer: null,
      bestStreak: 0,
      currentStreak: 0,
    });
  }, []);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (game.phase !== "playing" || !currentQuestion) return;

      const isCorrect = answer === currentQuestion.correctAnswer;
      const newStreak = isCorrect ? game.currentStreak + 1 : 0;

      setGame((prev) => ({
        ...prev,
        phase: "answered",
        selectedAnswer: answer,
        score: isCorrect ? prev.score + 1 : prev.score,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      }));

      // Auto-advance after delay
      setTimeout(() => {
        setGame((prev) => {
          const nextIndex = prev.currentIndex + 1;
          if (nextIndex >= QUESTIONS_PER_ROUND) {
            // Game over
            const finalScore = isCorrect ? prev.score : prev.score;
            saveHighScore(prev.mode, finalScore);
            setHighScores(loadHighScores());
            return { ...prev, phase: "results" };
          }
          return {
            ...prev,
            phase: "playing",
            currentIndex: nextIndex,
            selectedAnswer: null,
          };
        });
      }, 1200);
    },
    [game.phase, game.currentStreak, currentQuestion]
  );

  const goToMenu = useCallback(() => {
    setGame((prev) => ({ ...prev, phase: "menu" }));
  }, []);

  // ── Menu screen ────────────────────────────────────────────────

  if (game.phase === "menu") {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8 pt-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Genshin Quiz
            </h1>
            <p className="text-guild-muted">
              Test your Teyvat knowledge across three game modes
            </p>
          </div>

          {/* Mode cards */}
          <div className="grid gap-4">
            {(Object.keys(MODE_INFO) as QuizMode[]).map((mode) => {
              const info = MODE_INFO[mode];
              const hs = highScores[mode];
              return (
                <button
                  key={mode}
                  onClick={() => startGame(mode)}
                  className={cn(
                    "guild-card p-6 text-left transition-all duration-200 cursor-pointer",
                    "hover:scale-[1.01] hover:border-guild-accent/30",
                    "active:scale-[0.99]",
                    "group"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-guild-accent/15 flex items-center justify-center text-guild-accent shrink-0 group-hover:bg-guild-accent/25 transition-colors">
                      {info.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-foreground">
                          {info.label}
                        </h2>
                        {hs > 0 && (
                          <Badge variant="outline" className="text-xs text-guild-accent bg-guild-accent/10 border-guild-accent/20">
                            Best: {hs}/{QUESTIONS_PER_ROUND}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-guild-muted mt-0.5">
                        {info.description}
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-guild-dim group-hover:text-guild-accent transition-colors shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Overall stats */}
          {(highScores.silhouette > 0 || highScores.element > 0 || highScores.build > 0) && (
            <div className="guild-card p-4">
              <div className="flex items-center gap-2 text-sm text-guild-muted mb-3">
                <Trophy className="size-4 text-guild-accent" />
                <span>Your Best Scores</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(MODE_INFO) as QuizMode[]).map((mode) => {
                  const hs = highScores[mode];
                  const { grade, color } = getLetterGrade(hs, QUESTIONS_PER_ROUND);
                  return (
                    <div key={mode} className="text-center p-2 rounded-lg bg-white/3">
                      <div className={cn("text-xl font-bold", hs > 0 ? color : "text-guild-dim")}>
                        {hs > 0 ? grade : "-"}
                      </div>
                      <div className="text-xs text-guild-dim mt-1">
                        {MODE_INFO[mode].label}
                      </div>
                      {hs > 0 && (
                        <div className="text-xs text-guild-muted mt-0.5">
                          {hs}/{QUESTIONS_PER_ROUND}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Results screen ─────────────────────────────────────────────

  if (game.phase === "results") {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-2xl mx-auto pt-12">
          <ResultsScreen
            score={game.score}
            total={QUESTIONS_PER_ROUND}
            mode={game.mode}
            highScore={highScores[game.mode]}
            bestStreak={game.bestStreak}
            onPlayAgain={() => startGame(game.mode)}
            onChangeMode={goToMenu}
          />
        </div>
      </div>
    );
  }

  // ── Playing / Answered screen ──────────────────────────────────

  if (!currentQuestion) return null;

  const isRevealed = game.phase === "answered";
  const isElementMode = game.mode === "element";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6 pt-4">
        {/* Header bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToMenu}
            className="text-sm text-guild-muted hover:text-foreground transition-colors cursor-pointer"
          >
            &larr; Back
          </button>
          <Badge variant="outline" className="text-guild-accent bg-guild-accent/10 border-guild-accent/20 gap-1">
            {MODE_INFO[game.mode].icon}
            {MODE_INFO[game.mode].label}
          </Badge>
          <div className="text-sm font-medium text-guild-muted">
            {game.currentIndex + 1} / {QUESTIONS_PER_ROUND}
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar
          current={game.currentIndex}
          total={QUESTIONS_PER_ROUND}
          score={game.score}
        />

        {/* Quiz card */}
        <div className="guild-card p-6 md:p-8 space-y-6">
          {/* Question text */}
          <h2 className="text-lg font-semibold text-center text-foreground">
            {currentQuestion.questionText}
          </h2>

          {/* Character display */}
          <div className="flex justify-center py-2">
            {game.mode === "silhouette" ? (
              <CharacterSilhouette
                character={currentQuestion.character}
                revealed={isRevealed}
              />
            ) : (
              <CharacterDisplay character={currentQuestion.character} />
            )}
          </div>

          {/* Answer streak */}
          {game.currentStreak >= 2 && (
            <div className="text-center">
              <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-medium bg-amber-500/10 px-2 py-1 rounded-full">
                <Zap className="size-3" />
                {game.currentStreak} streak!
              </span>
            </div>
          )}

          {/* Answer buttons */}
          {isElementMode ? (
            // Element mode: 7 element buttons in a flex wrap
            <div className="flex flex-wrap justify-center gap-3">
              {currentQuestion.options.map((option) => (
                <AnswerButton
                  key={option}
                  label={option}
                  isCorrect={option === currentQuestion.correctAnswer}
                  isSelected={game.selectedAnswer === option}
                  isRevealed={isRevealed}
                  disabled={isRevealed}
                  onClick={() => handleAnswer(option)}
                  elementHighlight={option}
                />
              ))}
            </div>
          ) : (
            // Silhouette / Build mode: 2x2 grid
            <div className="grid grid-cols-2 gap-3">
              {currentQuestion.options.map((option) => (
                <AnswerButton
                  key={option}
                  label={option}
                  isCorrect={option === currentQuestion.correctAnswer}
                  isSelected={game.selectedAnswer === option}
                  isRevealed={isRevealed}
                  disabled={isRevealed}
                  onClick={() => handleAnswer(option)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Current streak display at bottom */}
        {game.bestStreak >= 3 && (
          <div className="text-center text-xs text-guild-dim">
            Best streak this round: {game.bestStreak}
          </div>
        )}
      </div>
    </div>
  );
}
