import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEncryption } from '@/hooks/useEncryption';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useCallback } from 'react';

interface DashboardStats {
  income: number;
  expenses: number;
  savings: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface DashboardData {
  stats: DashboardStats;
  transactions: any[];
  categoryData: CategoryData[];
  monthlyData: MonthlyData[];
  exceededBudgets: number;
}

export function useDashboardData() {
  const { user, isEncryptionReady } = useAuth();
  const { decryptEntities } = useEncryption();
  const queryClient = useQueryClient();

  const fetchDashboardData = useCallback(async (): Promise<DashboardData> => {
    if (!user) throw new Error('No user');

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const rangeStart = startOfMonth(subMonths(now, 5));

    // Fetch recent transactions (for the list)
    const { data: txData } = await supabase
      .from('transactions')
      .select('*, category:categories(name, color)')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('date', { ascending: false })
      .limit(10);

    const transactions = txData ? await decryptEntities(txData, 'transactions') : [];

    // Fetch all transactions for total balance calculation
    const { data: allTx } = await supabase
      .from('transactions')
      .select('type, amount, date')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('date', { ascending: true });

    const decryptedAllTx = allTx ? await decryptEntities(allTx, 'transactions') : [];

    // Calculate total balance from ALL transactions
    const totalIncome = decryptedAllTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = decryptedAllTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalBalance = totalIncome - totalExpenses;

    // Fetch transactions for last 6 months (for monthly trends and current month stats)
    const { data: rangeTx } = await supabase
      .from('transactions')
      .select('type, amount, date, category_id, category:categories(name, color)')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .gte('date', format(rangeStart, 'yyyy-MM-dd'))
      .lte('date', format(monthEnd, 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    const decryptedRangeTx = rangeTx ? await decryptEntities(rangeTx, 'transactions') : [];

    // Current month transactions
    const currentMonthTx = decryptedRangeTx.filter((t) => {
      const d = new Date(t.date);
      return d >= monthStart && d <= monthEnd;
    });

    // Calculate stats (current month)
    const income = currentMonthTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = currentMonthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const stats = { income, expenses, savings: totalBalance };

    // Category breakdown (current month)
    const expensesByCategory = currentMonthTx
      .filter((t) => t.type === 'expense' && t.category)
      .reduce((acc: Record<string, { value: number; color: string }>, t) => {
        const name = t.category?.name || 'Other';
        const color = t.category?.color || '#6B7280';
        if (!acc[name]) acc[name] = { value: 0, color };
        acc[name].value += Number(t.amount);
        return acc;
      }, {});
    const categoryData = Object.entries(expensesByCategory).map(([name, { value, color }]) => ({
      name,
      value,
      color,
    }));

    // Check exceeded budgets (current month)
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const { data: budgets } = await supabase
      .from('budgets')
      .select('amount, category_id')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .eq('year', currentYear);

    let exceededBudgets = 0;
    if (budgets) {
      const decryptedBudgets = await decryptEntities(budgets, 'budgets');
      const spendingByCategory: Record<string, number> = {};

      currentMonthTx
        .filter((t) => t.type === 'expense')
        .forEach((tx) => {
          if (tx.category_id) {
            spendingByCategory[tx.category_id] =
              (spendingByCategory[tx.category_id] || 0) + Number(tx.amount);
          }
        });

      exceededBudgets = decryptedBudgets.filter((budget) => {
        const spent = budget.category_id ? spendingByCategory[budget.category_id] || 0 : 0;
        return spent > Number(budget.amount);
      }).length;
    }

    // Monthly trends (last 6 months) computed from rangeTx
    const monthlyData: MonthlyData[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      const monthTx = decryptedRangeTx.filter((t) => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });

      const mIncome = monthTx
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      const mExpenses = monthTx
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      monthlyData.push({ month: format(monthDate, 'MMM'), income: mIncome, expenses: mExpenses });
    }

    return { stats, transactions, categoryData, monthlyData, exceededBudgets };
  }, [user, decryptEntities]);

  const query = useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: fetchDashboardData,
    enabled: !!user && isEncryptionReady,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] });
  }, [queryClient, user?.id]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
    invalidate,
  };
}
