-- SQL Schema for DeskTracker Pro
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- 1. Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    desk_number TEXT,
    shift TEXT,
    price DECIMAL,
    payment_status TEXT DEFAULT 'Pending',
    start_date DATE,
    expiry_date DATE,
    last_payment_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_seats INTEGER DEFAULT 50,
    library_name TEXT DEFAULT 'My Library',
    message_template TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Profiles Table for Subscription Logic
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    trial_start_date TIMESTAMPTZ DEFAULT now(),
    trial_end_date TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
    is_pro BOOLEAN DEFAULT false,
    pro_expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for Students
-- ... (existing policies)

-- 6. Create RLS Policies for Settings
-- ... (existing policies)

-- 7. Create RLS Policies for Profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
CREATE POLICY "Users can view their own students" 
ON public.students FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own students" 
ON public.students FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own students" 
ON public.students FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own students" 
ON public.students FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Create RLS Policies for Settings
CREATE POLICY "Users can view their own settings" 
ON public.settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.settings FOR UPDATE 
USING (auth.uid() = user_id);
