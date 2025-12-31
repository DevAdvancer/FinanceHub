import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEncryption } from '@/hooks/useEncryption';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  amount: string | number;
  type: string;
  description: string | null;
  date: string;
  category_id: string | null;
  category?: { name: string; color: string } | null;
  user_id?: string;
  is_deleted?: boolean;
}

interface TransactionInput {
  amount: string;
  type: string;
  description: string;
  date: string;
  category_id: string;
}

interface Category {
  id: string;
  name: string;
  color: string | null;
}

export function useTransactionMutations(
  categories: Category[],
  onSuccess?: () => void
) {
  const { user } = useAuth();
  const { encryptEntity } = useEncryption();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getCategoryInfo = (categoryId: string | null) => {
    if (!categoryId) return null;
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? { name: cat.name, color: cat.color || '#6B7280' } : null;
  };

  // Add transaction with optimistic update
  const addTransaction = useMutation({
    mutationFn: async (input: TransactionInput) => {
      if (!user) throw new Error('Not authenticated');

      const payload = {
        amount: input.amount,
        type: input.type,
        description: input.description || null,
        date: input.date,
        category_id: input.category_id || null,
        user_id: user.id,
      };

      const encryptedPayload = await encryptEntity(payload, 'transactions');
      const { data, error } = await supabase
        .from('transactions')
        .insert(encryptedPayload)
        .select('*, category:categories(name, color)')
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (input) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);

      // Optimistically add the transaction
      const optimisticTransaction: Transaction = {
        id: `temp-${Date.now()}`,
        amount: input.amount,
        type: input.type,
        description: input.description || null,
        date: input.date,
        category_id: input.category_id || null,
        category: getCategoryInfo(input.category_id),
      };

      queryClient.setQueryData<Transaction[]>(['transactions'], (old = []) => [
        optimisticTransaction,
        ...old,
      ]);

      return { previousTransactions };
    },
    onError: (err, _, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add transaction',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({ title: 'Transaction added (encrypted)' });
      onSuccess?.();
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // Update transaction with optimistic update
  const updateTransaction = useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TransactionInput }) => {
      if (!user) throw new Error('Not authenticated');

      const payload = {
        amount: input.amount,
        type: input.type,
        description: input.description || null,
        date: input.date,
        category_id: input.category_id || null,
        user_id: user.id,
      };

      const encryptedPayload = await encryptEntity(payload, 'transactions');
      const { error } = await supabase
        .from('transactions')
        .update(encryptedPayload)
        .eq('id', id);

      if (error) throw error;
      return { id, ...payload };
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);

      queryClient.setQueryData<Transaction[]>(['transactions'], (old = []) =>
        old.map((tx) =>
          tx.id === id
            ? {
                ...tx,
                amount: input.amount,
                type: input.type,
                description: input.description || null,
                date: input.date,
                category_id: input.category_id || null,
                category: getCategoryInfo(input.category_id),
              }
            : tx
        )
      );

      return { previousTransactions };
    },
    onError: (err, _, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update transaction',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({ title: 'Transaction updated (encrypted)' });
      onSuccess?.();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  // Delete transaction with optimistic update
  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      const previousTransactions = queryClient.getQueryData<Transaction[]>(['transactions']);

      // Optimistically remove the transaction
      queryClient.setQueryData<Transaction[]>(['transactions'], (old = []) =>
        old.filter((tx) => tx.id !== id)
      );

      return { previousTransactions };
    },
    onError: (err, _, context) => {
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete transaction',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({ title: 'Transaction deleted' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  return {
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
