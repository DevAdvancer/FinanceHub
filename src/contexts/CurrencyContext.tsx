import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatAmount: (amount: number | string) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState<Currency>(() => {
    // Start with localStorage for immediate display
    const saved = localStorage.getItem('preferred-currency');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return CURRENCIES[0];
      }
    }
    return CURRENCIES[0];
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load currency preference from database when user logs in
  useEffect(() => {
    const loadCurrencyFromDB = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_currency')
          .eq('id', user.id)
          .single();
        
        if (data?.preferred_currency) {
          const savedCurrency = CURRENCIES.find(c => c.code === data.preferred_currency);
          if (savedCurrency) {
            setCurrencyState(savedCurrency);
            localStorage.setItem('preferred-currency', JSON.stringify(savedCurrency));
          }
        }
      } catch (error) {
        console.error('Error loading currency preference:', error);
      }
    };

    loadCurrencyFromDB();
  }, [user]);

  const setCurrency = useCallback(async (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferred-currency', JSON.stringify(newCurrency));

    // Save to database if user is logged in
    if (user) {
      setIsLoading(true);
      try {
        await supabase
          .from('profiles')
          .update({ preferred_currency: newCurrency.code })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error saving currency preference:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  const formatAmount = useCallback((amount: number | string): string => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return `${currency.symbol}0.00`;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
