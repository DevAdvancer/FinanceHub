import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  PiggyBank, 
  Settings, 
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Wallet,
  CalendarDays,
  Target,
  Lightbulb,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebarState } from '@/contexts/SidebarContext';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { usePrefetch } from '@/hooks/usePrefetch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AboutModal } from '@/components/AboutModal';

import { Tag } from 'lucide-react';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Transactions', url: '/transactions', icon: ArrowUpDown },
  { title: 'Categories', url: '/categories', icon: Tag },
  { title: 'Budgets', url: '/budgets', icon: PiggyBank },
  { title: 'Goals', url: '/goals', icon: Target },
  { title: 'Insights', url: '/insights', icon: Lightbulb },
  { title: 'Yearly Summary', url: '/yearly-summary', icon: CalendarDays },
  { title: 'Settings', url: '/settings', icon: Settings },
];

const adminItems = [
  { title: 'Admin', url: '/admin', icon: Shield },
];

export function Sidebar() {
  const { collapsed, toggleCollapsed } = useSidebarState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { signOut, isAdmin, profile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { prefetchOnHover } = usePrefetch();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shrink-0">
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-display font-bold text-lg text-sidebar-foreground">
              FinanceHub
            </span>
          )}
        </div>
        {!isMobile && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapsed}
                  className="h-8 w-8 hidden lg:flex"
                >
                  {collapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{collapsed ? 'Expand' : 'Collapse'} sidebar <kbd className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded">⌘B</kbd></p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Profile */}
      {(!collapsed || isMobile) && profile && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-medium text-primary">
                {profile.full_name?.charAt(0) || profile.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              isActive(item.url)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )}
            {...prefetchOnHover(item.url)}
          >
            <item.icon className={cn("h-5 w-5 shrink-0", isActive(item.url) && "text-primary")} />
            {(!collapsed || isMobile) && <span>{item.title}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <div className={cn("my-4 border-t border-sidebar-border", collapsed && !isMobile && "mx-2")} />
            {adminItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive(item.url)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
                {...prefetchOnHover(item.url)}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive(item.url) && "text-primary")} />
                {(!collapsed || isMobile) && <span>{item.title}</span>}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 space-y-2 border-t border-sidebar-border">
        <AboutModal collapsed={collapsed} isMobile={isMobile} />
        <Button
          variant="ghost"
          size={(collapsed && !isMobile) ? "icon" : "default"}
          onClick={toggleTheme}
          className={cn("w-full", (!collapsed || isMobile) && "justify-start")}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5 shrink-0" />
          ) : (
            <Moon className="h-5 w-5 shrink-0" />
          )}
          {(!collapsed || isMobile) && <span className="ml-2">Toggle Theme</span>}
        </Button>
        <Button
          variant="ghost"
          size={(collapsed && !isMobile) ? "icon" : "default"}
          onClick={signOut}
          className={cn("w-full text-destructive hover:text-destructive hover:bg-destructive/10", (!collapsed || isMobile) && "justify-start")}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(!collapsed || isMobile) && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b border-border flex items-center px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-3">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
            <Wallet className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg">FinanceHub</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:block fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out",
          "bg-sidebar border-r border-sidebar-border",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}