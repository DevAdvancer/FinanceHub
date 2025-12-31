-- ============================================================================
-- COMPLETE DATABASE SCHEMA MIGRATION
-- ============================================================================
-- This file contains the complete database schema for the Expense Tracker app
-- including all tables, enums, functions, triggers, RLS policies, and default data.
-- Generated: 2025-12-31
-- ============================================================================

-- ============================================================================
-- SECTION 1: ENUMS
-- ============================================================================

-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create account_status enum for user account states
CREATE TYPE public.account_status AS ENUM ('active', 'suspended');

-- ============================================================================
-- SECTION 2: TABLES
-- ============================================================================

-- Profiles table - stores user profile information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  account_status account_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table - stores user roles (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Categories table - stores expense/income categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions table - stores income and expense transactions
-- Note: amount is stored as TEXT to support encrypted data
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Budgets table - stores monthly budget limits per category
-- Note: amount is stored as TEXT to support encrypted data
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  amount TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id, month, year)
);

-- Goals table - stores financial savings goals
-- Note: amounts are stored as TEXT to support encrypted data
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  target_amount TEXT NOT NULL,
  current_amount TEXT NOT NULL DEFAULT '0',
  deadline DATE,
  icon TEXT DEFAULT 'target',
  color TEXT DEFAULT '#10B981',
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Audit logs table - stores admin actions for auditing
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications table - stores user notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- SECTION 3: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SECTION 4: FUNCTIONS
-- ============================================================================

-- Security definer function to check if user has a specific role
-- Uses SECURITY DEFINER to bypass RLS and prevent recursive checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to handle new user signup - creates profile and assigns default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- SECTION 5: TRIGGERS
-- ============================================================================

-- Trigger for new user signup - creates profile and role automatically
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers for automatic updated_at timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================================
-- SECTION 6: ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- ----- PROFILES POLICIES -----
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- ----- USER ROLES POLICIES -----
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- ----- CATEGORIES POLICIES -----
CREATE POLICY "Users can view their own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can manage their own categories"
  ON public.categories FOR ALL
  USING (auth.uid() = user_id);

-- ----- TRANSACTIONS POLICIES -----
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id);

-- ----- BUDGETS POLICIES -----
CREATE POLICY "Users can view their own budgets"
  ON public.budgets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own budgets"
  ON public.budgets FOR ALL
  USING (auth.uid() = user_id);

-- ----- GOALS POLICIES -----
CREATE POLICY "Users can view their own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals"
  ON public.goals FOR ALL
  USING (auth.uid() = user_id);

-- ----- AUDIT LOGS POLICIES -----
CREATE POLICY "Admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- ----- NOTIFICATIONS POLICIES -----
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- SECTION 7: REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ============================================================================
-- SECTION 8: DEFAULT DATA
-- ============================================================================

-- Insert default expense and income categories
INSERT INTO public.categories (name, icon, color, is_default, user_id) VALUES
  -- Expense Categories
  ('Food & Dining', 'utensils', '#10B981', true, NULL),
  ('Transportation', 'car', '#3B82F6', true, NULL),
  ('Housing & Rent', 'home', '#8B5CF6', true, NULL),
  ('Utilities', 'zap', '#F59E0B', true, NULL),
  ('Entertainment', 'film', '#EC4899', true, NULL),
  ('Shopping', 'shopping-bag', '#6366F1', true, NULL),
  ('Healthcare', 'heart', '#EF4444', true, NULL),
  ('Education', 'book-open', '#14B8A6', true, NULL),
  ('Personal Care', 'smile', '#F97316', true, NULL),
  ('Subscriptions', 'credit-card', '#8B5CF6', true, NULL),
  ('Insurance', 'shield', '#0EA5E9', true, NULL),
  ('Travel', 'plane', '#06B6D4', true, NULL),
  ('Groceries', 'shopping-cart', '#84CC16', true, NULL),
  ('Fitness', 'dumbbell', '#EF4444', true, NULL),
  ('Pet Care', 'paw-print', '#F59E0B', true, NULL),
  ('Gifts & Donations', 'gift', '#EC4899', true, NULL),
  ('Clothing', 'shirt', '#A855F7', true, NULL),
  ('Electronics', 'smartphone', '#3B82F6', true, NULL),
  ('Home Improvement', 'hammer', '#78716C', true, NULL),
  ('Childcare', 'baby', '#FB7185', true, NULL),
  -- Income Categories
  ('Salary', 'briefcase', '#22C55E', true, NULL),
  ('Freelance', 'laptop', '#3B82F6', true, NULL),
  ('Investments', 'trending-up', '#8B5CF6', true, NULL),
  ('Rental Income', 'home', '#F59E0B', true, NULL),
  ('Business', 'building', '#6366F1', true, NULL),
  ('Interest', 'percent', '#14B8A6', true, NULL),
  ('Dividends', 'bar-chart', '#0EA5E9', true, NULL),
  ('Side Hustle', 'rocket', '#EC4899', true, NULL),
  ('Bonus', 'award', '#F97316', true, NULL),
  ('Refunds', 'refresh-cw', '#84CC16', true, NULL),
  ('Other', 'more-horizontal', '#6B7280', true, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
