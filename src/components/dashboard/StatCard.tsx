import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'income' | 'expense' | 'savings';
}

export function StatCard({ title, value, subtitle, icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    income: 'border-l-4 border-l-success',
    expense: 'border-l-4 border-l-destructive',
    savings: 'border-l-4 border-l-primary',
  };

  const iconBgStyles = {
    default: 'bg-muted',
    income: 'bg-success/10',
    expense: 'bg-destructive/10',
    savings: 'bg-primary/10',
  };

  const iconColorStyles = {
    default: 'text-muted-foreground',
    income: 'text-success',
    expense: 'text-destructive',
    savings: 'text-primary',
  };

  return (
    <Card className={cn('shadow-card hover:shadow-lg transition-all duration-300', variantStyles[variant])}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-display font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center gap-1 text-sm">
                {trend.value >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={cn(
                  "font-medium",
                  trend.value >= 0 ? "text-success" : "text-destructive"
                )}>
                  {trend.value >= 0 ? '+' : ''}{trend.value}%
                </span>
                <span className="text-muted-foreground">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl",
            iconBgStyles[variant]
          )}>
            <div className={iconColorStyles[variant]}>
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
