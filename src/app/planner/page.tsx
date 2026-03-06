"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Trash2, CalendarDays, Target, TrendingUp, BookOpen, Sword, Skull, Gem, Coins, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResinIcon } from "@/components/icons/genshin-icons";
import {
  TALENT_BOOK_SCHEDULE,
  WEAPON_MATERIAL_SCHEDULE,
} from "@/data/farming-schedule";

// ── Constants ─────────────────────────────────────────────────────────────

const DAILY_RESIN = 180;
const WEEKLY_RESIN = DAILY_RESIN * 7; // 1,260

const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type DayShort = (typeof DAYS_SHORT)[number];
type CategoryKey = "talent_books" | "weapon_materials" | "weekly_boss" | "world_boss" | "artifacts" | "mora_leylines" | "exp_leylines";

interface Category {
  key: CategoryKey;
  label: string;
  icon: React.ReactNode;
  resinPerRun: number;
  hasMaterials: boolean;
  anyDay: boolean;
}

const CATEGORIES: Category[] = [
  { key: "talent_books", label: "Talent Books", icon: <BookOpen className="h-4 w-4" />, resinPerRun: 20, hasMaterials: true, anyDay: false },
  { key: "weapon_materials", label: "Weapon Materials", icon: <Sword className="h-4 w-4" />, resinPerRun: 20, hasMaterials: true, anyDay: false },
  { key: "weekly_boss", label: "Weekly Boss", icon: <Skull className="h-4 w-4" />, resinPerRun: 30, hasMaterials: false, anyDay: true },
  { key: "world_boss", label: "World Boss", icon: <Target className="h-4 w-4" />, resinPerRun: 40, hasMaterials: false, anyDay: true },
  { key: "artifacts", label: "Artifacts", icon: <Gem className="h-4 w-4" />, resinPerRun: 20, hasMaterials: false, anyDay: true },
  { key: "mora_leylines", label: "Mora Leylines", icon: <Coins className="h-4 w-4" />, resinPerRun: 20, hasMaterials: false, anyDay: true },
  { key: "exp_leylines", label: "EXP Leylines", icon: <Sparkles className="h-4 w-4" />, resinPerRun: 20, hasMaterials: false, anyDay: true },
];

interface FarmingGoal {
  id: string;
  category: CategoryKey;
  material: string | null;
  runs: number;
  availableDays: DayShort[];
}

const STORAGE_KEY = "guild-resin-planner-goals";

// ── Helpers ───────────────────────────────────────────────────────────────

function fullDayToShort(day: string): DayShort {
  const map: Record<string, DayShort> = {
    Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
    Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun",
  };
  return map[day] ?? "Mon";
}

function getMaterialDays(material: string): DayShort[] {
  const allSchedules = { ...TALENT_BOOK_SCHEDULE, ...WEAPON_MATERIAL_SCHEDULE };
  const days = allSchedules[material];
  if (!days) return [...DAYS_SHORT];
  return [...days.map(fullDayToShort), "Sun" as DayShort];
}

function getResinPerRun(goal: FarmingGoal): number {
  const cat = CATEGORIES.find((c) => c.key === goal.category);
  if (!cat) return 20;
  // Weekly bosses: first 3 at 30, after that 60
  if (goal.category === "weekly_boss") return 30;
  return cat.resinPerRun;
}

function getTotalResinForGoal(goal: FarmingGoal): number {
  if (goal.category === "weekly_boss") {
    // First 3 discounted at 30, remainder at 60
    const discounted = Math.min(goal.runs, 3);
    const full = Math.max(goal.runs - 3, 0);
    return discounted * 30 + full * 60;
  }
  return goal.runs * getResinPerRun(goal);
}

function getCategoryLabel(key: CategoryKey): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

function getCategoryIcon(key: CategoryKey): React.ReactNode {
  return CATEGORIES.find((c) => c.key === key)?.icon ?? null;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ── Components ────────────────────────────────────────────────────────────

function BudgetBar({ used, total }: { used: number; total: number }) {
  const pct = Math.min((used / total) * 100, 100);
  const overBudget = used > total;
  const nearCap = !overBudget && used > total * 0.85;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-guild-muted">Weekly Resin Budget</span>
        <span className={cn(
          "font-mono font-semibold",
          overBudget ? "text-red-400" : nearCap ? "text-amber-400" : "text-emerald-400"
        )}>
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
      </div>
      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            overBudget ? "bg-red-500" : nearCap ? "bg-amber-500" : "bg-emerald-500"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {overBudget && (
        <p className="text-xs text-red-400">
          Over budget by {(used - total).toLocaleString()} resin ({Math.ceil((used - total) / DAILY_RESIN)} extra day{Math.ceil((used - total) / DAILY_RESIN) !== 1 ? "s" : ""} needed)
        </p>
      )}
    </div>
  );
}

