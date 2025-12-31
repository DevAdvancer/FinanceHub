import { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TransactionsPageSkeleton } from '@/components/skeletons/TableSkeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEncryption } from '@/hooks/useEncryption';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';
import { useTransactionMutations } from '@/hooks/useTransactionMutations';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { exportToCSV } from '@/lib/exportCsv';
import { Plus, Pencil, Trash2, TrendingUp, TrendingDown, Loader2, Search, Filter, Download, Lock, CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  amount: string | number;
  type: string;
  description: string | null;
  date: string;
  category_id: string | null;
  category?: { name: string; color: string } | null;
}

interface Category {
  id: string;
  name: string;
  color: string | null;
}

export default function Transactions() {
  const { user, isEncryptionReady } = useAuth();
  const { toast } = useToast();
  const { decryptEntities } = useEncryption();
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    category_id: '',
  });

  const handleMutationSuccess = () => {
    setIsDialogOpen(false);
    setEditingTransaction(null);
    resetForm();
    fetchData();
  };

  const { addTransaction, updateTransaction, deleteTransaction } = useTransactionMutations(
    categories,
    handleMutationSuccess
  );

  const fetchData = useCallback(async () => {
    if (!user || !isEncryptionReady) return;
    setIsLoading(true);
    const [txResult, catResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('*, category:categories(name, color)')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('date', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${user.id},is_default.eq.true`),
    ]);

    if (txResult.data) {
      const decryptedTx = await decryptEntities(txResult.data, 'transactions');
      setTransactions(decryptedTx);
    }
    if (catResult.data) setCategories(catResult.data);
    setIsLoading(false);
  }, [user, isEncryptionReady, decryptEntities]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscription for transactions
  useRealtimeSubscription({
    table: 'transactions',
    userId: user?.id,
    onChange: fetchData,
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingTransaction) {
      updateTransaction.mutate({ id: editingTransaction.id, input: formData });
    } else {
      addTransaction.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    deleteTransaction.mutate(id);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setFormData({
      amount: tx.amount.toString(),
      type: tx.type,
      description: tx.description || '',
      date: tx.date,
      category_id: tx.category_id || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      type: 'expense',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      category_id: '',
    });
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <TransactionsPageSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-display font-bold">Transactions</h1>
              <span title="End-to-end encrypted">
                <Lock className="h-4 w-4 text-success" />
              </span>
            </div>
            <p className="text-muted-foreground">Manage your income and expenses (encrypted)</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const csvData = filteredTransactions.map((tx) => ({
                  Date: format(new Date(tx.date), 'yyyy-MM-dd'),
                  Description: tx.description || '',
                  Category: tx.category?.name || '',
                  Type: tx.type,
                  Amount: tx.type === 'income' ? tx.amount : -tx.amount,
                }));
                exportToCSV(csvData, `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
                toast({ title: "Exported", description: "Transactions downloaded as CSV" });
              }}
              disabled={filteredTransactions.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingTransaction(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Transaction
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
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
                </div>
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
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(parseISO(formData.date), 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date ? parseISO(formData.date) : undefined}
                        onSelect={(date) => setFormData({ ...formData, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={addTransaction.isPending || updateTransaction.isPending}
                >
                  {(addTransaction.isPending || updateTransaction.isPending) && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        {format(new Date(tx.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{tx.description || '-'}</TableCell>
                      <TableCell>
                        {tx.category ? (
                          <Badge
                            variant="outline"
                            style={{ borderColor: tx.category.color || undefined }}
                          >
                            {tx.category.name}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'income' ? 'default' : 'secondary'}>
                          {tx.type === 'income' ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatAmount(Number(tx.amount))}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(tx)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(tx.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
