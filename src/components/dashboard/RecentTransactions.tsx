import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  date: string;
  category: {
    name: string;
    color: string | null;
  } | null;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function RecentTransactions({ transactions, isLoading }: RecentTransactionsProps) {
  const { formatAmount } = useCurrency();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    transaction.type === 'income' ? "bg-success/10" : "bg-destructive/10"
                  )}
                >
                  {transaction.type === 'income' ? (
                    <ArrowDownLeft className="h-5 w-5 text-success" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {transaction.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{format(new Date(transaction.date), 'MMM d, yyyy')}</span>
                    {transaction.category && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary" className="text-xs">
                          {transaction.category.name}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <p
                  className={cn(
                    "font-semibold tabular-nums",
                    transaction.type === 'income' ? "text-success" : "text-destructive"
                  )}
                >
                  {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
