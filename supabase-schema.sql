-- ==========================================================================
-- TIME RECLAIM - SUPABASE DATABASE SCHEMA SETUP SCRIPT
-- Copia ed incolla questo script nell'Editor SQL del tuo progetto Supabase
-- ==========================================================================

-- 1. Tabella Profili Utente
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT UNIQUE,
  name TEXT NOT NULL DEFAULT 'Alessandro',
  avatar TEXT NOT NULL DEFAULT 'AF',
  motivation TEXT DEFAULT 'Coltivare le mie relazioni ed eliminare il tempo perso sui social',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabella Routine (Sonno, Veglia, Bloccati, Social)
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
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
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  duration NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  icon TEXT DEFAULT 'fa-star',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabella Checklist Quotidiana
CREATE TABLE IF NOT EXISTS public.daily_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  category TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Abilitazione Permessi di Lettura / Scrittura Pubblica per Demo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access" ON public.routines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access" ON public.allocations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access" ON public.custom_activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write access" ON public.daily_checklist FOR ALL USING (true) WITH CHECK (true);
