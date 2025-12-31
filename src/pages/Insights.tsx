import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InsightsPageSkeleton } from '@/components/skeletons/InsightsSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEncryption } from '@/hooks/useEncryption';
import { 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Lock
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface Transaction {
  id: string;
  amount: string | number;
  type: string;
  category_id: string | null;
  date: string;
  description: string | null;
}

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface CategorySpending {
  name: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  color: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function Insights() {
  const { user, isEncryptionReady } = useAuth();
  const { toast } = useToast();
  const { formatAmount } = useCurrency();
  const { decryptEntities } = useEncryption();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('6');

  useEffect(() => {
    if (user && isEncryptionReady) {
      fetchData();
    }
  }, [user, selectedPeriod, isEncryptionReady]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const monthsAgo = parseInt(selectedPeriod);
      const startDate = format(subMonths(new Date(), monthsAgo), 'yyyy-MM-dd');

      const [transactionsRes, categoriesRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user?.id)
          .eq('is_deleted', false)
          .gte('date', startDate)
          .order('date', { ascending: true }),
        supabase
          .from('categories')
          .select('*')
          .or(`user_id.eq.${user?.id},is_default.eq.true`),
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      // Decrypt transactions
      const decryptedTransactions = await decryptEntities(transactionsRes.data || [], 'transactions');
      
      setTransactions(decryptedTransactions);
      setCategories(categoriesRes.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const monthlyData = useMemo((): MonthlyData[] => {
    const monthsAgo = parseInt(selectedPeriod);
    const data: MonthlyData[] = [];

    for (let i = monthsAgo - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      const monthLabel = format(monthDate, 'MMM yyyy');

      const monthTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= monthStart && date <= monthEnd;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      data.push({
        month: monthLabel,
        income,
        expenses,
        savings: income - expenses,
      });
    }

    return data;
  }, [transactions, selectedPeriod]);

  const categoryComparison = useMemo((): CategorySpending[] => {
    const currentMonth = new Date();
    const previousMonth = subMonths(currentMonth, 1);

    const currentStart = startOfMonth(currentMonth);
    const currentEnd = endOfMonth(currentMonth);
    const previousStart = startOfMonth(previousMonth);
    const previousEnd = endOfMonth(previousMonth);

    const categoryMap = new Map<string, { current: number; previous: number; name: string; color: string }>();

    categories.forEach((cat, index) => {
      categoryMap.set(cat.id, {
        current: 0,
        previous: 0,
        name: cat.name,
        color: cat.color || COLORS[index % COLORS.length],
      });
    });

    transactions.forEach(t => {
      if (t.type !== 'expense' || !t.category_id) return;
      
      const date = new Date(t.date);
      const catData = categoryMap.get(t.category_id);
      
      if (!catData) return;

      if (date >= currentStart && date <= currentEnd) {
        catData.current += Number(t.amount);
      } else if (date >= previousStart && date <= previousEnd) {
        catData.previous += Number(t.amount);
      }
    });

    const result: CategorySpending[] = [];
    categoryMap.forEach((data) => {
      if (data.current > 0 || data.previous > 0) {
        const change = data.current - data.previous;
        const changePercent = data.previous > 0 
          ? ((change / data.previous) * 100) 
          : (data.current > 0 ? 100 : 0);

        result.push({
          name: data.name,
          current: data.current,
          previous: data.previous,
          change,
          changePercent,
          color: data.color,
        });
      }
    });

    return result.sort((a, b) => b.current - a.current);
  }, [transactions, categories]);

  const topInsights = useMemo(() => {
    const insights: { type: 'positive' | 'negative' | 'neutral'; message: string; icon: typeof TrendingUp }[] = [];

    // Total spending trend
    if (monthlyData.length >= 2) {
      const lastMonth = monthlyData[monthlyData.length - 1];
      const prevMonth = monthlyData[monthlyData.length - 2];
      
      if (lastMonth && prevMonth) {
        const spendingChange = ((lastMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100;
        
        if (spendingChange > 10) {
          insights.push({
            type: 'negative',
            message: `Spending increased by ${Math.abs(spendingChange).toFixed(0)}% compared to last month`,
            icon: TrendingUp,
          });
        } else if (spendingChange < -10) {
          insights.push({
            type: 'positive',
            message: `Great! Spending decreased by ${Math.abs(spendingChange).toFixed(0)}% compared to last month`,
            icon: TrendingDown,
          });
        }

        const savingsChange = lastMonth.savings - prevMonth.savings;
        if (savingsChange > 0) {
          insights.push({
            type: 'positive',
            message: `You saved more than last month`,
            icon: TrendingUp,
          });
        }
      }
    }

    // Category insights
    const topIncrease = categoryComparison.find(c => c.changePercent > 20);
    if (topIncrease) {
      insights.push({
        type: 'negative',
        message: `${topIncrease.name} spending increased by ${topIncrease.changePercent.toFixed(0)}%`,
        icon: AlertTriangle,
      });
    }

    const topDecrease = categoryComparison.find(c => c.changePercent < -20);
    if (topDecrease) {
      insights.push({
        type: 'positive',
        message: `${topDecrease.name} spending decreased by ${Math.abs(topDecrease.changePercent).toFixed(0)}%`,
        icon: Lightbulb,
      });
    }

    return insights.slice(0, 4);
  }, [monthlyData, categoryComparison]);

  const pieChartData = useMemo(() => {
    return categoryComparison
      .filter(c => c.current > 0)
      .slice(0, 8)
      .map(c => ({
        name: c.name,
        value: c.current,
        color: c.color,
      }));
  }, [categoryComparison]);

  const totalCurrentExpenses = categoryComparison.reduce((sum, c) => sum + c.current, 0);
  const totalPreviousExpenses = categoryComparison.reduce((sum, c) => sum + c.previous, 0);
  const overallChange = totalPreviousExpenses > 0 
    ? ((totalCurrentExpenses - totalPreviousExpenses) / totalPreviousExpenses) * 100 
    : 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <InsightsPageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-display font-bold">Spending Insights</h1>
              <span title="End-to-end encrypted">
                <Lock className="h-4 w-4 text-success" />
              </span>
            </div>
            <p className="text-muted-foreground">Analyze your spending patterns and trends (encrypted)</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Insights */}
        {topInsights.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {topInsights.map((insight, index) => (
              <Card key={index} className={`border-l-4 ${
                insight.type === 'positive' 
                  ? 'border-l-success bg-success/5' 
                  : insight.type === 'negative' 
                  ? 'border-l-destructive bg-destructive/5'
                  : 'border-l-primary bg-primary/5'
              }`}>
                <CardContent className="flex items-center gap-3 pt-4">
                  <insight.icon className={`h-5 w-5 ${
                    insight.type === 'positive' 
                      ? 'text-success' 
                      : insight.type === 'negative' 
                      ? 'text-destructive'
                      : 'text-primary'
                  }`} />
                  <p className="text-sm font-medium">{insight.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month's Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(totalCurrentExpenses)}</div>
              <div className={`flex items-center text-sm ${overallChange > 0 ? 'text-destructive' : 'text-success'}`}>
                {overallChange > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>{Math.abs(overallChange).toFixed(1)}% vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Month's Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(totalPreviousExpenses)}</div>
              <p className="text-sm text-muted-foreground">Baseline for comparison</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categories Tracked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryComparison.length}</div>
              <p className="text-sm text-muted-foreground">Active spending categories</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <CardTitle>Monthly Income vs Expenses</CardTitle>
              </div>
              <CardDescription>Track your financial flow over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
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

          {/* Category Pie Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                <CardTitle>Expense Breakdown</CardTitle>
              </div>
              <CardDescription>Where your money goes this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatAmount(value), '']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Savings Trend */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Savings Trend</CardTitle>
              </div>
              <CardDescription>Your monthly savings over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [formatAmount(value), 'Savings']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="savings" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Month-over-Month Category Comparison</CardTitle>
            <CardDescription>See how your spending changed in each category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryComparison.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No spending data available for comparison
                </p>
              ) : (
                categoryComparison.map((category) => (
                  <div key={category.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Last month: {formatAmount(category.previous)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatAmount(category.current)}</p>
                      <div className={`flex items-center justify-end text-sm ${
                        category.change > 0 ? 'text-destructive' : category.change < 0 ? 'text-success' : 'text-muted-foreground'
                      }`}>
                        {category.change > 0 ? (
                          <ArrowUpRight className="h-4 w-4" />
                        ) : category.change < 0 ? (
                          <ArrowDownRight className="h-4 w-4" />
                        ) : null}
                        <span>
                          {category.change === 0 
                            ? 'No change' 
                            : `${category.changePercent > 0 ? '+' : ''}${category.changePercent.toFixed(0)}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
