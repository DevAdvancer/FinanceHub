import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, TrendingUp, TrendingDown, PiggyBank, AlertTriangle, PartyPopper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrency } from '@/contexts/CurrencyContext';

interface WelcomeNotificationProps {
  userName: string;
  stats: {
    income: number;
    expenses: number;
    savings: number;
  };
  exceededBudgets: number;
}

export function WelcomeNotification({ userName, stats, exceededBudgets }: WelcomeNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTip, setCurrentTip] = useState(0);
  const { formatAmount } = useCurrency();

  const savingsRate = stats.income > 0 ? (stats.savings / stats.income) * 100 : 0;
  const isPositiveSavings = stats.savings > 0;

  const tips = [
    "💡 Tip: Track every expense to understand your spending patterns.",
    "💡 Tip: Set realistic budgets for each category monthly.",
    "💡 Tip: Review your spending weekly to stay on track.",
    "💡 Tip: Automate your savings by treating it like a fixed expense.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <Card className={cn(
      "relative overflow-hidden",
      isPositiveSavings ? "bg-gradient-to-r from-success/10 to-primary/10" : "bg-gradient-to-r from-warning/10 to-destructive/10"
    )}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => setIsVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          {/* Welcome Message */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <PartyPopper className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                Welcome back, {userName}!
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Here's your financial summary for this month
            </p>
            <p className="text-xs text-muted-foreground italic animate-pulse">
              {tips[currentTip]}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50">
              <TrendingUp className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Total Balance</p>
                <p className="font-semibold text-success">{formatAmount(stats.savings)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50">
              <TrendingUp className="h-4 w-4 text-success" />
              <div>
                <p className="text-xs text-muted-foreground">Income (This Month)</p>
                <p className="font-semibold text-success">{formatAmount(stats.income)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50">
              <TrendingDown className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Expenses</p>
                <p className="font-semibold text-destructive">{formatAmount(stats.expenses)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background/50">
              <PiggyBank className={cn("h-4 w-4", isPositiveSavings ? "text-primary" : "text-warning")} />
              <div>
                <p className="text-xs text-muted-foreground">Savings Rate</p>
                <p className={cn("font-semibold", isPositiveSavings ? "text-primary" : "text-warning")}>
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Alert Badge */}
          {exceededBudgets > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-xs text-muted-foreground">Alerts</p>
                <p className="font-semibold text-destructive">{exceededBudgets} budgets exceeded</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
