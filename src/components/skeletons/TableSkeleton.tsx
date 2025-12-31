import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b border-border/50 animate-fade-in">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === 0 ? 'w-24' : i === columns - 1 ? 'w-16' : 'w-20'}`} 
        />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8, columns = 6 }: TableSkeletonProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        {/* Header */}
        <div className="flex items-center gap-4 py-3 border-b border-border">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </CardContent>
    </Card>
  );
}

export function TransactionsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Table */}
      <TableSkeleton rows={10} columns={6} />
    </div>
  );
}