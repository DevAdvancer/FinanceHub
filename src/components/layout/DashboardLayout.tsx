import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebarState } from '@/contexts/SidebarContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, profile } = useAuth();
  const { collapsed } = useSidebarState();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.account_status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Account Suspended</h1>
          <p className="text-muted-foreground">Your account has been suspended. Please contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Mobile: add top padding for header, Desktop: adjust left padding based on sidebar state */}
      <main 
        className={cn(
          "pt-16 lg:pt-0 min-h-screen transition-all duration-300",
          collapsed ? "lg:pl-20" : "lg:pl-64"
        )}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}