"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PrimogemIcon,
  BuildIcon,
  VisionIcon,
  WeaponIcon,
  CompassIcon,
  FateIcon,
  KameraIcon,
  LeakIcon,
  FlowerIcon,
} from "@/components/icons/genshin-icons";

interface NavItem {
  href: string;
  icon: React.FC<{ className?: string; size?: number }>;
  label: string;
  requiresSetting?: string;
}

const navItems: NavItem[] = [
  { href: "/", icon: PrimogemIcon, label: "Home" },
  { href: "/profile", icon: BuildIcon, label: "Builds" },
  { href: "/database", icon: VisionIcon, label: "Characters" },
  { href: "/weapons", icon: WeaponIcon, label: "Weapons" },
  { href: "/artifacts", icon: FlowerIcon, label: "Artifacts" },
  { href: "/calendar", icon: Calendar, label: "Calendar" },
  { href: "/abyss", icon: Shield, label: "Abyss" },
  { href: "/map", icon: CompassIcon, label: "Map" },
  { href: "/simulator", icon: FateIcon, label: "Simulator" },
  { href: "/streamers", icon: KameraIcon, label: "Live" },
  { href: "/leaks", icon: LeakIcon, label: "Leaks", requiresSetting: "showLeaks" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [showLeaks, setShowLeaks] = useState(false);

  useEffect(() => {
    // Load initial setting
    try {
      const stored = localStorage.getItem("guild-settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        setShowLeaks(parsed.showLeaks ?? false);
      }
    } catch {
      // ignore
    }

    // Listen for settings changes
    function handleSettingsChange(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.showLeaks === "boolean") {
        setShowLeaks(detail.showLeaks);
      }
    }
    window.addEventListener("guild-settings-change", handleSettingsChange);
    return () => window.removeEventListener("guild-settings-change", handleSettingsChange);
  }, []);

  const visibleItems = navItems.filter((item) => {
    if (item.requiresSetting === "showLeaks" && !showLeaks) return false;
    return true;
  });

  return (
    <aside className="hidden md:flex w-16 hover:w-48 transition-all duration-300 flex-col bg-guild-card/50 border-r border-white/5 group overflow-hidden">
      <div className="flex items-center h-16 px-4 border-b border-white/5">
        <PrimogemIcon className="text-guild-accent shrink-0" size={24} />
        <span className="ml-2 text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Guild
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center h-10 px-4 mx-2 rounded-md transition-colors",
                isActive
                  ? "bg-guild-accent/20 text-guild-accent"
                  : "text-guild-muted hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className="shrink-0" size={20} />
              <span className="ml-3 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="text-xs text-guild-dim opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Not affiliated with HoYoverse
        </div>
      </div>
    </aside>
  );
}
