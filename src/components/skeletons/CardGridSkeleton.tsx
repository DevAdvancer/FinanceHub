import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function BudgetCardSkeleton() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </CardContent>
    </Card>
  );
}

export function GoalCardSkeleton() {
  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SummaryCardSkeleton() {
  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-28" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BudgetsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>

      {/* Budget Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <BudgetCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function GoalsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-5 w-52" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>

      {/* Goal Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <GoalCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}