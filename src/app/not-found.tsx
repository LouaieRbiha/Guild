import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="text-6xl font-bold text-muted-foreground/30">404</div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-semibold">Page Not Found</h2>
        <p className="text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>
      <Link
        href="/database"
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-guild-accent/20 text-guild-accent border border-guild-accent/30 hover:bg-guild-accent/30 transition-colors"
      >
        <Search className="h-4 w-4" />
        Browse Database
      </Link>
    </div>
  );
}
