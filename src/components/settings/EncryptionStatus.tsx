import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEncryption } from '@/hooks/useEncryption';
import { Lock, Unlock, Shield, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';

interface EncryptionStats {
  transactions: { total: number; encrypted: number };
  budgets: { total: number; encrypted: number };
  goals: { total: number; encrypted: number };
}

export function EncryptionStatus() {
  const { user, isEncryptionReady } = useAuth();
  const { isEncrypted } = useEncryption();
  const [stats, setStats] = useState<EncryptionStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEncryptionStats = async () => {
    if (!user || !isEncryptionReady) return;

    setIsLoading(true);
    try {
      const [txResult, budgetResult, goalResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('amount, description')
          .eq('user_id', user.id)
          .eq('is_deleted', false),
        supabase
          .from('budgets')
          .select('amount')
          .eq('user_id', user.id),
        supabase
          .from('goals')
          .select('name, target_amount, current_amount')
          .eq('user_id', user.id),
      ]);

      const txEncrypted = txResult.data?.filter(tx => 
        (tx.amount && typeof tx.amount === 'string' && isEncrypted(tx.amount)) ||
        (tx.description && isEncrypted(tx.description))
      ).length || 0;

      const budgetEncrypted = budgetResult.data?.filter(b => 
        b.amount && typeof b.amount === 'string' && isEncrypted(b.amount)
      ).length || 0;

      const goalEncrypted = goalResult.data?.filter(g => 
        (g.name && isEncrypted(g.name)) ||
        (g.target_amount && typeof g.target_amount === 'string' && isEncrypted(String(g.target_amount)))
      ).length || 0;

      setStats({
        transactions: { total: txResult.data?.length || 0, encrypted: txEncrypted },
        budgets: { total: budgetResult.data?.length || 0, encrypted: budgetEncrypted },
        goals: { total: goalResult.data?.length || 0, encrypted: goalEncrypted },
      });
    } catch (error) {
      console.error('Error fetching encryption stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEncryptionStats();
  }, [user, isEncryptionReady]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Encryption Status
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const totalRecords = stats.transactions.total + stats.budgets.total + stats.goals.total;
  const totalEncrypted = stats.transactions.encrypted + stats.budgets.encrypted + stats.goals.encrypted;
  const overallPercentage = totalRecords > 0 ? Math.round((totalEncrypted / totalRecords) * 100) : 0;

  const getStatusColor = (percentage: number) => {
    if (percentage === 100) return 'text-success';
    if (percentage >= 50) return 'text-warning';
    return 'text-destructive';
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage === 100) return { variant: 'default' as const, text: 'Fully Encrypted', className: 'bg-success' };
    if (percentage >= 50) return { variant: 'secondary' as const, text: 'Partially Encrypted', className: 'bg-warning' };
    if (percentage > 0) return { variant: 'secondary' as const, text: 'Some Encrypted', className: 'bg-warning' };
    return { variant: 'outline' as const, text: 'Not Encrypted', className: '' };
  };

  const renderCategoryStatus = (
    label: string,
    data: { total: number; encrypted: number }
  ) => {
    const percentage = data.total > 0 ? Math.round((data.encrypted / data.total) * 100) : 0;
    
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{label}</span>
          <div className="flex items-center gap-2">
            {percentage === 100 ? (
              <Lock className="h-3.5 w-3.5 text-success" />
            ) : (
              <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={getStatusColor(percentage)}>
              {data.encrypted}/{data.total} ({percentage}%)
            </span>
          </div>
        </div>
        <Progress 
          value={percentage} 
          className={`h-2 ${percentage === 100 ? '[&>div]:bg-success' : percentage > 0 ? '[&>div]:bg-warning' : ''}`}
        />
      </div>
    );
  };

  const statusBadge = getStatusBadge(overallPercentage);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {overallPercentage === 100 ? (
              <ShieldCheck className="h-5 w-5 text-success" />
            ) : (
              <Shield className="h-5 w-5 text-primary" />
            )}
            <CardTitle>Encryption Status</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchEncryptionStats}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Client-side AES-256-GCM encryption for your financial data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">Overall Encryption</p>
            <p className={`text-3xl font-bold ${getStatusColor(overallPercentage)}`}>
              {overallPercentage}%
            </p>
          </div>
          <Badge className={statusBadge.className}>
            {statusBadge.text}
          </Badge>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          {renderCategoryStatus('Transactions', stats.transactions)}
          {renderCategoryStatus('Budgets', stats.budgets)}
          {renderCategoryStatus('Goals', stats.goals)}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="flex items-center gap-1">
            <Lock className="h-3 w-3" />
            New data is automatically encrypted before saving
          </p>
          <p>
            Encryption key is stored securely in your browser session
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
