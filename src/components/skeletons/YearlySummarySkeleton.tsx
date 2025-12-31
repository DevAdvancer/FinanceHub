import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function YearlySummarySkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Annual Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Card className="animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-52" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full rounded-lg" />
        </CardContent>
      </Card>

      <Card className="animate-fade-in">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="animate-fade-in">
            <CardHeader>
              <Skeleton className="h-6 w-56" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
