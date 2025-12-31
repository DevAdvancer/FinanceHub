import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { GoalsPageSkeleton } from '@/components/skeletons/CardGridSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEncryption } from '@/hooks/useEncryption';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { 
  Plus, Pencil, Trash2, Target, Plane, Home, Car, GraduationCap, 
  Heart, Umbrella, Gift, CheckCircle, Calendar, TrendingUp, Loader2, DollarSign, Lock
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Goal {
  id: string;
  name: string;
  target_amount: string | number;
  current_amount: string | number;
  deadline: string | null;
  icon: string;
  color: string;
  is_completed: boolean;
  created_at: string;
}

const iconOptions = [
  { value: 'target', label: 'Target', icon: Target },
  { value: 'plane', label: 'Vacation', icon: Plane },
  { value: 'home', label: 'Home', icon: Home },
  { value: 'car', label: 'Car', icon: Car },
  { value: 'graduation', label: 'Education', icon: GraduationCap },
  { value: 'heart', label: 'Health', icon: Heart },
  { value: 'umbrella', label: 'Emergency', icon: Umbrella },
  { value: 'gift', label: 'Gift', icon: Gift },
];

const colorOptions = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#14B8A6', '#6366F1'
];

const getIconComponent = (iconName: string) => {
  const found = iconOptions.find(i => i.value === iconName);
  return found?.icon || Target;
};