function GoalCard({
  goal,
  onRemove,
  onUpdateRuns,
}: {
  goal: FarmingGoal;
  onRemove: () => void;
  onUpdateRuns: (runs: number) => void;
}) {
  const totalResin = getTotalResinForGoal(goal);
  const label = goal.material ?? getCategoryLabel(goal.category);

  return (
    <div className="guild-elevated rounded-xl p-4 border border-white/5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-guild-accent shrink-0">{getCategoryIcon(goal.category)}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{label}</p>
            <p className="text-xs text-guild-dim">{getCategoryLabel(goal.category)}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={onRemove} className="text-guild-dim hover:text-red-400 shrink-0">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-guild-muted shrink-0">Runs:</label>
          <Input
            type="number"
            min={1}
            max={999}
            value={goal.runs}
            onChange={(e) => onUpdateRuns(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 h-7 text-center text-sm"
          />
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <ResinIcon className="text-guild-accent" size={16} />
          <span className="text-sm font-mono font-semibold text-foreground">{totalResin}</span>
        </div>
      </div>

      {goal.category === "weekly_boss" && goal.runs > 3 && (
        <p className="text-[11px] text-amber-400/80">
          First 3 runs at 30 resin, remaining {goal.runs - 3} at 60 resin each
        </p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        {DAYS_SHORT.map((day) => {
          const available = goal.availableDays.includes(day);
          return (
            <span
              key={day}
              className={cn(
                "text-[10px] px-1.5 py-0.5 rounded font-medium",
                available
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                  : "bg-white/3 text-guild-dim border border-transparent"
              )}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function AddGoalForm({ onAdd }: { onAdd: (goal: FarmingGoal) => void }) {
  const [category, setCategory] = useState<CategoryKey>("talent_books");
  const [material, setMaterial] = useState<string>("");
  const [runs, setRuns] = useState(5);

  const selectedCat = CATEGORIES.find((c) => c.key === category)!;
  const materials = useMemo(() => {
    if (category === "talent_books") return Object.keys(TALENT_BOOK_SCHEDULE);
    if (category === "weapon_materials") return Object.keys(WEAPON_MATERIAL_SCHEDULE);
    return [];
  }, [category]);

  useEffect(() => {
    if (materials.length > 0 && !materials.includes(material)) {
      setMaterial(materials[0]);
    }
    if (materials.length === 0) {
      setMaterial("");
    }
  }, [category, materials, material]);

  const handleAdd = () => {
    const days = selectedCat.anyDay
      ? [...DAYS_SHORT]
      : material
        ? getMaterialDays(material)
        : [...DAYS_SHORT];

    onAdd({
      id: generateId(),
      category,
      material: selectedCat.hasMaterials ? material : null,
      runs: Math.max(1, runs),
      availableDays: days,
    });
  };

  return (
    <div className="guild-card rounded-xl p-6 border border-white/5 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Plus className="h-5 w-5 text-guild-accent" />
        Add Farming Goal
      </h2>

      {/* Category selector */}
      <div className="space-y-2">
        <label className="text-xs text-guild-muted font-medium">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5",
                category === cat.key
                  ? "bg-guild-accent/20 text-guild-accent border border-guild-accent/30"
                  : "bg-white/5 text-guild-dim hover:text-white hover:bg-white/10 border border-transparent"
              )}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Material selector for domains */}
      {selectedCat.hasMaterials && materials.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs text-guild-muted font-medium">Material</label>
          <div className="flex flex-wrap gap-1.5">
            {materials.map((mat) => {
              const days = getMaterialDays(mat);
              return (
                <button
                  key={mat}
                  onClick={() => setMaterial(mat)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    material === mat
                      ? "bg-guild-accent/20 text-guild-accent border border-guild-accent/30"
                      : "bg-white/5 text-guild-dim hover:text-white hover:bg-white/10 border border-transparent"
                  )}
                >
                  <span>{mat}</span>
                  <span className="ml-1 opacity-50">({days.filter(d => d !== "Sun").join("/")})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Runs and add button */}
      <div className="flex items-end gap-3">
        <div className="space-y-2">
          <label className="text-xs text-guild-muted font-medium">Runs Needed</label>
          <Input
            type="number"
            min={1}
            max={999}
            value={runs}
            onChange={(e) => setRuns(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24 h-9"
          />
        </div>
        <div className="flex items-center gap-2 pb-0.5">
          <div className="flex items-center gap-1.5 text-sm text-guild-muted">
            <ResinIcon className="text-guild-accent" size={16} />
            <span className="font-mono">
              {category === "weekly_boss"
                ? (() => {
                    const disc = Math.min(runs, 3);
                    const full = Math.max(runs - 3, 0);
                    return disc * 30 + full * 60;
                  })()
                : runs * selectedCat.resinPerRun
              } resin
            </span>
          </div>
          <Button onClick={handleAdd} size="sm" className="ml-2">
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </div>
      </div>
    </div>
  );
}

interface DayAllocation {
  day: DayShort;
  goals: { goal: FarmingGoal; runsThisDay: number; resinThisDay: number }[];
  totalResin: number;
}

function computeWeeklyPlan(goals: FarmingGoal[]): DayAllocation[] {
  // For each goal, distribute runs across its available days evenly
  const dayMap: Record<DayShort, DayAllocation> = {} as Record<DayShort, DayAllocation>;
  for (const day of DAYS_SHORT) {
    dayMap[day] = { day, goals: [], totalResin: 0 };
  }

  for (const goal of goals) {
    const availDays = goal.availableDays.filter((d) => DAYS_SHORT.includes(d));
    if (availDays.length === 0) continue;

    const runsPerDay = Math.floor(goal.runs / availDays.length);
    let remainder = goal.runs % availDays.length;

    for (const day of availDays) {
      const runsThisDay = runsPerDay + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      if (runsThisDay === 0) continue;

      let resinThisDay: number;
      if (goal.category === "weekly_boss") {
        // For weekly boss, each run is at the per-run cost; simplified distribution
        resinThisDay = runsThisDay * getResinPerRun(goal);
      } else {
        resinThisDay = runsThisDay * getResinPerRun(goal);
      }

      dayMap[day].goals.push({ goal, runsThisDay, resinThisDay });
      dayMap[day].totalResin += resinThisDay;
    }
  }

  return DAYS_SHORT.map((d) => dayMap[d]);
}

function WeeklyPlanView({ goals }: { goals: FarmingGoal[] }) {
  const plan = useMemo(() => computeWeeklyPlan(goals), [goals]);

  if (goals.length === 0) {
    return (
      <div className="guild-card rounded-xl p-6 border border-white/5 text-center">
        <CalendarDays className="h-10 w-10 text-guild-dim mx-auto mb-3" />
        <p className="text-sm text-guild-muted">Add farming goals to see your weekly plan</p>
      </div>
    );
  }

  return (
    <div className="guild-card rounded-xl p-6 border border-white/5 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-guild-accent" />
        Weekly Plan
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {plan.map((dayAlloc) => {
          const pct = (dayAlloc.totalResin / DAILY_RESIN) * 100;
          const overBudget = dayAlloc.totalResin > DAILY_RESIN;
          const nearCap = !overBudget && dayAlloc.totalResin > DAILY_RESIN * 0.85;

          return (
            <div
              key={dayAlloc.day}
              className={cn(
                "guild-elevated rounded-xl p-3 border space-y-2",
                overBudget
                  ? "border-red-500/30"
                  : nearCap
                    ? "border-amber-500/20"
                    : "border-white/5"
              )}
            >
              {/* Day header */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">{dayAlloc.day}</span>
                <span className={cn(
                  "text-xs font-mono",
                  overBudget ? "text-red-400" : nearCap ? "text-amber-400" : "text-emerald-400"
                )}>
                  {dayAlloc.totalResin}/{DAILY_RESIN}
                </span>
              </div>

              {/* Day resin bar */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    overBudget ? "bg-red-500" : nearCap ? "bg-amber-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>

              {/* Day goals */}
              <div className="space-y-1">
                {dayAlloc.goals.map((entry, i) => (
                  <div key={`${entry.goal.id}-${i}`} className="flex items-center justify-between text-[11px]">
                    <span className="text-guild-muted truncate mr-1">
                      {entry.goal.material ?? getCategoryLabel(entry.goal.category)}
                    </span>
                    <span className="text-guild-dim shrink-0 font-mono">
                      {entry.runsThisDay}x
                    </span>
                  </div>
                ))}
                {dayAlloc.goals.length === 0 && (
                  <p className="text-[11px] text-guild-dim italic">Rest day</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SummarySection({ goals }: { goals: FarmingGoal[] }) {
  const totalResinNeeded = goals.reduce((sum, g) => sum + getTotalResinForGoal(g), 0);
  const daysToComplete = Math.ceil(totalResinNeeded / DAILY_RESIN);
  const weeksToComplete = Math.ceil(daysToComplete / 7);
  const excess = WEEKLY_RESIN - totalResinNeeded;

  if (goals.length === 0) return null;

  const stats = [
    {
      label: "Total Resin Needed",
      value: totalResinNeeded.toLocaleString(),
      sub: `${goals.length} goal${goals.length !== 1 ? "s" : ""}`,
      color: "text-foreground",
    },
    {
      label: "Weekly Available",
      value: WEEKLY_RESIN.toLocaleString(),
      sub: `${DAILY_RESIN}/day`,
      color: "text-guild-muted",
    },
    {
      label: excess >= 0 ? "Surplus Resin" : "Deficit Resin",
      value: Math.abs(excess).toLocaleString(),
      sub: excess >= 0 ? "under budget" : "over budget",
      color: excess >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Time to Complete",
      value: `${daysToComplete} day${daysToComplete !== 1 ? "s" : ""}`,
      sub: weeksToComplete <= 1 ? "within this week" : `~${weeksToComplete} week${weeksToComplete !== 1 ? "s" : ""}`,
      color: daysToComplete <= 7 ? "text-emerald-400" : daysToComplete <= 14 ? "text-amber-400" : "text-red-400",
    },
  ];

  return (
    <div className="guild-card rounded-xl p-6 border border-white/5 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-guild-accent" />
        Summary
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="guild-elevated rounded-xl p-4 border border-white/5 space-y-1">
            <p className="text-xs text-guild-muted">{stat.label}</p>
            <p className={cn("text-xl font-bold font-mono", stat.color)}>{stat.value}</p>
            <p className="text-[11px] text-guild-dim">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Per-goal breakdown */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-guild-muted">Resin Breakdown</h3>
        <div className="space-y-1.5">
          {goals.map((goal) => {
            const resin = getTotalResinForGoal(goal);
            const pct = totalResinNeeded > 0 ? (resin / totalResinNeeded) * 100 : 0;
            return (
              <div key={goal.id} className="flex items-center gap-3">
                <span className="text-xs text-guild-muted w-36 truncate shrink-0">
                  {goal.material ?? getCategoryLabel(goal.category)}
                </span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-guild-accent/50 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-guild-dim w-16 text-right shrink-0">
                  {resin} resin
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function PlannerPage() {
  const [goals, setGoals] = useState<FarmingGoal[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setGoals(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
    setLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch {
      // ignore storage errors
    }
  }, [goals, loaded]);

  const addGoal = useCallback((goal: FarmingGoal) => {
    setGoals((prev) => [...prev, goal]);
  }, []);

  const removeGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const updateGoalRuns = useCallback((id: string, runs: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, runs } : g))
    );
  }, []);

  const clearAllGoals = useCallback(() => {
    setGoals([]);
  }, []);

  const totalResinUsed = goals.reduce((sum, g) => sum + getTotalResinForGoal(g), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <ResinIcon className="text-guild-accent" size={32} />
          <div>
            <h1 className="text-3xl font-bold">Resin Planner</h1>
            <p className="text-sm text-guild-muted">Plan your weekly resin spending for maximum efficiency</p>
          </div>
        </div>
      </div>

      {/* Weekly Budget */}
      <div className="guild-card rounded-xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-guild-accent/15 shrink-0">
              <ResinIcon className="text-guild-accent" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Weekly Budget</h2>
              <p className="text-xs text-guild-dim">{DAILY_RESIN} resin/day &middot; Regenerates 1 per 8 minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-guild-accent bg-guild-accent/10 border-guild-accent/20 font-mono">
              {WEEKLY_RESIN.toLocaleString()} weekly
            </Badge>
            {goals.length > 0 && (
              <Button variant="ghost" size="xs" onClick={clearAllGoals} className="text-guild-dim hover:text-red-400">
                <Trash2 className="h-3 w-3" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        <BudgetBar used={totalResinUsed} total={WEEKLY_RESIN} />

        {/* Quick reference */}
        <div className="flex flex-wrap gap-3 text-[11px] text-guild-dim">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Domain: 20 resin
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Weekly Boss: 30 (first 3) / 60 resin
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            World Boss: 40 resin
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
            Condensed: 40 (double reward)
          </span>
        </div>
      </div>

      {/* Add Goal Form */}
      <AddGoalForm onAdd={addGoal} />

      {/* Current Goals */}
      {goals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-guild-accent" />
            Farming Goals
            <Badge variant="outline" className="text-xs text-guild-muted font-mono ml-1">
              {goals.length}
            </Badge>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onRemove={() => removeGoal(goal.id)}
                onUpdateRuns={(runs) => updateGoalRuns(goal.id, runs)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Weekly Plan View */}
      <WeeklyPlanView goals={goals} />

      {/* Summary */}
      <SummarySection goals={goals} />
    </div>
  );
}
