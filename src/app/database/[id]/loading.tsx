export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-guild-elevated" />
        <div className="space-y-2">
          <div className="h-8 w-48 bg-guild-elevated rounded-lg" />
          <div className="h-4 w-32 bg-guild-elevated rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-guild-elevated rounded-2xl" />
        <div className="h-64 bg-guild-elevated rounded-2xl" />
      </div>
      <div className="h-96 bg-guild-elevated rounded-2xl" />
    </div>
  );
}