export default function Goals() {
  const { user, isEncryptionReady } = useAuth();
  const { toast } = useToast();
  const { encryptEntity, decryptEntities } = useEncryption();
  const { formatAmount } = useCurrency();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [contributionDialog, setContributionDialog] = useState<{ open: boolean; goalId: string | null }>({
    open: false,
    goalId: null,
  });
  const [contributionAmount, setContributionAmount] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    deadline: '',
    icon: 'target',
    color: '#10B981',
  });

  const fetchGoals = useCallback(async () => {
    if (!user || !isEncryptionReady) return;
    setIsLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const decryptedGoals = await decryptEntities(data, 'goals');
      setGoals(decryptedGoals);
    }
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    setIsLoading(false);
  }, [user, isEncryptionReady, decryptEntities, toast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Realtime subscription
  useRealtimeSubscription({
    table: 'goals',
    userId: user?.id,
    onChange: fetchGoals,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        target_amount: formData.target_amount, // Will be encrypted as string
        current_amount: formData.current_amount || '0', // Will be encrypted as string
        deadline: formData.deadline || null,
        icon: formData.icon,
        color: formData.color,
        user_id: user.id,
      };

      // Encrypt the payload before saving
      const encryptedPayload = await encryptEntity(payload, 'goals');

      if (editingGoal) {
        const { error } = await supabase
          .from('goals')
          .update(encryptedPayload)
          .eq('id', editingGoal.id);
        if (error) throw error;
        toast({ title: "Goal updated (encrypted)" });
      } else {
        const { error } = await supabase
          .from('goals')
          .insert(encryptedPayload);
        if (error) throw error;
        toast({ title: "Goal created (encrypted)" });
      }

      setIsDialogOpen(false);
      setEditingGoal(null);
      resetForm();
      fetchGoals();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddContribution = async () => {
    if (!contributionDialog.goalId) return;

    const goal = goals.find(g => g.id === contributionDialog.goalId);
    if (!goal) return;

    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }

    const newAmount = Number(goal.current_amount) + amount;
    const isCompleted = newAmount >= Number(goal.target_amount);

    try {
      // Encrypt the updated amounts
      const encryptedPayload = await encryptEntity(
        { current_amount: String(newAmount), name: goal.name, target_amount: String(goal.target_amount) },
        'goals'
      );

      const { error } = await supabase
        .from('goals')
        .update({ 
          current_amount: encryptedPayload.current_amount,
          is_completed: isCompleted
        })
        .eq('id', goal.id);

      if (error) throw error;

      if (isCompleted) {
        toast({ 
          title: "🎉 Goal Achieved!", 
          description: `Congratulations! You've reached your ${goal.name} goal!` 
        });
      } else {
        toast({ title: "Contribution added (encrypted)", description: `$${amount.toFixed(2)} added to ${goal.name}` });
      }

      setContributionDialog({ open: false, goalId: null });
      setContributionAmount('');
      fetchGoals();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast({ title: "Goal deleted" });
      fetchGoals();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: goal.deadline || '',
      icon: goal.icon,
      color: goal.color,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '0',
      deadline: '',
      icon: 'target',
      color: '#10B981',
    });
  };

  const totalTarget = goals.reduce((sum, g) => sum + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);
  const completedCount = goals.filter(g => g.is_completed).length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <GoalsPageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-display font-bold">Financial Goals</h1>
              <span title="End-to-end encrypted">
                <Lock className="h-4 w-4 text-success" />
              </span>
            </div>
            <p className="text-muted-foreground">Track your savings goals (encrypted)</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingGoal(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create Goal'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Vacation Fund"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={formData.target_amount}
                      onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Starting Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.current_amount}
                      onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Deadline (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {iconOptions.map((opt) => {
                      const IconComp = opt.icon;
                      return (
                        <Button
                          key={opt.value}
                          type="button"
                          variant={formData.icon === opt.value ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => setFormData({ ...formData, icon: opt.value })}
                        >
                          <IconComp className="h-4 w-4" />
                        </Button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded-full border-2 transition-all ${
                          formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  {editingGoal ? 'Update' : 'Create'} Goal
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Target</p>
                  <p className="text-2xl font-bold">{formatAmount(totalTarget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success/10">
                  <TrendingUp className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                  <p className="text-2xl font-bold text-success">{formatAmount(totalSaved)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-warning/10">
                  <CheckCircle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedCount} / {goals.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No goals yet. Start by creating your first goal!</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                Create your first goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => {
              const IconComp = getIconComponent(goal.icon);
              const currentAmount = Number(goal.current_amount);
              const targetAmount = Number(goal.target_amount);
              const percentage = Math.min((currentAmount / targetAmount) * 100, 100);
              const remaining = targetAmount - currentAmount;
              const daysLeft = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;

              return (
                <Card key={goal.id} className={goal.is_completed ? 'border-success' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          <IconComp className="h-5 w-5" style={{ color: goal.color }} />
                        </div>
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(goal)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(goal.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold">{formatAmount(currentAmount)}</p>
                        <p className="text-sm text-muted-foreground">of {formatAmount(targetAmount)}</p>
                      </div>
                      {goal.is_completed ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed!
                        </Badge>
                      ) : (
                        <Badge variant="outline">{percentage.toFixed(0)}%</Badge>
                      )}
                    </div>
                    <Progress
                      value={percentage}
                      className={goal.is_completed ? '[&>div]:bg-success' : ''}
                      style={{ '--progress-color': goal.color } as React.CSSProperties}
                    />
                    <div className="flex items-center justify-between text-sm">
                      {goal.deadline && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {daysLeft !== null && daysLeft > 0 
                            ? `${daysLeft} days left`
                            : daysLeft === 0 
                              ? 'Due today'
                              : 'Overdue'
                          }
                        </div>
                      )}
                      {!goal.is_completed && (
                        <span className="text-muted-foreground">
                          {formatAmount(remaining)} to go
                        </span>
                      )}
                    </div>
                    {!goal.is_completed && (
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setContributionDialog({ open: true, goalId: goal.id })}
                      >
                        <DollarSign className="h-4 w-4" />
                        Add Contribution
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Contribution Dialog */}
        <Dialog open={contributionDialog.open} onOpenChange={(open) => {
          setContributionDialog({ open, goalId: open ? contributionDialog.goalId : null });
          if (!open) setContributionAmount('');
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Contribution</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <Button onClick={handleAddContribution} className="w-full">
                Add to Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
