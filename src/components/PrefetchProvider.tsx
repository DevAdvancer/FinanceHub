import { useEffect } from 'react';
import { usePrefetch } from '@/hooks/usePrefetch';
import { useAuth } from '@/contexts/AuthContext';

export function PrefetchProvider({ children }: { children: React.ReactNode }) {
  const { user, isEncryptionReady } = useAuth();
  const { clearPrefetchCache } = usePrefetch();

  // Clear prefetch cache on logout
  useEffect(() => {
    if (!user) {
      clearPrefetchCache();
    }
  }, [user, clearPrefetchCache]);

  return <>{children}</>;
}