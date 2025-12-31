import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  message?: string;
  className?: string;
}

export function PageLoader({ message = "Loading...", className }: PageLoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[50vh] gap-4", className)}>
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-muted animate-spin border-t-primary" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Wallet className="h-6 w-6 text-primary animate-pulse" />
        </div>
      </div>
      <p className="text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}
