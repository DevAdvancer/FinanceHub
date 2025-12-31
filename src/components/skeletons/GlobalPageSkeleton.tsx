import { Skeleton } from '@/components/ui/skeleton';

export function GlobalPageSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Sidebar placeholder for desktop */}
      <div className="hidden lg:block fixed left-0 top-0 h-full w-64 border-r border-border bg-card">
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile header placeholder */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card z-10">
        <div className="flex items-center justify-between h-full px-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      {/* Main content area */}
      <div className="pt-16 lg:pt-0 lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-72" />
          </div>

          {/* Cards grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-28" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chart placeholders */}
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
