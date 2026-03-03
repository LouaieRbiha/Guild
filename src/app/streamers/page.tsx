"use client";

const streamers = [
  { name: "TenTen", platform: "twitch", viewers: 12400, title: "AR60 Abyss Speedrun | New Team Comps" },
  { name: "Zy0x", platform: "youtube", viewers: 8100, title: "5.4 New Characters Review & Builds" },
  { name: "Sekapoko", platform: "twitch", viewers: 5300, title: "Pulling for C6 — Whale Stream" },
  { name: "Zajef77", platform: "twitch", viewers: 3900, title: "TC Discussion + Viewer Builds" },
  { name: "IWinToLose", platform: "youtube", viewers: 3200, title: "F2P vs Whale Damage Comparison" },
  { name: "Braxophone", platform: "twitch", viewers: 2800, title: "Chill Exploration Stream" },
];

export default function StreamersPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Live Now{" "}
          <span className="inline-flex items-center ml-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse mr-1" />
            <span className="text-sm text-red-400 font-normal">{streamers.length} live</span>
          </span>
        </h1>
        <div className="flex gap-2">
          {["All", "Twitch", "YouTube"].map((t) => (
            <button key={t} className="h-8 px-3 rounded-md text-sm bg-guild-elevated hover:bg-white/10 transition-colors cursor-pointer">{t}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {streamers.map((s) => (
          <div key={s.name} className="guild-card overflow-hidden hover:border-white/10 transition-colors cursor-pointer group">
            <div className="aspect-video bg-guild-elevated flex items-center justify-center relative">
              <span className="text-5xl font-bold text-white/10">{s.name[0]}</span>
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 px-2 py-0.5 rounded text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> LIVE
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs font-mono">
                {s.viewers.toLocaleString()}
              </div>
            </div>
            <div className="p-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm group-hover:text-guild-accent transition-colors">{s.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-guild-elevated text-guild-muted uppercase">{s.platform}</span>
              </div>
              <p className="text-xs text-guild-muted truncate">{s.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
