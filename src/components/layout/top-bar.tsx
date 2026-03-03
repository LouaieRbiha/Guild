"use client";

import { Search, Settings } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function TopBar() {
  const [uid, setUid] = useState("");
  const router = useRouter();

  const handleLookup = () => {
    if (uid.trim().length >= 9) {
      router.push(`/profile/${uid.trim()}`);
    }
  };

  return (
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
        <button className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-white/5 text-guild-muted hover:text-foreground transition-colors cursor-pointer">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
