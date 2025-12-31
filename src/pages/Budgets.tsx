import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BudgetsPageSkeleton } from '@/components/skeletons/CardGridSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEncryption } from '@/hooks/useEncryption';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { Plus, Pencil, Trash2, AlertTriangle, CheckCircle, Loader2, PiggyBank, Lock } from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface Budget {
  id: string;
  amount: string | number;
  month: number;
  year: number;
  category_id: string | null;
  category?: { name: string; color: string } | null;
}

interface Category {
  id: string;
  name: string;
  color: string | null;
}

interface BudgetWithSpending {
  id: string;
  amount: number;
  month: number;
  year: number;
  category_id: string | null;
  category?: { name: string; color: string } | null;
  spent: number;
  percentage: number;
  isExceeded: boolean;
}

export default function Budgets() {
  const { user, isEncryptionReady } = useAuth();
  const { toast } = useToast();
  const { encryptEntity, decryptEntities } = useEncryption();
  const { formatAmount } = useCurrency();
  const [budgets, setBudgets] = useState<BudgetWithSpending[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    amount: '',
    category_id: '',
    month: currentMonth.toString(),
    year: currentYear.toString(),
  });

  const fetchData = useCallback(async () => {
    if (!user || !isEncryptionReady) return;
    setIsLoading(true);
    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');

    const [budgetResult, catResult, txResult] = await Promise.all([
      supabase
        .from('budgets')
        .select('*, category:categories(name, color)')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear),
      supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},is_default.eq.true`),
      supabase
        .from('transactions')
        .select('amount, category_id')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .eq('is_deleted', false)
        .gte('date', monthStart)
        .lte('date', monthEnd),
    ]);

    if (catResult.data) setCategories(catResult.data);

    if (budgetResult.data && txResult.data) {
      const decryptedBudgets = await decryptEntities(budgetResult.data, 'budgets');
      const decryptedTx = await decryptEntities(txResult.data, 'transactions');

      const spendingByCategory: Record<string, number> = {};
      decryptedTx.forEach((tx) => {
        if (tx.category_id) {
          spendingByCategory[tx.category_id] = (spendingByCategory[tx.category_id] || 0) + Number(tx.amount);
        }
      });

      const budgetsWithSpending: BudgetWithSpending[] = decryptedBudgets.map((budget) => {
        const budgetAmount = Number(budget.amount);
        const spent = budget.category_id ? spendingByCategory[budget.category_id] || 0 : 0;
        const percentage = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;
        const isExceeded = spent > budgetAmount;

        if (isExceeded) {
          checkAndCreateNotification({ ...budget, amount: budgetAmount, spent, percentage, isExceeded }, spent);
        }

        return { ...budget, amount: budgetAmount, spent, percentage, isExceeded };
      });

      setBudgets(budgetsWithSpending);
    }
    setIsLoading(false);
  }, [user, isEncryptionReady, decryptEntities, currentMonth, currentYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscriptions
  useRealtimeSubscription({
    table: 'budgets',
    userId: user?.id,
    onChange: fetchData,
  });

  useRealtimeSubscription({
    table: 'transactions',
    userId: user?.id,
    onChange: fetchData,
  });

  const checkAndCreateNotification = async (budget: BudgetWithSpending, spent: number) => {
    // Check if notification already exists for this budget this month
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user!.id)
      .eq('type', 'budget_alert')
      .ilike('message', `%${budget.category?.name}%`)
      .gte('created_at', format(startOfMonth(new Date()), 'yyyy-MM-dd'));

    if (!existing || existing.length === 0) {
      await supabase.from('notifications').insert({
        user_id: user!.id,
        type: 'budget_alert',
        title: 'Budget Exceeded!',
        message: `You've exceeded your ${budget.category?.name || 'budget'} budget. Spent: $${spent.toFixed(2)} / Budget: $${budget.amount.toFixed(2)}`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const payload = {
        amount: formData.amount, // Will be encrypted as string
        category_id: formData.category_id || null,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        user_id: user.id,
      };

      // Encrypt the payload before saving
      const encryptedPayload = await encryptEntity(payload, 'budgets');

      if (editingBudget) {
        const { error } = await supabase
          .from('budgets')
          .update(encryptedPayload)
          .eq('id', editingBudget.id);
        if (error) throw error;
        toast({ title: "Budget updated (encrypted)" });
      } else {
        const { error } = await supabase
          .from('budgets')
          .insert(encryptedPayload);
        if (error) throw error;
        toast({ title: "Budget created (encrypted)" });
      }

      setIsDialogOpen(false);
      setEditingBudget(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: "Budget deleted" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (budget: BudgetWithSpending) => {
    setEditingBudget(budget);
    setFormData({
      amount: budget.amount.toString(),
      category_id: budget.category_id || '',
      month: budget.month.toString(),
      year: budget.year.toString(),
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category_id: '',
      month: currentMonth.toString(),
      year: currentYear.toString(),
    });
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const exceededCount = budgets.filter((b) => b.isExceeded).length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <BudgetsPageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-display font-bold">Budgets</h1>
              <span title="End-to-end encrypted">
                <Lock className="h-4 w-4 text-success" />
              </span>
            </div>
            <p className="text-muted-foreground">Set and track your spending limits (encrypted)</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingBudget(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Budget
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingBudget ? 'Edit Budget' : 'Create Budget'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select
                      value={formData.month}
                      onValueChange={(value) => setFormData({ ...formData, month: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {format(new Date(2024, i), 'MMMM')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Select
                      value={formData.year}
                      onValueChange={(value) => setFormData({ ...formData, year: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                          <SelectItem key={y} value={y.toString()}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingBudget ? 'Update' : 'Create'} Budget
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <PiggyBank className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">{formatAmount(totalBudget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">{formatAmount(totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${exceededCount > 0 ? 'bg-destructive/10' : 'bg-success/10'}`}>
                  {exceededCount > 0 ? (
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-success" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Exceeded</p>
                  <p className="text-2xl font-bold">{exceededCount} budgets</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : budgets.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <PiggyBank className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No budgets set for this month</p>
                <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                  Create your first budget
                </Button>
              </CardContent>
            </Card>
          ) : (
            budgets.map((budget) => (
              <Card key={budget.id} className={budget.isExceeded ? 'border-destructive' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: budget.category?.color || '#6B7280' }}
                      />
                      <CardTitle className="text-lg">
                        {budget.category?.name || 'General'}
                      </CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(budget)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold">{formatAmount(budget.spent)}</p>
                      <p className="text-sm text-muted-foreground">of {formatAmount(budget.amount)}</p>
                    </div>
                    <Badge variant={budget.isExceeded ? 'destructive' : 'outline'}>
                      {budget.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                  <Progress
                    value={budget.percentage}
                    className={budget.isExceeded ? '[&>div]:bg-destructive' : ''}
                  />
                  {budget.isExceeded && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Budget exceeded by {formatAmount(budget.spent - budget.amount)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
