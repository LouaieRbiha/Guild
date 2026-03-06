import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tier List',
  description: 'Genshin Impact tier list based on live Spiral Abyss and Stygian Onslaught usage rates. See which characters are SS, S, A, B, and C tier.',
  openGraph: {
    title: 'Tier List — Genshin Impact',
    description: 'Live tier list based on Spiral Abyss and Stygian Onslaught usage data.',
  },
};

function TierListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-guild-elevated rounded animate-pulse" />
          <div className="h-4 w-48 bg-guild-elevated rounded animate-pulse mt-2" />
        </div>
      </div>
      {/* Filter skeleton */}
      <div className="rounded-xl border border-guild-border p-4 space-y-3">
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-6 w-24 bg-guild-elevated rounded animate-pulse" />
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 w-16 bg-guild-elevated rounded animate-pulse" />
          ))}
        </div>
      </div>
      {/* Tier rows skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex rounded-xl border border-guild-border overflow-hidden">
            <div className="w-16 sm:w-20 flex items-center justify-center bg-guild-elevated">
              <div className="h-8 w-8 bg-guild-card rounded animate-pulse" />
            </div>
            <div className="flex-1 flex flex-wrap gap-2 p-3">
              {Array.from({ length: 4 + i }).map((_, j) => (
                <div key={j} className="w-[72px] sm:w-[80px] h-24 bg-guild-elevated rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<TierListSkeleton />}>
      {children}
    </Suspense>
  );
}
