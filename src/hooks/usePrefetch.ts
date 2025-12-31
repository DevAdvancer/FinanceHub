import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define prefetch functions for each route
const prefetchFunctions: Record<string, (userId: string) => Promise<void>> = {
  '/dashboard': async (userId) => {
    await Promise.all([
      supabase
        .from('transactions')
        .select('*, category:categories(name, color)')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('date', { ascending: false })
        .limit(10),
      supabase
        .from('budgets')
        .select('*, category:categories(name, color)')
        .eq('user_id', userId),
    ]);
  },
  '/transactions': async (userId) => {
    await Promise.all([
      supabase
        .from('transactions')
        .select('*, category:categories(name, color)')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('date', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},is_default.eq.true`),
    ]);
  },
  '/budgets': async (userId) => {
    await Promise.all([
      supabase.from('budgets').select('*, category:categories(name, color)').eq('user_id', userId),
      supabase
        .from('categories')
        .select('*')
        .or(`user_id.eq.${userId},is_default.eq.true`),
      supabase
        .from('transactions')
        .select('amount, type, category_id, date')
        .eq('user_id', userId)
        .eq('is_deleted', false),
    ]);
  },
  '/goals': async (userId) => {
    await supabase.from('goals').select('*').eq('user_id', userId);
  },
  '/insights': async (userId) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    await supabase
      .from('transactions')
      .select('type, amount, date, category:categories(name, color)')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .gte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`);
  },
};

// Track prefetched routes to avoid duplicate requests
const prefetchedRoutes = new Set<string>();

export function usePrefetch() {
  const { user, isEncryptionReady } = useAuth();
  const hasPrefetchedAll = useRef(false);

  const prefetchRoute = useCallback(
    async (route: string) => {
      if (!user || prefetchedRoutes.has(route)) return;

      const prefetchFn = prefetchFunctions[route];
      if (prefetchFn) {
        prefetchedRoutes.add(route);
        try {
          await prefetchFn(user.id);
        } catch (error) {
          // Silently fail - prefetching is optional
          prefetchedRoutes.delete(route);
        }
      }
    },
    [user]
  );

  // Prefetch all main routes when user logs in
  const prefetchAllRoutes = useCallback(async () => {
    if (!user || hasPrefetchedAll.current) return;
    hasPrefetchedAll.current = true;

    const routes = Object.keys(prefetchFunctions);
    // Prefetch in parallel for speed
    await Promise.allSettled(routes.map((route) => prefetchRoute(route)));
  }, [user, prefetchRoute]);

  // Auto-prefetch all routes when encryption is ready (user is fully logged in)
  useEffect(() => {
    if (user && isEncryptionReady && !hasPrefetchedAll.current) {
      prefetchAllRoutes();
    }
  }, [user, isEncryptionReady, prefetchAllRoutes]);

  const prefetchOnHover = useCallback(
    (route: string) => {
      return {
        onMouseEnter: () => prefetchRoute(route),
        onFocus: () => prefetchRoute(route),
      };
    },
    [prefetchRoute]
  );

  // Clear prefetch cache (call on logout or when data changes significantly)
  const clearPrefetchCache = useCallback(() => {
    prefetchedRoutes.clear();
    hasPrefetchedAll.current = false;
  }, []);

  return { prefetchRoute, prefetchOnHover, clearPrefetchCache, prefetchAllRoutes };
}
