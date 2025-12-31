import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => setCollapsed((prev) => !prev), []);

  // Keyboard shortcut: Ctrl+B to toggle sidebar
  // Navigation shortcuts: Ctrl+1-7 for pages
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleCollapsed();
        return;
      }

      // Navigation shortcuts (Ctrl/Cmd + 1-8)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        const routes = [
          '/dashboard',      // Ctrl+1
          '/transactions',   // Ctrl+2
          '/categories',     // Ctrl+3
          '/budgets',        // Ctrl+4
          '/goals',          // Ctrl+5
          '/insights',       // Ctrl+6
          '/yearly-summary', // Ctrl+7
          '/settings',       // Ctrl+8
        ];
        
        const num = parseInt(e.key);
        if (num >= 1 && num <= 8) {
          e.preventDefault();
          window.location.href = routes[num - 1];
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCollapsed]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarState() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarState must be used within a SidebarProvider');
  }
  return context;
}
