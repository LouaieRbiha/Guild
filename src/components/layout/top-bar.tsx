"use client";

import { Search, Settings, X, Eye, EyeOff, Moon, Monitor } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// ── Settings Storage ─────────────────────────────────────────────────

interface AppSettings {
  showLeaks: boolean;
  compactCards: boolean;
  showSpoilerWarning: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  showLeaks: false,
  compactCards: false,
  showSpoilerWarning: true,
};

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem("guild-settings");
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem("guild-settings", JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

// Export for other components to read settings
export function useSettings(): AppSettings {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  useEffect(() => {
    setSettings(loadSettings());
  }, []);
  return settings;
}

// ── Top Bar ──────────────────────────────────────────────────────────

export function TopBar() {
  const [uid, setUid] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      saveSettings(next);
      // Dispatch custom event so other components can react
      window.dispatchEvent(new CustomEvent("guild-settings-change", { detail: next }));
      return next;
    });
  }, []);

  const handleLookup = () => {
    if (uid.trim().length >= 9) {
      router.push(`/profile/${uid.trim()}`);
    }
  };

  // Close panel on outside click
  useEffect(() => {
    if (!showSettings) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSettings]);

  // Close on Escape
  useEffect(() => {
    if (!showSettings) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowSettings(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showSettings]);

  return (
    <>
      <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-guild-card/30 backdrop-blur-sm">
        <div className="flex items-center gap-4 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-guild-muted" />
            <input
              type="text"
              placeholder="Search characters, weapons, artifacts..."
              className="w-full h-9 pl-9 pr-4 rounded-md bg-guild-elevated border border-white/5 text-sm text-foreground placeholder:text-guild-muted focus:outline-none focus:ring-1 focus:ring-guild-accent"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter UID"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              className="h-9 w-36 px-3 rounded-md bg-guild-elevated border border-white/5 text-sm text-foreground placeholder:text-guild-muted focus:outline-none focus:ring-1 focus:ring-guild-accent font-mono"
            />
            <button
              onClick={handleLookup}
              className="h-9 px-4 rounded-md bg-guild-accent hover:bg-guild-accent/80 text-sm font-medium transition-colors cursor-pointer"
            >
              Lookup
            </button>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "h-9 w-9 flex items-center justify-center rounded-md transition-colors cursor-pointer",
              showSettings
                ? "bg-guild-accent/20 text-guild-accent"
                : "hover:bg-white/5 text-guild-muted hover:text-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Settings Panel Overlay */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div
            ref={panelRef}
            className="absolute right-0 top-0 h-full w-80 bg-guild-card border-l border-white/10 shadow-2xl shadow-black/50 overflow-y-auto animate-in slide-in-from-right duration-200"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-guild-accent" />
                <h2 className="text-lg font-semibold">Settings</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-white/5 text-guild-muted hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              {/* Content & Display */}
              <SettingsSection title="Content & Display">
                <SettingsToggle
                  label="Show Leaks"
                  description="Display leaks page in sidebar navigation"
                  icon={settings.showLeaks ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  checked={settings.showLeaks}
                  onChange={(v) => updateSetting("showLeaks", v)}
                />
                <SettingsToggle
                  label="Compact Cards"
                  description="Use smaller cards in grid views"
                  icon={<Monitor className="h-4 w-4" />}
                  checked={settings.compactCards}
                  onChange={(v) => updateSetting("compactCards", v)}
                />
                <SettingsToggle
                  label="Spoiler Warnings"
                  description="Show warning before viewing leak content"
                  icon={<Moon className="h-4 w-4" />}
                  checked={settings.showSpoilerWarning}
                  onChange={(v) => updateSetting("showSpoilerWarning", v)}
                />
              </SettingsSection>

              {/* About */}
              <SettingsSection title="About">
                <div className="space-y-2 text-sm text-guild-muted">
                  <p>Guild is a fan-made Genshin Impact companion app.</p>
                  <p className="text-xs text-guild-dim">
                    Game data from gi.yatta.moe. Not affiliated with HoYoverse.
                  </p>
                  <p className="text-xs text-guild-dim">
                    Version 1.0 &middot; Built with Next.js
                  </p>
                </div>
              </SettingsSection>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Settings Components ──────────────────────────────────────────────

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-guild-muted uppercase tracking-wider">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function SettingsToggle({
  label,
  description,
  icon,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
    >
      <div className={cn("mt-0.5", checked ? "text-guild-accent" : "text-guild-muted")}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-guild-muted mt-0.5">{description}</p>
      </div>
      {/* Toggle switch */}
      <div
        className={cn(
          "relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5",
          checked ? "bg-guild-accent" : "bg-white/10"
        )}
      >
        <div
          className={cn(
            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform",
            checked && "translate-x-5"
          )}
        />
      </div>
    </button>
  );
}
