import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { MonthlyTrend } from '@/components/dashboard/MonthlyTrend';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { WelcomeNotification } from '@/components/dashboard/WelcomeNotification';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { formatAmount } = useCurrency();
  const { data, isLoading, invalidate } = useDashboardData();

  // Realtime subscriptions - invalidate cache on changes
  useRealtimeSubscription({
    table: 'transactions',
    userId: user?.id,
    onChange: invalidate,
  });

  useRealtimeSubscription({
    table: 'budgets',
    userId: user?.id,
    onChange: invalidate,
  });

  if (isLoading || !data) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  const { stats, transactions, categoryData, monthlyData, exceededBudgets } = data;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile?.full_name || 'User'}!</p>
          </div>
          <NotificationBell />
        </div>

        <WelcomeNotification
          userName={profile?.full_name || 'User'}
          stats={stats}
          exceededBudgets={exceededBudgets}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Balance"
            value={formatAmount(stats.savings)}
            icon={<Wallet className="h-6 w-6" />}
            variant="savings"
          />
          <StatCard
            title="Income"
            value={formatAmount(stats.income)}
            subtitle="This month"
            icon={<TrendingUp className="h-6 w-6" />}
            variant="income"
          />
          <StatCard
            title="Expenses"
            value={formatAmount(stats.expenses)}
            subtitle="This month"
            icon={<TrendingDown className="h-6 w-6" />}
            variant="expense"
          />
          <StatCard
            title="Savings Rate"
            value={stats.income > 0 ? `${((stats.savings / stats.income) * 100).toFixed(1)}%` : '0%'}
            icon={<PiggyBank className="h-6 w-6" />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <MonthlyTrend data={monthlyData} isLoading={false} />
          <ExpenseChart data={categoryData} isLoading={false} />
        </div>

        <RecentTransactions transactions={transactions} isLoading={false} />
      </div>
    </DashboardLayout>
  );
}
