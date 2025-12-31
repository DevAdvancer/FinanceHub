import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function SettingsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-28" />
              </div>
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
