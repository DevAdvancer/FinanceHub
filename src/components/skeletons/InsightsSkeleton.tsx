import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function InsightCardSkeleton() {
  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InsightsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="animate-fade-in">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card className="animate-fade-in">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-72 w-full rounded-lg" />
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card className="animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <InsightCardSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}