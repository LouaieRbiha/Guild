export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-guild-elevated" />
        <div className="space-y-2">
          <div className="h-7 w-52 bg-guild-elevated rounded-lg" />
          <div className="h-4 w-28 bg-guild-elevated rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-40 bg-guild-elevated rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
