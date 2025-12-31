import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 'transactions' | 'budgets' | 'goals' | 'notifications';

interface UseRealtimeSubscriptionOptions {
  table: TableName;
  userId: string | undefined;
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void;
  onChange?: () => void; // Simple callback to refetch data
}

export function useRealtimeSubscription({
  table,
  userId,
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeSubscriptionOptions) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`${table}-changes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log(`[Realtime] ${table} INSERT:`, payload);
          onInsert?.(payload);
          onChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log(`[Realtime] ${table} UPDATE:`, payload);
          onUpdate?.(payload);
          onChange?.();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table,
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log(`[Realtime] ${table} DELETE:`, payload);
          onDelete?.(payload);
          onChange?.();
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] ${table} subscription status:`, status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, userId, onInsert, onUpdate, onDelete, onChange]);
}
