export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-guild-elevated" />
        <div className="space-y-2">
          <div className="h-7 w-40 bg-guild-elevated rounded-lg" />
          <div className="h-4 w-24 bg-guild-elevated rounded" />
        </div>
      </div>
      <div className="h-48 bg-guild-elevated rounded-2xl" />
      <div className="h-64 bg-guild-elevated rounded-2xl" />
    </div>
  );
}
