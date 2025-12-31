import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function StatCardSkeleton() {
  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

export function TransactionRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-3 animate-fade-in">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

export function RecentTransactionsSkeleton() {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      {/* Welcome Card */}
      <Skeleton className="h-24 w-full rounded-xl" />

      {/* Stat Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Recent Transactions */}
      <RecentTransactionsSkeleton />
    </div>
  );
}