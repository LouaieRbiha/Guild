"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PrimogemIcon,
  BuildIcon,
  VisionIcon,
  WeaponIcon,
  CompassIcon,
  FateIcon,
  KameraIcon,
  HourglassIcon,
  LeakIcon,
} from "@/components/icons/genshin-icons";

const navItems = [
  { href: "/", icon: PrimogemIcon, label: "Home" },
  { href: "/profile", icon: BuildIcon, label: "Builds" },
  { href: "/database", icon: VisionIcon, label: "Characters" },
  { href: "/weapons", icon: WeaponIcon, label: "Weapons" },
  { href: "/map", icon: CompassIcon, label: "Map" },
  { href: "/simulator", icon: FateIcon, label: "Simulator" },
  { href: "/streamers", icon: KameraIcon, label: "Live" },
  { href: "/timeline", icon: HourglassIcon, label: "Timeline" },
  { href: "/leaks", icon: LeakIcon, label: "Leaks" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-16 hover:w-48 transition-all duration-300 flex-col bg-guild-card/50 border-r border-white/5 group overflow-hidden">
      <div className="flex items-center h-16 px-4 border-b border-white/5">
        <PrimogemIcon className="text-guild-accent shrink-0" size={24} />
        <span className="ml-2 text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Guild
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => {
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
