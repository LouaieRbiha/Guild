export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-guild-elevated" />
        <div className="space-y-2">
          <div className="h-7 w-36 bg-guild-elevated rounded-lg" />
          <div className="h-4 w-24 bg-guild-elevated rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-48 bg-guild-elevated rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
