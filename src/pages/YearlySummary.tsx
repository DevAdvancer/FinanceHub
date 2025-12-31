import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { YearlySummarySkeleton } from '@/components/skeletons/YearlySummarySkeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useEncryption } from '@/hooks/useEncryption';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, PiggyBank, Calendar, Loader2, Lock } from 'lucide-react';
import { format, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export default function YearlySummary() {
  const { user, isEncryptionReady } = useAuth();
  const { formatAmount } = useCurrency();
  const { decryptEntities } = useEncryption();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [totals, setTotals] = useState({ income: 0, expenses: 0, savings: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    if (!user || !isEncryptionReady) return;
    fetchYearlyData();
  }, [user, selectedYear, isEncryptionReady]);

  const fetchYearlyData = async () => {
    setIsLoading(true);
    const year = parseInt(selectedYear);
    const yearStart = format(startOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd');
    const yearEnd = format(endOfYear(new Date(year, 0, 1)), 'yyyy-MM-dd');

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*, category:categories(name, color)')
      .eq('user_id', user!.id)
      .eq('is_deleted', false)
      .gte('date', yearStart)
      .lte('date', yearEnd);

    if (transactions) {
      // Decrypt transactions
      const decryptedTransactions = await decryptEntities(transactions, 'transactions');
      
      // Calculate monthly data
      const months = eachMonthOfInterval({
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31),
      });

      const monthly: MonthlyData[] = months.map((monthDate) => {
        const monthStr = format(monthDate, 'yyyy-MM');
        const monthTransactions = decryptedTransactions.filter((tx) => tx.date.startsWith(monthStr));

        const income = monthTransactions
          .filter((tx) => tx.type === 'income')
          .reduce((sum, tx) => sum + Number(tx.amount), 0);
        const expenses = monthTransactions
          .filter((tx) => tx.type === 'expense')
          .reduce((sum, tx) => sum + Number(tx.amount), 0);

        return {
          month: format(monthDate, 'MMM'),
          income,
          expenses,
          savings: income - expenses,
        };
      });

      setMonthlyData(monthly);

      // Calculate totals
      const totalIncome = monthly.reduce((sum, m) => sum + m.income, 0);
      const totalExpenses = monthly.reduce((sum, m) => sum + m.expenses, 0);
      setTotals({
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalIncome - totalExpenses,
      });

      // Calculate category breakdown
      const expensesByCategory: Record<string, { value: number; color: string }> = {};
      decryptedTransactions
        .filter((tx) => tx.type === 'expense' && tx.category)
        .forEach((tx) => {
          const name = tx.category?.name || 'Other';
          const color = tx.category?.color || '#6B7280';
          if (!expensesByCategory[name]) {
            expensesByCategory[name] = { value: 0, color };
          }
          expensesByCategory[name].value += Number(tx.amount);
        });

      setCategoryData(
        Object.entries(expensesByCategory)
          .map(([name, { value, color }]) => ({ name, value, color }))
          .sort((a, b) => b.value - a.value)
      );
    }

    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <YearlySummarySkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-display font-bold">Yearly Summary</h1>
              <span title="End-to-end encrypted">
                <Lock className="h-4 w-4 text-success" />
              </span>
            </div>
            <p className="text-muted-foreground">Annual financial overview (encrypted)</p>
          </div>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Annual Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-success">{formatAmount(totals.income)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-destructive/10">
                  <TrendingDown className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-destructive">{formatAmount(totals.expenses)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <PiggyBank className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Net Savings</p>
                  <p className={`text-2xl font-bold ${totals.savings >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatAmount(totals.savings)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Monthly Comparison Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(value) => formatAmount(value)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [formatAmount(value), '']}
                      />
                      <Legend />
                      <Bar dataKey="income" name="Income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Savings Trend Area Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Savings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(value) => formatAmount(value)} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [formatAmount(value), 'Savings']}
                      />
                      <Area
                        type="monotone"
                        dataKey="savings"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary) / 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Expense Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No expense data for this year
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [formatAmount(value), '']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Spending Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No expense data for this year
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categoryData.slice(0, 6).map((cat, index) => (
                        <div key={cat.name} className="flex items-center gap-4">
                          <div className="text-sm font-medium text-muted-foreground w-4">
                            {index + 1}
                          </div>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{cat.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatAmount(cat.value)}</p>
                            <p className="text-xs text-muted-foreground">
                              {((cat.value / totals.expenses) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
