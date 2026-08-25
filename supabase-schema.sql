-- ==========================================================================
-- TIME RECLAIM - SUPABASE AUTH & DATABASE SCHEMA (PROFILES + RLS)
-- Esegui questo script nell'Editor SQL del tuo progetto Supabase
-- ==========================================================================

-- 1. Tabella Profili Utente (Collegata direttamente ad auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'TR',
  motivation TEXT DEFAULT 'Coltivare le mie relazioni ed eliminare il tempo perso sui social',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabella Routine (Sonno, Veglia, Bloccati, Social)
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  sleep_hours NUMERIC(3,1) DEFAULT 8.0,
  wake_time TEXT DEFAULT '07:00',
  sleep_time TEXT DEFAULT '23:00',
  work_hours NUMERIC(3,1) DEFAULT 8.0,
  commute_hours NUMERIC(3,1) DEFAULT 1.0,
  chores_hours NUMERIC(3,1) DEFAULT 2.5,
  social_waste_hours NUMERIC(3,1) DEFAULT 3.0,
  detox_percent NUMERIC(3,2) DEFAULT 0.70,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabella Allocazione Tempo Intenzionale
CREATE TABLE IF NOT EXISTS public.allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  productive NUMERIC(3,2) DEFAULT 1.50,
  fitness NUMERIC(3,2) DEFAULT 1.00,
  cinema NUMERIC(3,2) DEFAULT 1.50,
  relations NUMERIC(3,2) DEFAULT 1.50,
  boredom NUMERIC(3,2) DEFAULT 1.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabella Attività Personalizzate (Banca del Tempo)
CREATE TABLE IF NOT EXISTS public.custom_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  duration NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  icon TEXT DEFAULT 'fa-star',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabella Checklist Quotidiana
CREATE TABLE IF NOT EXISTS public.daily_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  category TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================================================
-- TRIGGER PER CREAZIONE AUTOMATICA PROFILO ALLA REGISTRAZIONE AUTH
-- ==========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, avatar)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'first_name', 'Utente'),
    COALESCE(new.raw_user_meta_data->>'last_name', 'TimeReclaim'),
    new.email,
    UPPER(SUBSTRING(COALESCE(new.raw_user_meta_data->>'first_name', 'U'), 1, 1) || SUBSTRING(COALESCE(new.raw_user_meta_data->>'last_name', 'T'), 1, 1))
  );

  -- Crea anche record di default per routine ed allocazioni
  INSERT INTO public.routines (user_id) VALUES (new.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.allocations (user_id) VALUES (new.id) ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger agganciato ad auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checklist ENABLE ROW LEVEL SECURITY;

-- Profiles Policy
DROP POLICY IF EXISTS "Users can view and edit own profile" ON public.profiles;
CREATE POLICY "Users can view and edit own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Routines Policy
DROP POLICY IF EXISTS "Users can view and edit own routine" ON public.routines;
CREATE POLICY "Users can view and edit own routine" ON public.routines
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Allocations Policy
DROP POLICY IF EXISTS "Users can view and edit own allocations" ON public.allocations;
CREATE POLICY "Users can view and edit own allocations" ON public.allocations
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Custom Activities Policy
DROP POLICY IF EXISTS "Users can manage own custom activities" ON public.custom_activities;
CREATE POLICY "Users can manage own custom activities" ON public.custom_activities
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Daily Checklist Policy
DROP POLICY IF EXISTS "Users can manage own daily checklist" ON public.daily_checklist;
CREATE POLICY "Users can manage own daily checklist" ON public.daily_checklist
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
