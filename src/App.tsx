import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { PrefetchProvider } from "@/components/PrefetchProvider";

// Import all pages directly (no lazy loading for instant navigation)
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";
import Insights from "./pages/Insights";
import Settings from "./pages/Settings";
import YearlySummary from "./pages/YearlySummary";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <CurrencyProvider>
            <SidebarProvider>
              <PrefetchProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <KeyboardShortcutsModal />
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/budgets" element={<Budgets />} />
                    <Route path="/goals" element={<Goals />} />
                    <Route path="/insights" element={<Insights />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/yearly-summary" element={<YearlySummary />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </PrefetchProvider>
            </SidebarProvider>
          </CurrencyProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
