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

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for Students
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
