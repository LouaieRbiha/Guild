import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Analytics } from "@/components/shared/analytics";
import { SWRProvider } from "@/components/swr-provider";
export const metadata: Metadata = {
  title: {
    default: 'Guild — Genshin Impact Companion',
    template: '%s | Guild',
  },
  description: 'Your ultimate Genshin Impact companion — build analysis, tier lists, team compositions, damage calculator, wish simulator, and more.',
  keywords: ['Genshin Impact', 'build analyzer', 'tier list', 'damage calculator', 'wish simulator', 'artifact scorer', 'team comps'],
  openGraph: {
    type: 'website',
    siteName: 'Guild',
    title: 'Guild — Genshin Impact Companion',
    description: 'Build analysis, tier lists, team comps, damage calculator, wish simulator, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Guild — Genshin Impact Companion',
    description: 'Build analysis, tier lists, team comps, damage calculator, and more.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('guild-theme');if(!t){t=window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark'}document.documentElement.classList.add(t)}catch(e){document.documentElement.classList.add('dark')}})()` }} />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        `}} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:bg-guild-accent focus:text-white focus:text-sm focus:font-medium focus:outline-none focus:ring-2 focus:ring-guild-accent focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar />
            <main id="main-content" className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
              <SWRProvider>{children}</SWRProvider>
            </main>
          </div>
          <MobileNav />
          <Analytics />
        </div>
      </body>
    </html>
  );
}
